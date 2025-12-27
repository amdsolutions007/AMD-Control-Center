'use client'

import { motion } from 'framer-motion'

export function Hero({
  headline,
  subline,
}: {
  headline: string
  subline: string
}) {
  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-ink-950">
      {/* Video background (add public/hero.mp4). */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/85 to-ink-950" />

      {/* Subtle code-stream accents */}
      <div className="code-stream" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-6 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.22em] text-white/70">
            EXECUTIVE DARK MODE
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            AI-FIRST SYSTEMS
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {headline}
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70">{subline}</p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a
              href="#ecosystem"
              className="rounded-md bg-gold-500 px-5 py-3 text-sm font-semibold text-ink-950 hover:brightness-95"
            >
              Explore Ecosystem
            </a>
            <a
              href="/intelligence"
              className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              View Intelligence
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="pointer-events-none absolute -right-40 top-24 hidden h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-3xl md:block"
        />
      </div>
    </section>
  )
}
