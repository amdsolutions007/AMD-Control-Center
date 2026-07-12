import type { StreamingMetricsBundle } from '@/lib/music-intelligence/streaming-engine-types';

export default function StreamingMetricsPanel({ metrics }: { metrics: StreamingMetricsBundle }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{metrics.summary}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.metrics.map((m) => (
          <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
            <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
              {m.available && m.value != null ? m.value.toLocaleString() : '—'}
            </p>
            {!m.available ? (
              <p className="mt-1 text-[10px] text-gray-600">{m.emptyStateMessage}</p>
            ) : (
              <p className="mt-1 text-[10px] text-gray-500">
                Source: {m.source === 'smart_link_telemetry' ? 'Smart Link telemetry' : m.source}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
