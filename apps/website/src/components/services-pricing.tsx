'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const services = [
  {
    icon: '🌐',
    title: 'Professional Business Websites',
    description: 'Responsive business websites built around trust, enquiries, conversion, SEO readiness and long-term maintainability.',
    includes: ['Website strategy & structure', 'Responsive implementation', 'SEO-ready foundations', 'Conversion and contact journeys'],
  },
  {
    icon: '📍',
    title: 'Google Business Profile & Local Growth',
    description: 'Setup, optimization and visibility support for eligible businesses with genuine local operations and service coverage.',
    includes: ['Profile setup or optimization', 'Local visibility review', 'Website/location alignment', 'Verification assistance where applicable'],
  },
  {
    icon: '💬',
    title: 'WhatsApp & Workflow Automation',
    description: 'Customer-enquiry and operational workflows designed around how the business actually receives, routes and follows up conversations.',
    includes: ['Workflow discovery', 'Enquiry routing', 'Automation design', 'Operational integration'],
  },
  {
    icon: '🧩',
    title: 'Custom Software & AI Systems',
    description: 'Purpose-built software, AI-assisted workflows and internal tools for problems that are not well served by off-the-shelf products.',
    includes: ['Requirements discovery', 'Architecture & implementation', 'Integration planning', 'Testing & handover'],
  },
  {
    icon: '🎬',
    title: 'Media & Campaign Engineering',
    description: 'Creative and campaign assets connected to a real audience journey, destination and measurable next action.',
    includes: ['Campaign brief', 'Creative system', 'Channel adaptation', 'Destination and measurement planning'],
  },
  {
    icon: '🧠',
    title: 'Research & Intelligence Support',
    description: 'Evidence-led research, comparison and decision-support systems for business questions that require more than a generic answer.',
    includes: ['Source-backed research', 'Red-team review', 'Decision-support structure', 'Evidence classification'],
  },
]

const commercialFlow = [
  { step: '01', title: 'Discuss the need', text: 'Start with the business problem, desired outcome and current workflow.' },
  { step: '02', title: 'Define the scope', text: 'AMD identifies deliverables, dependencies, boundaries and the commercial model.' },
  { step: '03', title: 'Approve the quote', text: 'You review the agreed scope, amount, currency and payment terms before any invoice is issued.' },
  { step: '04', title: 'Invoice & pay', text: 'Deposit, milestone or full-payment instructions are issued against the approved work.' },
]

export function ServicesPricing() {
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
            Services & Commercial Model
          </div>
          <h2 className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            Scope the work before pricing the work.
          </h2>
          <p className="mx-auto mt-4 text-base leading-7 text-yellow-100/60">
            AMD services are shaped around the actual problem, deliverables and operating context.
            Bespoke work is quoted after scope review rather than sold through a generic public package.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="flex h-full flex-col rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.05] to-black p-6"
            >
              <div className="text-3xl">{service.icon}</div>
              <h3 className="mt-4 text-xl font-bold text-yellow-200">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-yellow-100/60">{service.description}</p>

              <ul className="mt-5 space-y-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-yellow-100/65">
                    <span className="mt-1 text-yellow-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] px-4 py-3 text-sm">
                  <span className="text-yellow-100/45">Pricing: </span>
                  <span className="font-bold text-yellow-300">Custom quote after scope review</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-yellow-500/20 bg-black/60 p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Commercial flow</div>
            <h3 className="mt-3 text-3xl font-black text-yellow-200">From enquiry to approved payment</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {commercialFlow.map((item) => (
              <div key={item.step} className="rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.03] p-5">
                <div className="text-xs font-black tracking-[0.18em] text-yellow-500">{item.step}</div>
                <h4 className="mt-3 font-bold text-yellow-200">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-yellow-100/55">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/payment"
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-center font-black text-black"
            >
              Pricing & Payments
            </Link>
            <a
              href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20request%20a%20project%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 px-6 py-3 text-center font-bold text-yellow-200"
            >
              Request a Quote
            </a>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-yellow-100/40">
          Timelines, support periods, warranties, deposits and milestone terms are confirmed in the approved proposal or invoice for the specific engagement.
        </p>
      </div>
    </section>
  )
}
