import { AboutSection } from '@/components/about-section'
import { EcosystemGrid } from '@/components/ecosystem-grid'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { PortfolioGrid } from '@/components/portfolio-grid'
import { ServicesPricing } from '@/components/services-pricing'

export default async function HomePage() {
  return (
    <main>
      <Hero
        headline="Illuminating the Digital Dark."
        subline="Growth systems architected with custom software and media engineering."
      />

      {/* Intelligence Portfolio - NEW: All 18 AI/Software Projects */}
      <PortfolioGrid />

      {/* Services & Pricing - NEW: What We Build & Investment */}
      <ServicesPricing />

      {/* AMD Ecosystem: how the customer-facing operating layers connect */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
            AMD Ecosystem
          </div>
          <h2 className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            One connected growth and delivery system
          </h2>
          <p className="mt-4 text-base leading-7 text-yellow-100/60 md:text-lg">
            AMD connects visibility, intelligence, automation, media, client delivery and commercial workflow so each layer supports the next instead of operating as a disconnected tool.
          </p>
        </div>
        <EcosystemGrid />
      </section>

      {/* About Section - NEW: AMD Solutions 007 Story */}
      <AboutSection />

      <Footer />
    </main>
  )
}
