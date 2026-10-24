'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const officialChannels = [
  {
    icon: '💬',
    title: 'WhatsApp',
    detail: '+234 818 002 1007',
    url: 'https://wa.me/2348180021007',
    badge: 'Primary contact',
  },
  {
    icon: '❌',
    title: 'X / Twitter',
    detail: '@amdsolutions007',
    url: 'https://x.com/amdsolutions007',
  },
  {
    icon: '💻',
    title: 'GitHub',
    detail: '@amdsolutions007',
    url: 'https://github.com/amdsolutions007',
  },
  {
    icon: '📺',
    title: 'YouTube',
    detail: '@amdsolutions007',
    url: 'https://youtube.com/@amdsolutions007',
  },
  {
    icon: '✈️',
    title: 'Telegram',
    detail: 'AMD Solutions 007',
    url: 'https://t.me/amdsolutions007',
  },
]

const amdDestinations = [
  {
    title: 'Official Website',
    description: 'Services, location coverage and current AMD company information.',
    href: '/',
  },
  {
    title: 'AMD Intelligence',
    description: 'Research, evidence intelligence and decision-support capability.',
    href: '/intelligence',
  },
  {
    title: 'AMD Signal Beacon',
    description: 'Curated technology briefings and RSS discovery.',
    href: 'https://amd-signal-beacon.vercel.app',
    external: true,
  },
  {
    title: 'Portfolio',
    description: 'Selected products, systems and engineering work.',
    href: '/portfolio',
  },
  {
    title: 'Pricing & Payments',
    description: 'Request a quote or access the approved-invoice payment flow.',
    href: '/payment',
  },
  {
    title: 'Client Portal',
    description: 'Authenticated access for approved AMD clients.',
    href: '/client-portal',
  },
]

export default function LinksPage() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText('ceo@amdsolutions007.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="min-h-screen bg-[#020305] px-4 pb-16 pt-24 text-white sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-3xl">
        <section className="text-center">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(212,175,55,0.35)]">
            <Image src="/amd_logo.png" alt="AMD Solutions 007" fill className="object-cover" priority />
          </div>

          <div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
            Official links
          </div>
          <h1 className="mt-2 text-3xl font-black text-yellow-300 sm:text-4xl">AMD Solutions 007</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-yellow-100/65 sm:text-base">
            Official AMD contact, social and website destinations in one place. For project enquiries, WhatsApp remains the primary direct channel.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 font-black text-black"
            >
              Discuss a Project
            </a>
            <button
              onClick={copyEmail}
              className="rounded-xl border border-yellow-500/35 bg-yellow-500/5 px-5 py-3 font-bold text-yellow-200"
            >
              {copied ? 'Email copied ✓' : 'Copy ceo@amdsolutions007.com'}
            </button>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Contact & social</div>
            <h2 className="mt-2 text-2xl font-black text-yellow-200">Core AMD channels</h2>
            <p className="mt-2 text-sm leading-6 text-yellow-100/55">
              These are the primary public destinations currently carried by AMD. Individual social-platform availability can change independently of this website.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {officialChannels.map((channel) => (
              <a
                key={channel.title}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-black p-5 transition hover:-translate-y-0.5 hover:border-yellow-500/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-2xl">{channel.icon}</div>
                  {channel.badge && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      {channel.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-yellow-200">{channel.title}</h3>
                <p className="mt-1 text-sm text-yellow-100/55">{channel.detail}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">AMD ecosystem</div>
            <h2 className="mt-2 text-2xl font-black text-yellow-200">Go directly to the right surface</h2>
          </div>

          <div className="space-y-3">
            {amdDestinations.map((item) =>
              item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-5 rounded-2xl border border-yellow-500/20 bg-black/60 p-5 transition hover:border-yellow-500/45"
                >
                  <div>
                    <h3 className="font-bold text-yellow-200">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-yellow-100/55">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-yellow-400">↗</span>
                </a>
              ) : (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between gap-5 rounded-2xl border border-yellow-500/20 bg-black/60 p-5 transition hover:border-yellow-500/45"
                >
                  <div>
                    <h3 className="font-bold text-yellow-200">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-yellow-100/55">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-yellow-400">→</span>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-6 text-sm leading-6 text-yellow-100/60">
          <strong className="text-yellow-300">No hidden programme promises:</strong> this page does not advertise grants, fellowships, 24/7 human availability, revenue guarantees or newsletter subscriptions unless those programmes are actually configured and approved.
        </section>

        <footer className="mt-10 text-center text-xs text-yellow-100/35">
          © 2026 AMD Solutions 007 · AMD Ascend Solutions
        </footer>
      </div>
    </main>
  )
}
