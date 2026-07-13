import type { ApprovalMode } from './automation-types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  approvalMode: ApprovalMode;
  retryable: boolean;
  ruleIds: string[];
}

export const AUTOMATION_RULE_DEFINITIONS = [
  {
    id: 'rule-intelligence-gap',
    name: 'Intelligence Coverage Gap',
    description: 'Trigger when fewer than 4 engines report live data.',
    trigger: 'intelligence_gap',
    condition: 'enginesWithLiveData < 4',
    action: 'queue_profile_completion_workflow',
    approvalMode: 'manual_approval' as ApprovalMode,
  },
  {
    id: 'rule-declining-health',
    name: 'Declining Executive Health',
    description: 'Trigger when executive health score falls below threshold.',
    trigger: 'declining_performance',
    condition: 'executiveHealthScore < 40',
    action: 'notify_executive_review',
    approvalMode: 'executive_approval_required' as ApprovalMode,
  },
  {
    id: 'rule-campaign-opportunity',
    name: 'Campaign Attribution Opportunity',
    description: 'Trigger when marketing campaigns lack UTM attribution.',
    trigger: 'campaign_opportunity',
    condition: 'activeCampaigns === 0',
    action: 'schedule_utm_guidance',
    approvalMode: 'automatic' as ApprovalMode,
  },
  {
    id: 'rule-rapid-growth',
    name: 'Rapid Audience Growth',
    description: 'Trigger on rapid audience growth signals.',
    trigger: 'rapid_growth',
    condition: 'audienceGrowthTrend === up',
    action: 'notify_growth_milestone',
    approvalMode: 'automatic' as ApprovalMode,
  },
  {
    id: 'rule-missing-data',
    name: 'Missing Engine Data',
    description: 'Trigger when upstream engines return fallback data.',
    trigger: 'missing_data',
    condition: 'engineStatus === fallback',
    action: 'queue_data_activation_workflow',
    approvalMode: 'manual_approval' as ApprovalMode,
  },
  {
    id: 'rule-executive-recommendation',
    name: 'Executive Recommendation Available',
    description: 'Trigger when Business Intelligence produces actionable recommendations.',
    trigger: 'recommendation_available',
    condition: 'recommendations.length > 0',
    action: 'surface_recommendation_workflow',
    approvalMode: 'manual_approval' as ApprovalMode,
  },
] as const;

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'wf-profile-completion',
    name: 'Profile Completion Workflow',
    trigger: 'intelligence_gap',
    conditions: ['Intelligence coverage below threshold'],
    actions: ['Send dashboard notification', 'Queue manual approval for profile review'],
    approvalMode: 'manual_approval',
    retryable: true,
    ruleIds: ['rule-intelligence-gap'],
  },
  {
    id: 'wf-executive-review',
    name: 'Executive Health Review',
    trigger: 'declining_performance',
    conditions: ['Executive health score below 40%'],
    actions: ['Request executive approval', 'Send dashboard alert'],
    approvalMode: 'executive_approval_required',
    retryable: false,
    ruleIds: ['rule-declining-health'],
  },
  {
    id: 'wf-utm-guidance',
    name: 'UTM Attribution Guidance',
    trigger: 'campaign_opportunity',
    conditions: ['No active campaigns detected'],
    actions: ['Send dashboard notification with UTM guidance'],
    approvalMode: 'automatic',
    retryable: true,
    ruleIds: ['rule-campaign-opportunity'],
  },
  {
    id: 'wf-growth-milestone',
    name: 'Growth Milestone Notification',
    trigger: 'rapid_growth',
    conditions: ['Audience growth trend positive'],
    actions: ['Send dashboard growth milestone notification'],
    approvalMode: 'automatic',
    retryable: true,
    ruleIds: ['rule-rapid-growth'],
  },
  {
    id: 'wf-data-activation',
    name: 'Data Activation Workflow',
    trigger: 'missing_data',
    conditions: ['One or more engines in fallback mode'],
    actions: ['Queue manual approval', 'Send dashboard activation prompt'],
    approvalMode: 'manual_approval',
    retryable: true,
    ruleIds: ['rule-missing-data'],
  },
  {
    id: 'wf-recommendation-surface',
    name: 'Recommendation Surface Workflow',
    trigger: 'recommendation_available',
    conditions: ['Executive recommendations available from Business Intelligence'],
    actions: ['Surface top recommendations in notification center'],
    approvalMode: 'manual_approval',
    retryable: true,
    ruleIds: ['rule-executive-recommendation'],
  },
];

export const SCHEDULED_OPERATION_DEFINITIONS = [
  {
    id: 'sched-daily-health-check',
    name: 'Daily Executive Health Check',
    schedule: '0 9 * * *',
    approvalMode: 'automatic' as ApprovalMode,
  },
  {
    id: 'sched-weekly-intelligence-audit',
    name: 'Weekly Intelligence Coverage Audit',
    schedule: '0 10 * * 1',
    approvalMode: 'manual_approval' as ApprovalMode,
  },
  {
    id: 'sched-monthly-automation-review',
    name: 'Monthly Automation Review',
    schedule: '0 8 1 * *',
    approvalMode: 'executive_approval_required' as ApprovalMode,
  },
] as const;

export const NOTIFICATION_CHANNEL_DEFINITIONS = [
  { channel: 'dashboard' as const, label: 'Dashboard', status: 'active' as const },
  { channel: 'email' as const, label: 'Email', status: 'awaiting_integration' as const },
  { channel: 'whatsapp' as const, label: 'WhatsApp', status: 'awaiting_integration' as const },
  { channel: 'slack' as const, label: 'Slack', status: 'awaiting_integration' as const },
  { channel: 'teams' as const, label: 'Microsoft Teams', status: 'awaiting_integration' as const },
];

export const HEALTH_THRESHOLDS = {
  lowExecutiveScore: 40,
  intelligenceGapEngines: 4,
} as const;
