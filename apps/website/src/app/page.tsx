import { AboutSection } from '@/components/about-section'
import { EcosystemGrid } from '@/components/ecosystem-grid'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { PortfolioGrid } from '@/components/portfolio-grid'
import { ServicesPricing } from '@/components/services-pricing'
import { Testimonials } from '@/components/testimonials'

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

      {/* The Architecture - EXISTING: Ecosystem Overview */}
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

      {/* Success Stories - NEW: Client Testimonials & Case Studies */}
      <Testimonials />

      {/* About Section - NEW: AMD Solutions 007 Story */}
      <AboutSection />

      <Footer />
    </main>
  )
}
