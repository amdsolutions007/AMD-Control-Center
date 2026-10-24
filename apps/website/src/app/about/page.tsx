'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const capabilities = [
  {
    icon: '🌐',
    title: 'Business Websites',
    description: 'Modern, responsive websites built around trust, enquiries, conversion and long-term growth.',
  },
  {
    icon: '🤖',
    title: 'AI & Automation',
    description: 'Practical automation and AI systems that reduce repetitive work, improve response time and support better decisions.',
  },
  {
    icon: '📍',
    title: 'Local Growth',
    description: 'Google Business Profile, local visibility and service-area growth systems for businesses that need to be found and trusted.',
  },
  {
    icon: '🧩',
    title: 'Custom Software',
    description: 'Purpose-built internal tools, portals, workflows and integrations for business problems that off-the-shelf software does not solve well.',
  },
]

const principles = [
  {
    title: 'Evidence before claims',
    description: 'We prefer measurable, supportable statements over inflated numbers or marketing superlatives.',
  },
  {
    title: 'Solve the business problem first',
    description: 'Technology is selected around the customer journey, workflow or operational problem—not added simply because it is fashionable.',
  },
  {
    title: 'Build for real operating conditions',
    description: 'Our systems are shaped by how Nigerian and African businesses actually sell, communicate, collect payment and serve customers.',
  },
  {
    title: 'Work smartly. Spend wisely.',
    description: 'We aim for focused implementation, reusable systems and sensible cost control rather than unnecessary complexity.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020305] text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(234,179,8,0.14),transparent_38%)]" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-4 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              About AMD Solutions 007
            </div>
            <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Illuminating the Digital Dark
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-yellow-100/70 sm:text-lg">
              AMD Solutions 007 is the public technology brand of AMD Ascend Solutions. We design websites,
              automation, local-growth systems and custom software that help businesses improve visibility,
              customer response and operations.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Who we are</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200">Technology built around real business outcomes</h2>
            <p className="mt-5 text-sm leading-7 text-yellow-100/65 sm:text-base">
              We combine software engineering, automation, digital growth and media capability in one operating
              layer. The goal is not to sell isolated tools. The goal is to connect discovery, enquiry, customer
              communication, fulfilment and repeat business into systems that make sense for the client.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/25 bg-black/70 p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Where we operate</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200">Based in Lagos. Serving clients remotely.</h2>
            <p className="mt-5 text-sm leading-7 text-yellow-100/65 sm:text-base">
              AMD operates from Ibeju-Lekki, Lagos State, Nigeria. Our wider Nigeria location network represents
              remote service coverage and market-specific growth intelligence; it does not represent physical AMD
              branches or offices in those states.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-yellow-500/10 bg-black/40 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">What we build</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">Focused digital systems for growth and operations</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-black p-6"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-yellow-300">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-yellow-100/65">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">How we work</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">Principles that guide the work</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {principles.map((item) => (
              <div key={item.title} className="rounded-2xl border border-yellow-500/20 bg-black/70 p-6">
                <h3 className="text-lg font-bold text-yellow-300">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-yellow-100/65">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050A14] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.28)] md:h-40 md:w-40">
              <img src="/founder.jpg" alt="Olawale Shoyemi, Founder and CEO of AMD Solutions 007" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Founder</div>
              <h2 className="mt-2 text-3xl font-black text-yellow-200">Olawale Shoyemi</h2>
              <p className="mt-1 font-semibold text-yellow-400">Founder & CEO</p>
              <p className="mt-4 text-sm leading-7 text-yellow-100/65 sm:text-base">
                AMD Solutions 007 was built around a practical idea: businesses should not have to choose between
                technology, visibility and customer growth. The company brings those disciplines together so clients
                can move from a problem or opportunity to a working digital system with clear ownership and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 text-center sm:p-10">
          <h2 className="text-3xl font-black text-yellow-200">Ready to discuss a business problem?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            Start with the problem, goal and current process. We will help determine whether the right next step is a
            website, automation, local-growth system, custom software or a combination.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20a%20business%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 font-black text-black"
            >
              Discuss a Project
            </a>
            <Link
              href="/payment"
              className="rounded-2xl border border-yellow-500/35 bg-yellow-500/5 px-6 py-4 font-bold text-yellow-200"
            >
              Pricing & Payments
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
