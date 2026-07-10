import { MI_DEFAULT_HUB_ID, MI_DSP_PLATFORMS } from './constants';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import { resolvePartnerContext } from './partner-service';
import type { MIWorkspaceSession } from './workspace-auth';
import { tableAvailable } from './workspace-fallback';
import type {
  IntelligenceDashboardPayload,
  IntelligenceWidgetMetric,
  PlatformActivityItem,
} from './intelligence-types';

type ServiceClient = NonNullable<ReturnType<typeof createMIServiceClient>>;

async function countRows(
  service: ServiceClient,
  table: string,
  filters: Record<string, string | boolean | number>,
): Promise<number> {
  let query = service.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

async function countSubmissionStatuses(
  service: ServiceClient,
  scope: { submitted_by?: string; hub_id?: string },
  statuses: string[],
): Promise<number> {
  if (!(await tableAvailable(service, 'mi_music_submissions'))) return 0;

  let query = service
    .from('mi_music_submissions')
    .select('*', { count: 'exact', head: true })
    .in('status', statuses);

  if (scope.submitted_by) query = query.eq('submitted_by', scope.submitted_by);
  if (scope.hub_id) query = query.eq('hub_id', scope.hub_id);

  const { count } = await query;
  return count ?? 0;
}

async function countTotalSubmissions(
  service: ServiceClient,
  scope: { submitted_by?: string; hub_id?: string },
): Promise<number> {
  if (!(await tableAvailable(service, 'mi_music_submissions'))) return 0;

  const filters: Record<string, string> = {};
  if (scope.submitted_by) filters.submitted_by = scope.submitted_by;
  if (scope.hub_id) filters.hub_id = scope.hub_id;
  return countRows(service, 'mi_music_submissions', filters);
}

async function countConnectedStreamingPlatforms(
  service: ServiceClient,
  scope: { submitted_by?: string; hub_id?: string },
): Promise<number> {
  if (!(await tableAvailable(service, 'mi_music_submissions'))) return 0;

  let query = service.from('mi_music_submissions').select('dsp_links');
  if (scope.submitted_by) query = query.eq('submitted_by', scope.submitted_by);
  if (scope.hub_id) query = query.eq('hub_id', scope.hub_id);

  const { data } = await query;
  const validKeys = new Set(MI_DSP_PLATFORMS.map((p) => p.key));
  const connected = new Set<string>();

  for (const row of data ?? []) {
    const links = (row.dsp_links ?? {}) as Record<string, string>;
    for (const [key, url] of Object.entries(links)) {
      if (validKeys.has(key as (typeof MI_DSP_PLATFORMS)[number]['key']) && url?.trim()) {
        connected.add(key);
      }
    }
  }

  return connected.size;
}

async function loadRecentActivity(
  service: ServiceClient,
  scope: { submitted_by?: string; hub_id?: string },
  limit = 8,
): Promise<PlatformActivityItem[]> {
  if (!(await tableAvailable(service, 'mi_music_submissions'))) return [];

  let query = service
    .from('mi_music_submissions')
    .select('id, song_title, artist_name, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (scope.submitted_by) query = query.eq('submitted_by', scope.submitted_by);
  if (scope.hub_id) query = query.eq('hub_id', scope.hub_id);

  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.id,
    type: 'submission' as const,
    title: row.song_title,
    subtitle: scope.hub_id ? row.artist_name : 'Music submission',
    status: row.status,
    timestamp: row.created_at,
  }));
}

function buildAiProcessingWidget(pendingCount: number, accent: 'artist' | 'partner'): IntelligenceWidgetMetric {
  const idle = pendingCount === 0;
  return {
    id: 'ai_processing_status',
    icon: 'ai_processing_status',
    title: 'AI Processing Status',
    value: idle ? 'Standby' : 'Queue Active',
    subtitle: idle
      ? 'No submissions awaiting AI pipeline processing.'
      : `${pendingCount} submission(s) in review queue.`,
    emptyState: idle,
    accent,
    ariaLabel: idle
      ? 'AI processing status: standby, no items in queue'
      : `AI processing status: queue active, ${pendingCount} items pending`,
  };
}

function buildActiveCampaignsWidget(accent: 'artist' | 'partner'): IntelligenceWidgetMetric {
  return {
    id: 'active_campaigns',
    icon: 'active_campaigns',
    title: 'Active Campaigns',
    value: 0,
    subtitle: 'Campaign engine activates in a future phase. No active campaigns yet.',
    emptyState: true,
    accent,
    ariaLabel: 'Active campaigns: zero, awaiting campaign engine',
  };
}

