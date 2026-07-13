export type BusinessEngineScope = 'artist' | 'partner';

export type EngineKey =
  | 'intelligence'
  | 'ai'
  | 'music'
  | 'streaming'
  | 'audience'
  | 'marketing';

export type EngineStatus = 'live' | 'fallback' | 'partial';
export type AlertSeverity = 'info' | 'warning' | 'opportunity' | 'critical';
export type AlertType =
  | 'rapid_growth'
  | 'declining_performance'
  | 'missing_data'
  | 'platform_health'
  | 'campaign_opportunity'
  | 'intelligence_gap';
export type RevenueConnectorStatus = 'awaiting_integration' | 'connected' | 'disconnected';
export type HealthLevel = 'healthy' | 'developing' | 'needs_attention' | 'awaiting_data';

export interface BusinessKpiMetric {
  key: string;
  label: string;
  value: number | string | null;
  available: boolean;
  source: EngineKey | 'composite';
  emptyStateMessage: string;
}

export interface ExecutiveKpiDashboard {
  metrics: BusinessKpiMetric[];
  executiveScore: number | null;
  hasLiveData: boolean;
  summary: string;
}

export interface BusinessHealthIntelligence {
  overallHealth: HealthLevel;
  growthScore: number | null;
  operationalHealth: HealthLevel;
  platformStability: HealthLevel;
  intelligenceCoverage: number;
  executiveReadiness: number | null;
  summary: string;
}

export interface GrowthPeriodMetric {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  label: string;
  value: number | null;
  trend: 'up' | 'down' | 'stable' | 'unknown';
  available: boolean;
}

export interface GrowthIntelligence {
  periods: GrowthPeriodMetric[];
  growthTrend: string;
  hasLiveData: boolean;
  summary: string;
}

export interface RevenueConnector {
  key: string;
  label: string;
  status: RevenueConnectorStatus;
  supportsLiveMetrics: boolean;
  summary: string;
}

export interface RevenueMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  emptyStateMessage: string;
}

export interface RevenueIntelligenceFramework {
  connectors: RevenueConnector[];
  metrics: RevenueMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface PerformanceDomain {
  key: string;
  label: string;
  score: number | null;
  summary: string;
  source: EngineKey;
}

export interface ExecutivePerformanceIntelligence {
  domains: PerformanceDomain[];
  hasLiveData: boolean;
  summary: string;
}

export interface EngineStatusItem {
  engine: EngineKey;
  label: string;
  status: EngineStatus;
  dataSource: 'live' | 'fallback';
  summary: string;
}

export interface CrossEngineIntelligence {
  unifiedSummary: string;
  engineStatuses: EngineStatusItem[];
  topRecommendations: string[];
  enginesWithLiveData: number;
  totalEngines: number;
}

export interface ExecutiveAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  detail: string;
  source: EngineKey | 'composite';
  timestamp: string;
}

export interface ExecutiveScorecard {
  key: string;
  label: string;
  score: number | null;
  status: HealthLevel;
  summary: string;
}

export interface ExecutiveScorecards {
  scorecards: ExecutiveScorecard[];
  overallScore: number | null;
  summary: string;
}

export interface BusinessTimelineEvent {
  id: string;
  engine: EngineKey;
  type: string;
  label: string;
  timestamp: string;
  detail: string;
}

export interface ExecutiveBusinessReport {
  businessStatus: string;
  operationalHealth: string;
  executiveKpiSummary: string;
  intelligenceSummary: string;
  businessRisks: string[];
  growthOpportunities: string[];
  recommendations: string[];
  summary: string;
}

export interface BusinessHealthDashboard {
  executiveHealthScore: number | null;
  businessGrowthScore: number | null;
  revenueReadiness: number | null;
  platformHealthScore: number | null;
  overallExecutiveScore: number | null;
  summary: string;
}

export interface BusinessEnginePayload {
  scope: BusinessEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  executiveKpis: ExecutiveKpiDashboard;
  businessHealth: BusinessHealthIntelligence;
  growth: GrowthIntelligence;
  revenue: RevenueIntelligenceFramework;
  performance: ExecutivePerformanceIntelligence;
  crossEngine: CrossEngineIntelligence;
  alerts: ExecutiveAlert[];
  scorecards: ExecutiveScorecards;
  timeline: BusinessTimelineEvent[];
  executiveReport: ExecutiveBusinessReport;
  healthDashboard: BusinessHealthDashboard;
}
