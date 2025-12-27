'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

export function Hero({
  headline,
  subline,
}: {
  headline: string
  subline: string
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative flex min-h-screen items-end justify-center overflow-hidden bg-[#050A14]">
      {/* Parallax Background with cinematic depth */}
      {/* Parallax Background with cinematic depth */}
      <motion.img
        src="/dashboard_bg.jpg"
        alt="Dashboard Background"
        style={{ y }}
        className="absolute inset-0 h-[120vh] w-full object-cover object-top"
      />

      {/* Animated gold particles overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.03)_0%,transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Cinematic gradient with gold tint */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent" />

      {/* Content anchored at very bottom - completely clear of all artwork */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center px-6 md:bottom-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="text-center"
        >
          {/* Subtitle in 24K Gold with shimmer effect */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mb-5 bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 bg-clip-text bg-[length:200%_100%] text-base font-light tracking-[0.08em] text-transparent drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-shimmer md:mb-6 md:text-xl"
          >
            {subline}
          </motion.p>

          {/* Premium Call-to-Action Button with 24K Gold glow */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link
              href="/#ecosystem"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-8 py-3.5 text-base font-bold tracking-wide text-yellow-400 backdrop-blur-md transition-all duration-500 hover:border-yellow-400 hover:from-yellow-600/30 hover:to-yellow-500/30 hover:text-yellow-300 hover:shadow-[0_0_40px_rgba(234,179,8,0.6),inset_0_0_20px_rgba(234,179,8,0.2)] md:px-10 md:py-4 md:text-lg"
            >
              {/* Animated shine effect */}
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              
              <span className="relative z-10 font-semibold">Explore Ecosystem</span>
              <svg
                className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 md:h-6 md:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
