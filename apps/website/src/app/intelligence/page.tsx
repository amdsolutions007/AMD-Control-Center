'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const capabilities = [
  {
    icon: '🔎',
    title: 'Research & Evidence Intelligence',
    status: 'CURRENT CAPABILITY',
    description:
      'Source-backed research, comparison, red-team review and evidence classification for decisions that should not rely on assumptions alone.',
  },
  {
    icon: '📈',
    title: 'Growth & Customer Intelligence',
    status: 'CURRENT CAPABILITY',
    description:
      'Customer-journey, conversion, local-growth and operational analysis designed to show where demand is coming from and where opportunities are being lost.',
  },
  {
    icon: '🧭',
    title: 'Decision Support Systems',
    status: 'CURRENT CAPABILITY',
    description:
      'Structured dashboards, workflows and AI-assisted decision layers that turn scattered business information into clearer next actions.',
  },
  {
    icon: '🎵',
    title: 'Label & Artist Intelligence',
    status: 'GOVERNED PRODUCT PROGRAM',
    description:
      'SHINE AI is being developed as a label and artist intelligence system for bringing campaign, audience and music-performance evidence into a more usable operating view.',
  },
  {
    icon: '🏪',
    title: 'SME Growth Intelligence',
    status: 'PRODUCT DIRECTION',
    description:
      'A customer-first operating layer for African SMEs, connecting enquiries, customers, orders, payments, fulfilment and repeat-business intelligence.',
  },
  {
    icon: '🧪',
    title: 'Experimental Intelligence Tools',
    status: 'R&D',
    description:
      'AMD also explores specialist prototypes and internal tools. Experimental work is not presented as a production product until it is independently validated.',
  },
]

const principles = [
  'Evidence is labelled: verified, strongly supported, inferred, unverified or conflicting.',
  'Predictions are not presented as certainty.',
  'Internal prototypes are not automatically marketed as live customer products.',
  'Customer data and permissions must remain bounded to the approved use case.',
  'High-impact decisions should retain source traceability and human review.',
  'Performance claims require measured evidence before publication.',
]

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-[#020305] text-white">
      <section className="relative overflow-hidden border-b border-yellow-500/10 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(234,179,8,0.14),transparent_38%)]" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-4 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              AMD Intelligence
            </div>
            <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Better decisions need better evidence.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-yellow-100/70 sm:text-lg">
              AMD combines research, data, software and AI-assisted reasoning to help businesses understand what is happening,
              what the evidence supports and what action should come next.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Capability map</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">
              Intelligence that supports an operating decision
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-yellow-100/60 sm:text-base">
              We distinguish current capability from product development and R&D so clients can see what is operational,
              what is evolving and what should not yet be treated as a finished product.
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
                <div className="flex items-start justify-between gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-yellow-400/80">
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-yellow-300">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-yellow-100/65">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-yellow-500/10 bg-black/45 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/20 bg-black/70 p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">How AMD treats intelligence</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200">Decision support, not artificial certainty</h2>
            <p className="mt-5 text-sm leading-7 text-yellow-100/65 sm:text-base">
              AI can accelerate research, analysis and pattern recognition, but it does not remove uncertainty.
              AMD intelligence work is designed to preserve evidence, identify conflicts and keep human judgement in the loop
              where the decision carries meaningful business risk.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-black p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Operating principles</div>
            <ul className="mt-5 space-y-3">
              {principles.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-yellow-100/65">
                  <span className="mt-1 text-yellow-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 text-center sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Use intelligence where it matters</div>
          <h2 className="mt-3 text-3xl font-black text-yellow-200">Start with the decision you need to make.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            Tell us what you are trying to understand, compare, monitor or improve. We will determine whether the right answer is
            research, a dashboard, an AI-assisted workflow, a custom data system or a simpler operational fix.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20an%20intelligence%20or%20decision-support%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 font-black text-black"
            >
              Discuss an Intelligence Project
            </a>
            <Link
              href="/portfolio"
              className="rounded-2xl border border-yellow-500/35 bg-yellow-500/5 px-6 py-4 font-bold text-yellow-200"
            >
              Explore Portfolio
            </Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-yellow-100/40">
            No public accuracy, revenue or prediction claim is treated as verified unless supporting evidence exists.
          </p>
        </div>
      </section>
    </main>
  )
}
