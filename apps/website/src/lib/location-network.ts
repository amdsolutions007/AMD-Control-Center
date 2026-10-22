import baseData from '@/data/location-base.json'
import governanceData from '@/data/location-governance.json'
import wave3Data from '@/data/location-wave-3.json'
import wave4Data from '@/data/location-wave-4.json'

export type LocationFaq = { question: string; answer: string }
export type LocationRecord = {
  slug: string
  displayName: string
  title: string
  description: string
  h1: string
  summary: string
  market: string[]
  centres: string[]
  services: string[]
  journey: string[]
  faq: LocationFaq[]
  evidence: string[]
}

export type LocationGovernance = {
  relatedLocations: string[]
  evidenceReviewedAt: string
  contentOwner: string
  demandConfidence: string
  lastValidatedAt: string
}

const governance = governanceData as Record<string, LocationGovernance>
const records: LocationRecord[] = [
  ...(baseData as LocationRecord[]),
  ...(wave3Data as LocationRecord[]),
  ...(wave4Data as LocationRecord[]),
]

export const locationRecords = records.map((record) => ({
  ...record,
  governance: governance[record.slug],
}))

export type GovernedLocation = (typeof locationRecords)[number]

export const locationBySlug = new Map(locationRecords.map((record) => [record.slug, record]))

export function getLocation(slug: string) {
  return locationBySlug.get(slug)
}

export function getLocationDisplayName(slug: string) {
  return locationBySlug.get(slug)?.displayName ?? slug
}

export const locationSlugs = locationRecords.map((record) => record.slug)
export const wave4Slugs = ['nasarawa', 'ondo', 'cross-river', 'imo', 'osun'] as const
export const canonicalWhatsApp = 'https://wa.me/2348180021007'
export const canonicalTelephone = '+2348180021007'
export const canonicalOrigin = 'https://www.amdsolutions007.com'
