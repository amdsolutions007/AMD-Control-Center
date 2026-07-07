'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  AuthSubmitButton,
  WorkspaceField,
  WorkspaceSection,
  WorkspaceTextArea,
} from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { MIArtistProfilePayload, MIArtistSocialLinks } from '@/lib/music-intelligence/artist-profile';

const EMPTY: MIArtistProfilePayload = {
  artist_name: '',
  stage_name: '',
  biography: '',
  country: '',
  city: '',
  primary_genre: '',
  secondary_genre: '',
  mood: '',
  language: '',
  profile_image_url: '',
  cover_image_url: '',
  social_links: {},
};

export default function ArtistProfileForm() {
  const [profile, setProfile] = useState<MIArtistProfilePayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/music-intelligence/workspace/profile')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load profile.');
        }
        return res.json();
      })
      .then((data) => setProfile({ ...EMPTY, ...data.profile }))
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  function updateSocial(key: keyof MIArtistSocialLinks, value: string) {
    setProfile((p) => ({
      ...p,
      social_links: { ...p.social_links, [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/music-intelligence/workspace/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Save failed.');
      setMessage({ type: 'success', text: `Profile saved. Completion: ${body.completion}%.` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AuthMessage type="info">Loading artist profile…</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Artist Profile"
      title="Profile Management"
      description="Complete your artist identity for playlist consideration and future intelligence modules. Data persists to your Supabase profile and catalog record."
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="artist-name" label="Artist Name" value={profile.artist_name} onChange={(v) => setProfile({ ...profile, artist_name: v })} required />
          <WorkspaceField id="stage-name" label="Stage Name" value={profile.stage_name} onChange={(v) => setProfile({ ...profile, stage_name: v })} required />
        </div>
        <WorkspaceTextArea id="bio" label="Biography" value={profile.biography} onChange={(v) => setProfile({ ...profile, biography: v })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="country" label="Country" value={profile.country} onChange={(v) => setProfile({ ...profile, country: v })} required />
          <WorkspaceField id="city" label="City" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="primary-genre" label="Primary Genre" value={profile.primary_genre} onChange={(v) => setProfile({ ...profile, primary_genre: v })} required />
          <WorkspaceField id="secondary-genre" label="Secondary Genre" value={profile.secondary_genre ?? ''} onChange={(v) => setProfile({ ...profile, secondary_genre: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="mood" label="Mood" value={profile.mood ?? ''} onChange={(v) => setProfile({ ...profile, mood: v })} />
          <WorkspaceField id="language" label="Language" value={profile.language ?? ''} onChange={(v) => setProfile({ ...profile, language: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="profile-image" label="Profile Image URL" value={profile.profile_image_url ?? ''} onChange={(v) => setProfile({ ...profile, profile_image_url: v })} placeholder="https://..." />
          <WorkspaceField id="cover-image" label="Cover Image URL" value={profile.cover_image_url ?? ''} onChange={(v) => setProfile({ ...profile, cover_image_url: v })} placeholder="https://..." />
        </div>
        <fieldset className="rounded-2xl border border-white/10 p-4 space-y-3">
          <legend className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Social Links</legend>
          {(['instagram', 'twitter', 'tiktok', 'spotify', 'apple', 'youtube', 'website'] as const).map((key) => (
            <WorkspaceField
              key={key}
              id={`social-${key}`}
              label={key}
              value={profile.social_links?.[key] ?? ''}
              onChange={(v) => updateSocial(key, v)}
              placeholder={`Your ${key} URL`}
            />
          ))}
        </fieldset>
        {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}
        <AuthSubmitButton loading={saving}>Save Artist Profile</AuthSubmitButton>
      </form>
    </WorkspaceSection>
  );
}
