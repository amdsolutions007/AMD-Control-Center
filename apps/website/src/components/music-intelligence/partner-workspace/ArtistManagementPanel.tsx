'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  AuthSubmitButton,
  WorkspaceField,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';

interface ArtistRow {
  id: string;
  name: string;
  slug?: string;
  is_active?: boolean;
  manager_email?: string;
}

export default function ArtistManagementPanel() {
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [managerEmails, setManagerEmails] = useState<Record<string, string>>({});

  function loadArtists() {
    return fetch('/api/music-intelligence/partner/artists')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load artists.');
        }
        return res.json();
      })
      .then((data) => setArtists(data.artists ?? []));
  }

  useEffect(() => {
    loadArtists()
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  async function postAction(body: Record<string, string>) {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/music-intelligence/partner/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Operation failed.');
      await loadArtists();
      setMessage({ type: 'success', text: 'Artist roster updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AuthMessage type="info">Loading artist roster…</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Artist Management"
      title="Roster Operations"
      description="Invite artists, assign managers, and maintain your organization roster."
    >
      {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}

      <form
        className="mt-8 flex flex-wrap gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          postAction({ action: 'invite', email: inviteEmail });
          setInviteEmail('');
        }}
      >
        <div className="flex-1 min-w-[200px]">
          <WorkspaceField
            id="invite_email"
            label="Invite Artist (Email)"
            type="email"
            value={inviteEmail}
            onChange={setInviteEmail}
            required
          />
        </div>
        <AuthSubmitButton loading={submitting}>Send Invite</AuthSubmitButton>
      </form>

      <div className="mt-8 space-y-3">
        {artists.length === 0 ? (
          <p className="text-sm text-gray-500">No artists linked yet. Send an invite to onboard roster members.</p>
        ) : (
          artists.map((artist) => (
            <div key={artist.id} className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-100">{artist.name}</p>
                  <p className="text-xs text-gray-500">{artist.slug ?? artist.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => postAction({ action: 'remove', artist_id: artist.id })}
                  className="rounded-full border border-red-500/40 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-red-300"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[180px]">
                  <WorkspaceField
                    id={`manager_${artist.id}`}
                    label="Assign Manager"
                    type="email"
                    value={managerEmails[artist.id] ?? artist.manager_email ?? ''}
                    onChange={(v) => setManagerEmails((m) => ({ ...m, [artist.id]: v }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    postAction({
                      action: 'assign_manager',
                      artist_id: artist.id,
                      manager_email: managerEmails[artist.id] ?? '',
                    })
                  }
                  className="rounded-full border border-[#6366F1]/40 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#6366F1]"
                >
                  Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </WorkspaceSection>
  );
}
