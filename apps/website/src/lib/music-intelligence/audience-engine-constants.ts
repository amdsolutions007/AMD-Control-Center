export interface AudiencePlatformDefinition {
  platformKey: string;
  label: string;
  category: 'dsp' | 'social' | 'analytics' | 'ads';
  supportsAudienceMetrics: boolean;
  apiIntegrationReady: boolean;
  telemetryKey: string | null;
}

export const AUDIENCE_PLATFORM_DEFINITIONS: AudiencePlatformDefinition[] = [
  { platformKey: 'spotify', label: 'Spotify', category: 'dsp', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: 'spotify' },
  { platformKey: 'apple_music', label: 'Apple Music', category: 'dsp', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: 'apple_music' },
  { platformKey: 'youtube_music', label: 'YouTube Music', category: 'dsp', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: 'youtube' },
  { platformKey: 'meta', label: 'Meta', category: 'social', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'facebook', label: 'Facebook', category: 'social', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'instagram', label: 'Instagram', category: 'social', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'tiktok', label: 'TikTok', category: 'social', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'linkedin', label: 'LinkedIn', category: 'social', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'google_analytics', label: 'Google Analytics', category: 'analytics', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'google_ads', label: 'Google Ads', category: 'ads', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
  { platformKey: 'youtube_analytics', label: 'YouTube Analytics', category: 'analytics', supportsAudienceMetrics: false, apiIntegrationReady: false, telemetryKey: null },
];

export const GLOBAL_AUDIENCE_METRIC_KEYS = [
  { key: 'total_audience', label: 'Total Audience', unit: 'contacts' },
  { key: 'active_audience', label: 'Active Audience', unit: 'sessions' },
  { key: 'returning_audience', label: 'Returning Audience', unit: 'sessions' },
  { key: 'new_audience', label: 'New Audience', unit: 'contacts' },
  { key: 'audience_growth', label: 'Audience Growth', unit: '%' },
] as const;

export const ENGAGEMENT_METRIC_KEYS = [
  { key: 'likes', label: 'Likes', requiresApi: true },
  { key: 'shares', label: 'Shares', requiresApi: true },
  { key: 'comments', label: 'Comments', requiresApi: true },
  { key: 'saves', label: 'Saves', requiresApi: true },
  { key: 'playlist_adds', label: 'Playlist Adds', requiresApi: true },
  { key: 'follows', label: 'Follows', requiresApi: true },
  { key: 'watch_time', label: 'Watch Time', requiresApi: true },
  { key: 'listening_time', label: 'Listening Time', requiresApi: true },
  { key: 'completion_rate', label: 'Completion Rate', requiresApi: true },
  { key: 'smart_link_clicks', label: 'Smart Link Clicks', requiresApi: false },
  { key: 'owned_contacts', label: 'Owned Contacts', requiresApi: false },
] as const;

export const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria', US: 'United States', GB: 'United Kingdom', GH: 'Ghana',
  ZA: 'South Africa', CA: 'Canada', DE: 'Germany', FR: 'France',
};

export function countryLabel(code: string | null | undefined): string {
  if (!code?.trim()) return 'Unknown';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
