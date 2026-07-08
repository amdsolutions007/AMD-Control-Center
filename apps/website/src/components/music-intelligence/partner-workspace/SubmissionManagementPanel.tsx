'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  StatusBadge,
  WorkspaceField,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';

interface SubmissionRow {
  id: string;
  song_title: string;
  artist_name: string;
  status: string;
  created_at: string;
  rejection_reason?: string | null;
}

export default function SubmissionManagementPanel() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  function load() {
    return fetch('/api/music-intelligence/partner/submissions')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load submissions.');
        }
        return res.json();
      })
      .then((data) => setSubmissions(data.submissions ?? []));
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateSubmission(id: string, action: 'approve' | 'reject' | 'revision') {
    setUpdating(id);
    try {
      const res = await fetch('/api/music-intelligence/partner/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: id,
          action,
          reason: reasons[id] || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Update failed.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <AuthMessage type="info">Loading submission queue…</AuthMessage>;
  if (error) return <AuthMessage type="error">{error}</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Submission Management"
      title="Review Queue"
      description="Approve, reject, or request revisions on artist submissions for your organization."
    >
      <div className="mt-8 space-y-4">
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions to review.</p>
        ) : (
          submissions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-100">{s.song_title}</p>
                  <p className="text-xs text-gray-500">{s.artist_name} · {new Date(s.created_at).toLocaleString()}</p>
                  {s.rejection_reason && (
                    <p className="mt-2 text-xs text-amber-300">Note: {s.rejection_reason}</p>
                  )}
                </div>
                <StatusBadge status={s.status} />
              </div>
              {['pending_review', 'revision_requested'].includes(s.status) && (
                <div className="mt-4 space-y-3">
                  <WorkspaceField
                    id={`reason_${s.id}`}
                    label="Review Note (optional)"
                    value={reasons[s.id] ?? ''}
                    onChange={(v) => setReasons((r) => ({ ...r, [s.id]: v }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <ActionButton label="Approve" onClick={() => updateSubmission(s.id, 'approve')} loading={updating === s.id} />
                    <ActionButton label="Reject" onClick={() => updateSubmission(s.id, 'reject')} loading={updating === s.id} variant="danger" />
                    <ActionButton label="Request Revision" onClick={() => updateSubmission(s.id, 'revision')} loading={updating === s.id} variant="warn" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </WorkspaceSection>
  );
}

function ActionButton({
  label,
  onClick,
  loading,
  variant = 'primary',
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  variant?: 'primary' | 'danger' | 'warn';
}) {
  const styles = {
    primary: 'border-[#6366F1]/40 text-[#6366F1]',
    danger: 'border-red-500/40 text-red-300',
    warn: 'border-amber-500/40 text-amber-300',
  };
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider disabled:opacity-50 ${styles[variant]}`}
    >
      {loading ? '…' : label}
    </button>
  );
}
