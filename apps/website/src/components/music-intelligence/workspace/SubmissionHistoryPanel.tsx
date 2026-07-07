'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  StatusBadge,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';

interface SubmissionRow {
  id: string;
  song_title: string;
  artist_name: string;
  status: string;
  created_at: string;
  dsp_links: Record<string, string>;
}

export default function SubmissionHistoryPanel() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/music-intelligence/workspace/submissions')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load submissions.');
        }
        return res.json();
      })
      .then((data) => setSubmissions(data.submissions ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AuthMessage type="info">Loading submission history…</AuthMessage>;
  if (error) return <AuthMessage type="error">{error}</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Submission History"
      title="Your Submissions"
      description="Track the status of music submitted for playlist consideration and A&R review."
    >
      {submissions.length === 0 ? (
        <AuthMessage type="info">No submissions yet. Use Submit Music to send your first track.</AuthMessage>
      ) : (
        <ul className="mt-8 space-y-3">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-100">{s.song_title}</p>
                  <p className="text-sm text-gray-400">{s.artist_name}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              {Object.keys(s.dsp_links ?? {}).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(s.dsp_links).filter(([, url]) => url).map(([platform]) => (
                    <span key={platform} className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-gray-500">
                      {platform.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </WorkspaceSection>
  );
}
