export type AutomationEngineScope = 'artist' | 'partner';

export type ApprovalMode = 'automatic' | 'manual_approval' | 'executive_approval_required';

export type WorkflowStatus =
  | 'idle'
  | 'triggered'
  | 'pending_approval'
  | 'approved'
  | 'executed'
  | 'failed'
  | 'skipped';

export type ExecutionStatus = 'success' | 'pending' | 'failed' | 'awaiting_approval';

export type NotificationChannel = 'dashboard' | 'email' | 'whatsapp' | 'slack' | 'teams';

export type NotificationConnectorStatus = 'active' | 'awaiting_integration' | 'disconnected';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  approvalMode: ApprovalMode;
  enabled: boolean;
  matched: boolean;
  matchReason: string | null;
}

export interface AutomationRulesEngine {
  rules: AutomationRule[];
  activeRules: number;
  matchedRules: number;
  summary: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  approvalMode: ApprovalMode;
  status: WorkflowStatus;
  retryable: boolean;
  summary: string;
}

export interface WorkflowAutomation {
  workflows: WorkflowDefinition[];
  activeWorkflows: number;
  pendingApprovals: number;
  summary: string;
}

export interface ScheduledOperation {
  id: string;
  name: string;
  schedule: string;
  nextRun: string | null;
  approvalMode: ApprovalMode;
  status: 'scheduled' | 'awaiting_data' | 'disabled';
  summary: string;
}

export interface ScheduledOperations {
  operations: ScheduledOperation[];
  summary: string;
}

export interface AutomationExecutiveAlert {
  id: string;
  title: string;
  severity: string;
  source: string;
  automationEligible: boolean;
  suggestedWorkflowId: string | null;
  detail: string;
}

export interface AutomationExecutiveAlerts {
  alerts: AutomationExecutiveAlert[];
  summary: string;
}

export interface DashboardNotification {
  id: string;
  channel: 'dashboard';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  workflowId: string | null;
}

export interface NotificationConnector {
  channel: NotificationChannel;
  label: string;
  status: NotificationConnectorStatus;
  summary: string;
}

export interface NotificationCenter {
  dashboardNotifications: DashboardNotification[];
  connectors: NotificationConnector[];
  unreadCount: number;
  summary: string;
}

export interface AutomationExecutionRecord {
  id: string;
  workflowId: string;
  trigger: string;
  timestamp: string;
  userId: string;
  status: ExecutionStatus;
  durationMs: number;
  result: string;
  approvalMode: ApprovalMode;
  error: string | null;
}

export interface AutomationHistory {
  records: AutomationExecutionRecord[];
  totalExecutions: number;
  summary: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  workflowName: string;
  approvalMode: ApprovalMode;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  summary: string;
  action: string;
}

export interface AutomationApprovalCenter {
  pending: ApprovalRequest[];
  approved: ApprovalRequest[];
  rejected: ApprovalRequest[];
  summary: string;
}

export interface AutomationHealthDashboard {
  automationHealthScore: number | null;
  activeWorkflows: number;
  pendingApprovals: number;
  executionSuccessRate: number | null;
  notificationCoverage: number;
  summary: string;
}

export interface AutomationTimelineEvent {
  id: string;
  type: 'rule_matched' | 'workflow_triggered' | 'approval_requested' | 'notification_sent' | 'execution_complete';
  label: string;
  timestamp: string;
  detail: string;
  workflowId: string | null;
}

export interface ExecutiveAutomationReport {
  automationStatus: string;
  workflowSummary: string;
  approvalSummary: string;
  notificationSummary: string;
  risks: string[];
  recommendations: string[];
  summary: string;
}

export interface AutomationEnginePayload {
  scope: AutomationEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  rulesEngine: AutomationRulesEngine;
  workflowAutomation: WorkflowAutomation;
  scheduledOperations: ScheduledOperations;
  executiveAlerts: AutomationExecutiveAlerts;
  notificationCenter: NotificationCenter;
  automationHistory: AutomationHistory;
  approvalCenter: AutomationApprovalCenter;
  healthDashboard: AutomationHealthDashboard;
  timeline: AutomationTimelineEvent[];
  executiveReport: ExecutiveAutomationReport;
}
