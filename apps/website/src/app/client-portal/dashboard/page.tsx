'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const card = 'rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-black via-yellow-900/10 to-black backdrop-blur-xl'

export default function ClientPortalDashboard() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060c] text-white">
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage:
          "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M30 0l25.98 15v30L30 60 4.02 45V15z\\' fill=\\'none\\' stroke=\\'%23eab308\\' stroke-width=\\'1\\'/%3E%3C/svg%3E')",
        backgroundSize: '60px 60px',
      }} />

      <div className="fixed left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/6 blur-3xl" />

      <motion.div
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3 text-center md:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300">
            🛰️ VIP ACCESS CHANNEL
          </span>
          <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Welcome, Authorized Agent
          </h1>
          <p className="text-yellow-100/70">Mission Status: Active. All systems are online and telemetry is synced.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className={`${card} p-6`}
          >
            <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-yellow-400">Ops Feed</div>
            <div className="space-y-2 text-yellow-100/70 text-sm">
              <div className="flex items-center justify-between"><span>Secure uplink</span><span className="text-green-400">Active</span></div>
              <div className="flex items-center justify-between"><span>Data sync</span><span className="text-green-400">Synced</span></div>
              <div className="flex items-center justify-between"><span>Threat grid</span><span className="text-yellow-400">Monitoring</span></div>
            </div>
          </div>

          <div className={`${card} p-6 md:col-span-2`}
          >
            <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-yellow-400">Mission Console</div>
            <div className="grid gap-4 md:grid-cols-2">
              {[{
                label: 'Next Deployment',
                value: 'T-12h',
                tone: 'text-yellow-300'
              }, {
                label: 'AI Runtimes',
                value: 'Operational',
                tone: 'text-green-400'
              }, {
                label: 'Incident Count',
                value: '0',
                tone: 'text-green-400'
              }, {
                label: 'Last Audit',
                value: '6 minutes ago',
                tone: 'text-yellow-200'
              }].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-yellow-500/20 bg-black/40 p-4">
                  <div className="text-xs uppercase tracking-widest text-yellow-100/50">{item.label}</div>
                  <div className={`text-2xl font-bold ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${card} p-6 text-sm text-yellow-100/80`}>
          <div className="mb-2 flex items-center gap-2 font-semibold text-yellow-300">
            <span>Next Actions</span>
            <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-mono">ALPHA</span>
          </div>
          <ul className="list-disc space-y-2 pl-5">
            <li>Review mission queue and confirm deployment windows.</li>
            <li>Validate credentials for new operatives before handoff.</li>
            <li>Run post-deploy telemetry checks on high-sensitivity systems.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-yellow-200 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              Return to HQ
            </Link>
            <Link
              href="/client-portal"
              className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-yellow-200 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              Switch Identity
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
