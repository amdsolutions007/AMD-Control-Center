import {
  collectArtistAutomationData,
  collectPartnerAutomationData,
} from './automation-collector';
import { processAutomationData } from './automation-processor';
import type { AutomationEnginePayload } from './automation-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

function emptyPayload(scope: 'artist' | 'partner'): AutomationEnginePayload {
  const now = new Date().toISOString();
  return {
    scope,
    generatedAt: now,
    dataSource: 'fallback',
    rulesEngine: {
      rules: [],
      activeRules: 0,
      matchedRules: 0,
      summary: 'Automation rules engine awaiting Business Intelligence data.',
    },
    workflowAutomation: {
      workflows: [],
      activeWorkflows: 0,
      pendingApprovals: 0,
      summary: 'Workflow automation awaiting intelligence signals.',
    },
    scheduledOperations: {
      operations: [],
      summary: 'Scheduled operations awaiting data.',
    },
    executiveAlerts: {
      alerts: [],
      summary: 'No automation-eligible alerts.',
    },
    notificationCenter: {
      dashboardNotifications: [],
      connectors: [],
      unreadCount: 0,
      summary: 'Notification center awaiting automation activity.',
    },
    automationHistory: {
      records: [],
      totalExecutions: 0,
      summary: 'Automation history empty.',
    },
    approvalCenter: {
      pending: [],
      approved: [],
      rejected: [],
      summary: 'No pending approvals.',
    },
    healthDashboard: {
      automationHealthScore: null,
      activeWorkflows: 0,
      pendingApprovals: 0,
      executionSuccessRate: null,
      notificationCoverage: 0,
      summary: 'Automation health dashboard awaiting data.',
    },
    timeline: [],
    executiveReport: {
      automationStatus: 'Awaiting data.',
      workflowSummary: 'Awaiting data.',
      approvalSummary: 'Awaiting data.',
      notificationSummary: 'Awaiting data.',
      risks: [],
      recommendations: ['Complete profile and submissions to activate automation.'],
      summary: 'Executive automation report awaiting Business Intelligence data.',
    },
  };
}

export async function loadArtistAutomationEngine(
  session: MIWorkspaceSession,
): Promise<AutomationEnginePayload> {
  const collected = await collectArtistAutomationData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  const processed = processAutomationData(collected);
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerAutomationEngine(
  session: MIPartnerWorkspaceSession,
): Promise<AutomationEnginePayload> {
  const collected = await collectPartnerAutomationData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  const processed = processAutomationData(collected);
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
