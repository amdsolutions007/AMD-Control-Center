import { MI_DEFAULT_HUB_ID } from './constants';
import { defaultPartnerCategory } from './partner-constants';
import {
  mergePartnerProfile,
  profileCompletionPercent,
  type MIPartnerProfileExtension,
  type MIPartnerProfilePayload,
} from './partner-profile';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import { tableAvailable } from './workspace-fallback';
import {
  appendContextPartnerInvite,
  assignContextPartnerManager,
  getContextPartnerArtists,
  getContextPartnerInvites,
  getContextPartnerNotifications,
  getContextPartnerProfile,
  mergeContextPartnerProfile,
  pushContextNotification,
  removeContextPartnerArtist,
} from './partner-fallback';

export interface PartnerDashboardData {
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

async function resolvePartnerContext(session: MIPartnerWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return { service: null, hubId: session.hubId ?? MI_DEFAULT_HUB_ID, partnerId: session.partnerId };

  if (await tableAvailable(service, 'mi_partner_profiles')) {
    const { data: owned } = await service
      .from('mi_partner_profiles')
      .select('id, hub_id')
      .eq('owner_user_id', session.userId)
      .maybeSingle();

    if (owned) {
      return { service, hubId: owned.hub_id, partnerId: owned.id };
    }

    const { data: membership } = await service
      .from('mi_partner_members')
      .select('partner_id, mi_partner_profiles(hub_id)')
      .eq('user_id', session.userId)
      .limit(1)
      .maybeSingle();

    if (membership?.partner_id) {
      const hubId =
        (membership.mi_partner_profiles as { hub_id?: string } | null)?.hub_id ?? MI_DEFAULT_HUB_ID;
      return { service, hubId, partnerId: membership.partner_id };
    }
  }

  const { data: profile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const ctx = (profile?.agent_007_context ?? {}) as Record<string, unknown>;
  return {
    service,
    hubId: (ctx.partner_hub_id as string) ?? session.hubId ?? MI_DEFAULT_HUB_ID,
    partnerId: (ctx.partner_id as string) ?? session.partnerId,
  };
}

export async function loadPartnerProfile(session: MIPartnerWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return null;

  const { data: userProfile } = await service
    .from('mi_user_profiles')
    .select('display_name, agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const ctx = (userProfile?.agent_007_context ?? {}) as Record<string, unknown>;
  const ctxExt = getContextPartnerProfile(ctx) as MIPartnerProfileExtension | null;

  if (await tableAvailable(service, 'mi_partner_profiles')) {
    const { data: row } = await service
      .from('mi_partner_profiles')
      .select('*')
      .eq('owner_user_id', session.userId)
      .maybeSingle();

    if (row) {
      const profile = mergePartnerProfile(row, ctxExt, {
        organization: session.organization,
        role: session.role,
        email: session.email,
      });
      return { profile, row, completion: profileCompletionPercent(profile), verificationStatus: row.verification_status };
    }
  }

  const profile = mergePartnerProfile(null, ctxExt, {
    organization: session.organization,
    role: session.role,
    email: session.email,
  });

  if (!profile.partner_category) {
    profile.partner_category = defaultPartnerCategory(session.role);
  }
  if (!profile.company_name && session.organization) {
    profile.company_name = session.organization;
  }

  const verificationStatus = ctxExt?.verification_status ?? 'pending';

  return { profile, row: null, completion: profileCompletionPercent(profile), verificationStatus };
}

export async function savePartnerProfile(
  session: MIPartnerWorkspaceSession,
  payload: MIPartnerProfilePayload,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const hubId = session.hubId ?? MI_DEFAULT_HUB_ID;
  let partnerId = session.partnerId;

  if (await tableAvailable(service, 'mi_partner_profiles')) {
    const { data: existing } = await service
      .from('mi_partner_profiles')
      .select('id')
      .eq('owner_user_id', session.userId)
      .maybeSingle();

    if (existing?.id) {
      await service
        .from('mi_partner_profiles')
        .update({
          company_name: payload.company_name,
          partner_category: payload.partner_category,
          logo_url: payload.logo_url || null,
          country: payload.country || null,
          website: payload.website || null,
          contact_email: payload.contact_email || null,
          contact_phone: payload.contact_phone || null,
          social_links: payload.social_links ?? {},
        })
        .eq('id', existing.id);
      partnerId = existing.id;
    } else {
      const { data: created, error } = await service
        .from('mi_partner_profiles')
        .insert({
          hub_id: hubId,
          owner_user_id: session.userId,
          company_name: payload.company_name,
          partner_category: payload.partner_category,
          logo_url: payload.logo_url || null,
          country: payload.country || null,
          website: payload.website || null,
          contact_email: payload.contact_email || null,
          contact_phone: payload.contact_phone || null,
          social_links: payload.social_links ?? {},
          verification_status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      partnerId = created.id;

      if (await tableAvailable(service, 'mi_partner_members')) {
        await service.from('mi_partner_members').upsert({
          partner_id: partnerId,
          user_id: session.userId,
          role: 'owner',
        });
      }

      if (await tableAvailable(service, 'mi_hub_managers')) {
        await service.from('mi_hub_managers').upsert({
          user_id: session.userId,
          hub_id: hubId,
          role: 'admin',
        });
      }
    }
  }

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const mergedContext = mergeContextPartnerProfile(
    (existingProfile?.agent_007_context as Record<string, unknown>) ?? {},
    payload,
  );

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    display_name: payload.company_name,
    agent_007_context: mergedContext,
  });

  await service.auth.admin.updateUserById(session.userId, {
    user_metadata: {
      partner_id: partnerId ?? mergedContext.partner_id,
      partner_hub_id: mergedContext.partner_hub_id ?? hubId,
      organization: payload.company_name,
    },
  });

  return { partnerId: partnerId ?? mergedContext.partner_id, completion: profileCompletionPercent(payload) };
}

export async function loadPartnerDashboard(session: MIPartnerWorkspaceSession): Promise<PartnerDashboardData> {
  const profileData = await loadPartnerProfile(session);
  const { service, hubId } = await resolvePartnerContext(session);
  const profile = profileData?.profile;
  const completion = profileData?.completion ?? 0;

  let recentSubmissions: PartnerDashboardData['recentSubmissions'] = [];
  let submissionQueue = 0;
  let activeArtists = 0;

  if (service) {
    if (await tableAvailable(service, 'mi_music_submissions')) {
      const { data: submissions } = await service
        .from('mi_music_submissions')
        .select('id, song_title, artist_name, status, created_at')
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false })
        .limit(5);
      recentSubmissions = submissions ?? [];
      submissionQueue = (submissions ?? []).filter((s) =>
        ['pending_review', 'revision_requested'].includes(s.status),
      ).length;
    }

    const { data: artists } = await service
      .from('mi_artists')
      .select('id')
      .eq('hub_id', hubId)
      .eq('is_active', true);
    activeArtists = artists?.length ?? 0;

    if (activeArtists === 0) {
      const { data: userProfile } = await service
        .from('mi_user_profiles')
        .select('agent_007_context')
        .eq('id', session.userId)
        .maybeSingle();
      activeArtists = getContextPartnerArtists(
        userProfile?.agent_007_context as Record<string, unknown> | null,
      ).filter((a) => a.is_active).length;
    }
  }

  const notifications: PartnerDashboardData['notifications'] = [];
  if (completion < 85) {
    notifications.push({
      id: 'profile-incomplete',
      message: 'Complete your organization profile to unlock full enterprise capabilities.',
      type: 'info',
    });
  }
  if (submissionQueue > 0) {
    notifications.push({
      id: 'submission-queue',
      message: `${submissionQueue} submission(s) awaiting partner review.`,
      type: 'info',
    });
  }

  if (service) {
    const { data: userProfile } = await service
      .from('mi_user_profiles')
      .select('agent_007_context')
      .eq('id', session.userId)
      .maybeSingle();
    const stored = getContextPartnerNotifications(
      userProfile?.agent_007_context as Record<string, unknown> | null,
    );
    stored.slice(0, 5).forEach((n) => notifications.push(n));
  }

  const verificationStatus = profileData?.verificationStatus ?? 'pending';

  return {
    organizationName: profile?.company_name || session.organization || session.displayName,
    partnerCategory: profile?.partner_category ?? defaultPartnerCategory(session.role),
    verificationStatus,
    activeArtists,
    activeCampaigns: 0,
    submissionQueue,
    workspaceSummary: `Enterprise workspace for ${profile?.company_name || 'your organization'} — ${activeArtists} active artists, ${submissionQueue} submissions in queue.`,
    profileCompletion: completion,
    recentSubmissions,
    notifications,
  };
}

export async function listPartnerArtists(session: MIPartnerWorkspaceSession) {
  const { service, hubId } = await resolvePartnerContext(session);
  if (!service) return [];

  const { data } = await service
    .from('mi_artists')
    .select('id, name, slug, is_active, profile_image_url')
    .eq('hub_id', hubId)
    .order('name');

  if (data && data.length > 0) return data;

  const { data: profile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();
  return getContextPartnerArtists(profile?.agent_007_context as Record<string, unknown> | null);
}

export async function invitePartnerArtist(
  session: MIPartnerWorkspaceSession,
  email: string,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const { partnerId } = await resolvePartnerContext(session);

  if (await tableAvailable(service, 'mi_partner_invites')) {
    const { data, error } = await service
      .from('mi_partner_invites')
      .insert({
        partner_id: partnerId,
        email: email.trim().toLowerCase(),
        invite_type: 'artist',
        role: 'artist',
        status: 'pending',
        invited_by: session.userId,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const nextCtx = appendContextPartnerInvite(
    (existingProfile?.agent_007_context as Record<string, unknown>) ?? {},
    { email, invite_type: 'artist', role: 'artist' },
  );

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    agent_007_context: pushContextNotification(
      nextCtx,
      `Artist invite sent to ${email}.`,
      'success',
    ),
  });

  return nextCtx.partner_invites?.[0];
}

export async function removePartnerArtist(session: MIPartnerWorkspaceSession, artistId: string) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const { hubId } = await resolvePartnerContext(session);
  await service.from('mi_artists').update({ is_active: false }).eq('id', artistId).eq('hub_id', hubId);

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const nextCtx = removeContextPartnerArtist(
    (existingProfile?.agent_007_context as Record<string, unknown>) ?? {},
    artistId,
  );

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    agent_007_context: nextCtx,
  });
}

