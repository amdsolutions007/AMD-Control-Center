'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { AudienceEnginePayload, AudienceEngineScope } from '@/lib/music-intelligence/audience-engine-types';
import AudienceEngineModule from './AudienceEngineModule';
import GeographicIntelligencePanel from './GeographicIntelligencePanel';
import AudienceHealthPanel from './AudienceHealthPanel';
import AudienceTimelinePanel from './AudienceTimelinePanel';

const ENDPOINTS: Record<AudienceEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/audience-engine',
  partner: '/api/music-intelligence/partner/audience-engine',
};

interface AudienceEngineSectionProps {
  scope: AudienceEngineScope;
  className?: string;
}

export default function AudienceEngineSection({ scope, className = 'mt-6' }: AudienceEngineSectionProps) {
  const [data, setData] = useState<AudienceEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load audience intelligence engine.');
        }
        return res.json() as Promise<AudienceEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading audience intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Audience Overview' : 'Portfolio Audience';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-audience-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Audience Intelligence Engine</p>
        <h2 id={`${scope}-audience-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Unified audience analytics · {data.dataSource === 'live' ? 'Production data' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AudienceEngineModule title="Total Audience">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.totalAudienceContacts ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Owned contacts</p>
        </AudienceEngineModule>
        <AudienceEngineModule title="Active Sessions">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.activeSessions ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Unique Smart Link sessions</p>
        </AudienceEngineModule>
        <AudienceEngineModule title="Territories">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.geographicTerritories}
          </p>
          <p className="mt-1 text-xs text-gray-500">Geographic signals</p>
        </AudienceEngineModule>
        <AudienceEngineModule title="Audience Health">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.audienceHealthScore != null ? `${data.healthDashboard.audienceHealthScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500 capitalize">
            {data.executiveReport.audienceHealth.replace(/_/g, ' ')}
          </p>
        </AudienceEngineModule>
      </div>

      <AudienceEngineModule title="Global Audience Overview" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.globalOverview.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.available && m.value != null ? m.value.toLocaleString() : '—'}
              </p>
              {!m.available ? <p className="mt-1 text-[10px] text-gray-600">{m.emptyStateMessage}</p> : null}
            </div>
          ))}
        </div>
      </AudienceEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AudienceEngineModule title={scope === 'partner' ? 'Territory Performance' : 'Geographic Intelligence'}>
          <GeographicIntelligencePanel geographic={data.geographic} />
        </AudienceEngineModule>

        <AudienceEngineModule title="Audience Growth">
          <ul className="space-y-2 text-sm text-gray-300">
            {data.growth.periods.map((p) => (
              <li key={p.period} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
                <span>{p.label}</span>
                <span className="tabular-nums text-gray-500">
                  {p.available && p.value != null ? p.value : '—'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">{data.growth.summary}</p>
        </AudienceEngineModule>
      </div>

      <AudienceEngineModule title="Engagement Intelligence" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.engagement.metrics.slice(0, 6).map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.available && m.value != null ? m.value.toLocaleString() : '—'}
              </p>
            </div>
          ))}
        </div>
      </AudienceEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AudienceEngineModule title={scope === 'partner' ? 'Audience Comparison' : 'Platform Audience Distribution'}>
          <ul className="space-y-2 text-sm">
            {data.platformDistribution.entries.slice(0, 8).map((e) => (
              <li key={e.platformKey} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{e.label}</span>
                <span className="text-gray-500 tabular-nums">
                  {e.audienceCount != null ? e.audienceCount : '—'}
                </span>
              </li>
            ))}
          </ul>
        </AudienceEngineModule>

        <AudienceEngineModule title={scope === 'partner' ? 'Executive Audience Report' : 'Demographic Intelligence'}>
          {scope === 'partner' ? (
            <div className="text-sm text-gray-300 space-y-2">
              <p>{data.executiveReport.summary}</p>
              {data.executiveReport.recommendations.map((rec, i) => (
                <p key={i} className="text-xs text-gray-500">→ {rec}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{data.demographic.summary}</p>
          )}
        </AudienceEngineModule>
      </div>

      <AudienceEngineModule title="Audience Health Dashboard" className="mt-4">
        <AudienceHealthPanel health={data.healthDashboard} />
      </AudienceEngineModule>

      {scope === 'artist' ? (
        <AudienceEngineModule title="Executive Audience Report" className="mt-4">
          <div className="text-sm text-gray-300 space-y-2">
            <p>{data.executiveReport.summary}</p>
            {data.executiveReport.recommendations.map((rec, i) => (
              <p key={i} className="text-xs text-gray-500">→ {rec}</p>
            ))}
          </div>
        </AudienceEngineModule>
      ) : null}

      <AudienceEngineModule title="Audience Timeline" className="mt-4">
        <AudienceTimelinePanel timeline={data.timeline} />
      </AudienceEngineModule>
    </section>
  );
}
