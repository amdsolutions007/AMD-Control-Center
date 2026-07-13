export type MarketingEngineScope = 'artist' | 'partner';

export type MetricSource = 'production_data' | 'platform_api' | 'connector_pending' | 'none';
export type ConnectorStatus = 'connected' | 'pending' | 'disconnected';
export type CampaignHealth = 'healthy' | 'active' | 'developing' | 'awaiting_data';
export type CampaignStatus = 'active' | 'completed' | 'pending' | 'unknown';

export interface MarketingMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  source: MetricSource;
  unit: string;
  emptyStateMessage: string;
}

export interface MarketingConnectorStatus {
  platformKey: string;
  label: string;
  connectionStatus: ConnectorStatus;
  supportsCampaignMetrics: boolean;
  lastSynchronization: string | null;
  summary: string;
}

export interface CampaignIntelligenceItem {
  id: string;
  campaignName: string;
  campaignType: string;
  platform: string;
  campaignObjective: string;
  status: CampaignStatus;
  budget: number | null;
  spend: number | null;
  campaignHealth: CampaignHealth;
  clickCount: number | null;
  derivedFrom: string;
}

export interface CampaignIntelligence {
  campaigns: CampaignIntelligenceItem[];
  totalCampaigns: number;
  activeCampaigns: number;
  summary: string;
  hasLiveData: boolean;
}

export interface PerformanceIntelligence {
  metrics: MarketingMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface ConversionFunnelStep {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
}

export interface ConversionIntelligence {
  funnel: ConversionFunnelStep[];
  conversionRate: number | null;
  hasLiveData: boolean;
  summary: string;
}

export interface RoiIntelligence {
  metrics: MarketingMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface AcquisitionSource {
  source: string;
  label: string;
  count: number;
  share: number;
  type: 'organic' | 'paid' | 'direct';
}

export interface AudienceAcquisitionIntelligence {
  sources: AcquisitionSource[];
  newUsers: number | null;
  returningUsers: number | null;
  organicGrowth: number | null;
  paidGrowth: number | null;
  hasLiveData: boolean;
  summary: string;
}

export interface GeographicMarketingEntry {
  territory: string;
  clicks: number;
  conversions: number | null;
  share: number;
}

export interface GeographicMarketingIntelligence {
  entries: GeographicMarketingEntry[];
  topTerritory: string | null;
  hasLiveData: boolean;
  summary: string;
}

export interface PlatformComparisonEntry {
  platformKey: string;
  label: string;
  clicks: number | null;
  conversions: number | null;
  ctr: number | null;
  cpc: number | null;
  roi: number | null;
  engagementRate: number | null;
  connectionStatus: ConnectorStatus;
  rank: number | null;
}

export interface PlatformComparisonEngine {
  entries: PlatformComparisonEntry[];
  bestPerformingPlatform: string | null;
  highestRoi: string | null;
  lowestCpc: string | null;
  highestConversion: string | null;
  summary: string;
}

export interface ExecutiveMarketingReport {
  campaignHealth: CampaignHealth;
  budgetUtilization: string;
  marketingPerformance: string;
  roiSummary: string;
  conversionSummary: string;
  recommendations: string[];
  summary: string;
}

export interface MarketingTimelineEvent {
  id: string;
  type:
    | 'campaign_created'
    | 'campaign_started'
    | 'budget_change'
    | 'performance_milestone'
    | 'campaign_completed'
    | 'conversion_milestone';
  label: string;
  timestamp: string;
  detail: string;
}

export interface MarketingHealthDashboard {
  marketingHealthScore: number | null;
  campaignScore: number | null;
  roiScore: number | null;
  conversionScore: number | null;
  platformCoverage: number | null;
  attributionStatus: 'active' | 'partial' | 'awaiting_integrations';
  summary: string;
}

export interface MarketingEnginePortfolioSummary {
  totalCampaigns: number;
  totalClicks: number | null;
  totalConversions: number | null;
  connectedPlatforms: number;
  summary: string;
}

export interface MarketingEnginePayload {
  scope: MarketingEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  portfolioSummary: MarketingEnginePortfolioSummary;
  connectors: MarketingConnectorStatus[];
  campaigns: CampaignIntelligence;
  performance: PerformanceIntelligence;
  conversion: ConversionIntelligence;
  roi: RoiIntelligence;
  acquisition: AudienceAcquisitionIntelligence;
  geographic: GeographicMarketingIntelligence;
  platformComparison: PlatformComparisonEngine;
  executiveReport: ExecutiveMarketingReport;
  timeline: MarketingTimelineEvent[];
  healthDashboard: MarketingHealthDashboard;
}
