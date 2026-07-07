import { createMIAuthServerClient } from '@/lib/supabase/mi-server';
import { isValidRoleSlug, type MIAuthRoleSlug } from './auth-roles';
import { roleHasPermission } from './rbac';

export interface MIWorkspaceSession {
  userId: string;
  email: string;
  role: MIAuthRoleSlug;
  displayName: string;
  onboardingComplete: boolean;
  artistId: string | null;
}

export async function getWorkspaceSession(): Promise<MIWorkspaceSession | null> {
  const supabase = await createMIAuthServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const role = meta.role && isValidRoleSlug(meta.role) ? meta.role : 'fan';

  return {
    userId: user.id,
    email: user.email ?? '',
    role,
    displayName: meta.display_name ?? user.email?.split('@')[0] ?? 'Member',
    onboardingComplete: Boolean(meta.onboarding_complete),
    artistId: typeof meta.artist_id === 'string' ? meta.artist_id : null,
  };
}

export async function requireArtistWorkspaceSession(): Promise<
  { session: MIWorkspaceSession } | { error: string; status: number }
> {
  const session = await getWorkspaceSession();
  if (!session) return { error: 'Authentication required.', status: 401 };
  if (session.role !== 'artist') return { error: 'Artist workspace access only.', status: 403 };
  if (!roleHasPermission(session.role, 'playlist:submit')) {
    return { error: 'Insufficient permissions.', status: 403 };
  }
  if (!session.onboardingComplete) {
    return { error: 'Complete profile setup first.', status: 403 };
  }
  return { session };
}
