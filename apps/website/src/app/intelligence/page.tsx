'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const intelligenceModules = [
  {
    id: 'skycap',
    name: 'SkyCap AI',
    tagline: 'Financial Market Intelligence.',
    description: 'Predictive modeling for FX and crypto markets using deep-learning sentiment analysis.',
    icon: '📊',
    gradient: 'from-yellow-500/20 via-yellow-600/10 to-transparent',
    glowColor: 'rgba(234, 179, 8, 0.3)',
  },
  {
    id: 'shine',
    name: 'Shine AI',
    tagline: 'Entertainment Analytics.',
    description: 'Algorithmic virality prediction for artists and labels. We know a hit before it drops.',
    icon: '🎵',
    gradient: 'from-yellow-400/20 via-yellow-500/10 to-transparent',
    glowColor: 'rgba(250, 204, 21, 0.3)',
  },
  {
    id: 'naijabiz',
    name: 'NaijaBiz Assist',
    tagline: 'SME Growth Engine.',
    description: 'Automated business logic for scaling Nigerian enterprises in a chaotic economy.',
    icon: '🚀',
    gradient: 'from-yellow-500/20 via-amber-600/10 to-transparent',
    glowColor: 'rgba(234, 179, 8, 0.3)',
  },
  {
    id: 'japa',
    name: 'Japa Readiness Calculator',
    tagline: 'Migration Logic.',
    description: 'Data-driven assessment for relocation success probabilities.',
    icon: '✈️',
    gradient: 'from-yellow-300/20 via-yellow-400/10 to-transparent',
    glowColor: 'rgba(253, 224, 71, 0.3)',
  },
];

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Radial Glow */}
      <div className="fixed left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="relative">
        {/* Hero Section */}
        <section className="border-b border-yellow-500/10 px-6 pb-20 pt-32 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 inline-block"
              >
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300 backdrop-blur-sm">
                  CLASSIFIED TECHNOLOGY
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="mb-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl">
                The Arsenal.
              </h1>

              {/* Subheadline */}
              <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
                Proprietary algorithms deploying{' '}
                <span className="font-semibold text-yellow-300">unfair advantages</span> for our clients.
              </p>

              {/* Decorative Line */}
              <div className="mx-auto mt-12 h-px w-32 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* Intelligence Modules Grid */}
        <section className="px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2">
              {intelligenceModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Card Container */}
                  <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-black to-yellow-950/10 p-8 backdrop-blur-xl transition-all duration-500 hover:border-yellow-500/40">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                    
                    {/* Glow Effect */}
                    <div 
                      className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{ 
                        background: `radial-gradient(circle at center, ${module.glowColor}, transparent 70%)` 
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-4xl backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                          {module.icon}
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                          <span className="text-xs font-mono text-yellow-400/70">ACTIVE</span>
                        </div>
                      </div>

                      {/* Module Name */}
                      <h3 className="mb-2 bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-2xl font-bold text-transparent">
                        {module.name}
                      </h3>

                      {/* Tagline */}
                      <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-yellow-300/80">
                        {module.tagline}
                      </p>

                      {/* Description */}
                      <p className="leading-relaxed text-yellow-100/60">
                        {module.description}
                      </p>

                      {/* Bottom Border Animation */}
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full" />
                    </div>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute -left-px -top-px h-8 w-8 border-l-2 border-t-2 border-yellow-500/40 transition-all duration-500 group-hover:h-12 group-hover:w-12 group-hover:border-yellow-400/60" />
                  <div className="absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-yellow-500/40 transition-all duration-500 group-hover:h-12 group-hover:w-12 group-hover:border-yellow-400/60" />
                </motion.div>
              ))}
            </div>

            {/* Technical Specs Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 gap-4 rounded-xl border border-yellow-500/20 bg-black/60 p-6 backdrop-blur-xl md:grid-cols-4"
            >
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-yellow-300">4</div>
                <div className="text-xs uppercase tracking-wider text-yellow-100/50">Active Systems</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-yellow-300">24/7</div>
                <div className="text-xs uppercase tracking-wider text-yellow-100/50">Deployment</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-yellow-300">∞</div>
                <div className="text-xs uppercase tracking-wider text-yellow-100/50">Data Points</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-yellow-300">99.9%</div>
                <div className="text-xs uppercase tracking-wider text-yellow-100/50">Accuracy</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-yellow-500/10 px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* CTA Headline */}
              <h2 className="mb-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Deploy This Intelligence.
              </h2>

              <p className="mb-10 text-lg text-yellow-100/60">
                Gain access to military-grade algorithms that power billion-dollar decisions.
              </p>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="https://wa.me/2348148419412?text=I%20want%20to%20request%20demo%20access%20to%20AMD%20Intelligence%20Arsenal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 font-semibold text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]"
                >
                  <span className="relative z-10">Request Demo Access</span>
                  <svg 
                    className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300/70 backdrop-blur-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono">ENCRYPTED • NDA REQUIRED</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
