import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocationLandingPage } from '@/components/location/LocationLandingPage'
import { canonicalOrigin, getLocation, locationSlugs } from '@/lib/location-network'

export const dynamicParams = false

export function generateStaticParams() {
  return locationSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const location = getLocation(slug)
  if (!location) return {}
  const canonical = `${canonicalOrigin}/locations/${location.slug}`
  return {
    title: location.title,
    description: location.description,
    alternates: { canonical },
    openGraph: { title: location.title, description: location.description, url: canonical, type: 'website' },
  }
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const location = getLocation(slug)
  if (!location) notFound()
  return <LocationLandingPage location={location} />
}
