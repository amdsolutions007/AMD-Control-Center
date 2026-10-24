'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const capabilities = [
  {
    icon: '🎬',
    title: 'Campaign Creative',
    description:
      'Creative concepts, launch assets and campaign-ready visual systems designed around a defined audience, offer and call to action.',
  },
  {
    icon: '📱',
    title: 'Short-Form & Social Content',
    description:
      'Vertical video, WhatsApp Status, social cut-downs and platform-ready creative adapted for how customers actually consume content.',
  },
  {
    icon: '🎵',
    title: 'Music & Entertainment Campaign Support',
    description:
      'Creative and campaign support for artists, labels and entertainment projects, with performance claims kept separate from creative production.',
  },
  {
    icon: '🧠',
    title: 'AI-Assisted Production',
    description:
      'AI tools can accelerate ideation, scripting, variation and post-production where appropriate, while human review remains responsible for the final output.',
  },
  {
    icon: '🔗',
    title: 'Conversion-Connected Media',
    description:
      'Media can be connected to landing pages, WhatsApp, smart links, forms and analytics so attention has a clear next step.',
  },
  {
    icon: '🧩',
    title: 'Multi-Asset Delivery',
    description:
      'One campaign direction can be adapted into the formats a project actually needs instead of producing disconnected one-off assets.',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Define the objective',
    text: 'Clarify the audience, offer, platform, desired action and what success should mean before production starts.',
  },
  {
    step: '02',
    title: 'Build the creative system',
    text: 'Develop the concept, script, visual language and asset plan around the real campaign or business goal.',
  },
  {
    step: '03',
    title: 'Produce & adapt',
    text: 'Create the approved assets and adapt them for the required channels, screen sizes and customer journey.',
  },
  {
    step: '04',
    title: 'Connect & learn',
    text: 'Where tracking is available, connect media to the destination and review the evidence before making performance claims.',
  },
]

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-[#020305] text-white">
      <section className="relative overflow-hidden border-b border-yellow-500/10 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(234,179,8,0.14),transparent_38%)]" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-4 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              AMD Media Engineering
            </div>
            <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Media built to move a customer journey forward.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-yellow-100/70 sm:text-lg">
              AMD combines creative direction, short-form production, campaign assets and digital delivery so media is connected to a real business or audience objective—not treated as decoration.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Capabilities</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">Creative production connected to the wider system</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-yellow-100/60 sm:text-base">
              The right media format depends on the audience, platform, campaign and next action. AMD scopes the asset mix around that context instead of forcing every project into the same production package.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-black p-6"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-5 text-xl font-bold text-yellow-300">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-yellow-100/65">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-yellow-500/10 bg-black/45 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Production workflow</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">From attention to action</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {workflow.map((item) => (
              <article key={item.step} className="rounded-2xl border border-yellow-500/20 bg-black/70 p-6">
                <div className="text-xs font-black tracking-[0.2em] text-yellow-500">{item.step}</div>
                <h3 className="mt-3 text-xl font-bold text-yellow-300">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-yellow-100/65">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-black p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Proof & rights</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200">Portfolio evidence stays separate from claims.</h2>
            <p className="mt-5 text-sm leading-7 text-yellow-100/65 sm:text-base">
              Public examples should only show work AMD can legitimately display and should not imply view counts, awards, conversions or client endorsements unless those outcomes are independently supported.
            </p>
            <Link
              href="/portfolio"
              className="mt-6 inline-flex rounded-2xl border border-yellow-500/35 bg-yellow-500/5 px-5 py-3 font-bold text-yellow-200"
            >
              Explore Portfolio →
            </Link>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-black/70 p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Commercial model</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200">Scope first. Quote the actual production.</h2>
            <p className="mt-5 text-sm leading-7 text-yellow-100/65 sm:text-base">
              Media work can vary widely in format, volume, production method, rights and distribution needs. AMD therefore scopes bespoke media before invoicing rather than publishing one fixed checkout price.
            </p>
            <Link
              href="/payment"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 font-black text-black"
            >
              Request a Media Quote →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-yellow-500/10 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 text-center sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Start with the brief</div>
          <h2 className="mt-3 text-3xl font-black text-yellow-200">What should the audience do after they watch?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            Tell us the audience, platform, offer and desired action. We will recommend the production approach and asset mix that fit the campaign instead of forcing a generic package.
          </p>
          <a
            href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20a%20media%20or%20campaign%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 font-black text-black"
          >
            Discuss a Media Project
          </a>
          <p className="mt-5 text-xs leading-5 text-yellow-100/40">
            No public view-count, award, conversion or turnaround claim is treated as verified without supporting evidence.
          </p>
        </div>
      </section>
    </main>
  )
}
