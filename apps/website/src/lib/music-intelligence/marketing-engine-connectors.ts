import { MARKETING_PLATFORM_DEFINITIONS } from './marketing-engine-constants';
import type { MarketingConnectorStatus, ConnectorStatus } from './marketing-engine-types';

export interface MarketingConnectorInput {
  platformKey: string;
  hasTelemetry: boolean;
  lastActivity: string | null;
}

export function buildMarketingConnectors(inputs: MarketingConnectorInput[]): MarketingConnectorStatus[] {
  const inputMap = new Map(inputs.map((i) => [i.platformKey, i]));

  return MARKETING_PLATFORM_DEFINITIONS.map((def) => {
    const input = inputMap.get(def.platformKey);
    const hasTelemetry = input?.hasTelemetry ?? false;
    const connectionStatus: ConnectorStatus = hasTelemetry ? 'connected' : 'disconnected';

    return {
      platformKey: def.platformKey,
      label: def.label,
      connectionStatus,
      supportsCampaignMetrics: def.supportsCampaignMetrics,
      lastSynchronization: input?.lastActivity ?? null,
      summary: hasTelemetry
        ? `${def.label} UTM attribution active. Platform API connector framework ready.`
        : `${def.label} connector framework ready. Integration pending executive authorization.`,
    };
  });
}
