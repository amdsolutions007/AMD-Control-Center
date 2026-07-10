import type { AIIntelligenceScope } from '@/lib/music-intelligence/ai-intelligence-types';

const ACCENT: Record<AIIntelligenceScope, string> = {
  artist: 'text-[#00E5FF] border-[#00E5FF]/30',
  partner: 'text-[#6366F1] border-[#6366F1]/30',
};

export default function AISystemStatusBadge({
  scope,
  label,
  detail,
  status,
}: {
  scope: AIIntelligenceScope;
  label: string;
  detail: string;
  status: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#050512]/70 p-4 ${ACCENT[scope]}`}
      aria-label={`AI system status: ${label}. ${detail}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-80">AI System Status</p>
        <span className="text-[8px] font-black uppercase tracking-wider opacity-70">{status}</span>
      </div>
      <p className={`mt-2 text-lg font-black ${ACCENT[scope].split(' ')[0]}`}>{label}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}
