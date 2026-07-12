import type { PlatformComparison } from '@/lib/music-intelligence/streaming-engine-types';

export default function PlatformComparisonPanel({ comparison }: { comparison: PlatformComparison }) {
  if (comparison.entries.length === 0) {
    return <p className="text-sm text-gray-500">No platform comparison data available.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{comparison.distributionSummary}</p>
      <ul className="space-y-2">
        {comparison.entries.map((entry) => (
          <li key={entry.platformKey} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
            <div>
              <p className="font-semibold text-gray-100">{entry.label}</p>
              <p className="text-[10px] text-gray-500 capitalize">{entry.connectionStatus}</p>
            </div>
            <div className="text-right">
              <p className="tabular-nums text-gray-200">
                {entry.redirectClicks != null ? `${entry.redirectClicks} redirects` : '—'}
              </p>
              {entry.relativeShare != null ? (
                <p className="text-[10px] text-gray-500">{entry.relativeShare}% share</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
