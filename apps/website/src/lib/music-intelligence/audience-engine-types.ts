export type AudienceEngineScope = 'artist' | 'partner';

export type MetricSource = 'production_data' | 'platform_api' | 'connector_pending' | 'none';
export type ConnectorStatus = 'connected' | 'pending' | 'disconnected';
export type HealthLevel = 'healthy' | 'developing' | 'needs_attention' | 'awaiting_data';

export interface AudienceMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  source: MetricSource;
  unit: string;
  emptyStateMessage: string;
}

export interface GlobalAudienceOverview {
  metrics: AudienceMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface GeographicEntry {
  territory: string;
  count: number;
  share: number;
  growthIndicator: 'up' | 'down' | 'stable' | 'unknown';
}

export interface GeographicIntelligence {
  countries: GeographicEntry[];
  regions: GeographicEntry[];
  cities: GeographicEntry[];
  topTerritories: string[];
  geographicGrowth: number | null;
  summary: string;
  hasLiveData: boolean;
}

export interface DemographicSegment {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  emptyStateMessage: string;
}

export interface DemographicIntelligence {
  ageGroups: DemographicSegment[];
  gender: DemographicSegment[];
  languages: DemographicSegment[];
  audienceSegments: DemographicSegment[];
  listenerCategories: DemographicSegment[];
  hasLiveData: boolean;
  summary: string;
}

export interface PlatformAudienceEntry {
  platformKey: string;
  label: string;
  connectionStatus: ConnectorStatus;
  audienceCount: number | null;
  share: number | null;
  apiReady: boolean;
}

export interface PlatformAudienceDistribution {
  entries: PlatformAudienceEntry[];
  connectedCount: number;
  summary: string;
}

export interface BehaviourMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  detail: string;
}

export interface AudienceBehaviourIntelligence {
  metrics: BehaviourMetric[];
  summary: string;
  hasLiveData: boolean;
}

export interface EngagementMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  source: MetricSource;
  emptyStateMessage: string;
}

export interface EngagementIntelligence {
  metrics: EngagementMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface GrowthPeriod {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  label: string;
  value: number | null;
  trend: 'up' | 'down' | 'stable' | 'unknown';
  available: boolean;
}

export interface GrowthIntelligence {
  periods: GrowthPeriod[];
  growthTrend: string;
  hasLiveData: boolean;
  summary: string;
}

export interface ExecutiveAudienceReport {
  audienceHealth: HealthLevel;
  growthSummary: string;
  geographicSummary: string;
  demographicSummary: string;
  platformSummary: string;
  engagementSummary: string;
  recommendations: string[];
  summary: string;
}

export interface AudienceTimelineEvent {
  id: string;
  type:
    | 'first_audience'
    | 'growth_milestone'
    | 'geographic_expansion'
    | 'platform_expansion'
    | 'audience_peak'
    | 'campaign_impact';
  label: string;
  timestamp: string;
  detail: string;
}

export interface AudienceHealthDashboard {
  audienceHealthScore: number | null;
  growthScore: number | null;
  engagementScore: number | null;
  geographicCoverage: number | null;
  platformCoverage: number | null;
  intelligenceStatus: 'active' | 'partial' | 'awaiting_integrations';
  summary: string;
}

export interface AudienceConnectorStatus {
  platformKey: string;
  label: string;
  connectionStatus: ConnectorStatus;
  supportsAudienceMetrics: boolean;
  lastSynchronization: string | null;
  summary: string;
}

export interface AudienceEnginePortfolioSummary {
  totalAudienceContacts: number | null;
  activeSessions: number | null;
  geographicTerritories: number;
  connectedPlatforms: number;
  summary: string;
}

export interface AudienceEnginePayload {
  scope: AudienceEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  portfolioSummary: AudienceEnginePortfolioSummary;
  connectors: AudienceConnectorStatus[];
  globalOverview: GlobalAudienceOverview;
  geographic: GeographicIntelligence;
  demographic: DemographicIntelligence;
  platformDistribution: PlatformAudienceDistribution;
  behaviour: AudienceBehaviourIntelligence;
  engagement: EngagementIntelligence;
  growth: GrowthIntelligence;
  executiveReport: ExecutiveAudienceReport;
  timeline: AudienceTimelineEvent[];
  healthDashboard: AudienceHealthDashboard;
}
