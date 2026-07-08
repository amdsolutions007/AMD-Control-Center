import { createMIAuthServerClient } from '@/lib/supabase/mi-server';
import { isValidRoleSlug, type MIAuthRoleSlug } from './auth-roles';
import { roleHasPermission } from './rbac';
import { isPartnerWorkspaceRole } from './partner-constants';

export interface MIPartnerWorkspaceSession {
  userId: string;
  email: string;
  role: MIAuthRoleSlug;
  displayName: string;
  organization: string;
  onboardingComplete: boolean;
  partnerId: string | null;
  hubId: string | null;
}

export async function getPartnerWorkspaceSession(): Promise<MIPartnerWorkspaceSession | null> {
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
    displayName: meta.display_name ?? user.email?.split('@')[0] ?? 'Partner',
    organization: meta.organization ?? '',
    onboardingComplete: Boolean(meta.onboarding_complete),
    partnerId: typeof meta.partner_id === 'string' ? meta.partner_id : null,
    hubId: typeof meta.partner_hub_id === 'string' ? meta.partner_hub_id : null,
  };
}

export async function requirePartnerWorkspaceSession(): Promise<
  { session: MIPartnerWorkspaceSession } | { error: string; status: number }
> {
  const session = await getPartnerWorkspaceSession();
  if (!session) return { error: 'Authentication required.', status: 401 };
  if (!isPartnerWorkspaceRole(session.role)) {
    return { error: 'Partner workspace access only.', status: 403 };
  }
  const canAccess =
    roleHasPermission(session.role, 'partnership:manage') ||
    roleHasPermission(session.role, 'catalog:manage') ||
    roleHasPermission(session.role, 'analytics:view');
  if (!canAccess) return { error: 'Insufficient permissions.', status: 403 };
  if (!session.onboardingComplete) {
    return { error: 'Complete organization setup first.', status: 403 };
  }
  return { session };
}
