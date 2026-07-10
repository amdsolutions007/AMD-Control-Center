import type { AIActivityItem } from '@/lib/music-intelligence/ai-intelligence-types';

export default function AIActivityFeed({
  items,
  emptyMessage,
}: {
  items: AIActivityItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2" aria-label="AI activity feed">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-white/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-100">{item.title}</p>
            <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">{item.type}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
