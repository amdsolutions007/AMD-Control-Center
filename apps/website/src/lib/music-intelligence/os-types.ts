export type OSEngineScope = 'artist' | 'partner';

export type KernelStatus = 'operational' | 'degraded' | 'standby';
export type EngineRegistryStatus = 'live' | 'fallback' | 'registered';
export type AgentFrameworkStatus = 'framework_ready' | 'awaiting_activation';
export type AlertSeverity = 'info' | 'watch' | 'attention';

export interface OSCommandCenter {
  systemHealthScore: number | null;
  enginesLive: number;
  enginesRegistered: number;
  activeAlerts: number;
  pendingDecisions: number;
  summary: string;
}

export interface OSKernel {
  status: KernelStatus;
  orchestrationActive: boolean;
  enginesOnline: number;
  enginesTotal: number;
  uptimeLabel: string;
  summary: string;
}

export interface IntelligenceRegistryEntry {
  key: string;
  label: string;
  phase: string;
  status: EngineRegistryStatus;
  apiRoute: string;
  summary: string;
}

export interface IntelligenceRegistry {
  entries: IntelligenceRegistryEntry[];
  liveCount: number;
  registeredCount: number;
  summary: string;
}

export interface SystemHealthMetric {
  key: string;
  label: string;
  score: number | null;
  source: string;
}

export interface SystemHealthCenter {
  overallScore: number | null;
  metrics: SystemHealthMetric[];
  summary: string;
}

export interface ExecutiveDecision {
  id: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  source: string;
  summary: string;
}

export interface ExecutiveDecisionCenter {
  decisions: ExecutiveDecision[];
  pendingCount: number;
  summary: string;
}

export interface UnifiedSearchItem {
  id: string;
  label: string;
  category: string;
  engineKey: string;
  searchable: boolean;
}

export interface UnifiedIntelligenceSearch {
  items: UnifiedSearchItem[];
  totalItems: number;
  frameworkReady: true;
  summary: string;
}

export interface OperatingTimelineEvent {
  id: string;
  source: string;
  label: string;
  timestamp: string;
  detail: string;
}

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  label: string;
  source: string;
  summary: string;
  timestamp: string;
}

export interface OSExecutiveReport {
  commandCenterSummary: string;
  kernelSummary: string;
  registrySummary: string;
  healthSummary: string;
  decisionSummary: string;
  risks: string[];
  recommendations: string[];
  summary: string;
}

export interface AIAgentDefinition {
  key: string;
  label: string;
  domain: string;
  status: AgentFrameworkStatus;
  capabilities: string[];
  summary: string;
}

export interface AIAgentFramework {
  agents: AIAgentDefinition[];
  autonomousExecution: false;
  summary: string;
}

export interface OSdashboard {
  platformName: string;
  scope: OSEngineScope;
  enginesStacked: number;
  healthScore: number | null;
  summary: string;
}

export interface OSEnginePayload {
  scope: OSEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  commandCenter: OSCommandCenter;
  kernel: OSKernel;
  registry: IntelligenceRegistry;
  healthCenter: SystemHealthCenter;
  decisionCenter: ExecutiveDecisionCenter;
  unifiedSearch: UnifiedIntelligenceSearch;
  timeline: OperatingTimelineEvent[];
  alerts: SystemAlert[];
  executiveReport: OSExecutiveReport;
  aiAgentFramework: AIAgentFramework;
  osDashboard: OSdashboard;
}
