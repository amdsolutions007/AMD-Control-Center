'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { EnterpriseEnginePayload, EnterpriseEngineScope } from '@/lib/music-intelligence/enterprise-types';
import EnterpriseEngineModule from './EnterpriseEngineModule';
import EnterpriseTimelinePanel from './EnterpriseTimelinePanel';

const ENDPOINTS: Record<EnterpriseEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/enterprise-engine',
  partner: '/api/music-intelligence/partner/enterprise-engine',
};

export default function EnterpriseEngineSection({
  scope,
  className = 'mt-6',
}: {
  scope: EnterpriseEngineScope;
  className?: string;
}) {
  const [data, setData] = useState<EnterpriseEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load enterprise intelligence engine.');
        }
        return res.json() as Promise<EnterpriseEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading enterprise intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Enterprise Overview' : 'Portfolio Enterprise Command';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-enterprise-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Enterprise Intelligence Engine</p>
        <h2 id={`${scope}-enterprise-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Enterprise operating layer · {data.dataSource === 'live' ? 'BI + Automation orchestration' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EnterpriseEngineModule title="Enterprise Health">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.enterpriseHealthScore != null ? `${data.healthDashboard.enterpriseHealthScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.healthDashboard.summary}</p>
        </EnterpriseEngineModule>
        <EnterpriseEngineModule title="Governance">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.governance.governanceHealthScore != null ? `${data.governance.governanceHealthScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.governance.summary}</p>
        </EnterpriseEngineModule>
        <EnterpriseEngineModule title="Intelligence Coverage">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.commandCenter.intelligenceCoverage}%</p>
          <p className="mt-1 text-xs text-gray-500">{data.commandCenter.summary}</p>
        </EnterpriseEngineModule>
        <EnterpriseEngineModule title="Pending Approvals">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.commandCenter.pendingApprovals}</p>
          <p className="mt-1 text-xs text-gray-500">Automation approval queue</p>
        </EnterpriseEngineModule>
      </div>

      <EnterpriseEngineModule title="Organization Intelligence" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.organization.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.available && m.value != null ? String(m.value) : '—'}
              </p>
            </div>
          ))}
        </div>
      </EnterpriseEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <EnterpriseEngineModule title="Enterprise Administration">
          <ul className="space-y-2 text-sm">
            {data.administration.entities.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{e.label}</span>
                <span className="text-[9px] uppercase text-gray-500">{e.status}</span>
              </li>
            ))}
          </ul>
        </EnterpriseEngineModule>

        <EnterpriseEngineModule title="Enterprise Governance">
          <ul className="space-y-2 text-sm">
            {data.governance.modules.map((m) => (
              <li key={m.key} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{m.label}</span>
                  <span className="text-[9px] uppercase text-gray-500">{m.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{m.summary}</p>
              </li>
            ))}
          </ul>
        </EnterpriseEngineModule>
      </div>

      <EnterpriseEngineModule title="Enterprise RBAC" className="mt-4">
        <ul className="space-y-2 text-sm">
          {data.rbac.roles.filter((r) => r.active).map((r) => (
            <li key={r.key} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-100">{r.label}</span>
                <span className="text-[9px] uppercase text-gray-500">{r.scope}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{r.permissions.join(' · ')}</p>
            </li>
          ))}
        </ul>
      </EnterpriseEngineModule>

      <EnterpriseEngineModule title="Enterprise Analytics" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.analytics.items.map((item) => (
            <div key={item.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{item.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {item.value != null ? String(item.value) : '—'}
              </p>
            </div>
          ))}
        </div>
      </EnterpriseEngineModule>

      <EnterpriseEngineModule title="Enterprise API Framework" className="mt-4">
        <ul className="space-y-2 text-sm">
          {data.apiFramework.connectors.map((c) => (
            <li key={c.key} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <span>{c.label}</span>
              <span className="text-[9px] uppercase text-gray-500">{c.status.replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
      </EnterpriseEngineModule>

      <EnterpriseEngineModule title="Enterprise Report" className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.enterpriseReport.summary}</p>
          {data.enterpriseReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </EnterpriseEngineModule>

      <EnterpriseEngineModule title="Enterprise Timeline" className="mt-4">
        <EnterpriseTimelinePanel timeline={data.timeline} />
      </EnterpriseEngineModule>
    </section>
  );
}
