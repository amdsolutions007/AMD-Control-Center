import 'server-only'

import fs from 'node:fs/promises'
import path from 'node:path'

export type SocialLinks = {
  empire_identity?: {
    name?: string
    legal_name?: string
    ceo?: string
    slogan?: string
  }
  contact_channels?: {
    official_email?: string
    official_phone?: string
    website?: string
  }
  operational_tools?: Record<string, string>
  social_grid?: Record<string, string>
  dashboard_settings?: Record<string, boolean>
}

export type BillingProfile = {
  billing_identity?: {
    entity_name?: string
    status?: string
    currency?: string
  }
  us_billing_address?: {
    street_1?: string
    street_2?: string
    city?: string
    state?: string
    state_code?: string
    zip_code?: string
    country?: string
    phone_prefix?: string
  }
  payment_methods?: Record<string, unknown>
}

function repoRoot(): string {
  // apps/website -> repo root is ../../
  return path.resolve(process.cwd(), '..', '..')
}

async function readJson<T>(absPath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(absPath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const abs = path.join(repoRoot(), 'config', 'social_links.json')
  return (await readJson<SocialLinks>(abs)) ?? {}
}

export async function getBillingProfile(): Promise<BillingProfile> {
  const abs = path.join(repoRoot(), 'config', 'billing_profile.json')
  return (await readJson<BillingProfile>(abs)) ?? {}
}

export function formatUsBillingAddress(billing: BillingProfile): string {
  const a = billing.us_billing_address ?? {}
  const line1 = [a.street_1, a.street_2].filter(Boolean).join(', ')
  const line2 = [a.city, a.state_code, a.zip_code].filter(Boolean).join(' ')
  const line3 = a.country ?? ''
  return [line1, line2, line3].filter(Boolean).join('\n').trim()
}
