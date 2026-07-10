import type { IntelligenceAccent, IntelligenceWidgetMetric } from '@/lib/music-intelligence/intelligence-types';
import { IntelligenceWidgetIcon } from './IntelligenceWidgetIcons';

const ACCENT_VALUE: Record<IntelligenceAccent, string> = {
  artist: 'text-[#00E5FF]',
  partner: 'text-[#6366F1]',
  neutral: 'text-gray-300',
};

const ACCENT_BORDER: Record<IntelligenceAccent, string> = {
  artist: 'border-[#00E5FF]/20',
  partner: 'border-[#6366F1]/20',
  neutral: 'border-white/10',
};

export default function IntelligenceWidgetCard({ widget }: { widget: IntelligenceWidgetMetric }) {
  const valueClass = ACCENT_VALUE[widget.accent];
  const borderClass = ACCENT_BORDER[widget.accent];

  return (
    <article
      className={`rounded-2xl border bg-[#050512]/70 p-4 ${borderClass}`}
      aria-label={widget.ariaLabel}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl border border-white/10 bg-black/30 p-2 ${valueClass}`}>
          <IntelligenceWidgetIcon id={widget.icon} />
        </div>
        {widget.emptyState && (
          <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Awaiting Data</span>
        )}
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{widget.title}</p>
      <p className={`mt-2 text-2xl font-black tabular-nums ${valueClass}`}>{widget.value}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{widget.subtitle}</p>
    </article>
  );
}
