import type { AudienceTimelineEvent } from '@/lib/music-intelligence/audience-engine-types';

export default function AudienceTimelinePanel({ timeline }: { timeline: AudienceTimelineEvent[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-gray-500">No audience events recorded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {timeline.map((event) => (
        <li key={event.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-gray-100">{event.label}</span>
            <time className="text-[9px] uppercase tracking-wider text-gray-500">
              {new Date(event.timestamp).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-1 text-xs text-gray-500">{event.detail}</p>
        </li>
      ))}
    </ul>
  );
}
