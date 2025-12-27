import { EcosystemGrid } from '@/components/ecosystem-grid'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'

export default async function HomePage() {
  return (
    <main>
      <Hero
        headline="Illuminating the Digital Dark."
        subline="Growth systems architected with custom software and media engineering."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] md:text-5xl">
            THE ARCHITECTURE
          </h2>
          <p className="text-lg text-yellow-100/60 md:text-xl">
            A unified stack: Ad Tech + Media Systems + Automation.
          </p>
        </div>
        <EcosystemGrid />
      </section>

      <Footer />
    </main>
  )
}
