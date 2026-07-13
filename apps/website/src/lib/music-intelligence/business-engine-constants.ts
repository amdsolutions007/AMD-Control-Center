import type { EngineKey } from './business-engine-types';

export const BUSINESS_ENGINE_KEYS: EngineKey[] = [
  'intelligence',
  'ai',
  'music',
  'streaming',
  'audience',
  'marketing',
];

export const ENGINE_LABELS: Record<EngineKey, string> = {
  intelligence: 'Intelligence Dashboard',
  ai: 'AI Intelligence',
  music: 'Music Intelligence',
  streaming: 'Streaming Intelligence',
  audience: 'Audience Intelligence',
  marketing: 'Marketing Intelligence',
};

export const REVENUE_CONNECTOR_DEFINITIONS = [
  { key: 'royalties', label: 'Royalties', supportsLiveMetrics: false },
  { key: 'payments', label: 'Payments', supportsLiveMetrics: false },
  { key: 'billing', label: 'Billing', supportsLiveMetrics: false },
  { key: 'subscriptions', label: 'Subscription Revenue', supportsLiveMetrics: false },
  { key: 'marketplace', label: 'Marketplace Revenue', supportsLiveMetrics: false },
  { key: 'enterprise', label: 'Enterprise Plans', supportsLiveMetrics: false },
  { key: 'licensing', label: 'Licensing Revenue', supportsLiveMetrics: false },
] as const;

export const REVENUE_METRIC_KEYS = [
  { key: 'total_revenue', label: 'Total Revenue' },
  { key: 'royalties', label: 'Royalties' },
  { key: 'subscription_revenue', label: 'Subscription Revenue' },
  { key: 'partner_revenue', label: 'Partner Revenue' },
] as const;

export const SCORECARD_KEYS = [
  { key: 'platform', label: 'Platform' },
  { key: 'artists', label: 'Artists' },
  { key: 'partners', label: 'Partners' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'audience', label: 'Audience' },
  { key: 'streaming', label: 'Streaming' },
  { key: 'marketing', label: 'Marketing' },
] as const;

export const HEALTH_SCORE_WEIGHTS = {
  intelligence: 0.15,
  ai: 0.15,
  music: 0.15,
  streaming: 0.15,
  audience: 0.15,
  marketing: 0.15,
  coverage: 0.1,
} as const;

export const ALERT_THRESHOLDS = {
  lowHealthScore: 40,
  intelligenceGapMinEngines: 4,
  rapidGrowthValue: 5,
} as const;
