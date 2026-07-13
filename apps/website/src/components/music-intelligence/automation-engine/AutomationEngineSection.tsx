'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { AutomationEnginePayload, AutomationEngineScope } from '@/lib/music-intelligence/automation-types';
import AutomationEngineModule from './AutomationEngineModule';
import AutomationTimelinePanel from './AutomationTimelinePanel';

const ENDPOINTS: Record<AutomationEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/automation-engine',
  partner: '/api/music-intelligence/partner/automation-engine',
};

export default function AutomationEngineSection({
  scope,
  className = 'mt-6',
}: {
  scope: AutomationEngineScope;
  className?: string;
}) {
  const [data, setData] = useState<AutomationEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load automation intelligence engine.');
        }
        return res.json() as Promise<AutomationEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading automation intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Automation Overview' : 'Portfolio Automation';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-automation-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Automation Intelligence Engine</p>
        <h2 id={`${scope}-automation-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Workflow automation · {data.dataSource === 'live' ? 'Business Intelligence driven' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AutomationEngineModule title="Automation Health">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.healthDashboard.automationHealthScore != null ? `${data.healthDashboard.automationHealthScore}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.healthDashboard.summary}</p>
        </AutomationEngineModule>
        <AutomationEngineModule title="Active Workflows">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.workflowAutomation.activeWorkflows}</p>
          <p className="mt-1 text-xs text-gray-500">{data.workflowAutomation.summary}</p>
        </AutomationEngineModule>
        <AutomationEngineModule title="Pending Approvals">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.approvalCenter.pending.length}</p>
          <p className="mt-1 text-xs text-gray-500">{data.approvalCenter.summary}</p>
        </AutomationEngineModule>
        <AutomationEngineModule title="Notifications">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>{data.notificationCenter.unreadCount}</p>
          <p className="mt-1 text-xs text-gray-500">{data.notificationCenter.summary}</p>
        </AutomationEngineModule>
      </div>

      <AutomationEngineModule title="Automation Rules Engine" className="mt-4">
        <p className="mb-3 text-xs text-gray-500">{data.rulesEngine.summary}</p>
        <ul className="space-y-2 text-sm">
          {data.rulesEngine.rules.map((r) => (
            <li key={r.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-100">{r.name}</span>
                <span className={`text-[9px] uppercase tracking-wider ${r.matched ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {r.matched ? 'matched' : 'standby'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {r.approvalMode.replace(/_/g, ' ')} · {r.matchReason ?? r.description}
              </p>
            </li>
          ))}
        </ul>
      </AutomationEngineModule>

      <AutomationEngineModule title="Workflow Automation" className="mt-4">
        <ul className="space-y-2 text-sm">
          {data.workflowAutomation.workflows.map((w) => (
            <li key={w.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-100">{w.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">{w.status}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{w.summary}</p>
            </li>
          ))}
        </ul>
      </AutomationEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AutomationEngineModule title="Scheduled Operations">
          <ul className="space-y-2 text-sm">
            {data.scheduledOperations.operations.map((op) => (
              <li key={op.id} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{op.name}</span>
                <span className="text-[9px] uppercase text-gray-500">{op.status}</span>
              </li>
            ))}
          </ul>
        </AutomationEngineModule>

        <AutomationEngineModule title="Notification Center">
          {data.notificationCenter.dashboardNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">{data.notificationCenter.summary}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.notificationCenter.dashboardNotifications.slice(0, 6).map((n) => (
                <li key={n.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                  <span className="font-semibold text-gray-100">{n.title}</span>
                  <p className="mt-1 text-xs text-gray-500">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </AutomationEngineModule>
      </div>

      <AutomationEngineModule title="Automation Approval Center" className="mt-4">
        {data.approvalCenter.pending.length === 0 ? (
          <p className="text-sm text-gray-500">No pending approval requests.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.approvalCenter.pending.map((a) => (
              <li key={a.id} className="rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{a.workflowName}</span>
                  <span className="text-[9px] uppercase text-amber-400">{a.approvalMode.replace(/_/g, ' ')}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{a.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </AutomationEngineModule>

      <AutomationEngineModule title="Automation History" className="mt-4">
        {data.automationHistory.records.length === 0 ? (
          <p className="text-sm text-gray-500">{data.automationHistory.summary}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.automationHistory.records.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-gray-300">
                <span>{r.workflowId}</span>
                <span className="text-[9px] uppercase text-gray-500">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </AutomationEngineModule>

      <AutomationEngineModule title="Executive Automation Report" className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.executiveReport.summary}</p>
          {data.executiveReport.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-gray-500">→ {rec}</p>
          ))}
        </div>
      </AutomationEngineModule>

      <AutomationEngineModule title="Automation Timeline" className="mt-4">
        <AutomationTimelinePanel timeline={data.timeline} />
      </AutomationEngineModule>
    </section>
  );
}
