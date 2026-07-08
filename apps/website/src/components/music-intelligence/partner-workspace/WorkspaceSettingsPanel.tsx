'use client';

import { useEffect, useState } from 'react';
import {
  AuthMessage,
  AuthSubmitButton,
  WorkspaceSection,
} from '@/components/music-intelligence/workspace/WorkspaceShared';

export default function WorkspaceSettingsPanel() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/music-intelligence/partner/settings')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load settings.');
        }
        return res.json();
      })
      .then((data) => {
        setNotificationsEnabled(Boolean(data.settings?.notifications_enabled ?? true));
        setEmailDigest(String(data.settings?.email_digest ?? 'weekly'));
      })
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/music-intelligence/partner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications_enabled: notificationsEnabled,
          email_digest: emailDigest,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Save failed.');
      setMessage({ type: 'success', text: 'Workspace settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AuthMessage type="info">Loading workspace settings…</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Workspace Settings"
      title="Partner Configuration"
      description="Configure notification preferences and enterprise workspace defaults."
    >
      {message && <AuthMessage type={message.type}>{message.text}</AuthMessage>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <label className="flex items-center gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="rounded border-white/20"
          />
          Enable enterprise notifications
        </label>
        <div>
          <label htmlFor="email_digest" className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">
            Email Digest Frequency
          </label>
          <select
            id="email_digest"
            value={emailDigest}
            onChange={(e) => setEmailDigest(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-white/15 bg-[#050512]/90 px-4 py-3 text-sm text-gray-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="off">Off</option>
          </select>
        </div>
        <AuthSubmitButton loading={saving}>Save Settings</AuthSubmitButton>
      </form>
    </WorkspaceSection>
  );
}
