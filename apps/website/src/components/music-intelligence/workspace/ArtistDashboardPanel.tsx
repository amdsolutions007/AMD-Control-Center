'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AuthMessage,
  StatusBadge,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';
import IntelligenceDashboardSection from '@/components/music-intelligence/intelligence/IntelligenceDashboardSection';
import AIIntelligenceSection from '@/components/music-intelligence/ai-intelligence/AIIntelligenceSection';
import MusicEngineSection from '@/components/music-intelligence/music-engine/MusicEngineSection';

interface DashboardData {
  welcomeName: string;
  profileCompletion: number;
  profileStatus: 'incomplete' | 'complete';
  submissionCount: number;
  pendingCount: number;
  recentSubmissions: Array<{ id: string; song_title: string; status: string; created_at: string }>;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' }>;
}

export default function ArtistDashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/music-intelligence/workspace/dashboard')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load dashboard.');
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AuthMessage type="info">Loading your command center…</AuthMessage>;
  if (error) return <AuthMessage type="error">{error}</AuthMessage>;
  if (!data) return null;

  return (
    <WorkspaceSection
      eyebrow="Artist Command Center"
      title={`Welcome, ${data.welcomeName}`}
      description="Your operational hub for profile management, music submissions, and live intelligence metrics."
    >
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Profile Status" value={`${data.profileCompletion}%`}>
          <StatusBadge status={data.profileStatus} />
        </MetricCard>
        <MetricCard label="Submissions" value={String(data.submissionCount)}>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{data.pendingCount} pending review</span>
        </MetricCard>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="Quick Actions">
          <div className="flex flex-wrap gap-2">
            <QuickAction href="/music-intelligence/account/profile" label="Complete Profile" />
            <QuickAction href="/music-intelligence/account/submissions" label="Submit Music" />
            <QuickAction href="/music-intelligence/account/submissions/history" label="View History" />
          </div>
        </Panel>

        <Panel title="Notifications">
          {data.notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No new notifications.</p>
          ) : (
            <ul className="space-y-2">
              {data.notifications.map((n) => (
                <li key={n.id} className="rounded-xl border border-white/10 bg-[#050512]/60 px-3 py-2 text-sm text-gray-300">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent Activity" className="mt-4">
        {data.recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet. Submit your first track for playlist consideration.</p>
        ) : (
          <ul className="space-y-2">
            {data.recentSubmissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-100">{s.song_title}</p>
                  <p className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <IntelligenceDashboardSection scope="artist" showActivity={false} />

      <AIIntelligenceSection scope="artist" />

      <MusicEngineSection scope="artist" />

      <div className="mt-6">
        <FoundationModule title="Streaming Analytics" description="Cross-platform performance dashboards activate in Phase 5." />
      </div>
    </WorkspaceSection>
  );
}

function MetricCard({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#00E5FF]">{value}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#050512]/60 p-4 ${className}`}>
      <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#00E5FF]/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#00E5FF] hover:shadow-[0_0_16px_rgba(0,229,255,0.25)]"
    >
      {label}
    </Link>
  );
}

function FoundationModule({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-300">{title}</h3>
        <span className="text-[8px] font-black uppercase tracking-wider text-[#00E5FF]/70">Foundation</span>
      </div>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}
