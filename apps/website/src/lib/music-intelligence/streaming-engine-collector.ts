import { MI_DEFAULT_HUB_ID } from './constants';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import { resolvePartnerContext } from './partner-service';
import type { MIWorkspaceSession } from './workspace-auth';
import { loadArtistProfile, listSubmissions } from './workspace-service';
import { listPartnerSubmissions } from './partner-service';
import { tableAvailable } from './workspace-fallback';
import type { MIMusicSubmissionRow } from './submissions';
import { mapTelemetryDsp } from './streaming-engine-constants';
import type { MIDspPlatformKey } from './constants';

export interface ClickTelemetryRow {
  destination_dsp: string;
  created_at: string;
  artist_id: string | null;
  track_id: string | null;
}

export interface CollectedDspLink {
  platformKey: MIDspPlatformKey;
  url: string;
  submissionId: string;
  songTitle: string;
  addedAt: string;
}

export interface ArtistStreamingEngineData {
  submissions: MIMusicSubmissionRow[];
  dspLinks: CollectedDspLink[];
  clickTelemetry: ClickTelemetryRow[];
  artistId: string | null;
  hubId: string;
  dataAvailable: boolean;
}

export interface PartnerStreamingEngineData {
  submissions: MIMusicSubmissionRow[];
  dspLinks: CollectedDspLink[];
  clickTelemetry: ClickTelemetryRow[];
  hubId: string;
  dataAvailable: boolean;
}

function collectDspLinksFromSubmissions(submissions: MIMusicSubmissionRow[]): CollectedDspLink[] {
  const links: CollectedDspLink[] = [];
  const validKeys = new Set([
    'spotify', 'apple_music', 'audiomack', 'boomplay', 'youtube_music', 'deezer', 'amazon_music',
  ]);

  for (const sub of submissions) {
    for (const [key, url] of Object.entries(sub.dsp_links ?? {})) {
      if (validKeys.has(key) && url?.trim()) {
        links.push({
          platformKey: key as MIDspPlatformKey,
          url: url.trim(),
          submissionId: sub.id,
          songTitle: sub.song_title,
          addedAt: sub.created_at,
        });
      }
    }
  }
  return links;
}

async function loadClickTelemetry(
  service: NonNullable<ReturnType<typeof createMIServiceClient>>,
  scope: { artistId?: string | null; hubId?: string },
): Promise<ClickTelemetryRow[]> {
  if (!(await tableAvailable(service, 'mi_click_tracking'))) return [];

  let query = service
    .from('mi_click_tracking')
    .select('destination_dsp, created_at, artist_id, track_id')
    .order('created_at', { ascending: false })
    .limit(500);

  if (scope.artistId) query = query.eq('artist_id', scope.artistId);
  else if (scope.hubId) query = query.eq('hub_id', scope.hubId);

  const { data } = await query;
  return (data ?? []) as ClickTelemetryRow[];
}

export async function collectArtistStreamingEngineData(
  session: MIWorkspaceSession,
): Promise<ArtistStreamingEngineData> {
  const [profileData, submissions] = await Promise.all([
    loadArtistProfile(session),
    listSubmissions(session),
  ]);

  const rows = submissions as MIMusicSubmissionRow[];
  const dspLinks = collectDspLinksFromSubmissions(rows);
  const artistId = profileData?.catalog?.id ?? session.artistId ?? null;
  const hubId = profileData?.catalog?.hub_id ?? MI_DEFAULT_HUB_ID;

  const service = createMIServiceClient();
  const clickTelemetry = service
    ? await loadClickTelemetry(service, { artistId, hubId: artistId ? undefined : hubId })
    : [];

  return {
    submissions: rows,
    dspLinks,
    clickTelemetry,
    artistId,
    hubId,
    dataAvailable: true,
  };
}

export async function collectPartnerStreamingEngineData(
  session: MIPartnerWorkspaceSession,
): Promise<PartnerStreamingEngineData> {
  const { service, hubId } = await resolvePartnerContext(session);
  const submissions = (await listPartnerSubmissions(session)) as MIMusicSubmissionRow[];
  const dspLinks = collectDspLinksFromSubmissions(submissions);

  const clickTelemetry = service
    ? await loadClickTelemetry(service, { hubId })
    : [];

  return {
    submissions,
    dspLinks,
    clickTelemetry,
    hubId,
    dataAvailable: true,
  };
}

export function aggregateClicksByPlatform(
  telemetry: ClickTelemetryRow[],
): Map<MIDspPlatformKey, { count: number; lastAt: string }> {
  const map = new Map<MIDspPlatformKey, { count: number; lastAt: string }>();

  for (const row of telemetry) {
    const key = mapTelemetryDsp(row.destination_dsp);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (row.created_at > existing.lastAt) existing.lastAt = row.created_at;
    } else {
      map.set(key, { count: 1, lastAt: row.created_at });
    }
  }

  return map;
}
