'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  AuthSubmitButton,
  WorkspaceField,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';
import { MI_PARTNER_CATEGORIES } from '@/lib/music-intelligence/partner-constants';
import type { MIPartnerProfilePayload } from '@/lib/music-intelligence/partner-profile';

const EMPTY: MIPartnerProfilePayload = {
  company_name: '',
  partner_category: 'enterprise-partner',
  logo_url: '',
  country: '',
  website: '',
  contact_email: '',
  contact_phone: '',
  social_links: {},
};

export default function OrganizationProfileForm() {
  const [profile, setProfile] = useState<MIPartnerProfilePayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/music-intelligence/partner/profile')
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/music-intelligence/partner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Save failed.');
      setMessage({ type: 'success', text: `Organization profile saved. Completion: ${body.completion}%.` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AuthMessage type="info">Loading organization profile…</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Organization Profile"
      title="Enterprise Identity"
      description="Manage your company profile, verification details, and public organization metadata."
    >
      {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <WorkspaceField
          id="company_name"
          label="Company Name"
          value={profile.company_name}
          onChange={(v) => setProfile((p) => ({ ...p, company_name: v }))}
          required
        />
        <div>
          <label htmlFor="partner_category" className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">
            Partner Category
          </label>
          <select
            id="partner_category"
            value={profile.partner_category}
            onChange={(e) => setProfile((p) => ({ ...p, partner_category: e.target.value as MIPartnerProfilePayload['partner_category'] }))}
            className="w-full rounded-xl border border-white/15 bg-[#050512]/90 px-4 py-3 text-sm text-gray-100 focus:border-[#6366F1]/60 focus:outline-none"
          >
            {MI_PARTNER_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="country" label="Country" value={profile.country} onChange={(v) => setProfile((p) => ({ ...p, country: v }))} required />
          <WorkspaceField id="website" label="Website" value={profile.website ?? ''} onChange={(v) => setProfile((p) => ({ ...p, website: v }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="contact_email" label="Contact Email" type="email" value={profile.contact_email} onChange={(v) => setProfile((p) => ({ ...p, contact_email: v }))} required />
          <WorkspaceField id="contact_phone" label="Contact Phone" value={profile.contact_phone ?? ''} onChange={(v) => setProfile((p) => ({ ...p, contact_phone: v }))} />
        </div>
        <WorkspaceField id="logo_url" label="Logo URL" value={profile.logo_url ?? ''} onChange={(v) => setProfile((p) => ({ ...p, logo_url: v }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceField id="linkedin" label="LinkedIn" value={profile.social_links?.linkedin ?? ''} onChange={(v) => setProfile((p) => ({ ...p, social_links: { ...p.social_links, linkedin: v } }))} />
          <WorkspaceField id="instagram" label="Instagram" value={profile.social_links?.instagram ?? ''} onChange={(v) => setProfile((p) => ({ ...p, social_links: { ...p.social_links, instagram: v } }))} />
        </div>
        <AuthSubmitButton loading={saving}>Save Organization Profile</AuthSubmitButton>
      </form>
    </WorkspaceSection>
  );
}
