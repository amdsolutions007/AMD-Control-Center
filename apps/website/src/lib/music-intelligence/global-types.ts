export type GlobalEngineScope = 'artist' | 'partner';

export type FederationLevel = 'strong' | 'moderate' | 'developing' | 'awaiting_data';
export type AlertSeverity = 'info' | 'watch' | 'attention';
export type RegionalKey = 'west_africa' | 'east_africa' | 'north_america' | 'europe' | 'global_aggregate';

export interface GlobalExecutiveDashboard {
  globalHealthIndex: number | null;
  federationCoverage: number;
  benchmarkPosition: string | null;
  activeAlerts: number;
  opportunityCount: number;
  summary: string;
}

export interface RegionalMetric {
  key: RegionalKey;
  label: string;
  indexScore: number | null;
  trend: 'up' | 'stable' | 'down' | 'awaiting_data';
  summary: string;
}

export interface RegionalIntelligence {
  regions: RegionalMetric[];
  hasLiveData: boolean;
  tenantIsolated: true;
  summary: string;
}

export interface IndustrySegment {
  key: string;
  label: string;
  indexScore: number | null;
  cohortLabel: string;
  summary: string;
}

export interface IndustryIntelligence {
  segments: IndustrySegment[];
  hasLiveData: boolean;
  tenantIsolated: true;
  summary: string;
}

export interface GlobalPerformanceMetric {
  key: string;
  label: string;
  value: string | number | null;
  source: 'federated';
}

export interface GlobalPerformanceIntelligence {
  metrics: GlobalPerformanceMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface GlobalBenchmark {
  key: string;
  label: string;
  tenantIndex: number | null;
  cohortMedian: number | null;
  percentileBand: string | null;
  summary: string;
}

export interface GlobalBenchmarkIntelligence {
  benchmarks: GlobalBenchmark[];
  hasLiveData: boolean;
  tenantIsolated: true;
  summary: string;
}

export interface GlobalHealthIntelligence {
  globalHealthIndex: number | null;
  federationStrength: FederationLevel;
  intelligenceCoverage: number;
  operationalReadiness: number | null;
  summary: string;
}

export interface GlobalOpportunity {
  id: string;
  label: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  summary: string;
}

export interface GlobalOpportunityIntelligence {
  opportunities: GlobalOpportunity[];
  hasLiveData: boolean;
  summary: string;
}

export interface GlobalAlert {
  id: string;
  severity: AlertSeverity;
  label: string;
  summary: string;
  timestamp: string;
}

export interface GlobalTimelineEvent {
  id: string;
  source: 'federation' | 'global';
  type: string;
  label: string;
  timestamp: string;
  detail: string;
}

export interface GlobalExecutiveReport {
  dashboardSummary: string;
  regionalSummary: string;
  industrySummary: string;
  benchmarkSummary: string;
  opportunitySummary: string;
  risks: string[];
  recommendations: string[];
  summary: string;
}

export interface GlobalEnginePayload {
  scope: GlobalEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  tenantIsolationEnforced: true;
  executiveDashboard: GlobalExecutiveDashboard;
  regional: RegionalIntelligence;
  industry: IndustryIntelligence;
  performance: GlobalPerformanceIntelligence;
  benchmarks: GlobalBenchmarkIntelligence;
  health: GlobalHealthIntelligence;
  opportunities: GlobalOpportunityIntelligence;
  alerts: GlobalAlert[];
  timeline: GlobalTimelineEvent[];
  globalReport: GlobalExecutiveReport;
}

export interface FederatedGlobalSignals {
  anonymizedHealthIndex: number | null;
  intelligenceCoverage: number;
  operationalReadiness: number | null;
  governanceIndex: number | null;
  automationIndex: number | null;
  federationCoverage: number;
  cohortPercentileBand: string | null;
  pendingGlobalActions: number;
  hasLiveData: boolean;
}
