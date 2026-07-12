import { MI_DSP_PLATFORMS, type MIDspPlatformKey } from './constants';

export interface DspConnectorDefinition {
  platformKey: MIDspPlatformKey;
  label: string;
  apiIntegrationReady: boolean;
  supportsLiveMetrics: boolean;
  telemetryKey: string | null;
}

/** Maps mi_click_tracking destination_dsp values to platform keys */
export const TELEMETRY_DSP_MAP: Record<string, MIDspPlatformKey> = {
  spotify: 'spotify',
  apple_music: 'apple_music',
  audiomack: 'audiomack',
  boomplay: 'boomplay',
  youtube: 'youtube_music',
  youtube_music: 'youtube_music',
  deezer: 'deezer',
  amazon_music: 'amazon_music',
};

export const STREAMING_METRIC_DEFINITIONS = [
  {
    key: 'total_streams',
    label: 'Total Streams',
    unit: 'streams',
    requiresApi: true,
    emptyStateMessage: 'Platform API connection required for stream counts.',
  },
  {
    key: 'monthly_streams',
    label: 'Monthly Streams',
    unit: 'streams',
    requiresApi: true,
    emptyStateMessage: 'Monthly stream data activates when DSP APIs are connected.',
  },
  {
    key: 'daily_streams',
    label: 'Daily Streams',
    unit: 'streams',
    requiresApi: true,
    emptyStateMessage: 'Daily stream data activates when DSP APIs are connected.',
  },
  {
    key: 'total_listeners',
    label: 'Total Listeners',
    unit: 'listeners',
    requiresApi: true,
    emptyStateMessage: 'Listener metrics require platform API synchronization.',
  },
  {
    key: 'saves',
    label: 'Saves',
    unit: 'saves',
    requiresApi: true,
    emptyStateMessage: 'Save metrics require platform API synchronization.',
  },
  {
    key: 'followers',
    label: 'Followers',
    unit: 'followers',
    requiresApi: true,
    emptyStateMessage: 'Follower metrics require platform API synchronization.',
  },
  {
    key: 'playlist_adds',
    label: 'Playlist Adds',
    unit: 'adds',
    requiresApi: true,
    emptyStateMessage: 'Playlist add metrics require platform API synchronization.',
  },
  {
    key: 'listener_growth',
    label: 'Listener Growth',
    unit: '%',
    requiresApi: true,
    emptyStateMessage: 'Growth metrics require historical platform API data.',
  },
  {
    key: 'smart_link_redirects',
    label: 'Smart Link Redirects',
    unit: 'clicks',
    requiresApi: false,
    emptyStateMessage: 'No Smart Link redirect telemetry recorded yet.',
  },
] as const;

export const DSP_CONNECTOR_DEFINITIONS: DspConnectorDefinition[] = MI_DSP_PLATFORMS.map((p) => ({
  platformKey: p.key,
  label: p.label,
  apiIntegrationReady: false,
  supportsLiveMetrics: false,
  telemetryKey: TELEMETRY_DSP_MAP[p.key] ? p.key : null,
}));

export function extractPlatformIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    if (path.includes('/track/')) return path.split('/track/')[1]?.split('?')[0] ?? null;
    if (path.includes('/album/')) return path.split('/album/')[1]?.split('?')[0] ?? null;
    if (path.includes('/artist/')) return path.split('/artist/')[1]?.split('?')[0] ?? null;
    return path.split('/').filter(Boolean).pop() ?? null;
  } catch {
    return null;
  }
}

export function mapTelemetryDsp(destinationDsp: string): MIDspPlatformKey | null {
  return TELEMETRY_DSP_MAP[destinationDsp] ?? null;
}
