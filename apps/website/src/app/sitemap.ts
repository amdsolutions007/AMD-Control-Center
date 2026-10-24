import type { MetadataRoute } from 'next'
import { canonicalOrigin, locationSlugs } from '@/lib/location-network'

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes = [
    '',
    '/about',
    '/portfolio',
    '/media',
    '/links',
    '/client-portal',
    '/music-intelligence',
  ]

  const locationRoutes = locationSlugs.map((slug) => `/locations/${slug}`)
  const routes = [...coreRoutes, ...locationRoutes]

  return routes.map((path) => ({
    url: `${canonicalOrigin}${path || '/'}`,
    changeFrequency: path.startsWith('/locations/') ? 'monthly' : 'weekly',
    priority: path === '' ? 1 : path === '/locations/nigeria' ? 0.9 : 0.7,
  }))
}