function buildMetricWidget(
  id: IntelligenceWidgetMetric['id'],
  title: string,
  value: number | string,
  subtitle: string,
  accent: 'artist' | 'partner' | 'neutral',
  emptyWhenZero = false,
): IntelligenceWidgetMetric {
  const numeric = typeof value === 'number' ? value : null;
  const emptyState = emptyWhenZero && numeric === 0;
  return {
    id,
    icon: id,
    title,
    value,
    subtitle,
    emptyState,
    accent,
    ariaLabel: `${title}: ${value}. ${subtitle}`,
  };
}

export async function loadArtistIntelligence(
  session: MIWorkspaceSession,
): Promise<IntelligenceDashboardPayload> {
  const service = createMIServiceClient();
  const hubId = MI_DEFAULT_HUB_ID;
  const accent = 'artist' as const;

  if (!service) {
    return emptyArtistPayload();
  }

  const hasPartnerProfiles = await tableAvailable(service, 'mi_partner_profiles');
  const hasArtistMembers = await tableAvailable(service, 'mi_artist_members');

  const linkedArtist =
    session.artistId != null
      ? 1
      : hasArtistMembers
        ? await countRows(service, 'mi_artist_members', { user_id: session.userId }).then((n) =>
            n > 0 ? 1 : 0,
          )
        : 0;

  const scope = { submitted_by: session.userId };

  const [
    totalSubmissions,
    pendingReviews,
    approvedSubmissions,
    hubPartners,
    hubOrganizations,
    connectedPlatforms,
    recentActivity,
  ] = await Promise.all([
    countTotalSubmissions(service, scope),
    countSubmissionStatuses(service, scope, ['pending_review', 'revision_requested']),
    countSubmissionStatuses(service, scope, ['approved']),
    hasPartnerProfiles
      ? countRows(service, 'mi_partner_profiles', { hub_id: hubId })
      : Promise.resolve(0),
    hasPartnerProfiles
      ? countRows(service, 'mi_partner_profiles', { hub_id: hubId })
      : Promise.resolve(0),
    countConnectedStreamingPlatforms(service, scope),
    loadRecentActivity(service, scope),
  ]);

  const widgets: IntelligenceWidgetMetric[] = [
    buildMetricWidget(
      'total_artists',
      'Total Artists',
      linkedArtist,
      linkedArtist ? 'Your artist profile is linked.' : 'Link your artist profile to activate portfolio intelligence.',
      accent,
      true,
    ),
    buildMetricWidget(
      'total_partners',
      'Total Partners',
      hubPartners,
      hubPartners ? 'Enterprise partners on your hub.' : 'No partner organizations registered on this hub yet.',
      'neutral',
      true,
    ),
    buildMetricWidget(
      'total_organizations',
      'Total Organizations',
      hubOrganizations,
      hubOrganizations ? 'Organizations active on platform hub.' : 'Organization records will appear as partners onboard.',
      'neutral',
      true,
    ),
    buildMetricWidget(
      'total_submissions',
      'Total Music Submissions',
      totalSubmissions,
      totalSubmissions ? 'Your submitted tracks across all statuses.' : 'Submit your first track to begin intelligence tracking.',
      accent,
      true,
    ),
    buildMetricWidget(
      'pending_reviews',
      'Pending Reviews',
      pendingReviews,
      pendingReviews ? 'Submissions awaiting partner review.' : 'No submissions currently pending review.',
      accent,
      true,
    ),
    buildMetricWidget(
      'approved_submissions',
      'Approved Submissions',
      approvedSubmissions,
      approvedSubmissions ? 'Tracks approved for playlist consideration.' : 'Approved submissions will appear here after review.',
      accent,
      true,
    ),
    buildActiveCampaignsWidget(accent),
    buildMetricWidget(
      'connected_streaming_platforms',
      'Connected Streaming Platforms',
      connectedPlatforms,
      connectedPlatforms
        ? `${connectedPlatforms} of ${MI_DSP_PLATFORMS.length} DSP destinations linked in your submissions.`
        : `Add DSP links in submissions to connect up to ${MI_DSP_PLATFORMS.length} platforms.`,
      accent,
      true,
    ),
    buildAiProcessingWidget(pendingReviews, accent),
  ];

  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    widgets,
    recentActivity,
    dataSource: 'live',
  };
}

