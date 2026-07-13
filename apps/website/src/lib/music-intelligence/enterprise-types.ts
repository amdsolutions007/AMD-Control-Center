export type EnterpriseEngineScope = 'artist' | 'partner';

export type GovernanceLevel = 'compliant' | 'developing' | 'needs_attention' | 'awaiting_data';
export type RbacScope = 'artist' | 'partner' | 'enterprise' | 'delegated';
export type ApiConnectorStatus = 'active' | 'awaiting_integration' | 'disconnected';

export interface EnterpriseCommandCenter {
  executiveScore: number | null;
  automationHealth: number | null;
  intelligenceCoverage: number;
  pendingApprovals: number;
  activeWorkflows: number;
  organizationCount: number | null;
  summary: string;
}

export interface OrganizationMetric {
  key: string;
  label: string;
  value: number | string | null;
  available: boolean;
  emptyStateMessage: string;
}

export interface OrganizationIntelligence {
  metrics: OrganizationMetric[];
  hasLiveData: boolean;
  summary: string;
}

export interface AdministrationEntity {
  id: string;
  type: 'organization' | 'department' | 'team' | 'member' | 'invitation' | 'enterprise_account';
  label: string;
  count: number | null;
  status: string;
  summary: string;
}

export interface EnterpriseAdministration {
  entities: AdministrationEntity[];
  delegatedAdminEnabled: boolean;
  summary: string;
}

export interface GovernanceModule {
  key: string;
  label: string;
  status: GovernanceLevel;
  score: number | null;
  summary: string;
}

export interface EnterpriseGovernance {
  modules: GovernanceModule[];
  governanceHealthScore: number | null;
  summary: string;
}

export interface RbacRole {
  key: string;
  label: string;
  scope: RbacScope;
  permissions: string[];
  active: boolean;
}

export interface EnterpriseRbac {
  roles: RbacRole[];
  currentScope: EnterpriseEngineScope;
  sessionProtected: boolean;
  summary: string;
}

export interface EnterpriseAnalyticItem {
  key: string;
  label: string;
  value: string | number | null;
  source: 'business' | 'automation' | 'composite';
}

export interface EnterpriseAnalytics {
  items: EnterpriseAnalyticItem[];
  hasLiveData: boolean;
  summary: string;
}

export interface EnterpriseHealthDashboard {
  enterpriseHealthScore: number | null;
  governanceScore: number | null;
  automationScore: number | null;
  businessScore: number | null;
  operationalReadiness: number | null;
  summary: string;
}

export interface EnterpriseTimelineEvent {
  id: string;
  source: 'business' | 'automation' | 'enterprise';
  type: string;
  label: string;
  timestamp: string;
  detail: string;
}

export interface EnterpriseReport {
  commandCenterSummary: string;
  governanceSummary: string;
  administrationSummary: string;
  analyticsSummary: string;
  risks: string[];
  recommendations: string[];
  summary: string;
}

export interface EnterpriseApiConnector {
  key: string;
  label: string;
  status: ApiConnectorStatus;
  supportsLiveData: boolean;
  summary: string;
}

export interface EnterpriseApiFramework {
  connectors: EnterpriseApiConnector[];
  protectedRoutes: string[];
  summary: string;
}

export interface EnterpriseEnginePayload {
  scope: EnterpriseEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  commandCenter: EnterpriseCommandCenter;
  organization: OrganizationIntelligence;
  administration: EnterpriseAdministration;
  governance: EnterpriseGovernance;
  rbac: EnterpriseRbac;
  analytics: EnterpriseAnalytics;
  healthDashboard: EnterpriseHealthDashboard;
  timeline: EnterpriseTimelineEvent[];
  enterpriseReport: EnterpriseReport;
  apiFramework: EnterpriseApiFramework;
}
