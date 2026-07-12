import type { MusicIntelligenceReport } from '@/lib/music-intelligence/music-engine-types';

export default function SubmissionTimelinePanel({ timeline }: { timeline: MusicIntelligenceReport['timeline'] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-gray-500">Timeline activates when submission records exist.</p>;
  }

  return (
    <ol className="space-y-2" aria-label="Submission intelligence timeline">
      {timeline.map((event) => (
        <li key={event.id} className="rounded-xl border border-white/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-100">{event.label}</p>
            <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">{event.type}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{event.detail}</p>
          <p className="mt-1 text-[10px] text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
        </li>
      ))}
    </ol>
  );
}
