import { WORKFLOW_TEMPLATES } from './automation-constants';
import type { CollectedAutomationData } from './automation-collector';
import type { AutomationRule } from './automation-types';
import type {
  ApprovalRequest,
  AutomationExecutionRecord,
  AutomationTimelineEvent,
  WorkflowDefinition,
  WorkflowStatus,
} from './automation-types';

export interface OrchestrationResult {
  workflows: WorkflowDefinition[];
  executions: AutomationExecutionRecord[];
  approvals: ApprovalRequest[];
  timeline: AutomationTimelineEvent[];
}

function resolveWorkflowStatus(approvalMode: AutomationRule['approvalMode']): WorkflowStatus {
  if (approvalMode === 'automatic') return 'executed';
  return 'pending_approval';
}

function resolveExecutionStatus(approvalMode: AutomationRule['approvalMode']): AutomationExecutionRecord['status'] {
  if (approvalMode === 'automatic') return 'success';
  return 'awaiting_approval';
}

export function orchestrateWorkflows(
  collected: CollectedAutomationData,
  matchedRules: AutomationRule[],
): OrchestrationResult {
  const now = collected.business.generatedAt;
  const workflows: WorkflowDefinition[] = [];
  const executions: AutomationExecutionRecord[] = [];
  const approvals: ApprovalRequest[] = [];
  const timeline: AutomationTimelineEvent[] = [];

  const matchedRuleIds = new Set(matchedRules.map((r) => r.id));

  for (const template of WORKFLOW_TEMPLATES) {
    const triggered = template.ruleIds.some((id) => matchedRuleIds.has(id));
    if (!triggered) {
      workflows.push({
        id: template.id,
        name: template.name,
        trigger: template.trigger,
        conditions: template.conditions,
        actions: template.actions,
        approvalMode: template.approvalMode,
        status: 'idle',
        retryable: template.retryable,
        summary: 'Awaiting matching Business Intelligence signal.',
      });
      continue;
    }

    const rule = matchedRules.find((r) => template.ruleIds.includes(r.id));
    const status = resolveWorkflowStatus(template.approvalMode);
    const execStatus = resolveExecutionStatus(template.approvalMode);
    const durationMs = template.approvalMode === 'automatic' ? 12 : 0;

    workflows.push({
      id: template.id,
      name: template.name,
      trigger: template.trigger,
      conditions: template.conditions,
      actions: template.actions,
      approvalMode: template.approvalMode,
      status,
      retryable: template.retryable,
      summary: rule?.matchReason ?? 'Workflow triggered by Business Intelligence signal.',
    });

    const executionId = `exec-${template.id}-${Date.now()}`;
    executions.push({
      id: executionId,
      workflowId: template.id,
      trigger: template.trigger,
      timestamp: now,
      userId: collected.userId,
      status: execStatus,
      durationMs,
      result:
        execStatus === 'success'
          ? 'Dashboard notification queued. No irreversible action executed.'
          : 'Awaiting approval before execution.',
      approvalMode: template.approvalMode,
      error: null,
    });

    timeline.push({
      id: `tl-trigger-${template.id}`,
      type: 'workflow_triggered',
      label: `${template.name} triggered`,
      timestamp: now,
      detail: rule?.matchReason ?? template.conditions.join(' · '),
      workflowId: template.id,
    });

    if (template.approvalMode !== 'automatic') {
      const approvalId = `approval-${template.id}`;
      approvals.push({
        id: approvalId,
        workflowId: template.id,
        workflowName: template.name,
        approvalMode: template.approvalMode,
        requestedAt: now,
        status: 'pending',
        summary: rule?.matchReason ?? 'Approval required before workflow execution.',
        action: template.actions.join(' · '),
      });

      timeline.push({
        id: `tl-approval-${template.id}`,
        type: 'approval_requested',
        label: `Approval requested: ${template.name}`,
        timestamp: now,
        detail: `Mode: ${template.approvalMode.replace(/_/g, ' ')}`,
        workflowId: template.id,
      });
    } else {
      timeline.push({
        id: `tl-exec-${template.id}`,
        type: 'execution_complete',
        label: `${template.name} executed`,
        timestamp: now,
        detail: 'Automatic mode — dashboard notification only.',
        workflowId: template.id,
      });
    }
  }

  return { workflows, executions, approvals, timeline };
}
