'use client';

import { useEffect, useState } from 'react';
import { AuthMessage, WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';

interface Notification {
  id: string;
  message: string;
  type: string;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/music-intelligence/partner/notifications')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load notifications.');
        }
        return res.json();
      })
      .then((data) => setNotifications(data.notifications ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AuthMessage type="info">Loading notifications…</AuthMessage>;
  if (error) return <AuthMessage type="error">{error}</AuthMessage>;

  return (
    <WorkspaceSection
      eyebrow="Notifications"
      title="Enterprise Notification Center"
      description="Operational alerts for submissions, roster changes, and workspace activity."
    >
      <ul className="mt-8 space-y-3">
        {notifications.length === 0 ? (
          <li className="text-sm text-gray-500">No notifications at this time.</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl border border-white/10 bg-[#050512]/60 px-4 py-3 text-sm text-gray-300"
            >
              <span className="mr-2 text-[9px] font-black uppercase tracking-wider text-[#6366F1]">
                {n.type}
              </span>
              {n.message}
            </li>
          ))
        )}
      </ul>
    </WorkspaceSection>
  );
}
