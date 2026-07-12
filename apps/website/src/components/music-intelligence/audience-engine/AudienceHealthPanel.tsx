import type { AudienceHealthDashboard } from '@/lib/music-intelligence/audience-engine-types';

export default function AudienceHealthPanel({ health }: { health: AudienceHealthDashboard }) {
  const items = [
    { label: 'Audience Health', value: health.audienceHealthScore },
    { label: 'Growth Score', value: health.growthScore },
    { label: 'Engagement Score', value: health.engagementScore },
    { label: 'Geographic Coverage', value: health.geographicCoverage },
    { label: 'Platform Coverage', value: health.platformCoverage },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 capitalize">Status: {health.intelligenceStatus.replace(/_/g, ' ')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{item.label}</p>
            <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
              {item.value != null ? `${Math.round(item.value)}%` : '—'}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">{health.summary}</p>
    </div>
  );
}
