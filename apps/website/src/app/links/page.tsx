'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function LinksPage() {
  const [copied, setCopied] = useState(false)
  
  const stats = [
    { number: '24', label: 'Active Projects' },
    { number: '50K+', label: 'Lines of Code' },
    { number: '12', label: 'Social Platforms' },
  ]

  const links = [
    {
      icon: '📞',
      title: 'WhatsApp Hotline (Priority)',
      url: 'https://wa.me/2348180021007',
      priority: true,
    },
    {
      icon: '🎨',
      title: 'Projects Portfolio - 24 Active Projects',
      url: 'https://amdsolutions007.github.io',
      badge: 'Featured',
    },
    {
      icon: '🌐',
      title: 'Visit Official Website',
      url: 'https://www.amdsolutions007.com',
    },
    {
      icon: '✈️',
      title: 'Join Telegram Intelligence',
      url: 'https://t.me/amdsolutions007',
    },
    {
      icon: '📸',
      title: 'Instagram',
      url: 'https://instagram.com/amdsolutions007',
    },
    {
      icon: '❌',
      title: 'X / Twitter',
      url: 'https://x.com/amdsolutions007',
    },
    {
      icon: '🎵',
      title: 'TikTok',
      url: 'https://tiktok.com/@amdsolutions007',
    },
    {
      icon: '💼',
      title: 'LinkedIn',
      url: 'https://linkedin.com/company/amdsolutions007',
    },
    {
      icon: '💻',
      title: 'GitHub / Code Portfolio',
      url: 'https://github.com/amdsolutions007',
    },
    {
      icon: '📘',
      title: 'Facebook',
      url: 'https://facebook.com/amdsolutions007',
    },
    {
      icon: '👻',
      title: 'Snapchat',
      url: 'https://snapchat.com/add/solutions007',
    },
    {
      icon: '📺',
      title: 'YouTube',
      url: 'https://youtube.com/@amdsolutions007',
    },
    {
      icon: '📌',
      title: 'Pinterest',
      url: 'https://pinterest.com/amdsolutions007',
    },
  ]

  const copyEmail = () => {
    navigator.clipboard.writeText('ceo@amdsolutions007.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          {/* Avatar with Animated Glow */}
          <div className="mb-6 flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(212,175,55,0.5)] animate-pulse">
              <Image
                src="/amd_logo.png"
                alt="AMD Media Solutions"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title with Gradient Animation */}
          <h1 className="mb-2 text-3xl font-bold text-yellow-400 animate-[fadeIn_0.8s_ease-in]">
            AMD MEDIA SOLUTIONS
          </h1>

          {/* Bio */}
          <p className="text-lg text-yellow-100/70 mb-4 animate-[fadeIn_1s_ease-in]">
            Illuminating the Digital Dark.
          </p>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-3 backdrop-blur-sm hover:border-yellow-400/60 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl font-bold text-yellow-400">{stat.number}</div>
                <div className="text-xs text-yellow-100/50">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Email Copy Button */}
          <button
            onClick={copyEmail}
            className="inline-flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/5 px-4 py-2 text-sm text-yellow-100/70 hover:border-yellow-400/60 hover:text-yellow-400 transition-all duration-300"
          >
            <span>📧</span>
            <span>{copied ? '✓ Copied!' : 'ceo@amdsolutions007.com'}</span>
          </button>
        </div>

        {/* Links Section with Staggered Animation */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-center gap-3 rounded-xl border-2 bg-black px-6 py-4 text-center text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-[slideUp_0.5s_ease-out] ${
                link.priority
                  ? 'border-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]'
                  : 'border-yellow-400 hover:bg-yellow-400/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Priority Badge */}
              {link.priority && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                  PRIORITY
                </span>
              )}
              
              {/* Featured Badge */}
              {link.badge && (
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-0.5 text-xs font-bold text-black">
                  {link.badge}
                </span>
              )}

              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </span>
              <span className="text-lg font-semibold">{link.title}</span>
            </a>
          ))}
        </div>

        {/* Call-to-Action Section */}
        <div className="mt-12 rounded-xl border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent p-6 text-center backdrop-blur-sm">
          <h3 className="mb-2 text-xl font-bold text-yellow-400">
            Need a Linktree Like This?
          </h3>
          <p className="mb-4 text-sm text-yellow-100/70">
            Custom-built, world-class link pages with animations & analytics
          </p>
          <a
            href="https://wa.me/2348180021007?text=Hi!%20I%20want%20a%20custom%20linktree"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all duration-300 hover:bg-yellow-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)]"
          >
            Contact for Custom Development →
          </a>
          <p className="mt-3 text-xs text-yellow-100/50">
            Starting at $500 • Premium Quality • Fast Delivery
          </p>
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400 border border-yellow-400/30">
            Python
          </span>
          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400 border border-yellow-400/30">
            Next.js
          </span>
          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400 border border-yellow-400/30">
            AI/ML
          </span>
          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400 border border-yellow-400/30">
            React
          </span>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-yellow-100/50">
          <p className="mb-2">© 2025 AMD Media Solutions.</p>
          <p className="text-xs">Built with AI. Shipped with Speed. 🚀</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
