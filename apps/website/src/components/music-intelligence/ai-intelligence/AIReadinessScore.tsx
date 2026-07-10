import type { AIIntelligenceScope } from '@/lib/music-intelligence/ai-intelligence-types';

const VALUE: Record<AIIntelligenceScope, string> = {
  artist: 'text-[#00E5FF]',
  partner: 'text-[#6366F1]',
};

export default function AIReadinessScore({
  scope,
  score,
  label,
}: {
  scope: AIIntelligenceScope;
  score: number | null;
  label: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#050512]/70 p-4"
      aria-label={
        score != null ? `Intelligence readiness score: ${score} out of 100. ${label}` : `Readiness: ${label}`
      }
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Readiness Score</p>
      <p className={`mt-2 text-4xl font-black tabular-nums ${VALUE[scope]}`}>
        {score != null ? score : '—'}
      </p>
      <p className="mt-2 text-xs text-gray-500">{label}</p>
    </div>
  );
}
