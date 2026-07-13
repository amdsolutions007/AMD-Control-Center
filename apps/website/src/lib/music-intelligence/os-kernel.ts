import { ENGINE_REGISTRY_DEFINITIONS, enginesLiveToKernelStatus } from './os-constants';
import type { CollectedOSData } from './os-engine-collector';
import type { OSKernel } from './os-types';

export function buildOSKernel(collected: CollectedOSData): OSKernel {
  const total = ENGINE_REGISTRY_DEFINITIONS.length;
  const enginesOnline = ENGINE_REGISTRY_DEFINITIONS.filter(
    (def) => collected.engines[def.loaderKey].dataSource === 'live',
  ).length;

  const status = enginesLiveToKernelStatus(enginesOnline, total);

  return {
    status,
    orchestrationActive: collected.dataAvailable,
    enginesOnline,
    enginesTotal: total,
    uptimeLabel: collected.dataAvailable ? 'OS kernel active' : 'OS kernel standby',
    summary:
      status === 'operational'
        ? `AMD Music OS™ kernel operational · ${enginesOnline}/${total} intelligence engines live.`
        : status === 'degraded'
          ? `AMD Music OS™ kernel degraded · ${enginesOnline}/${total} engines live.`
          : 'AMD Music OS™ kernel standby · awaiting intelligence engine activation.',
  };
}
