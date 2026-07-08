import type { MIPartnerCategorySlug, MIVerificationStatus } from './partner-constants';
import type { MIAuthRoleSlug } from './auth-roles';

export interface MIPartnerSocialLinks {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

export interface MIPartnerProfileExtension {
  company_name?: string;
  partner_category?: MIPartnerCategorySlug;
  logo_url?: string;
  country?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: MIPartnerSocialLinks;
  verification_status?: MIVerificationStatus;
}

export interface MIPartnerProfilePayload {
  company_name: string;
  partner_category: MIPartnerCategorySlug;
  logo_url?: string;
  country: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  social_links?: MIPartnerSocialLinks;
}

export interface MIPartnerProfileRow {
  id: string;
  hub_id: string;
  owner_user_id: string;
  company_name: string;
  partner_category: string;
  logo_url: string | null;
  country: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: MIPartnerSocialLinks | null;
  verification_status: MIVerificationStatus;
}

export function mergePartnerProfile(
  row: Partial<MIPartnerProfileRow> | null,
  extension: MIPartnerProfileExtension | null,
  meta: { organization?: string; role?: MIAuthRoleSlug; email?: string },
): MIPartnerProfilePayload {
  return {
    company_name: row?.company_name ?? extension?.company_name ?? meta.organization ?? '',
    partner_category: (row?.partner_category ?? extension?.partner_category ?? 'enterprise-partner') as MIPartnerCategorySlug,
    logo_url: row?.logo_url ?? extension?.logo_url ?? '',
    country: row?.country ?? extension?.country ?? '',
    website: row?.website ?? extension?.website ?? '',
    contact_email: row?.contact_email ?? extension?.contact_email ?? meta.email ?? '',
    contact_phone: row?.contact_phone ?? extension?.contact_phone ?? '',
    social_links: row?.social_links ?? extension?.social_links ?? {},
  };
}

export function profileCompletionPercent(profile: MIPartnerProfilePayload): number {
  const fields = [
    profile.company_name,
    profile.partner_category,
    profile.country,
    profile.contact_email,
    profile.website || profile.social_links?.website,
  ];
  const filled = fields.filter((f) => Boolean(f?.trim())).length;
  return Math.round((filled / fields.length) * 100);
}
