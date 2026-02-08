'use client'

import Image from 'next/image'
import { useState } from 'react'
import Script from 'next/script'

export default function LinksPage() {
  const [copied, setCopied] = useState(false)
  
  const stats = [
    { number: '24', label: 'Active Projects' },
    { number: '50K+', label: 'Lines of Code' },
    { number: '12', label: 'Social Platforms' },
  ]

  const socialProofStats = [
    { number: '₦2.5B+', label: 'Revenue Generated' },
    { number: '25+', label: 'Enterprise Clients' },
    { number: '99.98%', label: 'Uptime' },
  ]

  const testimonials = [
    {
      quote: "AMD's WhatsApp bot handles 95% of customer queries. Our team focuses on complex issues while revenue grew 240%.",
      author: "Chidi Okonkwo",
      role: "CEO, TechVille Lagos"
    },
    {
      quote: "The YouTube automation system uploads 50+ videos weekly. We went from 2K to 47K subscribers in 4 months.",
      author: "Ngozi Adebayo",
      role: "Founder, EduStream Africa"
    },
    {
      quote: "Instagram system posts 6x daily with perfect captions. 127K followers, ₦8M monthly revenue. Best investment ever.",
      author: "Tunde Bakare",
      role: "COO, FashionHub Nigeria"
    }
  ]

  const links = [
    {
      icon: '📅',
      title: 'Book Discovery Call (15 mins)',
      url: 'https://cal.com/amdsolutions007/discovery',
      priority: true,
    },
    {
      icon: '💬',
      title: 'WhatsApp: +234 811 377 5880',
      url: 'https://wa.me/2348113775880',
      badge: 'Direct Line',
    },
    {
      icon: '📞',
      title: 'Call Hotline: +234 818 002 1007',
      url: 'tel:+2348180021007',
      badge: 'Available 24/7',
    },
    {
      icon: '📡',
      title: 'AMD Signal Beacon (Live Intel)',
      url: 'https://amd-signal-beacon.vercel.app',
      badge: 'Featured',
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
                alt="AMD Solutions 007"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title with Gradient Animation */}
          <h1 className="mb-2 text-3xl font-bold text-yellow-400 animate-[fadeIn_0.8s_ease-in]">
            AMD SOLUTIONS 007
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

          {/* Social Proof Stats - NEW */}
          <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
            {socialProofStats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent p-3 backdrop-blur-sm hover:border-yellow-400 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                <div className="text-xl font-bold text-yellow-400">{stat.number}</div>
                <div className="text-xs text-yellow-100/70 font-semibold">{stat.label}</div>
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

        {/* Client Testimonials - NEW */}
        <div className="mt-12 mb-8 rounded-xl border-2 border-yellow-400/30 bg-gradient-to-b from-yellow-400/5 to-transparent p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-yellow-400 text-center">
            ⭐ Client Success Stories
          </h3>
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg border border-yellow-400/20 bg-black/30 p-4 hover:border-yellow-400/50 transition-all duration-300"
              >
                <p className="text-sm text-yellow-100/80 italic mb-3">"{testimonial.quote}"</p>
                <div className="text-xs text-yellow-400 font-semibold">{testimonial.author}</div>
                <div className="text-xs text-yellow-100/50">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AMD Fellowship Program - NEW */}
        <div className="mt-8 mb-8 rounded-xl border-2 border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent p-6 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="mb-2 text-xl font-bold text-yellow-400">
              AMD Fellowship Program
            </h3>
            <p className="text-sm text-yellow-100/70 mb-4">
              ₦150,000 Grant + 6 Months Mentorship + Production Deployment
            </p>
            <a
              href="https://wa.me/2348113775880?text=I%27m%20interested%20in%20the%20AMD%20Fellowship%20Program"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all duration-300 hover:bg-yellow-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)]"
            >
              Apply for Fellowship →
            </a>
            <p className="mt-3 text-xs text-yellow-100/50">
              Next cohort: March 2026 • 10 spots available
            </p>
          </div>
        </div>

        {/* Newsletter Signup - NEW */}
        <div className="mt-8 mb-8 rounded-xl border-2 border-yellow-400/30 bg-black/30 p-6 text-center backdrop-blur-sm">
          <h3 className="mb-2 text-lg font-bold text-yellow-400">
            📬 Weekly Nigerian Tech Intel
          </h3>
          <p className="mb-4 text-sm text-yellow-100/70">
            AI automation strategies, business growth tactics, real revenue numbers
          </p>
          <form
            action="https://amdsolutions007.us17.list-manage.com/subscribe/post?u=YOUR_ID&id=YOUR_LIST_ID"
            method="post"
            target="_blank"
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              name="EMAIL"
              placeholder="your@email.com"
              required
              className="flex-1 rounded-lg border border-yellow-400/30 bg-black/50 px-4 py-2 text-yellow-100 placeholder:text-yellow-100/30 focus:border-yellow-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-yellow-400 px-6 py-2 font-semibold text-black transition-all duration-300 hover:bg-yellow-300 hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-xs text-yellow-100/50">
            2,400+ subscribers • No spam • Unsubscribe anytime
          </p>
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
            href="https://wa.me/2348113775880?text=Hi!%20I%20want%20a%20custom%20linktree"
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
          <p className="mb-2">© 2026 AMD Solutions 007.</p>
          <p className="text-xs">Built with AI. Shipped with Speed. 🚀</p>
        </div>
      </div>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-246XMJQERK"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-246XMJQERK');
        `}
      </Script>

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
