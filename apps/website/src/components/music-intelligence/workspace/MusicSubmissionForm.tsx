'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MI_DSP_PLATFORMS } from '@/lib/music-intelligence/constants';
import type { MIMusicSubmissionPayload } from '@/lib/music-intelligence/submissions';
import {
  AuthMessage,
  AuthSubmitButton,
  WorkspaceField,
  WorkspaceSection,
  WorkspaceTextArea,
} from '@/components/music-intelligence/workspace/WorkspaceShared';

const EMPTY: MIMusicSubmissionPayload = {
  song_title: '',
  artist_name: '',
  album: '',
  genre: '',
  mood: '',
  bpm: null,
  release_date: '',
  territory: 'Global',
  language: '',
  dsp_links: {},
  artwork_url: '',
  press_kit_url: '',
  biography: '',
};

export default function MusicSubmissionForm() {
  const router = useRouter();
  const [form, setForm] = useState<MIMusicSubmissionPayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/music-intelligence/workspace/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setForm((f) => ({
            ...f,
            artist_name: data.profile.stage_name || data.profile.artist_name || '',
            genre: data.profile.primary_genre || '',
            mood: data.profile.mood || '',
            language: data.profile.language || '',
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/music-intelligence/workspace/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Submission failed.');
      setMessage({ type: 'success', text: 'Submission received. Status: pending review.' });
      setTimeout(() => router.push('/music-intelligence/account/submissions/history'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AuthMessage type="info">Preparing submission form…</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Music Submission Center"
      title="Submit Music"
      description="Submit tracks for playlist consideration across AMD Music Intelligence channels. Provide at least one streaming platform URL."
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="song-title" label="Song Title" value={form.song_title} onChange={(v) => setForm({ ...form, song_title: v })} required />
          <WorkspaceField id="submission-artist" label="Artist" value={form.artist_name} onChange={(v) => setForm({ ...form, artist_name: v })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="album" label="Album" value={form.album ?? ''} onChange={(v) => setForm({ ...form, album: v })} />
          <WorkspaceField id="submission-genre" label="Genre" value={form.genre ?? ''} onChange={(v) => setForm({ ...form, genre: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <WorkspaceField id="submission-mood" label="Mood" value={form.mood ?? ''} onChange={(v) => setForm({ ...form, mood: v })} />
          <WorkspaceField id="bpm" label="BPM (Optional)" type="number" value={form.bpm != null ? String(form.bpm) : ''} onChange={(v) => setForm({ ...form, bpm: v ? Number(v) : null })} />
          <WorkspaceField id="release-date" label="Release Date" type="date" value={form.release_date ?? ''} onChange={(v) => setForm({ ...form, release_date: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="territory" label="Territory" value={form.territory ?? 'Global'} onChange={(v) => setForm({ ...form, territory: v })} />
          <WorkspaceField id="submission-language" label="Language" value={form.language ?? ''} onChange={(v) => setForm({ ...form, language: v })} />
        </div>

        <fieldset className="rounded-2xl border border-[#00E5FF]/20 p-4 space-y-3">
          <legend className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00E5FF]">Streaming Platform URLs</legend>
          {MI_DSP_PLATFORMS.map(({ key, label }) => (
            <WorkspaceField
              key={key}
              id={`dsp-${key}`}
              label={label}
              value={form.dsp_links[key] ?? ''}
              onChange={(v) => setForm({ ...form, dsp_links: { ...form.dsp_links, [key]: v } })}
              placeholder={`https://${key.replace('_', '.')}...`}
            />
          ))}
        </fieldset>

        <fieldset className="rounded-2xl border border-white/10 p-4 space-y-3">
          <legend className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Optional Assets</legend>
          <WorkspaceField id="artwork-url" label="Artwork URL" value={form.artwork_url ?? ''} onChange={(v) => setForm({ ...form, artwork_url: v })} />
          <WorkspaceField id="press-kit-url" label="Press Kit URL" value={form.press_kit_url ?? ''} onChange={(v) => setForm({ ...form, press_kit_url: v })} />
          <WorkspaceTextArea id="submission-bio" label="Biography (Optional)" value={form.biography ?? ''} onChange={(v) => setForm({ ...form, biography: v })} rows={3} />
          <AuthMessage type="info">Audio upload architecture prepared for a future phase. URL-based submissions are active now.</AuthMessage>
        </fieldset>

        {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}
        <AuthSubmitButton loading={submitting}>Submit for Review</AuthSubmitButton>
      </form>
    </WorkspaceSection>
  );
}
