import { NOTIFICATION_CHANNEL_DEFINITIONS } from './automation-constants';
import type { NotificationConnector, NotificationConnectorStatus } from './automation-types';

export function buildNotificationConnectors(): NotificationConnector[] {
  return NOTIFICATION_CHANNEL_DEFINITIONS.map((def) => ({
    channel: def.channel,
    label: def.label,
    status: def.status as NotificationConnectorStatus,
    summary:
      def.status === 'active'
        ? `${def.label} notifications active within Automation Intelligence Engine.`
        : `${def.label} connector framework ready. Integration pending executive authorization.`,
  }));
}
