import { ENGINE_REGISTRY_DEFINITIONS } from './os-constants';
import type { CollectedOSData } from './os-engine-collector';
import type { IntelligenceRegistry, IntelligenceRegistryEntry } from './os-types';

export function resolveEngineApiRoute(scope: 'artist' | 'partner', engineKey: string): string {
  const base = scope === 'artist' ? '/api/music-intelligence/workspace' : '/api/music-intelligence/partner';
  const routeMap: Record<string, string> = {
    intelligence: `${base}/intelligence`,
    ai: `${base}/ai-intelligence`,
    music: `${base}/music-engine`,
    streaming: `${base}/streaming-engine`,
    audience: `${base}/audience-engine`,
    marketing: `${base}/marketing-engine`,
    business: `${base}/business-engine`,
    automation: `${base}/automation-engine`,
    enterprise: `${base}/enterprise-engine`,
    global: `${base}/global-engine`,
  };
  return routeMap[engineKey] ?? `${base}/intelligence`;
}

export function buildIntelligenceRegistry(collected: CollectedOSData): IntelligenceRegistry {
  const entries: IntelligenceRegistryEntry[] = ENGINE_REGISTRY_DEFINITIONS.map((def) => {
    const payload = collected.engines[def.loaderKey];
    const isLive = payload.dataSource === 'live';
    return {
      key: def.key,
      label: def.label,
      phase: def.phase,
      status: isLive ? 'live' : 'fallback',
      apiRoute: resolveEngineApiRoute(collected.scope, def.key),
      summary: isLive
        ? `Phase ${def.phase} engine live · registered in OS.`
        : `Phase ${def.phase} engine registered · awaiting live data.`,
    };
  });

  const liveCount = entries.filter((e) => e.status === 'live').length;

  return {
    entries,
    liveCount,
    registeredCount: entries.length,
    summary: `Intelligence Registry · ${liveCount}/${entries.length} engines live · all subsystems registered.`,
  };
}
