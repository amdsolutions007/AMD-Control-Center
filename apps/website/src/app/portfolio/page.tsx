"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Github, ExternalLink } from "lucide-react"

const verifiedRepositories = [
  {
    title: "Address-Intel",
    icon: "🗺️",
    description: "Parser for unstructured Nigerian addresses, designed to turn informal location descriptions into more structured address data.",
    tags: ["Python", "NLP", "Geospatial"],
    href: "https://github.com/amdsolutions007/Address-Intel",
  },
  {
    title: "Bank-Statement-Parser",
    icon: "🔍",
    description: "Bank-statement parsing project for extracting transaction data from Nigerian bank PDF statements.",
    tags: ["Python", "PDF", "Data Extraction"],
    href: "https://github.com/amdsolutions007/Bank-Statement-Parser",
  },
  {
    title: "CBN-Compliance-Copilot",
    icon: "⚖️",
    description: "RegTech project exploring AI-assisted compliance workflows for Nigerian fintech use cases.",
    tags: ["Python", "RegTech", "Compliance"],
    href: "https://github.com/amdsolutions007/CBN-Compliance-Copilot",
  },
  {
    title: "NaijaStack-AI",
    icon: "🇳🇬",
    description: "Nigerian SaaS starter-kit repository combining a modern web stack with local-payment and AI-oriented building blocks.",
    tags: ["Next.js", "Paystack", "AI"],
    href: "https://github.com/amdsolutions007/NaijaStack-AI",
  },
  {
    title: "NaijaLaw-GPT",
    icon: "📚",
    description: "Nigerian legal-assistant project focused on legal research and document-support workflows.",
    tags: ["Python", "Legal AI", "Research"],
    href: "https://github.com/amdsolutions007/NaijaLaw-GPT",
  },
  {
    title: "Naija-Voice-AI",
    icon: "🎙️",
    description: "Nigerian Pidgin translation project using AI-assisted language processing.",
    tags: ["Python", "Language AI", "Pidgin"],
    href: "https://github.com/amdsolutions007/Naija-Voice-AI",
  },
  {
    title: "Naija-Prop-Intel",
    icon: "🏠",
    description: "Nigerian property-intelligence project covering property analysis, risk and investment-support tooling.",
    tags: ["Python", "Property", "Analysis"],
    href: "https://github.com/amdsolutions007/Naija-Prop-Intel",
  },
  {
    title: "Naija-Rent-Estimator",
    icon: "💰",
    description: "Rent-estimation project focused on Lagos apartment pricing and comparative analysis.",
    tags: ["Python", "Data", "Housing"],
    href: "https://github.com/amdsolutions007/Naija-Rent-Estimator",
  },
  {
    title: "Naija-Resume-Scanner",
    icon: "📄",
    description: "ATS-oriented resume analysis project for Nigerian job seekers.",
    tags: ["Python", "NLP", "Careers"],
    href: "https://github.com/amdsolutions007/Naija-Resume-Scanner",
  },
  {
    title: "Naira-AI-Crypto-Tracker",
    icon: "💹",
    description: "Repository for real-time Naira/crypto exchange-rate tracking and market-oriented analytics.",
    tags: ["Python", "APIs", "Market Data"],
    href: "https://github.com/amdsolutions007/Naira-AI-Crypto-Tracker",
  },
  {
    title: "AMD Global Intelligence",
    icon: "🌍",
    description: "Automated AI and technology news/intelligence feed with source collection and update workflows.",
    tags: ["Python", "News", "Intelligence"],
    href: "https://github.com/amdsolutions007/AMD-Global-Intelligence",
  },
  {
    title: "AMD Materiality Engine",
    icon: "🌱",
    description: "ESG and double-materiality engineering project covering reporting, data governance and enterprise workflow concerns.",
    tags: ["ESG", "Enterprise", "Data"],
    href: "https://github.com/amdsolutions007/amd-materiality-engine",
  },
  {
    title: "NaijaBiz Pilot",
    icon: "💬",
    description: "WhatsApp-oriented business-assistant project exploring customer conversation and operational automation.",
    tags: ["Node.js", "WhatsApp", "Automation"],
    href: "https://github.com/amdsolutions007/amd-whatsapp-bot",
  },
  {
    title: "AMD Activity Booster",
    icon: "⚡",
    description: "GitHub automation project for scheduled activity logging and repository workflow experiments.",
    tags: ["Python", "GitHub Actions", "Automation"],
    href: "https://github.com/amdsolutions007/amd-activity-booster",
  },
]

