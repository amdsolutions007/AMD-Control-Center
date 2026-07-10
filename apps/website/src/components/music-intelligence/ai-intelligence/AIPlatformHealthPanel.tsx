import type { AIIntelligenceScope, AIPlatformHealthSummary } from '@/lib/music-intelligence/ai-intelligence-types';

export default function AIPlatformHealthPanel({
  scope,
  health,
}: {
  scope: AIIntelligenceScope;
  health: AIPlatformHealthSummary | null;
}) {
  if (!health) return null;

  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4" aria-label="Platform health summary">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Platform Health Summary</p>
      <p className={`mt-3 text-3xl font-black tabular-nums ${accent}`}>
        {health.score != null ? health.score : '—'}
      </p>
      <p className="mt-2 text-xs text-gray-500">{health.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
        <span>Artists: {health.artistCount}</span>
        <span>Review queue: {health.reviewWorkload}</span>
        <span className="col-span-2">
          Pipeline: {health.pipelineActive ? 'Active' : 'Standby'}
        </span>
      </div>
    </div>
  );
}
