'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const projects = [
  {
    name: 'Address-Intel',
    emoji: '🗺️',
    description: 'Unstructured Nigerian address parsing and geospatial-data tooling.',
    href: 'https://github.com/amdsolutions007/Address-Intel',
  },
  {
    name: 'Bank-Statement-Parser',
    emoji: '🔍',
    description: 'Nigerian bank PDF transaction extraction and parsing.',
    href: 'https://github.com/amdsolutions007/Bank-Statement-Parser',
  },
  {
    name: 'NaijaStack-AI',
    emoji: '🇳🇬',
    description: 'Nigerian SaaS starter-kit repository with local-payment building blocks.',
    href: 'https://github.com/amdsolutions007/NaijaStack-AI',
  },
  {
    name: 'Naija-Prop-Intel',
    emoji: '🏠',
    description: 'Nigerian property-intelligence and analysis tooling.',
    href: 'https://github.com/amdsolutions007/Naija-Prop-Intel',
  },
  {
    name: 'Naija-Voice-AI',
    emoji: '🎙️',
    description: 'AI-assisted Nigerian Pidgin translation project.',
    href: 'https://github.com/amdsolutions007/Naija-Voice-AI',
  },
  {
    name: 'AMD Materiality Engine',
    emoji: '🌱',
    description: 'Enterprise ESG and double-materiality engineering project.',
    href: 'https://github.com/amdsolutions007/amd-materiality-engine',
  },
]

export function PortfolioGrid() {
  return (
    <section className="border-b border-yellow-500/10 px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Engineering portfolio</div>
          <h2 className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            Selected repositories with a visible source trail
          </h2>
          <p className="mx-auto mt-4 text-base leading-7 text-yellow-100/60">
            A small selection of confirmed AMD repositories. Repository presence shows the work exists; it does not imply customer adoption, revenue or production scale.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.05] to-black p-6 transition hover:-translate-y-0.5 hover:border-yellow-500/45"
            >
              <div className="text-3xl">{project.emoji}</div>
              <h3 className="mt-4 text-xl font-bold text-yellow-200">{project.name}</h3>
              <p className="mt-3 text-sm leading-6 text-yellow-100/60">{project.description}</p>
              <div className="mt-5 text-sm font-bold text-yellow-300">View repository ↗</div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/portfolio"
            className="inline-flex rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-3 font-bold text-yellow-200"
          >
            Explore the full AMD portfolio →
          </Link>
        </div>
      </div>
    </section>
  )
}