const currentPrograms = [
  {
    title: "AMD Web & Local Growth Intelligence",
    status: "LIVE PROGRAM",
    description: "The current AMD website, national service-area architecture, Client Portal, quote/invoice flow and local-growth operating layer.",
    href: "/",
  },
  {
    title: "SHINE AI — Label & Artist Intelligence",
    status: "GOVERNED PRODUCT PROGRAM",
    description: "A governed music-intelligence product program connecting campaign, audience and performance evidence for labels and artists.",
    href: "/intelligence",
  },
  {
    title: "AMD SME Growth Intelligence",
    status: "PRODUCT DIRECTION",
    description: "A customer-first operating layer for African SMEs connecting enquiries, customers, orders, payments, fulfilment and repeat-business intelligence.",
    href: "/intelligence",
  },
]

export default function Portfolio() {
  return (
    <main className="min-h-screen bg-[#020305] pb-20 text-white">
      <section className="border-b border-yellow-500/10 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            AMD Portfolio
          </div>
          <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Engineering work with a visible source trail.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-yellow-100/70 sm:text-lg">
            This portfolio separates confirmed public repositories from current AMD product programs.
            Repository presence proves the project exists; it does not automatically prove commercial adoption,
            production scale or business impact.
          </p>
          <a
            href="https://github.com/amdsolutions007"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/5 px-5 py-3 font-bold text-yellow-200"
          >
            <Github size={18} /> View AMD on GitHub
          </a>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Verified repository set</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">Projects confirmed in the AMD GitHub account</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-yellow-100/60 sm:text-base">
              Descriptions below are deliberately conservative. Claims such as revenue generated, accuracy, adoption,
              time saved or customer outcomes are excluded unless separately supported.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {verifiedRepositories.map((project, index) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.025 }}
                className="flex h-full flex-col rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.05] to-black p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-3xl">{project.icon}</div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Repository confirmed
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-yellow-200">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-yellow-100/65">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-yellow-500/15 bg-yellow-500/5 px-2 py-1 text-xs text-yellow-400/80">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 font-bold text-yellow-300"
                >
                  View repository <ExternalLink size={15} />
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-yellow-500/10 bg-black/45 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Current AMD programs</div>
            <h2 className="mt-3 text-3xl font-black text-yellow-200 sm:text-4xl">Not every current system is a standalone public repository</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {currentPrograms.map((program) => (
              <Link
                key={program.title}
                href={program.href}
                className="rounded-2xl border border-yellow-500/20 bg-black/70 p-6 transition hover:border-yellow-500/45"
              >
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-yellow-400">
                  {program.status}
                </span>
                <h3 className="mt-5 text-xl font-bold text-yellow-200">{program.title}</h3>
                <p className="mt-3 text-sm leading-6 text-yellow-100/60">{program.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 text-center sm:p-10">
          <h2 className="text-3xl font-black text-yellow-200">Need something built around your own workflow?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            Use the portfolio to understand the kinds of problems AMD explores and engineers. Your project should still be scoped around your actual requirements rather than copied from an existing repository.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20a%20custom%20software%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 font-black text-black"
            >
              Discuss a Project
            </a>
            <Link href="/payment" className="rounded-2xl border border-yellow-500/35 bg-yellow-500/5 px-6 py-4 font-bold text-yellow-200">
              Pricing & Payments
            </Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-yellow-100/40">
            Portfolio entries are not presented as customer case studies unless customer evidence and publication rights are available.
          </p>
        </div>
      </section>
    </main>
  )
}
