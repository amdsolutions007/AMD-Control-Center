'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { IntelligenceDashboardPayload } from '@/lib/music-intelligence/intelligence-types';
import IntelligenceActivityFeed from './IntelligenceActivityFeed';
import IntelligenceWidgetGrid from './IntelligenceWidgetGrid';

type IntelligenceScope = 'artist' | 'partner';

const ENDPOINTS: Record<IntelligenceScope, string> = {
  artist: '/api/music-intelligence/workspace/intelligence',
  partner: '/api/music-intelligence/partner/intelligence',
};

const EMPTY_ACTIVITY: Record<IntelligenceScope, string> = {
  artist: 'No platform activity yet. Submit music or update your profile to begin tracking.',
  partner: 'No hub activity yet. Artist submissions and reviews will appear here.',
};

interface IntelligenceDashboardSectionProps {
  scope: IntelligenceScope;
  className?: string;
  showActivity?: boolean;
}

export default function IntelligenceDashboardSection({
  scope,
  className = 'mt-8',
  showActivity = true,
}: IntelligenceDashboardSectionProps) {
  const [data, setData] = useState<IntelligenceDashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load intelligence dashboard.');
        }
        return res.json() as Promise<IntelligenceDashboardPayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading intelligence metrics…</AuthMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <AuthMessage type="error">{error}</AuthMessage>
      </div>
    );
  }

  if (!data) return null;

  const accentLabel = scope === 'artist' ? 'Artist Intelligence' : 'Enterprise Intelligence';

  return (
    <section className={className} aria-labelledby={`${scope}-intelligence-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Intelligence Dashboard</p>
        <h2 id={`${scope}-intelligence-heading`} className="mt-1 text-lg font-black text-gray-100">
          {accentLabel}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Live platform metrics · {data.dataSource === 'live' ? 'Production data' : 'Fallback mode'}
        </p>
      </div>

      <IntelligenceWidgetGrid widgets={data.widgets} />

      {showActivity ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-3">
            Recent Platform Activity
          </h3>
          <IntelligenceActivityFeed items={data.recentActivity} emptyMessage={EMPTY_ACTIVITY[scope]} />
        </div>
      ) : null}
    </section>
  );
}
