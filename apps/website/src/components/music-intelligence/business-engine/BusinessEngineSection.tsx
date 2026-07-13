'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { BusinessEnginePayload, BusinessEngineScope } from '@/lib/music-intelligence/business-engine-types';
import BusinessEngineModule from './BusinessEngineModule';
import BusinessTimelinePanel from './BusinessTimelinePanel';

const ENDPOINTS: Record<BusinessEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/business-engine',
  partner: '/api/music-intelligence/partner/business-engine',
};

export default function BusinessEngineSection({
  scope,
  className = 'mt-6',
}: {
  scope: BusinessEngineScope;
  className?: string;
}) {
  const [data, setData] = useState<BusinessEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load business intelligence engine.');
        }
        return res.json() as Promise<BusinessEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading business intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Executive Business Overview' : 'Portfolio Business Intelligence';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-business-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Business Intelligence Engine</p>
        <h2 id={`${scope}-business-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Executive command center · {data.dataSource === 'live' ? 'Aggregated from production engines' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BusinessEngineModule title="Executive Score">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.overallExecutiveScore != null
              ? `${data.healthDashboard.overallExecutiveScore}%`
              : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.healthDashboard.summary}</p>
        </BusinessEngineModule>
        <BusinessEngineModule title="Business Health">
          <p className={`text-2xl font-black tabular-nums capitalize ${accent}`}>
            {data.businessHealth.overallHealth.replace(/_/g, ' ')}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.businessHealth.summary}</p>
        </BusinessEngineModule>
        <BusinessEngineModule title="Intelligence Coverage">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.businessHealth.intelligenceCoverage}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.crossEngine.enginesWithLiveData}/{data.crossEngine.totalEngines} engines live
          </p>
        </BusinessEngineModule>
        <BusinessEngineModule title="Revenue Readiness">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.revenueReadiness}%
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.revenue.summary}</p>
        </BusinessEngineModule>
      </div>

      <BusinessEngineModule title="Executive KPI Dashboard" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.executiveKpis.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.available && m.value != null ? String(m.value) : '—'}
              </p>
            </div>
          ))}
        </div>
      </BusinessEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BusinessEngineModule title="Business Health Intelligence">
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
              <span>Growth Score</span>
              <span className="tabular-nums text-gray-500">
                {data.businessHealth.growthScore != null ? `${data.businessHealth.growthScore}%` : '—'}
              </span>
            </li>
            <li className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
              <span>Operational Health</span>
              <span className="capitalize text-gray-500">{data.businessHealth.operationalHealth.replace(/_/g, ' ')}</span>
            </li>
            <li className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
              <span>Executive Readiness</span>
              <span className="tabular-nums text-gray-500">
                {data.businessHealth.executiveReadiness != null ? `${data.businessHealth.executiveReadiness}%` : '—'}
              </span>
            </li>
          </ul>
        </BusinessEngineModule>

        <BusinessEngineModule title="Growth Intelligence">
          {data.growth.periods.length === 0 ? (
            <p className="text-sm text-gray-500">{data.growth.summary}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.growth.periods.map((p) => (
                <li key={p.period} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                  <span>{p.label}</span>
                  <span className="tabular-nums text-gray-500">
                    {p.available && p.value != null ? p.value : '—'} {p.trend !== 'unknown' ? `(${p.trend})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </BusinessEngineModule>
      </div>

      <BusinessEngineModule title="Revenue Intelligence Framework" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.revenue.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">—</p>
              <p className="mt-1 text-[10px] text-gray-600">{m.emptyStateMessage}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {data.revenue.connectors.length} revenue connectors ready · {data.revenue.summary}
        </p>
      </BusinessEngineModule>

      <BusinessEngineModule title="Executive Performance Intelligence" className="mt-4">
        <ul className="space-y-2 text-sm">
          {data.performance.domains.map((d) => (
            <li key={d.key} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <span>{d.label}</span>
              <span className="tabular-nums text-gray-500">{d.score != null ? `${d.score}%` : '—'}</span>
            </li>
          ))}
        </ul>
      </BusinessEngineModule>

      <BusinessEngineModule title="Cross-Engine Intelligence" className="mt-4">
        <p className="text-sm text-gray-300">{data.crossEngine.unifiedSummary}</p>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          {data.crossEngine.engineStatuses.map((e) => (
            <li key={e.engine}>
              {e.label}: {e.status} — {e.summary}
            </li>
          ))}
        </ul>
      </BusinessEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BusinessEngineModule title="Executive Alerts">
          {data.alerts.length === 0 ? (
            <p className="text-sm text-gray-500">No executive alerts at this time.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.alerts.map((a) => (
                <li key={a.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-gray-100">{a.title}</span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500">{a.severity}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{a.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </BusinessEngineModule>

        <BusinessEngineModule title="Executive Scorecards">
          <ul className="space-y-2 text-sm">
            {data.scorecards.scorecards.map((s) => (
              <li key={s.key} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{s.label}</span>
                <span className="tabular-nums text-gray-500">{s.score != null ? `${s.score}%` : '—'}</span>
              </li>
            ))}
          </ul>
          {data.scorecards.overallScore != null && (
            <p className="mt-2 text-xs text-gray-500">Composite: {data.scorecards.overallScore}%</p>
          )}
        </BusinessEngineModule>
      </div>

      <BusinessEngineModule title="Executive Business Report" className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.executiveReport.summary}</p>
          {data.executiveReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </BusinessEngineModule>

      <BusinessEngineModule title="Business Timeline" className="mt-4">
        <BusinessTimelinePanel timeline={data.timeline} />
      </BusinessEngineModule>
    </section>
  );
}
