import Link from 'next/link';
import type { AIRecommendation, AIIntelligenceScope } from '@/lib/music-intelligence/ai-intelligence-types';

const PRIORITY: Record<AIRecommendation['priority'], string> = {
  high: 'text-red-400/90',
  medium: 'text-amber-400/90',
  low: 'text-gray-400',
};

const ACTION: Record<AIIntelligenceScope, string> = {
  artist: 'text-[#00E5FF] border-[#00E5FF]/40',
  partner: 'text-[#6366F1] border-[#6366F1]/40',
};

export default function AIRecommendationsPanel({
  scope,
  recommendations,
}: {
  scope: AIIntelligenceScope;
  recommendations: AIRecommendation[];
}) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No recommendations at this time. Platform data meets current intelligence baseline.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-label="AI recommendations">
      {recommendations.map((rec) => (
        <li key={rec.id} className="rounded-xl border border-white/10 bg-[#050512]/60 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-100">{rec.title}</p>
            <span className={`text-[8px] font-black uppercase tracking-wider ${PRIORITY[rec.priority]}`}>
              {rec.priority}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">{rec.description}</p>
          <p className="mt-2 text-[9px] text-gray-600">Source: {rec.derivedFrom}</p>
          {rec.actionHref && rec.actionLabel ? (
            <Link
              href={rec.actionHref}
              className={`mt-3 inline-block rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${ACTION[scope]}`}
            >
              {rec.actionLabel}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
