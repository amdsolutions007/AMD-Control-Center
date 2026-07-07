import type { MIAuthRoleSlug } from './auth-roles';

/** Prepared model for mi_user_profiles — maps to Supabase auth.users + profile row */
export interface MIUserProfile {
  id: string;
  user_id: string;
  email: string;
  role: MIAuthRoleSlug;
  display_name: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface MIUserProfileInit {
  role: MIAuthRoleSlug;
  display_name: string;
  organization?: string;
}

export type MIUserMetadata = {
  role?: MIAuthRoleSlug;
  display_name?: string;
  organization?: string;
  onboarding_complete?: boolean;
};

export function profileFromMetadata(userId: string, email: string, meta: MIUserMetadata): MIUserProfile {
  const now = new Date().toISOString();
  return {
    id: userId,
    user_id: userId,
    email,
    role: meta.role ?? 'fan',
    display_name: meta.display_name ?? email.split('@')[0] ?? 'Member',
    onboarding_complete: Boolean(meta.onboarding_complete),
    created_at: now,
    updated_at: now,
  };
}
