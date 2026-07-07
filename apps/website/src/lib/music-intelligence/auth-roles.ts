export const MI_AUTH_ROLES = [
  { slug: 'artist', label: 'Artist', icon: '🎤', description: 'Creators accessing discovery, playlists and audience growth tools.' },
  { slug: 'record-label', label: 'Record Label', icon: '🏷️', description: 'Labels managing catalog intelligence and roster operations.' },
  { slug: 'distributor', label: 'Distributor', icon: '📦', description: 'Distribution partners monitoring cross-platform performance.' },
  { slug: 'music-publisher', label: 'Music Publisher', icon: '📝', description: 'Publishers overseeing rights, catalog and licensing intelligence.' },
  { slug: 'artist-manager', label: 'Artist Manager', icon: '👔', description: 'Managers coordinating artist portfolios and growth strategy.' },
  { slug: 'a-and-r', label: 'A&R', icon: '🔎', description: 'Talent scouts leveraging AI-powered discovery signals.' },
  { slug: 'brand-partner', label: 'Brand / Commercial Partner', icon: '🤝', description: 'Brands pursuing strategic music and commercial alliances.' },
  { slug: 'media', label: 'Media', icon: '📰', description: 'Press and media professionals accessing editorial intelligence.' },
  { slug: 'fan', label: 'Fan', icon: '❤️', description: 'Music fans discovering curated playlists and artist experiences.' },
  { slug: 'enterprise-partner', label: 'Enterprise Partner', icon: '🏢', description: 'Enterprise organisations deploying music intelligence at scale.' },
] as const;

export type MIAuthRoleSlug = (typeof MI_AUTH_ROLES)[number]['slug'];

export function getRoleBySlug(slug: string | null | undefined) {
  return MI_AUTH_ROLES.find((r) => r.slug === slug) ?? null;
}

export function isValidRoleSlug(slug: string): slug is MIAuthRoleSlug {
  return MI_AUTH_ROLES.some((r) => r.slug === slug);
}
