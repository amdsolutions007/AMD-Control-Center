import type { MIPartnerProfilePayload } from './partner-profile';

type PartnerInvite = {
  id: string;
  email: string;
  invite_type: 'staff' | 'artist';
  role: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
};

type PartnerArtist = {
  id: string;
  name: string;
  slug: string;
  manager_email?: string;
  is_active: boolean;
};

export type PartnerAgent007Context = {
  partner_profile?: Record<string, unknown>;
  partner_id?: string;
  partner_hub_id?: string;
  partner_invites?: PartnerInvite[];
  partner_artists?: PartnerArtist[];
  partner_settings?: Record<string, unknown>;
  partner_notifications?: Array<{ id: string; message: string; type: string; created_at: string }>;
};

export function getContextPartnerProfile(ctx: Record<string, unknown> | null | undefined) {
  return (ctx?.partner_profile ?? null) as PartnerAgent007Context['partner_profile'];
}

export function getContextPartnerInvites(ctx: Record<string, unknown> | null | undefined): PartnerInvite[] {
  const rows = ctx?.partner_invites;
  return Array.isArray(rows) ? (rows as PartnerInvite[]) : [];
}

export function getContextPartnerArtists(ctx: Record<string, unknown> | null | undefined): PartnerArtist[] {
  const rows = ctx?.partner_artists;
  return Array.isArray(rows) ? (rows as PartnerArtist[]) : [];
}

export function getContextPartnerNotifications(ctx: Record<string, unknown> | null | undefined) {
  const rows = ctx?.partner_notifications;
  if (!Array.isArray(rows)) return [];
  return rows as Array<{ id: string; message: string; type: string; created_at: string }>;
}

export function appendContextPartnerInvite(
  ctx: Record<string, unknown>,
  payload: { email: string; invite_type: 'staff' | 'artist'; role: string },
) {
  const row: PartnerInvite = {
    id: crypto.randomUUID(),
    email: payload.email,
    invite_type: payload.invite_type,
    role: payload.role,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const prior = getContextPartnerInvites(ctx);
  return { ...ctx, partner_invites: [row, ...prior] };
}

export function removeContextPartnerArtist(ctx: Record<string, unknown>, artistId: string) {
  const artists = getContextPartnerArtists(ctx).filter((a) => a.id !== artistId);
  return { ...ctx, partner_artists: artists };
}

export function assignContextPartnerManager(
  ctx: Record<string, unknown>,
  artistId: string,
  managerEmail: string,
) {
  const artists = getContextPartnerArtists(ctx).map((a) =>
    a.id === artistId ? { ...a, manager_email: managerEmail } : a,
  );
  return { ...ctx, partner_artists: artists };
}

export function mergeContextPartnerProfile(ctx: Record<string, unknown>, profile: MIPartnerProfilePayload) {
  return {
    ...ctx,
    partner_profile: profile,
    partner_id: ctx.partner_id ?? crypto.randomUUID(),
    partner_hub_id: ctx.partner_hub_id ?? '214a5177-aa98-4a4f-a283-ff2886f9c7fa',
  };
}

export function pushContextNotification(
  ctx: Record<string, unknown>,
  message: string,
  type: 'info' | 'success' | 'warning' = 'info',
) {
  const row = { id: crypto.randomUUID(), message, type, created_at: new Date().toISOString() };
  const prior = getContextPartnerNotifications(ctx);
  return { ...ctx, partner_notifications: [row, ...prior].slice(0, 50) };
}
