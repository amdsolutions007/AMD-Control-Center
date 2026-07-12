import type { MIDspPlatformKey } from './constants';
import {
  DSP_CONNECTOR_DEFINITIONS,
  extractPlatformIdFromUrl,
  type DspConnectorDefinition,
} from './streaming-engine-constants';
import type { DspConnectorStatus, DspConnectionStatus, SyncHealth } from './streaming-engine-types';

export interface DspConnectorInput {
  platformKey: MIDspPlatformKey;
  releaseUrl: string | null;
  lastClickAt: string | null;
}

export interface DspConnectorFramework {
  connectors: DspConnectorStatus[];
  connected: MIDspPlatformKey[];
  pending: MIDspPlatformKey[];
  disconnected: MIDspPlatformKey[];
}

function resolveConnectionStatus(releaseUrl: string | null): DspConnectionStatus {
  if (releaseUrl?.trim()) return 'connected';
  return 'disconnected';
}

function resolveSyncHealth(
  connectionStatus: DspConnectionStatus,
  lastClickAt: string | null,
  supportsLiveMetrics: boolean,
): SyncHealth {
  if (connectionStatus === 'disconnected') return 'api_pending';
  if (supportsLiveMetrics && lastClickAt) return 'healthy';
  if (lastClickAt) return 'stale';
  if (connectionStatus === 'connected') return 'never_synced';
  return 'api_pending';
}

function buildConnectorSummary(
  def: DspConnectorDefinition,
  status: DspConnectionStatus,
  syncHealth: SyncHealth,
): string {
  if (status === 'connected' && syncHealth === 'never_synced') {
    return `${def.label} release URL on record. Platform API connector ready for activation.`;
  }
  if (status === 'connected' && syncHealth === 'stale') {
    return `${def.label} connected with Smart Link redirect telemetry. Live API sync pending.`;
  }
  if (status === 'connected' && syncHealth === 'healthy') {
    return `${def.label} connected with active telemetry. API integration framework ready.`;
  }
  return `${def.label} connector framework ready. Add release URL to activate.`;
}

export function buildConnectorFramework(inputs: DspConnectorInput[]): DspConnectorFramework {
  const inputMap = new Map(inputs.map((i) => [i.platformKey, i]));
  const connectors: DspConnectorStatus[] = [];
  const connected: MIDspPlatformKey[] = [];
  const pending: MIDspPlatformKey[] = [];
  const disconnected: MIDspPlatformKey[] = [];

  for (const def of DSP_CONNECTOR_DEFINITIONS) {
    const input = inputMap.get(def.platformKey);
    const releaseUrl = input?.releaseUrl?.trim() || null;
    const connectionStatus = resolveConnectionStatus(releaseUrl);
    const syncHealth = resolveSyncHealth(connectionStatus, input?.lastClickAt ?? null, def.supportsLiveMetrics);

    const connector: DspConnectorStatus = {
      platformKey: def.platformKey,
      label: def.label,
      connectionStatus,
      apiIntegrationReady: def.apiIntegrationReady,
      supportsLiveMetrics: def.supportsLiveMetrics,
      releaseUrl,
      platformId: releaseUrl ? extractPlatformIdFromUrl(releaseUrl) : null,
      lastSynchronization: input?.lastClickAt ?? null,
      synchronizationHealth: syncHealth,
      summary: buildConnectorSummary(def, connectionStatus, syncHealth),
    };

    connectors.push(connector);
    if (connectionStatus === 'connected') connected.push(def.platformKey);
    else if (connectionStatus === 'pending') pending.push(def.platformKey);
    else disconnected.push(def.platformKey);
  }

  return { connectors, connected, pending, disconnected };
}
