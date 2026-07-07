import { MI_DEFAULT_HUB_ID } from './constants';
import {
  mergeArtistProfile,
  profileCompletionPercent,
  slugifyArtistName,
  type MIArtistProfileExtension,
  type MIArtistProfilePayload,
} from './artist-profile';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIWorkspaceSession } from './workspace-auth';
import {
  appendContextSubmission,
  getContextSubmissions,
  tableAvailable,
} from './workspace-fallback';

export interface WorkspaceDashboardData {
  welcomeName: string;
  profileCompletion: number;
  profileStatus: 'incomplete' | 'complete';
  submissionCount: number;
  pendingCount: number;
  recentSubmissions: Array<{
    id: string;
    song_title: string;
    status: string;
    created_at: string;
  }>;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' }>;
}

export async function loadArtistProfile(session: MIWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return null;

  const { data: userProfile } = await service
    .from('mi_user_profiles')
    .select('display_name, avatar_url, agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  let catalog = null;
  const ctxRaw = (userProfile?.agent_007_context ?? {}) as {
    artist_profile?: MIArtistProfileExtension;
    artist_id?: string;
  };
  const linkedArtistId = session.artistId ?? ctxRaw.artist_id ?? null;

  if (linkedArtistId) {
    const { data } = await service
      .from('mi_artists')
      .select('id, hub_id, name, slug, bio, profile_image_url, cover_image_url, social_links, genre_tags')
      .eq('id', linkedArtistId)
      .maybeSingle();
    catalog = data;
  } else if (await tableAvailable(service, 'mi_artist_members')) {
    const { data: membership } = await service
      .from('mi_artist_members')
      .select('artist_id')
      .eq('user_id', session.userId)
      .limit(1)
      .maybeSingle();
    if (membership?.artist_id) {
      const { data } = await service
        .from('mi_artists')
        .select('id, hub_id, name, slug, bio, profile_image_url, cover_image_url, social_links, genre_tags')
        .eq('id', membership.artist_id)
        .maybeSingle();
      catalog = data;
    }
  }

  const ctx = ctxRaw;
  const profile = mergeArtistProfile(catalog, ctx.artist_profile ?? null, {
    display_name: userProfile?.display_name ?? session.displayName,
    role: session.role,
  });

  return { profile, catalog, completion: profileCompletionPercent(profile) };
}

export async function saveArtistProfile(
  session: MIWorkspaceSession,
  payload: MIArtistProfilePayload,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const extension: MIArtistProfileExtension = {
    stage_name: payload.stage_name,
    country: payload.country,
    city: payload.city,
    primary_genre: payload.primary_genre,
    secondary_genre: payload.secondary_genre,
    mood: payload.mood,
    language: payload.language,
    profile_image_url: payload.profile_image_url,
    cover_image_url: payload.cover_image_url,
    social_links: payload.social_links,
  };

  const slug = slugifyArtistName(payload.stage_name || payload.artist_name);
  let artistId = session.artistId;

  if (artistId) {
    await service
      .from('mi_artists')
      .update({
        name: payload.artist_name,
        bio: payload.biography,
        profile_image_url: payload.profile_image_url || null,
        cover_image_url: payload.cover_image_url || null,
        social_links: payload.social_links ?? {},
      })
      .eq('id', artistId);
  } else {
    const { data: created, error: createError } = await service
      .from('mi_artists')
      .insert({
        hub_id: MI_DEFAULT_HUB_ID,
        name: payload.artist_name,
        slug: `${slug}-${session.userId.slice(0, 8)}`,
        bio: payload.biography,
        profile_image_url: payload.profile_image_url || null,
        cover_image_url: payload.cover_image_url || null,
        social_links: payload.social_links ?? {},
        is_active: true,
      })
      .select('id')
      .single();

    if (createError) throw new Error(createError.message);
    artistId = created.id;

    if (await tableAvailable(service, 'mi_artist_members')) {
      await service.from('mi_artist_members').upsert({
        user_id: session.userId,
        artist_id: artistId,
        hub_id: MI_DEFAULT_HUB_ID,
        role: 'artist',
      });
    }
  }

  const { data: existingProfile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();

  const mergedContext = {
    ...((existingProfile?.agent_007_context as Record<string, unknown>) ?? {}),
    artist_profile: extension,
    artist_id: artistId,
  };

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    display_name: payload.stage_name || payload.artist_name,
    avatar_url: payload.profile_image_url || null,
    agent_007_context: mergedContext,
  });

  await service.auth.admin.updateUserById(session.userId, {
    user_metadata: { artist_id: artistId },
  });

  return { artistId, completion: profileCompletionPercent(payload) };
}

