import type { BusinessTimelineEvent } from '@/lib/music-intelligence/business-engine-types';

export default function BusinessTimelinePanel({ timeline }: { timeline: BusinessTimelineEvent[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-gray-500">No executive timeline events on record.</p>;
  }

  return (
    <ul className="space-y-2">
      {timeline.map((event) => (
        <li key={event.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300">
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-gray-100">{event.label}</span>
            <span className="text-[9px] uppercase tracking-wider text-gray-500">{event.engine}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{event.detail}</p>
          <p className="mt-1 text-[10px] text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