export async function loadPartnerIntelligence(
  session: MIPartnerWorkspaceSession,
): Promise<IntelligenceDashboardPayload> {
  const { service, hubId } = await resolvePartnerContext(session);
  const accent = 'partner' as const;

  if (!service) {
    return emptyPartnerPayload();
  }

  const hasPartnerProfiles = await tableAvailable(service, 'mi_partner_profiles');
  const scope = { hub_id: hubId };

  const [
    totalArtists,
    totalPartners,
    totalOrganizations,
    totalSubmissions,
    pendingReviews,
    approvedSubmissions,
    connectedPlatforms,
    recentActivity,
  ] = await Promise.all([
    countRows(service, 'mi_artists', { hub_id: hubId, is_active: true }),
    hasPartnerProfiles
      ? countRows(service, 'mi_partner_profiles', { hub_id: hubId })
      : Promise.resolve(0),
    hasPartnerProfiles
      ? countRows(service, 'mi_partner_profiles', { hub_id: hubId })
      : Promise.resolve(0),
    countTotalSubmissions(service, scope),
    countSubmissionStatuses(service, scope, ['pending_review', 'revision_requested']),
    countSubmissionStatuses(service, scope, ['approved']),
    countConnectedStreamingPlatforms(service, scope),
    loadRecentActivity(service, scope),
  ]);

  const widgets: IntelligenceWidgetMetric[] = [
    buildMetricWidget(
      'total_artists',
      'Total Artists',
      totalArtists,
      totalArtists ? 'Active artists in your organization hub.' : 'Invite artists to populate your portfolio.',
      accent,
      true,
    ),
    buildMetricWidget(
      'total_partners',
      'Total Partners',
      totalPartners,
      totalPartners ? 'Partner profiles registered on hub.' : 'Partner profiles will appear as organizations onboard.',
      accent,
      true,
    ),
    buildMetricWidget(
      'total_organizations',
      'Total Organizations',
      totalOrganizations,
      totalOrganizations ? 'Enterprise organizations on platform hub.' : 'No organization records on this hub yet.',
      accent,
      true,
    ),
    buildMetricWidget(
      'total_submissions',
      'Total Music Submissions',
      totalSubmissions,
      totalSubmissions ? 'All hub submissions across statuses.' : 'Submission queue empty — awaiting artist uploads.',
      accent,
      true,
    ),
    buildMetricWidget(
      'pending_reviews',
      'Pending Reviews',
      pendingReviews,
      pendingReviews ? 'Submissions requiring partner review action.' : 'Review queue clear — no pending submissions.',
      accent,
      true,
    ),
    buildMetricWidget(
      'approved_submissions',
      'Approved Submissions',
      approvedSubmissions,
      approvedSubmissions ? 'Tracks approved for distribution and playlist routing.' : 'No approved submissions yet.',
      accent,
      true,
    ),
    buildActiveCampaignsWidget(accent),
    buildMetricWidget(
      'connected_streaming_platforms',
      'Connected Streaming Platforms',
      connectedPlatforms,
      connectedPlatforms
        ? `${connectedPlatforms} DSP destinations linked across hub submissions.`
        : `${MI_DSP_PLATFORMS.length} platform destinations available when artists add DSP links.`,
      accent,
      true,
    ),
    buildAiProcessingWidget(pendingReviews, accent),
  ];

  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    widgets,
    recentActivity,
    dataSource: 'live',
  };
}

function emptyArtistPayload(): IntelligenceDashboardPayload {
  const accent = 'artist' as const;
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'fallback',
    recentActivity: [],
    widgets: [
      buildMetricWidget('total_artists', 'Total Artists', 0, 'Database unavailable.', accent, true),
      buildMetricWidget('total_partners', 'Total Partners', 0, 'Database unavailable.', 'neutral', true),
      buildMetricWidget('total_organizations', 'Total Organizations', 0, 'Database unavailable.', 'neutral', true),
      buildMetricWidget('total_submissions', 'Total Music Submissions', 0, 'Database unavailable.', accent, true),
      buildMetricWidget('pending_reviews', 'Pending Reviews', 0, 'Database unavailable.', accent, true),
      buildMetricWidget('approved_submissions', 'Approved Submissions', 0, 'Database unavailable.', accent, true),
      buildActiveCampaignsWidget(accent),
      buildMetricWidget('connected_streaming_platforms', 'Connected Streaming Platforms', 0, 'Database unavailable.', accent, true),
      buildAiProcessingWidget(0, accent),
    ],
  };
}

function emptyPartnerPayload(): IntelligenceDashboardPayload {
  const artistFallback = emptyArtistPayload();
  return {
    ...artistFallback,
    scope: 'partner',
    widgets: artistFallback.widgets.map((w) => ({
      ...w,
      accent: w.accent === 'neutral' ? ('partner' as const) : ('partner' as const),
    })),
  };
}
