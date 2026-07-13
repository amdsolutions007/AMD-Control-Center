import { SCHEDULED_OPERATION_DEFINITIONS } from './automation-constants';
import type { CollectedAutomationData } from './automation-collector';
import { evaluateAutomationRules } from './automation-rules-engine';
import type {
  AutomationApprovalCenter,
  AutomationEnginePayload,
  AutomationExecutiveAlert,
  AutomationExecutiveAlerts,
  AutomationHealthDashboard,
  AutomationHistory,
  AutomationTimelineEvent,
  ExecutiveAutomationReport,
  ScheduledOperation,
  ScheduledOperations,
  WorkflowAutomation,
} from './automation-types';
import {
  appendNotificationTimelineEvents,
  buildNotificationCenter,
} from './notification-manager';
import { orchestrateWorkflows } from './workflow-orchestrator';

function buildScheduledOperations(collected: CollectedAutomationData): ScheduledOperations {
  const operations: ScheduledOperation[] = SCHEDULED_OPERATION_DEFINITIONS.map((def) => ({
    id: def.id,
    name: def.name,
    schedule: def.schedule,
    nextRun: collected.dataAvailable ? null : null,
    approvalMode: def.approvalMode,
    status: collected.dataAvailable ? 'scheduled' : 'awaiting_data',
    summary: collected.dataAvailable
      ? `Scheduled operation ready (${def.schedule}). Execution requires approval per mode.`
      : 'Awaiting Business Intelligence live data to activate schedule.',
  }));

  return {
    operations,
    summary: collected.dataAvailable
      ? `${operations.length} scheduled operations configured.`
      : 'Scheduled operations awaiting production intelligence data.',
  };
}

function buildExecutiveAlerts(collected: CollectedAutomationData): AutomationExecutiveAlerts {
  const alerts: AutomationExecutiveAlert[] = collected.business.alerts.map((a) => ({
    id: a.id,
    title: a.title,
    severity: a.severity,
    source: a.source,
    automationEligible: true,
    suggestedWorkflowId: mapAlertToWorkflow(a.type),
    detail: a.detail,
  }));

  return {
    alerts,
    summary:
      alerts.length > 0
        ? `${alerts.length} executive alert(s) eligible for automation workflows.`
        : 'No executive alerts requiring automation at this time.',
  };
}

function mapAlertToWorkflow(alertType: string): string | null {
  const map: Record<string, string> = {
    intelligence_gap: 'wf-profile-completion',
    declining_performance: 'wf-executive-review',
    campaign_opportunity: 'wf-utm-guidance',
    rapid_growth: 'wf-growth-milestone',
    missing_data: 'wf-data-activation',
  };
  return map[alertType] ?? null;
}

function buildApprovalCenter(orchestration: ReturnType<typeof orchestrateWorkflows>): AutomationApprovalCenter {
  return {
    pending: orchestration.approvals.filter((a) => a.status === 'pending'),
    approved: orchestration.approvals.filter((a) => a.status === 'approved'),
    rejected: orchestration.approvals.filter((a) => a.status === 'rejected'),
    summary:
      orchestration.approvals.length > 0
        ? `${orchestration.approvals.length} approval request(s) pending review.`
        : 'No pending automation approvals.',
  };
}

function buildAutomationHistory(orchestration: ReturnType<typeof orchestrateWorkflows>): AutomationHistory {
  return {
    records: orchestration.executions,
    totalExecutions: orchestration.executions.length,
    summary:
      orchestration.executions.length > 0
        ? `${orchestration.executions.length} workflow execution record(s) in current audit trail.`
        : 'Automation history awaiting workflow triggers.',
  };
}

function buildHealthDashboard(
  rulesEngine: ReturnType<typeof evaluateAutomationRules>,
  workflowAutomation: WorkflowAutomation,
  notificationUnread: number,
): AutomationHealthDashboard {
  const triggered = workflowAutomation.workflows.filter((w) => w.status !== 'idle').length;
  const successCount = workflowAutomation.workflows.filter((w) => w.status === 'executed').length;
  const executionSuccessRate =
    triggered > 0 ? Math.round((successCount / triggered) * 100) : null;

  const automationHealthScore =
    rulesEngine.matchedRules > 0
      ? Math.min(100, 50 + rulesEngine.matchedRules * 10 + (executionSuccessRate ?? 0) / 2)
      : 60;

  return {
    automationHealthScore: Math.round(automationHealthScore),
    activeWorkflows: triggered,
    pendingApprovals: workflowAutomation.pendingApprovals,
    executionSuccessRate,
    notificationCoverage: notificationUnread > 0 ? 100 : 20,
    summary: `Automation health: ${triggered} active workflow(s) · ${workflowAutomation.pendingApprovals} pending approval(s).`,
  };
}

