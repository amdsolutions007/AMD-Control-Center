import type { MIAuthRoleSlug } from './auth-roles';

/** Partner organization categories — maps to supported industry types */
export const MI_PARTNER_CATEGORIES = [
  { slug: 'record-label', label: 'Record Label' },
  { slug: 'distributor', label: 'Music Distributor' },
  { slug: 'music-publisher', label: 'Music Publisher' },
  { slug: 'artist-manager', label: 'Artist Management Company' },
  { slug: 'playlist-curator', label: 'Playlist Curator' },
  { slug: 'radio-station', label: 'Radio Station' },
  { slug: 'media-house', label: 'Media House' },
  { slug: 'promoter', label: 'Promoter' },
  { slug: 'event-organizer', label: 'Event Organizer' },
  { slug: 'enterprise-partner', label: 'Enterprise Partner' },
] as const;

export type MIPartnerCategorySlug = (typeof MI_PARTNER_CATEGORIES)[number]['slug'];

/** RBAC roles that access the Partner Command Center */
export const PARTNER_WORKSPACE_ROLES: MIAuthRoleSlug[] = [
  'record-label',
  'distributor',
  'music-publisher',
  'artist-manager',
  'a-and-r',
  'brand-partner',
  'media',
  'enterprise-partner',
];

export function isPartnerWorkspaceRole(role: MIAuthRoleSlug): boolean {
  return PARTNER_WORKSPACE_ROLES.includes(role);
}

export function getPostOnboardingPath(role: MIAuthRoleSlug): string {
  if (role === 'artist') return '/music-intelligence/account';
  if (isPartnerWorkspaceRole(role)) return '/music-intelligence/partner';
  return '/music-intelligence/onboarding?complete=1';
}

export function defaultPartnerCategory(role: MIAuthRoleSlug): MIPartnerCategorySlug {
  const map: Partial<Record<MIAuthRoleSlug, MIPartnerCategorySlug>> = {
    'record-label': 'record-label',
    distributor: 'distributor',
    'music-publisher': 'music-publisher',
    'artist-manager': 'artist-manager',
    'a-and-r': 'playlist-curator',
    'brand-partner': 'promoter',
    media: 'media-house',
    'enterprise-partner': 'enterprise-partner',
  };
  return map[role] ?? 'enterprise-partner';
}

export const MI_VERIFICATION_STATUSES = ['pending', 'in_review', 'verified', 'rejected'] as const;
export type MIVerificationStatus = (typeof MI_VERIFICATION_STATUSES)[number];
