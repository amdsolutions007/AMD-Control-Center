'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { MarketingEnginePayload, MarketingEngineScope } from '@/lib/music-intelligence/marketing-engine-types';
import MarketingEngineModule from './MarketingEngineModule';
import MarketingTimelinePanel from './MarketingTimelinePanel';

const ENDPOINTS: Record<MarketingEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/marketing-engine',
  partner: '/api/music-intelligence/partner/marketing-engine',
};

export default function MarketingEngineSection({ scope, className = 'mt-6' }: { scope: MarketingEngineScope; className?: string }) {
  const [data, setData] = useState<MarketingEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load marketing intelligence engine.');
        }
        return res.json() as Promise<MarketingEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading marketing intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Marketing Overview' : 'Portfolio Campaigns';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-marketing-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Marketing Intelligence Engine</p>
        <h2 id={`${scope}-marketing-engine-heading`} className="mt-1 text-lg font-black text-gray-100">{heading}</h2>
        <p className="mt-1 text-xs text-gray-500">
          Campaign intelligence · {data.dataSource === 'live' ? 'Production data' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MarketingEngineModule title="Campaigns">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.portfolioSummary.totalCampaigns}</p>
          <p className="mt-1 text-xs text-gray-500">{data.portfolioSummary.summary}</p>
        </MarketingEngineModule>
        <MarketingEngineModule title="Total Clicks">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.portfolioSummary.totalClicks ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-500">Smart Link telemetry</p>
        </MarketingEngineModule>
        <MarketingEngineModule title="Conversions">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.portfolioSummary.totalConversions ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-500">Submissions + contacts</p>
        </MarketingEngineModule>
        <MarketingEngineModule title="Marketing Health">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.marketingHealthScore != null ? `${data.healthDashboard.marketingHealthScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500 capitalize">{data.executiveReport.campaignHealth.replace(/_/g, ' ')}</p>
        </MarketingEngineModule>
      </div>

      <MarketingEngineModule title={scope === 'partner' ? 'Portfolio Campaigns' : 'Campaign Performance'} className="mt-4">
        {data.campaigns.campaigns.length === 0 ? (
          <p className="text-sm text-gray-500">{data.campaigns.summary}</p>
        ) : (
          <ul className="space-y-2">
            {data.campaigns.campaigns.map((c) => (
              <li key={c.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{c.campaignName}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">{c.campaignHealth}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {c.platform} · {c.campaignType} · {c.clickCount ?? 0} clicks
                </p>
              </li>
            ))}
          </ul>
        )}
      </MarketingEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MarketingEngineModule title="Performance Intelligence">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.performance.metrics.slice(0, 4).map((m) => (
              <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
                <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                  {m.available && m.value != null ? m.value.toLocaleString() : '—'}
                </p>
              </div>
            ))}
          </div>
        </MarketingEngineModule>

        <MarketingEngineModule title={scope === 'artist' ? 'Conversion Summary' : 'Campaign ROI'}>
          <ul className="space-y-2 text-sm text-gray-300">
            {data.conversion.funnel.filter((f) => f.available).map((f) => (
              <li key={f.key} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
                <span>{f.label}</span>
                <span className="tabular-nums text-gray-500">{f.value}</span>
              </li>
            ))}
          </ul>
          {data.conversion.conversionRate != null ? (
            <p className="mt-2 text-xs text-gray-500">Conversion rate: {data.conversion.conversionRate}%</p>
          ) : (
            <p className="mt-2 text-xs text-gray-500">{data.roi.summary}</p>
          )}
        </MarketingEngineModule>
      </div>

      <MarketingEngineModule title={scope === 'artist' ? 'Audience Acquisition' : 'Platform Comparison'} className="mt-4">
        {scope === 'partner' ? (
          <ul className="space-y-2 text-sm">
            {data.platformComparison.entries.filter((e) => e.clicks != null).slice(0, 8).map((e) => (
              <li key={e.platformKey} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{e.label}</span>
                <span className="tabular-nums text-gray-500">{e.clicks}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.acquisition.sources.slice(0, 8).map((s) => (
              <li key={s.source} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{s.label}</span>
                <span className="tabular-nums text-gray-500">{s.count}</span>
              </li>
            ))}
          </ul>
        )}
      </MarketingEngineModule>

      <MarketingEngineModule title={scope === 'partner' ? 'Executive Marketing Report' : 'Marketing Health'} className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.executiveReport.summary}</p>
          {data.executiveReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </MarketingEngineModule>

      <MarketingEngineModule title="Marketing Timeline" className="mt-4">
        <MarketingTimelinePanel timeline={data.timeline} />
      </MarketingEngineModule>
    </section>
  );
}