function buildExecutiveReport(
  collected: CollectedAutomationData,
  rulesEngine: ReturnType<typeof evaluateAutomationRules>,
  workflowAutomation: WorkflowAutomation,
  approvalCenter: AutomationApprovalCenter,
  notificationCenter: ReturnType<typeof buildNotificationCenter>,
): ExecutiveAutomationReport {
  const risks: string[] = [];
  if (approvalCenter.pending.some((a) => a.approvalMode === 'executive_approval_required')) {
    risks.push('Executive approval required for health review workflow.');
  }
  if (rulesEngine.matchedRules === 0 && collected.dataAvailable) {
    risks.push('No automation rules matched — verify Business Intelligence signals.');
  }

  const recommendations = [
    ...collected.business.executiveReport.recommendations.slice(0, 4),
    ...(approvalCenter.pending.length > 0
      ? [`Review ${approvalCenter.pending.length} pending automation approval(s).`]
      : []),
  ];

  return {
    automationStatus:
      rulesEngine.matchedRules > 0
        ? `${rulesEngine.matchedRules} automation rule(s) active.`
        : 'Automation engine standby — awaiting matching intelligence signals.',
    workflowSummary: workflowAutomation.summary,
    approvalSummary: approvalCenter.summary,
    notificationSummary: notificationCenter.summary,
    risks: risks.length > 0 ? risks : ['No critical automation risks detected.'],
    recommendations,
    summary: `Executive automation report · ${workflowAutomation.activeWorkflows} workflow(s) evaluated · ${notificationCenter.unreadCount} notification(s).`,
  };
}

export function processAutomationData(collected: CollectedAutomationData): Omit<AutomationEnginePayload, 'scope' | 'generatedAt' | 'dataSource'> {
  const rulesEngine = evaluateAutomationRules(collected);
  const matchedRules = rulesEngine.rules.filter((r) => r.matched);
  const orchestration = orchestrateWorkflows(collected, matchedRules);

  const workflowAutomation: WorkflowAutomation = {
    workflows: orchestration.workflows,
    activeWorkflows: orchestration.workflows.filter((w) => w.status !== 'idle').length,
    pendingApprovals: orchestration.approvals.filter((a) => a.status === 'pending').length,
    summary:
      orchestration.workflows.filter((w) => w.status !== 'idle').length > 0
        ? `${orchestration.workflows.filter((w) => w.status !== 'idle').length} workflow(s) triggered from Business Intelligence.`
        : 'Workflow automation standby — no matching intelligence signals.',
  };

  const scheduledOperations = buildScheduledOperations(collected);
  const executiveAlerts = buildExecutiveAlerts(collected);
  const notificationCenter = buildNotificationCenter(orchestration, collected.business.generatedAt);
  const approvalCenter = buildApprovalCenter(orchestration);
  const automationHistory = buildAutomationHistory(orchestration);
  const healthDashboard = buildHealthDashboard(rulesEngine, workflowAutomation, notificationCenter.unreadCount);

  const ruleTimeline: AutomationTimelineEvent[] = matchedRules.map((r) => ({
    id: `tl-rule-${r.id}`,
    type: 'rule_matched' as const,
    label: `Rule matched: ${r.name}`,
    timestamp: collected.business.generatedAt,
    detail: r.matchReason ?? r.description,
    workflowId: null,
  }));

  const timeline = appendNotificationTimelineEvents(
    [...ruleTimeline, ...orchestration.timeline],
    notificationCenter.dashboardNotifications,
  );

  const executiveReport = buildExecutiveReport(
    collected,
    rulesEngine,
    workflowAutomation,
    approvalCenter,
    notificationCenter,
  );

  return {
    rulesEngine,
    workflowAutomation,
    scheduledOperations,
    executiveAlerts,
    notificationCenter,
    automationHistory,
    approvalCenter,
    healthDashboard,
    timeline,
    executiveReport,
  };
}