export async function loadWorkspaceDashboard(session: MIWorkspaceSession): Promise<WorkspaceDashboardData> {
  const service = createMIServiceClient();
  const profileData = await loadArtistProfile(session);
  const completion = profileData?.completion ?? 0;

  let recentSubmissions: WorkspaceDashboardData['recentSubmissions'] = [];
  let submissionCount = 0;
  let pendingCount = 0;

  if (service) {
    const hasSubmissionTable = await tableAvailable(service, 'mi_music_submissions');
    if (hasSubmissionTable) {
      const { data: submissions } = await service
        .from('mi_music_submissions')
        .select('id, song_title, status, created_at')
        .eq('submitted_by', session.userId)
        .order('created_at', { ascending: false })
        .limit(5);
      recentSubmissions = submissions ?? [];
    } else {
      const { data: profile } = await service
        .from('mi_user_profiles')
        .select('agent_007_context')
        .eq('id', session.userId)
        .maybeSingle();
      recentSubmissions = getContextSubmissions(
        profile?.agent_007_context as Record<string, unknown> | null,
      ).slice(0, 5);
    }
    submissionCount = recentSubmissions.length;
    pendingCount = recentSubmissions.filter((s) => s.status === 'pending_review').length;
  }

  const notifications: WorkspaceDashboardData['notifications'] = [];
  if (completion < 100) {
    notifications.push({
      id: 'profile-incomplete',
      message: 'Complete your artist profile to strengthen submission review.',
      type: 'info',
    });
  }
  if (pendingCount > 0) {
    notifications.push({
      id: 'pending-submissions',
      message: `${pendingCount} submission(s) awaiting review.`,
      type: 'info',
    });
  }

  return {
    welcomeName: profileData?.profile.stage_name || session.displayName,
    profileCompletion: completion,
    profileStatus: completion >= 85 ? 'complete' : 'incomplete',
    submissionCount,
    pendingCount,
    recentSubmissions,
    notifications,
  };
}

export async function listSubmissions(session: MIWorkspaceSession) {
  const service = createMIServiceClient();
  if (!service) return [];

  if (await tableAvailable(service, 'mi_music_submissions')) {
    const { data } = await service
      .from('mi_music_submissions')
      .select('*')
      .eq('submitted_by', session.userId)
      .order('created_at', { ascending: false });
    return data ?? [];
  }

  const { data: profile } = await service
    .from('mi_user_profiles')
    .select('agent_007_context')
    .eq('id', session.userId)
    .maybeSingle();
  return getContextSubmissions(profile?.agent_007_context as Record<string, unknown> | null);
}

export async function createSubmission(
  session: MIWorkspaceSession,
  payload: import('./submissions').MIMusicSubmissionPayload,
) {
  const service = createMIServiceClient();
  if (!service) throw new Error('Database service not configured.');

  const profileData = await loadArtistProfile(session);
  const artistId = profileData?.catalog?.id ?? session.artistId;

  if (await tableAvailable(service, 'mi_music_submissions')) {
    const { data, error } = await service
      .from('mi_music_submissions')
      .insert({
        hub_id: MI_DEFAULT_HUB_ID,
        artist_id: artistId,
        submitted_by: session.userId,
        status: 'pending_review',
        song_title: payload.song_title,
        artist_name: payload.artist_name,
        album: payload.album ?? null,
        genre: payload.genre ?? null,
        mood: payload.mood ?? null,
        bpm: payload.bpm ?? null,
        release_date: payload.release_date ?? null,
        territory: payload.territory ?? 'Global',
        language: payload.language ?? null,
        dsp_links: payload.dsp_links,
        artwork_url: payload.artwork_url ?? null,
        press_kit_url: payload.press_kit_url ?? null,
        biography: payload.biography ?? null,
        audio_upload_ready: false,
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

  const ctx = (existingProfile?.agent_007_context ?? {}) as Record<string, unknown>;
  const nextCtx = appendContextSubmission(ctx, session.userId, payload, artistId);
  const created = nextCtx.submissions?.[0];

  await service.from('mi_user_profiles').upsert({
    id: session.userId,
    agent_007_context: nextCtx,
  });

  return created;
}
