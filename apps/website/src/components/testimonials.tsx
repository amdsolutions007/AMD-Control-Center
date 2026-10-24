'use client'

import { motion } from 'framer-motion'

const standards = [
  {
    icon: '🔎',
    title: 'Evidence before performance claims',
    description: 'Revenue, ROI, ratings, satisfaction, accuracy and time-saved figures are published only when a current source supports the number.',
  },
  {
    icon: '🧾',
    title: 'Client permission before testimonials',
    description: 'Named client stories should be published only when AMD has the right to identify the customer and reproduce the testimonial.',
  },
  {
    icon: '📊',
    title: 'Baseline before improvement',
    description: 'A performance result is meaningful only when the original baseline, measurement period and method are clear.',
  },
  {
    icon: '🔗',
    title: 'Source traceability',
    description: 'Where a public case study is used, the underlying evidence should be retained so the claim can be reviewed later.',
  },
]

const measurableOutcomes = [
  'Qualified enquiries and conversion steps',
  'Response time and workflow completion',
  'Operational time or cost saved',
  'Search visibility and customer discovery',
  'Campaign engagement tied to a real destination',
  'Invoice, payment and fulfilment progress',
]

export function Testimonials() {
  return (
    <section className="border-b border-yellow-500/10 px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
            Performance Evidence
          </div>
          <h2 className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            Measure the result before marketing the result.
          </h2>
          <p className="mx-auto mt-4 text-base leading-7 text-yellow-100/60">
            AMD does not use invented testimonials or unsupported aggregate performance numbers as social proof.
            Results become public proof only when the evidence and publication rights support them.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {standards.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.05] to-black p-6"
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="mt-4 text-xl font-bold text-yellow-200">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-yellow-100/60">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-black/60 p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
            What AMD can measure with the right instrumentation
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {measurableOutcomes.map((item) => (
              <div key={item} className="rounded-xl border border-yellow-500/15 bg-yellow-500/[0.03] p-4 text-sm leading-6 text-yellow-100/65">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-5 text-yellow-100/40">
            This section is a measurement framework, not a claim that AMD has already achieved a specific figure for every project.
          </p>
        </div>
      </div>
    </section>
  )
}
