import { collectArtistOSData, collectPartnerOSData } from './os-engine-collector';
import { processOSData } from './os-processor';
import { resolveEngineApiRoute } from './os-registry';
import { AI_AGENT_DEFINITIONS, ENGINE_REGISTRY_DEFINITIONS, UNIFIED_SEARCH_CATALOG } from './os-constants';
import type { OSEnginePayload } from './os-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

function emptyPayload(scope: 'artist' | 'partner'): OSEnginePayload {
  const now = new Date().toISOString();
  return {
    scope,
    generatedAt: now,
    dataSource: 'fallback',
    commandCenter: {
      systemHealthScore: null,
      enginesLive: 0,
      enginesRegistered: ENGINE_REGISTRY_DEFINITIONS.length,
      activeAlerts: 0,
      pendingDecisions: 0,
      summary: 'AMD Music OS™ Command Center awaiting intelligence subsystems.',
    },
    kernel: {
      status: 'standby',
      orchestrationActive: false,
      enginesOnline: 0,
      enginesTotal: ENGINE_REGISTRY_DEFINITIONS.length,
      uptimeLabel: 'OS kernel standby',
      summary: 'AMD Music OS™ kernel standby · awaiting engine activation.',
    },
    registry: {
      entries: ENGINE_REGISTRY_DEFINITIONS.map((def) => ({
        key: def.key,
        label: def.label,
        phase: def.phase,
        status: 'registered' as const,
        apiRoute: resolveEngineApiRoute(scope, def.key),
        summary: `Phase ${def.phase} registered · awaiting live data.`,
      })),
      liveCount: 0,
      registeredCount: ENGINE_REGISTRY_DEFINITIONS.length,
      summary: 'Intelligence Registry · all engines registered · awaiting live data.',
    },
    healthCenter: {
      overallScore: null,
      metrics: [],
      summary: 'System Health Center awaiting intelligence data.',
    },
    decisionCenter: {
      decisions: [],
      pendingCount: 0,
      summary: 'Executive Decision Center awaiting intelligence data.',
    },
    unifiedSearch: {
      items: UNIFIED_SEARCH_CATALOG.map((item) => ({
        id: item.id,
        label: item.label,
        category: item.category,
        engineKey: item.engineKey,
        searchable: false,
      })),
      totalItems: UNIFIED_SEARCH_CATALOG.length,
      frameworkReady: true,
      summary: 'Unified Intelligence Search framework ready · awaiting engine data.',
    },
    timeline: [],
    alerts: [],
    executiveReport: {
      commandCenterSummary: 'Awaiting data.',
      kernelSummary: 'Awaiting data.',
      registrySummary: 'Awaiting data.',
      healthSummary: 'Awaiting data.',
      decisionSummary: 'Awaiting data.',
      risks: [],
      recommendations: ['Activate intelligence engines to boot AMD Music OS™.'],
      summary: 'AMD Music OS™ executive report awaiting subsystem data.',
    },
    aiAgentFramework: {
      agents: AI_AGENT_DEFINITIONS.map((def) => ({
        key: def.key,
        label: def.label,
        domain: def.domain,
        status: 'framework_ready' as const,
        capabilities: [...def.capabilities],
        summary: `${def.label} · framework ready.`,
      })),
      autonomousExecution: false,
      summary: 'AI Agent Framework · definitions only · no autonomous execution.',
    },
    osDashboard: {
      platformName: 'AMD Music OS™',
      scope,
      enginesStacked: ENGINE_REGISTRY_DEFINITIONS.length,
      healthScore: null,
      summary: 'AMD Music OS™ Dashboard awaiting intelligence subsystems.',
    },
  };
}

export async function loadArtistOSEngine(session: MIWorkspaceSession): Promise<OSEnginePayload> {
  const collected = await collectArtistOSData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  const processed = processOSData(collected);
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerOSEngine(session: MIPartnerWorkspaceSession): Promise<OSEnginePayload> {
  const collected = await collectPartnerOSData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  const processed = processOSData(collected);
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
