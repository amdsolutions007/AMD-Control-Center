'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#050A14] via-black to-[#050A14] px-6 pb-20 pt-32">
        {/* Animated background particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.03)_0%,transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="mb-4 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-6 py-2 text-sm font-semibold text-yellow-400 backdrop-blur-sm">
              About AMD Solutions 007
            </div>
            <h1 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] md:text-7xl">
              Illuminating the Digital Dark
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-yellow-100/70 md:text-2xl">
              We believe business problems are just <span className="font-semibold text-yellow-300">lack of data</span>. We use AI and custom software engineering to solve them with <span className="font-semibold text-yellow-300">military-grade intelligence</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="relative overflow-hidden bg-black px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-12 text-center text-4xl font-bold text-yellow-400 md:text-5xl">
              The Manifesto
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left: The Problem */}
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-8 backdrop-blur-sm">
                <div className="mb-4 text-5xl">🌑</div>
                <h3 className="mb-4 text-2xl font-bold text-yellow-300">The Digital Dark</h3>
                <p className="leading-relaxed text-yellow-100/70">
                  In today's business landscape, companies drown in data but starve for insights. They operate in darkness, making decisions without the intelligence needed to navigate competitive markets. Traditional agencies offer cookie-cutter solutions that don't address the core problem: <span className="font-semibold text-yellow-300">the absence of customized, intelligent systems</span>.
                </p>
              </div>

              {/* Right: The Solution */}
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-8 backdrop-blur-sm">
                <div className="mb-4 text-5xl">💡</div>
                <h3 className="mb-4 text-2xl font-bold text-yellow-300">Our Illumination</h3>
                <p className="leading-relaxed text-yellow-100/70">
                  We are <span className="font-semibold text-yellow-300">developers first</span>, not just marketers. We build proprietary AI tools that turn your data into actionable intelligence. Our hybrid approach combines <span className="font-semibold text-yellow-300">Custom Software Engineering</span> (Python/AI) with <span className="font-semibold text-yellow-300">Creative Media</span> (Video/Ads) to create growth systems that actually work.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black to-[#050A14] px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              The Solutions 007 Philosophy
            </h2>
            <div className="mb-8 text-6xl">🎯</div>
            <blockquote className="mb-8 border-l-4 border-yellow-500 bg-yellow-500/5 p-6 text-2xl font-light italic leading-relaxed text-yellow-200 backdrop-blur-sm md:text-3xl">
              "Working Smartly. Solutions to Every Dark Cloud."
            </blockquote>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-yellow-100/70">
              We don't believe in working harder—we believe in working <span className="font-semibold text-yellow-300">smarter</span>. Every challenge is an opportunity for innovation. Every "dark cloud" in your business has a solution waiting to be engineered. Our mission is to illuminate your path with <span className="font-semibold text-yellow-300">elite precision</span> and <span className="font-semibold text-yellow-300">military-grade intelligence</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="relative overflow-hidden bg-[#050A14] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent p-12 backdrop-blur-md"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 h-40 w-40">
                <img 
                  src="/founder.jpg" 
                  alt="Olawale Shoyemi - Founder" 
                  className="h-full w-full rounded-full border-4 border-[#D4AF37] object-cover shadow-[0_0_40px_rgba(212,175,55,0.4),0_0_80px_rgba(212,175,55,0.2)]"
                />
              </div>
              <h3 className="mb-2 text-3xl font-bold text-yellow-300">Olawale Shoyemi</h3>
              <p className="text-xl text-yellow-400">Founder • Solutions 007</p>
            </div>
            <p className="mb-6 text-center text-lg leading-relaxed text-yellow-100/70">
              A software engineer and data scientist who saw the gap between traditional marketing agencies and what businesses truly need: <span className="font-semibold text-yellow-300">intelligent, automated growth systems</span>. Olawale founded AMD Solutions 007 with a mission to combine the precision of software engineering with the creativity of media production, creating a new category of business intelligence.
            </p>
            <div className="text-center">
              <a
                href="https://wa.me/2348180021007"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-6 py-3 font-semibold text-yellow-400 transition-all hover:border-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
              >
                <span>📱</span>
                <span>Connect on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technology Arsenal */}
      <section className="relative overflow-hidden bg-black px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-16 text-center">
              <h2 className="mb-4 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Our Technology Arsenal
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-yellow-100/60">
                Proprietary AI tools engineered to solve specific business challenges
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* SkyCap AI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10">
                  <div className="mb-4 text-5xl">📊</div>
                  <h3 className="mb-3 text-2xl font-bold text-yellow-300">SkyCap AI</h3>
                  <p className="mb-4 text-sm font-semibold text-yellow-500/80">Financial Market Intelligence</p>
                  <p className="leading-relaxed text-yellow-100/70">
                    Advanced AI system for analyzing financial markets, tracking trends, and generating actionable investment intelligence. Built for traders and investment firms who need real-time data interpretation.
                  </p>
                </div>
              </motion.div>

              {/* Shine AI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10">
                  <div className="mb-4 text-5xl">🎵</div>
                  <h3 className="mb-3 text-2xl font-bold text-yellow-300">Shine AI</h3>
                  <p className="mb-4 text-sm font-semibold text-yellow-500/80">Music & Entertainment Analytics</p>
                  <p className="leading-relaxed text-yellow-100/70">
                    Specialized platform for artists, labels, and entertainment brands. Analyzes streaming data, audience behavior, and campaign performance to maximize reach and revenue in the music industry.
                  </p>
                </div>
              </motion.div>

              {/* NaijaBiz Assist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10">
                  <div className="mb-4 text-5xl">🚀</div>
                  <h3 className="mb-3 text-2xl font-bold text-yellow-300">NaijaBiz Assist</h3>
                  <p className="mb-4 text-sm font-semibold text-yellow-500/80">Local Business Scaling Engine</p>
                  <p className="leading-relaxed text-yellow-100/70">
                    AI-powered growth assistant designed for Nigerian SMEs. Provides market insights, competitor analysis, and automated marketing strategies tailored to the African business landscape.
                  </p>
                </div>
              </motion.div>

              {/* Japa Readiness Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10">
                  <div className="mb-4 text-5xl">✈️</div>
                  <h3 className="mb-3 text-2xl font-bold text-yellow-300">Japa Readiness Calculator</h3>
                  <p className="mb-4 text-sm font-semibold text-yellow-500/80">Migration Analytics Platform</p>
                  <p className="leading-relaxed text-yellow-100/70">
                    Comprehensive assessment tool for professionals planning international relocation. Analyzes financial readiness, skill marketability, and visa eligibility using AI-driven data models.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#050A14] to-black px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1)_0%,transparent_50%)]" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Ready to Illuminate Your Business?
            </h2>
            <p className="mb-10 text-xl text-yellow-100/70">
              Book a strategy session to discover how our AI-powered solutions can transform your growth trajectory.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.a
                href="https://wa.me/2348180021007"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-r from-yellow-600/30 to-yellow-500/30 px-8 py-4 text-lg font-bold tracking-wide text-yellow-300 backdrop-blur-md transition-all duration-500 hover:border-yellow-400 hover:from-yellow-600/40 hover:to-yellow-500/40 hover:text-yellow-200 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]"
              >
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                <span className="relative z-10">📱 Book Strategy Session</span>
              </motion.a>

              <Link
                href="/#ecosystem"
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 px-8 py-4 text-lg font-semibold text-yellow-400 backdrop-blur-sm transition-all hover:border-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
              >
                Explore Our Ecosystem
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
