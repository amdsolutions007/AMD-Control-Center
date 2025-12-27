'use client'

import { motion } from 'framer-motion'

const items = [
  {
    title: 'Ad Tech',
    desc: 'Campaign architecture, tracking, and optimization pipelines.',
  },
  {
    title: 'Media Engineering',
    desc: 'High-performance creatives engineered for attention and conversion.',
  },
  {
    title: 'Automation',
    desc: 'Operational tooling that standardizes execution and reporting.',
  },
  {
    title: 'AI Systems',
    desc: 'Proprietary assistants and internal tools powering growth systems.',
  },
]

export function EcosystemGrid() {
  return (
    <div id="ecosystem" className="grid gap-4 md:grid-cols-2">
      {items.map((it, idx) => (
        <motion.div
          key={it.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: idx * 0.05, ease: 'easeOut' }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-gold-500" />
            <h3 className="text-lg font-semibold">{it.title}</h3>
          </div>
          <p className="mt-3 text-white/70">{it.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}
