import type { AIQualityIndicator } from '@/lib/music-intelligence/ai-intelligence-types';

const STATUS_STYLE: Record<AIQualityIndicator['status'], string> = {
  complete: 'text-emerald-400/90',
  partial: 'text-amber-400/90',
  missing: 'text-gray-500',
};

export default function AIQualityIndicators({ indicators }: { indicators: AIQualityIndicator[] }) {
  if (indicators.length === 0) {
    return <p className="text-sm text-gray-500">Quality indicators activate when platform data is available.</p>;
  }

  return (
    <ul className="space-y-2" aria-label="Submission and profile quality indicators">
      {indicators.map((item) => (
        <li key={item.id} className="rounded-xl border border-white/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-100">{item.label}</p>
            <span className={`text-[8px] font-black uppercase tracking-wider ${STATUS_STYLE[item.status]}`}>
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