export async function assignPartnerManager(
  session: MIPartnerWorkspaceSession,
  artistId: string,
  managerEmail: string,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  if (await tableAvailable(service, 'mi_artist_members')) {
    const { data: user } = await service.auth.admin.listUsers();
    const manager = user.users.find((u) => u.email?.toLowerCase() === managerEmail.toLowerCase());
    if (manager) {
      await service.from('mi_artist_members').upsert({
        user_id: manager.id,
        artist_id: artistId,
        hub_id: session.hubId ?? MI_DEFAULT_HUB_ID,
        role: 'manager',
      });
    }
  }

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const nextCtx = assignContextPartnerManager(
    (existingProfile?.agent_007_context as Record<string, unknown>) ?? {},
    artistId,
    managerEmail,
  );

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    agent_007_context: nextCtx,
  });
}

export async function listPartnerSubmissions(session: MIPartnerWorkspaceSession) {
  const { service, hubId } = await resolvePartnerContext(session);
  if (!service) return [];

  if (await tableAvailable(service, 'mi_music_submissions')) {
    const { data } = await service
      .from('mi_music_submissions')
      .select('*')
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false });
    return data ?? [];
  }

  return [];
}

export async function updatePartnerSubmission(
  session: MIPartnerWorkspaceSession,
  submissionId: string,
  action: 'approve' | 'reject' | 'revision',
  reason?: string,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const statusMap = {
    approve: 'approved',
    reject: 'rejected',
    revision: 'revision_requested',
  } as const;

  if (await tableAvailable(service, 'mi_music_submissions')) {
    const { data, error } = await service
      .from('mi_music_submissions')
      .update({
        status: statusMap[action],
        rejection_reason: reason ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error('Submission table not available. Apply Phase 3C migration first.');
}

export async function loadPartnerInvites(session: MIPartnerWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return [];

  const { partnerId } = await resolvePartnerContext(session);

  if (await tableAvailable(service, 'mi_partner_invites')) {
    const { data } = await service
      .from('mi_partner_invites')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });
    return data ?? [];
  }

  const { data: profile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();
  return getContextPartnerInvites(profile?.agent_007_context as Record<string, unknown> | null);
}

export async function loadPartnerSettings(session: MIPartnerWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return { notifications_enabled: true, email_digest: 'weekly' };

  const { data: profile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const settings = (profile?.agent_007_context as Record<string, unknown>)?.partner_settings;
  return {
    notifications_enabled: true,
    email_digest: 'weekly',
    ...(typeof settings === 'object' && settings !== null ? settings : {}),
  };
}

export async function savePartnerSettings(
  session: MIPartnerWorkspaceSession,
  settings: Record<string, unknown>,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const ctx = (existingProfile?.agent_007_context as Record<string, unknown>) ?? {};
  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    agent_007_context: { ...ctx, partner_settings: settings },
  });
}

export async function loadPartnerNotifications(session: MIPartnerWorkspaceSession) {
  const dashboard = await loadPartnerDashboard(session);
  return dashboard.notifications;
}
