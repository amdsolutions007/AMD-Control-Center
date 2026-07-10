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

interface DashboardData {
  organizationName: string;
  partnerCategory: string;
  verificationStatus: string;
  activeArtists: number;
  activeCampaigns: number;
  submissionQueue: number;
  workspaceSummary: string;
  profileCompletion: number;
  recentSubmissions: Array<{
    id: string;
    song_title: string;
    artist_name: string;
    status: string;
    created_at: string;
  }>;
  notifications: Array<{ id: string; message: string; type: string }>;
}

export default function PartnerDashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/music-intelligence/partner/dashboard')
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

  if (loading) return <AuthMessage type="info">Loading enterprise command center…</AuthMessage>;
  if (error) return <AuthMessage type="error">{error}</AuthMessage>;
  if (!data) return null;

  return (
    <WorkspaceSection
      eyebrow="Partner Command Center"
      title={data.organizationName}
      description={data.workspaceSummary}
    >
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Partner Category" value={data.partnerCategory.replace(/-/g, ' ')} />
        <MetricCard label="Verification" value={data.verificationStatus}>
          <StatusBadge status={data.verificationStatus} />
        </MetricCard>
        <MetricCard label="Profile Completion" value={`${data.profileCompletion}%`} />
        <MetricCard label="Active Artists" value={String(data.activeArtists)} />
        <MetricCard label="Active Campaigns" value={String(data.activeCampaigns)}>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Awaiting campaign engine</span>
        </MetricCard>
        <MetricCard label="Submission Queue" value={String(data.submissionQueue)} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="Quick Actions">
          <div className="flex flex-wrap gap-2">
            <QuickAction href="/music-intelligence/partner/profile" label="Organization Profile" />
            <QuickAction href="/music-intelligence/partner/artists" label="Manage Artists" />
            <QuickAction href="/music-intelligence/partner/submissions" label="Review Submissions" />
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

      <Panel title="Recent Submissions" className="mt-4">
        {data.recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions in queue yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recentSubmissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-100">{s.song_title}</p>
                  <p className="text-xs text-gray-500">{s.artist_name} · {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <IntelligenceDashboardSection scope="partner" showActivity={false} />

      <AIIntelligenceSection scope="partner" />
    </WorkspaceSection>
  );
}

function MetricCard({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-[#6366F1] capitalize">{value}</p>
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
      className="rounded-full border border-[#6366F1]/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#6366F1] hover:shadow-[0_0_16px_rgba(99,102,241,0.25)]"
    >
      {label}
    </Link>
  );
}
