import { EcosystemGrid } from '@/components/ecosystem-grid'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'

export default async function HomePage() {
  return (
    <main>
      <Hero
        headline="Illuminating the Digital Dark. Powered by AI."
        subline="Growth Systems built with custom software and media engineering."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">The Ecosystem</h2>
          <p className="mt-2 text-white/70">
            A unified stack: Ad Tech + Media Systems + Automation.
          </p>
        </div>
        <EcosystemGrid />
      </section>

      <Footer />
    </main>
  )
}
