import type { StreamingStatusPanel as StatusPanel } from '@/lib/music-intelligence/streaming-engine-types';
import { MI_DSP_PLATFORMS } from '@/lib/music-intelligence/constants';

export default function StreamingStatusPanelView({ panel }: { panel: StatusPanel }) {
  const labelFor = (key: string) => MI_DSP_PLATFORMS.find((p) => p.key === key)?.label ?? key;

  return (
    <div className="space-y-3 text-sm text-gray-300">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">Connected DSPs</p>
          {panel.connectedDsps.length === 0 ? (
            <p className="mt-1 text-xs text-gray-500">None connected</p>
          ) : (
            <p className="mt-1">{panel.connectedDsps.map(labelFor).join(' · ')}</p>
          )}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">Sync Status</p>
          <p className="mt-1 capitalize">{panel.synchronizationStatus.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {panel.activeConnectors} active · {panel.apiConnectorsReady} connector(s) ready ·{' '}
        {panel.pendingConnections.length} pending
      </p>
      <p className="text-xs text-gray-500">{panel.summary}</p>
    </div>
  );
}
