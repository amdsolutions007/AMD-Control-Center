import type { MIAuthRoleSlug } from './auth-roles';

export interface MIArtistSocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  spotify?: string;
  apple?: string;
  youtube?: string;
  website?: string;
}

/** Extended artist fields stored in mi_user_profiles.agent_007_context.artist_profile */
export interface MIArtistProfileExtension {
  stage_name?: string;
  country?: string;
  city?: string;
  primary_genre?: string;
  secondary_genre?: string;
  mood?: string;
  language?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  social_links?: MIArtistSocialLinks;
}

export interface MIArtistProfilePayload {
  artist_name: string;
  stage_name: string;
  biography: string;
  country: string;
  city: string;
  primary_genre: string;
  secondary_genre?: string;
  mood?: string;
  language?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  social_links?: MIArtistSocialLinks;
}

export interface MIArtistCatalogRow {
  id: string;
  hub_id: string;
  name: string;
  slug: string;
  bio: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  social_links: MIArtistSocialLinks | null;
  genre_tags: string[] | null;
}

export function slugifyArtistName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'artist';
}

export function mergeArtistProfile(
  catalog: Partial<MIArtistCatalogRow> | null,
  extension: MIArtistProfileExtension | null,
  meta: { display_name?: string; role?: MIAuthRoleSlug },
): MIArtistProfilePayload {
  return {
    artist_name: catalog?.name ?? meta.display_name ?? '',
    stage_name: extension?.stage_name ?? catalog?.name ?? meta.display_name ?? '',
    biography: catalog?.bio ?? '',
    country: extension?.country ?? '',
    city: extension?.city ?? '',
    primary_genre: extension?.primary_genre ?? '',
    secondary_genre: extension?.secondary_genre ?? '',
    mood: extension?.mood ?? '',
    language: extension?.language ?? '',
    profile_image_url: catalog?.profile_image_url ?? extension?.profile_image_url ?? '',
    cover_image_url: catalog?.cover_image_url ?? extension?.cover_image_url ?? '',
    social_links: catalog?.social_links ?? extension?.social_links ?? {},
  };
}

export function profileCompletionPercent(profile: MIArtistProfilePayload): number {
  const fields = [
    profile.artist_name,
    profile.stage_name,
    profile.biography,
    profile.country,
    profile.city,
    profile.primary_genre,
    profile.profile_image_url,
  ];
  const filled = fields.filter((f) => Boolean(f?.trim())).length;
  return Math.round((filled / fields.length) * 100);
}
