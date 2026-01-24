"use client"

import Link from "next/link"
import {
  Github,
  ExternalLink,
  Database,
  Server,
  Cpu,
  Shield,
  Globe,
  Terminal,
  Zap,
  ChevronRight,
} from "lucide-react"

const GITHUB_USER = "amdsolutions007"
const REPO_BASE = `https://github.com/${GITHUB_USER}/`

const toRepoLink = (title: string) => {
  const slug = title.replace(/\s+/g, "-")
  return `${REPO_BASE}${slug}`
}

const FEATURED_PROJECTS = [
  {
    title: "Address-Intel",
    icon: "🗺️",
    desc: "AI-powered parser for unstructured Nigerian addresses. Turn 'behind yellow shop' into valid geospatial data.",
    tags: ["Python", "NLP", "Geospatial AI"],
    impact: "Solved Logistics delivery failure",
  },
  {
    title: "Bank-Statement-Parser",
    icon: "🔍",
    desc: "Extract transactions from Nigerian bank PDFs instantly with intelligent OCR and validation.",
    tags: ["Python", "PDF Processing", "AI"],
    impact: "Automated credit scoring",
  },
  {
    title: "CBN-Compliance-Copilot",
    icon: "⚖️",
    desc: "Automated CBN compliance checking for Fintechs. Regulatory AI adhering to Central Bank guidelines.",
    tags: ["Python", "RegTech", "Compliance"],
    impact: "Reduced audit time by 90%",
  },
  {
    title: "Naira-AI-Crypto-Tracker",
    icon: "💹",
    desc: "Real-time USDT/NGN tracking with Binance data and instant Telegram alerts.",
    tags: ["Python", "Binance API", "Telegram"],
    impact: "Real-time Arbitrage signals",
  },
].map((item) => ({ ...item, link: toRepoLink(item.title) }))

const OPEN_SOURCE_TOOLS = [
  { title: "NaijaStack-AI", icon: "🇳🇬", desc: "The Ultimate Nigerian SaaS Starter Kit. Next.js + Paystack + AI.", tags: ["Next.js", "Paystack"] },
  { title: "Naija-Prop-Intel", icon: "🏘️", desc: "AI Real Estate Super-App. Flood risk & ROI analysis for 52 cities.", tags: ["Python", "GIS"] },
  { title: "Naija-Voice-AI", icon: "🎙️", desc: "Pidgin Voice Assistant. Speech recognition for 130M speakers.", tags: ["NLP", "Speech API"] },
  { title: "AMD-Control-Center", icon: "🎛️", desc: "CLI Dashboard to manage all projects from one terminal.", tags: ["CLI", "DevOps"] },
  { title: "Naija-Resume-Scanner", icon: "📄", desc: "ATS Optimizer. Fix 70% rejection rates with AI formatting.", tags: ["AI", "Resume"] },
  { title: "NaijaLaw-GPT", icon: "⚖️", desc: "Legal AI Assistant for Nigerian court precedents.", tags: ["GPT-4", "Legal"] },
  { title: "AMD-Global-Intel", icon: "🌐", desc: "AI tech news aggregator from HackerNews & ArXiv.", tags: ["Scraping", "AI"] },
  { title: "AMD-ML-Predictor", icon: "🔮", desc: "Time series forecasting for Nigerian markets.", tags: ["TensorFlow", "ML"] },
].map((item) => ({ ...item, link: toRepoLink(item.title) }))

