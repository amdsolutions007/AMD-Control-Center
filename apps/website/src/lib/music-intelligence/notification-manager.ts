import { buildNotificationConnectors } from './automation-connectors';
import type {
  AutomationTimelineEvent,
  DashboardNotification,
  NotificationCenter,
} from './automation-types';
import type { OrchestrationResult } from './workflow-orchestrator';

export function buildNotificationCenter(
  orchestration: OrchestrationResult,
  businessGeneratedAt: string,
): NotificationCenter {
  const connectors = buildNotificationConnectors();
  const dashboardNotifications: DashboardNotification[] = [];

  for (const workflow of orchestration.workflows.filter((w) => w.status !== 'idle')) {
    dashboardNotifications.push({
      id: `notif-${workflow.id}`,
      channel: 'dashboard',
      title: workflow.name,
      message: workflow.summary,
      timestamp: businessGeneratedAt,
      read: false,
      workflowId: workflow.id,
    });
  }

  for (const event of orchestration.timeline.filter((e) => e.type === 'execution_complete')) {
    dashboardNotifications.push({
      id: `notif-${event.id}`,
      channel: 'dashboard',
      title: event.label,
      message: event.detail,
      timestamp: event.timestamp,
      read: false,
      workflowId: event.workflowId,
    });
  }

  const unreadCount = dashboardNotifications.filter((n) => !n.read).length;

  return {
    dashboardNotifications,
    connectors,
    unreadCount,
    summary:
      unreadCount > 0
        ? `${unreadCount} dashboard notification(s) from automation workflows. External channels await integration.`
        : 'Notification center ready. Dashboard channel active.',
  };
}

export function appendNotificationTimelineEvents(
  timeline: AutomationTimelineEvent[],
  notifications: DashboardNotification[],
): AutomationTimelineEvent[] {
  const notificationEvents: AutomationTimelineEvent[] = notifications.map((n) => ({
    id: `tl-notif-${n.id}`,
    type: 'notification_sent' as const,
    label: n.title,
    timestamp: n.timestamp,
    detail: n.message,
    workflowId: n.workflowId,
  }));

  return [...timeline, ...notificationEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
