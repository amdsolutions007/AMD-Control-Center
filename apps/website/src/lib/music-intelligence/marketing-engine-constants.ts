export interface MarketingPlatformDefinition {
  platformKey: string;
  label: string;
  utmSources: string[];
  supportsCampaignMetrics: boolean;
  apiIntegrationReady: boolean;
}

export const MARKETING_PLATFORM_DEFINITIONS: MarketingPlatformDefinition[] = [
  { platformKey: 'meta_ads', label: 'Meta Ads', utmSources: ['meta', 'facebook', 'fb', 'instagram', 'ig'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'facebook', label: 'Facebook', utmSources: ['facebook', 'fb'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'instagram', label: 'Instagram', utmSources: ['instagram', 'ig'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'google_ads', label: 'Google Ads', utmSources: ['google', 'google_ads', 'gads', 'cpc'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'google_analytics', label: 'Google Analytics', utmSources: ['google_analytics', 'ga'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'search_console', label: 'Search Console', utmSources: ['search_console', 'organic'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'youtube', label: 'YouTube Analytics', utmSources: ['youtube', 'yt'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'tiktok', label: 'TikTok Ads', utmSources: ['tiktok', 'tt'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'linkedin', label: 'LinkedIn Campaign Manager', utmSources: ['linkedin', 'li'], supportsCampaignMetrics: false, apiIntegrationReady: false },
  { platformKey: 'twitter', label: 'X (Twitter)', utmSources: ['twitter', 'x'], supportsCampaignMetrics: false, apiIntegrationReady: false },
];

export const PERFORMANCE_METRIC_KEYS = [
  { key: 'impressions', label: 'Impressions', requiresApi: true },
  { key: 'reach', label: 'Reach', requiresApi: true },
  { key: 'clicks', label: 'Clicks', requiresApi: false },
  { key: 'unique_clicks', label: 'Unique Clicks', requiresApi: false },
  { key: 'ctr', label: 'CTR', requiresApi: true },
  { key: 'cpc', label: 'CPC', requiresApi: true },
  { key: 'cpm', label: 'CPM', requiresApi: true },
  { key: 'frequency', label: 'Frequency', requiresApi: true },
  { key: 'engagement_rate', label: 'Engagement Rate', requiresApi: true },
] as const;

export const ROI_METRIC_KEYS = [
  { key: 'cost_per_click', label: 'Cost Per Click', requiresApi: true },
  { key: 'cost_per_conversion', label: 'Cost Per Conversion', requiresApi: true },
  { key: 'cost_per_artist', label: 'Cost Per Artist Acquisition', requiresApi: true },
  { key: 'cost_per_partner', label: 'Cost Per Partner Acquisition', requiresApi: true },
  { key: 'roas', label: 'Return On Ad Spend', requiresApi: true },
  { key: 'roi', label: 'Return On Investment', requiresApi: true },
] as const;

export function mapUtmSourceToPlatform(source: string | null | undefined): string | null {
  if (!source?.trim()) return null;
  const normalized = source.toLowerCase().trim();
  for (const def of MARKETING_PLATFORM_DEFINITIONS) {
    if (def.utmSources.some((s) => normalized.includes(s))) return def.platformKey;
  }
  return null;
}

export function platformLabel(key: string): string {
  return MARKETING_PLATFORM_DEFINITIONS.find((d) => d.platformKey === key)?.label ?? key;
}
