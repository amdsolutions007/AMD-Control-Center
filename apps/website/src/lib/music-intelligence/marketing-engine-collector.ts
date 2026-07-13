import { MI_DEFAULT_HUB_ID } from './constants';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import { resolvePartnerContext } from './partner-service';
import type { MIWorkspaceSession } from './workspace-auth';
import { loadArtistProfile, listSubmissions } from './workspace-service';
import { listPartnerSubmissions } from './partner-service';
import { tableAvailable } from './workspace-fallback';
import type { MIMusicSubmissionRow } from './submissions';

export interface MarketingClickRow {
  destination_dsp: string;
  user_country: string | null;
  user_device_type: string | null;
  session_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface MarketingAudienceRow {
  id: string;
  created_at: string;
  source_smart_link_id: string | null;
}

export interface MarketingCollectedData {
  submissions: MIMusicSubmissionRow[];
  clickTelemetry: MarketingClickRow[];
  audienceContacts: MarketingAudienceRow[];
  hubId: string;
  artistId: string | null;
  dataAvailable: boolean;
}

async function loadMarketingClickTelemetry(
  service: NonNullable<ReturnType<typeof createMIServiceClient>>,
  scope: { artistId?: string | null; hubId: string },
): Promise<MarketingClickRow[]> {
  if (!(await tableAvailable(service, 'mi_click_tracking'))) return [];

  let query = service
    .from('mi_click_tracking')
    .select('destination_dsp, user_country, user_device_type, session_id, utm_source, utm_medium, utm_campaign, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (scope.artistId) query = query.eq('artist_id', scope.artistId);
  else query = query.eq('hub_id', scope.hubId);

  const { data } = await query;
  return (data ?? []) as MarketingClickRow[];
}

async function loadMarketingAudience(
  service: NonNullable<ReturnType<typeof createMIServiceClient>>,
  hubId: string,
): Promise<MarketingAudienceRow[]> {
  if (!(await tableAvailable(service, 'mi_audience'))) return [];

  const { data } = await service
    .from('mi_audience')
    .select('id, created_at, source_smart_link_id')
    .eq('hub_id', hubId)
    .is('opt_out_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  return (data ?? []) as MarketingAudienceRow[];
}

export async function collectArtistMarketingEngineData(
  session: MIWorkspaceSession,
): Promise<MarketingCollectedData> {
  const [profileData, submissions] = await Promise.all([
    loadArtistProfile(session),
    listSubmissions(session),
  ]);

  const artistId = profileData?.catalog?.id ?? session.artistId ?? null;
  const hubId = profileData?.catalog?.hub_id ?? MI_DEFAULT_HUB_ID;
  const service = createMIServiceClient();

  const [clickTelemetry, audienceContacts] = service
    ? await Promise.all([
        loadMarketingClickTelemetry(service, { artistId, hubId }),
        loadMarketingAudience(service, hubId),
      ])
    : [[], []];

  return {
    submissions: submissions as MIMusicSubmissionRow[],
    clickTelemetry,
    audienceContacts,
    hubId,
    artistId,
    dataAvailable: true,
  };
}

export async function collectPartnerMarketingEngineData(
  session: MIPartnerWorkspaceSession,
): Promise<MarketingCollectedData> {
  const { service, hubId } = await resolvePartnerContext(session);
  const submissions = (await listPartnerSubmissions(session)) as MIMusicSubmissionRow[];

  const [clickTelemetry, audienceContacts] = service
    ? await Promise.all([
        loadMarketingClickTelemetry(service, { hubId }),
        loadMarketingAudience(service, hubId),
      ])
    : [[], []];

  return {
    submissions,
    clickTelemetry,
    audienceContacts,
    hubId,
    artistId: null,
    dataAvailable: true,
  };
}
