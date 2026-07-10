import { StatusBadge } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { PlatformActivityItem } from '@/lib/music-intelligence/intelligence-types';

export default function IntelligenceActivityFeed({
  items,
  emptyMessage,
}: {
  items: PlatformActivityItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2" aria-label="Recent platform activity">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2"
        >
          <div>
            <p className="text-sm font-semibold text-gray-100">{item.title}</p>
            <p className="text-xs text-gray-500">
              {item.subtitle} · {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
          {item.status ? <StatusBadge status={item.status} /> : null}
        </li>
      ))}
    </ul>
  );
}
