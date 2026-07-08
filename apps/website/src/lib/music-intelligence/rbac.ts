import type { MIAuthRoleSlug } from './auth-roles';

export type MIPermission =
  | 'smartlink:view'
  | 'analytics:view'
  | 'playlist:submit'
  | 'catalog:manage'
  | 'partnership:manage'
  | 'admin:platform';

/** RBAC foundation — role-to-permission map for future protected routes */
export const MI_ROLE_PERMISSIONS: Record<MIAuthRoleSlug, MIPermission[]> = {
  artist: ['smartlink:view', 'playlist:submit', 'analytics:view'],
  'record-label': ['smartlink:view', 'catalog:manage', 'analytics:view', 'partnership:manage'],
  distributor: ['smartlink:view', 'catalog:manage', 'analytics:view'],
  'music-publisher': ['smartlink:view', 'catalog:manage', 'analytics:view'],
  'artist-manager': ['smartlink:view', 'analytics:view', 'playlist:submit'],
  'a-and-r': ['smartlink:view', 'analytics:view', 'playlist:submit'],
  'brand-partner': ['smartlink:view', 'partnership:manage', 'analytics:view'],
  media: ['smartlink:view', 'analytics:view'],
  fan: ['smartlink:view'],
  'enterprise-partner': ['smartlink:view', 'analytics:view', 'partnership:manage', 'catalog:manage'],
};

export const MI_PROTECTED_ROUTE_PREFIXES = [
  '/music-intelligence/onboarding',
  '/music-intelligence/account',
  '/music-intelligence/partner',
] as const;

export function roleHasPermission(role: MIAuthRoleSlug, permission: MIPermission): boolean {
  return MI_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
