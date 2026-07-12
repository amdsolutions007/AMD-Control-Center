import type { GeographicIntelligence } from '@/lib/music-intelligence/audience-engine-types';

export default function GeographicIntelligencePanel({ geographic }: { geographic: GeographicIntelligence }) {
  if (!geographic.hasLiveData) {
    return <p className="text-sm text-gray-500">{geographic.summary}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{geographic.summary}</p>
      {geographic.countries.length > 0 ? (
        <ul className="space-y-2">
          {geographic.countries.map((entry) => (
            <li key={entry.territory} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span className="text-gray-100">{entry.territory}</span>
              <span className="text-gray-500 tabular-nums">{entry.count} · {entry.share}%</span>
            </li>
          ))}
        </ul>
      ) : null}
      {geographic.regions.length > 0 ? (
        <div className="text-xs text-gray-500">
          Submission territories: {geographic.regions.map((r) => r.territory).join(' · ')}
        </div>
      ) : null}
    </div>
  );
}
