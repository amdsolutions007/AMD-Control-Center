'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { OSEnginePayload, OSEngineScope } from '@/lib/music-intelligence/os-types';
import OperatingSystemModule from './OperatingSystemModule';
import OperatingTimelinePanel from './OperatingTimelinePanel';

const ENDPOINTS: Record<OSEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/os-engine',
  partner: '/api/music-intelligence/partner/os-engine',
};

export default function OperatingSystemSection({
  scope,
  className = 'mt-6',
}: {
  scope: OSEngineScope;
  className?: string;
}) {
  const [data, setData] = useState<OSEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load AMD Music OS™.');
        }
        return res.json() as Promise<OSEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading AMD Music OS™…</AuthMessage>
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

  const heading = scope === 'artist' ? 'AMD Music OS™ Control' : 'Portfolio OS Command';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-os-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">AMD Music OS™</p>
        <h2 id={`${scope}-os-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Operating system layer · {data.dataSource === 'live' ? 'All subsystems orchestrated' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OperatingSystemModule title="System Health">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthCenter.overallScore != null ? `${data.healthCenter.overallScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.osDashboard.summary}</p>
        </OperatingSystemModule>
        <OperatingSystemModule title="OS Kernel">
          <p className={`text-lg font-black uppercase ${accent}`}>{data.kernel.status.replace(/_/g, ' ')}</p>
          <p className="mt-1 text-xs text-gray-500">{data.kernel.summary}</p>
        </OperatingSystemModule>
        <OperatingSystemModule title="Engines Live">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.registry.liveCount}/{data.registry.registeredCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.registry.summary}</p>
        </OperatingSystemModule>
        <OperatingSystemModule title="System Alerts">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.alerts.length}</p>
          <p className="mt-1 text-xs text-gray-500">{data.commandCenter.summary}</p>
        </OperatingSystemModule>
      </div>

      <OperatingSystemModule title="Intelligence Registry" className="mt-4">
        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
          {data.registry.entries.map((e) => (
            <li key={e.key} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <span>{e.label} <span className="text-gray-500">· Phase {e.phase}</span></span>
              <span className="text-[9px] uppercase text-gray-500">{e.status}</span>
            </li>
          ))}
        </ul>
      </OperatingSystemModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <OperatingSystemModule title="Executive Decision Center">
          <ul className="space-y-2 text-sm">
            {data.decisionCenter.decisions.map((d) => (
              <li key={d.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{d.label}</span>
                  <span className="text-[9px] uppercase text-gray-500">{d.priority}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{d.summary}</p>
              </li>
            ))}
          </ul>
        </OperatingSystemModule>

        <OperatingSystemModule title="Unified Intelligence Search">
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {data.unifiedSearch.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{item.label}</span>
                <span className="text-[9px] uppercase text-gray-500">{item.searchable ? 'indexed' : 'standby'}</span>
              </li>
            ))}
          </ul>
        </OperatingSystemModule>
      </div>

      <OperatingSystemModule title="System Health Center" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.healthCenter.metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-gray-100">
                {m.score != null ? `${m.score}%` : '—'}
              </p>
            </div>
          ))}
        </div>
      </OperatingSystemModule>

      <OperatingSystemModule title="AI Agent Framework" className="mt-4">
        <p className="mb-2 text-xs text-gray-500">{data.aiAgentFramework.summary}</p>
        <ul className="space-y-2 text-sm">
          {data.aiAgentFramework.agents.map((a) => (
            <li key={a.key} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-100">{a.label}</span>
                <span className="text-[9px] uppercase text-gray-500">{a.status.replace(/_/g, ' ')}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{a.capabilities.join(' · ')}</p>
            </li>
          ))}
        </ul>
      </OperatingSystemModule>

      {data.alerts.length > 0 && (
        <OperatingSystemModule title="System Alerts" className="mt-4">
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
        </OperatingSystemModule>
      )}

      <OperatingSystemModule title="Executive Report" className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.executiveReport.summary}</p>
          {data.executiveReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </OperatingSystemModule>

      <OperatingSystemModule title="Operating Timeline" className="mt-4">
        <OperatingTimelinePanel timeline={data.timeline} />
      </OperatingSystemModule>
    </section>
  );
}
