'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const items = [
  {
    title: 'Web & Local Growth',
    desc: 'Business websites, location architecture, Google visibility and SEO systems that help customers find, trust and contact a business.',
    icon: '🌍',
    href: '/locations/nigeria',
    stage: 'DISCOVER',
  },
  {
    title: 'Intelligence & AI',
    desc: 'Research, decision support and AI-assisted systems that turn scattered information into clearer business action.',
    icon: '🧠',
    href: '/intelligence',
    stage: 'UNDERSTAND',
  },
  {
    title: 'Automation & Operations',
    desc: 'WhatsApp, workflow and custom-software systems designed to reduce repetitive work and move enquiries through a defined process.',
    icon: '⚙️',
    href: '/payment',
    stage: 'OPERATE',
  },
  {
    title: 'Media & Campaign Systems',
    desc: 'Creative, campaign and media engineering that connects attention with a measurable customer journey rather than isolated content.',
    icon: '🎬',
    href: '/media',
    stage: 'ATTRACT',
  },
  {
    title: 'Portfolio & Product Proof',
    desc: 'A growing body of software, experiments and production systems showing how AMD approaches real technical and market problems.',
    icon: '🧩',
    href: '/portfolio',
    stage: 'EVALUATE',
  },
  {
    title: 'Client Delivery & Billing',
    desc: 'Authenticated client access, approved quotes, invoices and project-facing workflows that keep delivery tied to the right customer.',
    icon: '🔐',
    href: '/client-portal',
    stage: 'DELIVER',
  },
]

export function EcosystemGrid() {
  return (
    <div id="ecosystem" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: index * 0.05 }}
        >
          <Link
            href={item.href}
            className="group flex h-full flex-col rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] via-black/70 to-black p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/45 hover:shadow-[0_16px_40px_rgba(234,179,8,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-2xl">
                {item.icon}
              </div>
              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-yellow-400/80">
                {item.stage}
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-yellow-200 transition-colors group-hover:text-yellow-300">
              {item.title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-6 text-yellow-100/65">
              {item.desc}
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-yellow-400">
              Explore
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
