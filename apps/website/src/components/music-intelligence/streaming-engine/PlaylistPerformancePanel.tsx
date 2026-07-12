import type { PlaylistPerformanceItem } from '@/lib/music-intelligence/streaming-engine-types';

export default function PlaylistPerformancePanel({
  items,
}: {
  items: PlaylistPerformanceItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Submit music with genre metadata to activate playlist routing intelligence.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300">
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-gray-100">{item.playlistName}</span>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 capitalize">
              {item.estimatedImpact} impact
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {item.platform} · {item.playlistType.replace(/_/g, ' ')}
            {item.position != null ? ` · Position ${item.position}` : ''}
          </p>
          <p className="mt-1 text-xs text-gray-500">{item.impactExplanation}</p>
        </li>
      ))}
    </ul>
  );
}
