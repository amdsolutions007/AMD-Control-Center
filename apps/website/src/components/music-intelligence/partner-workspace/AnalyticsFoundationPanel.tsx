'use client';

import { WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';

const WIDGETS = [
  { title: 'Streams', value: '—', description: 'Cross-platform stream aggregation (Phase 3E).' },
  { title: 'Followers', value: '—', description: 'Audience growth across connected DSPs.' },
  { title: 'Playlist Performance', value: '—', description: 'Placement reach and retention metrics.' },
  { title: 'Release Performance', value: '—', description: 'Per-release velocity and territory breakdown.' },
  { title: 'Engagement', value: '—', description: 'Social and platform engagement signals.' },
];

export default function AnalyticsFoundationPanel() {
  return (
    <WorkspaceSection
      eyebrow="Analytics Foundation"
      title="Enterprise Intelligence"
      description="Production-ready placeholder widgets — data pipelines activate in Phase 3E and Phase 5."
    >
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WIDGETS.map((w) => (
          <div key={w.title} className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{w.title}</p>
            <p className="mt-3 text-3xl font-black text-[#6366F1]">{w.value}</p>
            <p className="mt-2 text-xs text-gray-500">{w.description}</p>
            <span className="mt-3 inline-block text-[8px] font-black uppercase tracking-wider text-gray-500">
              Foundation Widget
            </span>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}