const ENTERPRISE_SYSTEMS = [
  { title: "AMD-DB-Manager", icon: <Database size={18} />, desc: "Multi-database migration & backup automation." },
  { title: "AMD-API-Nexus", icon: <Server size={18} />, desc: "Centralized API Gateway with rate limiting." },
  { title: "AMD-Data-Engine", icon: <Cpu size={18} />, desc: "ETL pipelines & real-time analytics." },
  { title: "AMD-Alert-System", icon: <Shield size={18} />, desc: "Multi-channel notification engine (SMS/WhatsApp)." },
]

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#E0E0E0] selection:bg-yellow-500/30 pb-24">
      {/* HERO SECTION */}
      <section className="relative py-24 px-6 border-b border-[#FFD70026] bg-[url('/grid-pattern.svg')]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-[#FFD70080] rounded-full text-[#FFD700] text-xs font-mono uppercase tracking-widest bg-[#FFD7001a]">
            Vector 007 Authorization
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            AI ENGINEERING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-300">DIVISION</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Building intelligence for the African Ecosystem. From <span className="text-white">crypto tracking</span> to <span className="text-white">geospatial intelligence</span>, we ship products that matter.
          </p>

          <div className="flex justify-center gap-6 mt-10">
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" className="flex items-center gap-2 text-white bg-black/70 border border-[#FFD70040] px-6 py-3 rounded-full hover:border-[#FFD700] transition-all">
              <Github size={20} /> <span>GitHub Profile</span>
            </a>
            <div className="flex items-center gap-2 text-[#FFD700] px-6 py-3 border border-[#FFD70026] rounded-full bg-black/50">
              <Terminal size={18} className="text-[#FFD700]" /> <span>24 Active Projects</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: FLAGSHIP PROJECTS (2 COLUMNS) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-10">
          <Zap className="text-[#FFD700]" /> FEATURED INTELLIGENCE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURED_PROJECTS.map((project, index) => (
            <Link
              key={index}
              href={project.link}
              target="_blank"
              className="group relative bg-black/70 border border-[#FFD70033] p-8 rounded-2xl hover:border-[#FFD700] hover:bg-black/80 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 p-2 bg-black/70 border border-[#FFD70040] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} className="text-[#FFD700]" />
              </div>
              <div className="text-5xl mb-6">{project.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">{project.desc}</p>

              <div className="mb-6 pt-4 border-t border-[#FFD7001a]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Impact</p>
                <p className="text-sm text-[#FFD700] font-mono">{project.impact}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono text-[#FFD700] bg-[#FFD7001a] px-3 py-1 rounded-full border border-[#FFD70040]">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 2: THE ARSENAL (GRID) */}
      <section className="py-20 px-6 bg-[#000000] border-y border-[#FFD7001a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-10">
            <Globe className="text-[#FFD700]" /> OPEN SOURCE ARSENAL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {OPEN_SOURCE_TOOLS.map((tool, index) => (
              <Link
                key={index}
                href={tool.link}
                target="_blank"
                className="bg-black/70 border border-[#FFD70026] p-6 rounded-xl hover:bg-black/80 hover:border-[#FFD70080] transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{tool.icon}</span>
                  <Github size={16} className="text-[#FFD70040] group-hover:text-[#FFD700]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">{tool.title}</h4>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">{tool.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {tool.tags.map((t) => (
                    <span key={t} className="text-[10px] border border-[#FFD70026] text-[#E0E0E0] px-2 py-1 rounded bg-black/70">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: ENTERPRISE & CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT: ENTERPRISE LIST */}
          <div className="lg:col-span-2">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
              <Shield className="text-[#FFD700]" /> ENTERPRISE INFRASTRUCTURE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ENTERPRISE_SYSTEMS.map((sys, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-black/60 border border-[#FFD70026] p-4 rounded-lg hover:border-[#FFD70080] transition-colors"
                >
                  <div className="p-3 bg-black/70 rounded-lg text-[#FFD700] border border-[#FFD70040]">{sys.icon}</div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{sys.title}</h4>
                    <p className="text-xs text-gray-400">{sys.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: CALL TO ACTION (AGENT'S IDEA) */}
          <div className="bg-black/70 border border-[#FFD70066] p-8 rounded-2xl text-center shadow-[0_0_40px_rgba(255,215,0,0.08)]">
            <h3 className="text-xl font-bold text-white mb-4">Ready to Deploy?</h3>
            <p className="text-gray-300 text-sm mb-6">You've seen the arsenal. Now let's build your custom solution.</p>
            <Link
              href="/client-portal"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#FFD700] hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition-colors"
            >
              Initialize Project <ChevronRight size={18} />
            </Link>
            <p className="text-xs text-gray-400 mt-4">Secured by AMD-007 Protocols</p>
          </div>
        </div>
      </section>

      {/* Floating 007 Agent */}
      <Link
        href="/client-portal"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFD700] text-black font-bold shadow-[0_10px_30px_rgba(255,215,0,0.35)] border border-[#FFD700] hover:scale-105 transition-transform"
      >
        <span className="text-sm">007 Agent</span>
        <ChevronRight size={16} />
      </Link>
    </div>
  )
}
