import { AUDIENCE_PLATFORM_DEFINITIONS } from './audience-engine-constants';
import type { AudienceConnectorStatus, ConnectorStatus } from './audience-engine-types';

export interface ConnectorInput {
  platformKey: string;
  hasTelemetry: boolean;
  lastActivity: string | null;
}

export function buildAudienceConnectors(inputs: ConnectorInput[]): AudienceConnectorStatus[] {
  const inputMap = new Map(inputs.map((i) => [i.platformKey, i]));

  return AUDIENCE_PLATFORM_DEFINITIONS.map((def) => {
    const input = inputMap.get(def.platformKey);
    const hasTelemetry = input?.hasTelemetry ?? false;
    const connectionStatus: ConnectorStatus = hasTelemetry ? 'connected' : 'disconnected';

    return {
      platformKey: def.platformKey,
      label: def.label,
      connectionStatus,
      supportsAudienceMetrics: def.supportsAudienceMetrics,
      lastSynchronization: input?.lastActivity ?? null,
      summary: hasTelemetry
        ? `${def.label} telemetry active. Platform API connector framework ready.`
        : `${def.label} connector framework ready. Integration pending executive authorization.`,
    };
  });
}
