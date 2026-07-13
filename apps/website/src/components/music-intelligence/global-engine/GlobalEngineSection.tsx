'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { GlobalEnginePayload, GlobalEngineScope } from '@/lib/music-intelligence/global-types';
import GlobalEngineModule from './GlobalEngineModule';
import GlobalTimelinePanel from './GlobalTimelinePanel';

const ENDPOINTS: Record<GlobalEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/global-engine',
  partner: '/api/music-intelligence/partner/global-engine',
};

export default function GlobalEngineSection({
  scope,
  className = 'mt-6',
}: {
  scope: GlobalEngineScope;
  className?: string;
}) {
  const [data, setData] = useState<GlobalEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load global intelligence network.');
        }
        return res.json() as Promise<GlobalEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading global intelligence network…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Global Intelligence Overview' : 'Portfolio Global Command';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-global-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Global Intelligence Network</p>
        <h2 id={`${scope}-global-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Global federation layer · {data.dataSource === 'live' ? 'Enterprise orchestration · tenant-isolated' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlobalEngineModule title="Global Health Index">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.health.globalHealthIndex != null ? `${data.health.globalHealthIndex}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.health.summary}</p>
        </GlobalEngineModule>
        <GlobalEngineModule title="Federation Coverage">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.executiveDashboard.federationCoverage}%</p>
          <p className="mt-1 text-xs text-gray-500">{data.executiveDashboard.summary}</p>
        </GlobalEngineModule>
        <GlobalEngineModule title="Benchmark Position">
          <p className={`text-lg font-black ${accent}`}>{data.executiveDashboard.benchmarkPosition ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-500">Anonymous cohort percentile</p>
        </GlobalEngineModule>
        <GlobalEngineModule title="Global Alerts">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.alerts.length}</p>
          <p className="mt-1 text-xs text-gray-500">{data.executiveDashboard.activeAlerts} federated signal(s)</p>
        </GlobalEngineModule>
      </div>

      <GlobalEngineModule title="Regional Intelligence" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.regional.regions.map((r) => (
            <div key={r.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{r.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {r.indexScore != null ? `${r.indexScore}%` : '—'}
              </p>
              <p className="mt-1 text-[9px] uppercase text-gray-500">{r.trend.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </GlobalEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlobalEngineModule title="Industry Intelligence">
          <ul className="space-y-2 text-sm">
            {data.industry.segments.map((s) => (
              <li key={s.key} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{s.label}</span>
                  <span className="text-[9px] uppercase text-gray-500">{s.cohortLabel}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {s.indexScore != null ? `Index ${s.indexScore}%` : '—'} · {s.summary}
                </p>
              </li>
            ))}
          </ul>
        </GlobalEngineModule>

        <GlobalEngineModule title="Global Benchmark Intelligence">
          <ul className="space-y-2 text-sm">
            {data.benchmarks.benchmarks.map((b) => (
              <li key={b.key} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{b.label}</span>
                  <span className="text-[9px] uppercase text-gray-500">{b.percentileBand ?? '—'}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {b.tenantIndex != null ? `Index ${b.tenantIndex}%` : '—'} · cohort median {b.cohortMedian}%
                </p>
              </li>
            ))}
          </ul>
        </GlobalEngineModule>
      </div>

      <GlobalEngineModule title="Global Performance Intelligence" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.performance.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.value != null ? String(m.value) : '—'}
              </p>
            </div>
          ))}
        </div>
      </GlobalEngineModule>

      <GlobalEngineModule title="Global Opportunity Intelligence" className="mt-4">
        <ul className="space-y-2 text-sm">
          {data.opportunities.opportunities.map((o) => (
            <li key={o.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-100">{o.label}</span>
                <span className="text-[9px] uppercase text-gray-500">{o.priority}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{o.summary}</p>
            </li>
          ))}
        </ul>
      </GlobalEngineModule>

      {data.alerts.length > 0 && (
        <GlobalEngineModule title="Global Alerts" className="mt-4">
          <ul className="space-y-2 text-sm">
            {data.alerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{a.label}</span>
                  <span className="text-[9px] uppercase text-gray-500">{a.severity}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{a.summary}</p>
              </li>
            ))}
          </ul>
        </GlobalEngineModule>
      )}

      <GlobalEngineModule title="Global Executive Report" className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.globalReport.summary}</p>
          {data.globalReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </GlobalEngineModule>

      <GlobalEngineModule title="Global Timeline" className="mt-4">
        <GlobalTimelinePanel timeline={data.timeline} />
      </GlobalEngineModule>
    </section>
  );
}
