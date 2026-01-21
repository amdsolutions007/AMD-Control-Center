import { Hero } from '@/components/hero'
import { Footer } from '@/components/footer'
import { getCityData } from './cityData'
import Link from 'next/link'

export const dynamicParams = true

export default function CityPage({ params }: { params: { city: string } }) {
  const data = getCityData(params.city)

  // Fallback for unknown city: use city name in title/desc
  const title = data?.title || `Top AI Software Company in ${params.city.replace(/-/g, ' ')}`
  const description =
    data?.description ||
    `AMD Solutions 007 builds AI software, automation, and web platforms for ${params.city.replace(/-/g, ' ')}. Get enterprise-grade engineering and faster launches.`
  const cta = data?.cta || 'Book a build session today'

  const headline = `${title} | AMD Solutions 007`
  const subline = `${description}`

  return (
    <main className="min-h-screen bg-[#050A14] text-white">
      <Hero headline={headline} subline={subline} />

      <section className="bg-black/60 py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-6">
          <h1 className="text-3xl font-bold text-yellow-300 md:text-4xl">
            {title}
          </h1>
          <p className="text-lg text-yellow-100/80 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-yellow-200/80">
            <span className="rounded-full border border-yellow-500/40 px-3 py-1">AI Engineering</span>
            <span className="rounded-full border border-yellow-500/40 px-3 py-1">Enterprise Automation</span>
            <span className="rounded-full border border-yellow-500/40 px-3 py-1">Web Development</span>
            <span className="rounded-full border border-yellow-500/40 px-3 py-1">Cloud & Data</span>
          </div>
          <div className="pt-4">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-5 py-3 text-yellow-200 transition hover:border-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-100"
            >
              {cta}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
