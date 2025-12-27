'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const navigationLinks = [
  { href: '/about', label: 'About' },
  { href: '/#ecosystem', label: 'Ecosystem' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/media', label: 'Media' },
  { href: '/portal', label: 'Portal' },
]

const paymentLink = { href: '/payment', label: 'Services' }

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src="/amd_logo.png" alt="AMD Logo" className="h-10 w-auto drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 bg-clip-text bg-[length:200%_100%] text-lg font-bold tracking-[0.18em] text-transparent drop-shadow-[0_0_8px_rgba(234,179,8,0.3)] animate-shimmer">
              AMD SOLUTIONS 007
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden items-center gap-8 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/about" className="group relative text-sm font-medium text-yellow-200/80 transition-all duration-300 hover:text-yellow-300">
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/#ecosystem" className="group relative text-sm font-medium text-yellow-200/80 transition-all duration-300 hover:text-yellow-300">
              <span className="relative z-10">Ecosystem</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/intelligence" className="group relative text-sm font-medium text-yellow-200/80 transition-all duration-300 hover:text-yellow-300">
              <span className="relative z-10">Intelligence</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/media" className="group relative text-sm font-medium text-yellow-200/80 transition-all duration-300 hover:text-yellow-300">
              <span className="relative z-10">Media</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300 group-hover:w-full" />
            </Link>
            
            {/* Services/Payment Link - Distinctive Gold Border */}
            <Link
              href="/payment"
              className="group relative overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 px-4 py-2 text-sm font-bold text-yellow-300 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-200 hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <span className="relative z-10">Services</span>
            </Link>
          </motion.div>

          {/* Desktop Portal Button & Mobile Menu Button */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Desktop Portal Button */}
            <Link
              href="/portal"
              className="group relative hidden overflow-hidden rounded-lg border border-yellow-500/40 bg-gradient-to-r from-yellow-600/15 to-yellow-500/15 px-5 py-2 text-sm font-bold text-yellow-400 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] md:block"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <span className="relative z-10">Client Portal</span>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-2.5 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] md:hidden"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle mobile menu"
            >
              <motion.span 
                className="h-0.5 w-6 rounded-full bg-yellow-400"
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span 
                className="h-0.5 w-6 rounded-full bg-yellow-400"
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span 
                className="h-0.5 w-6 rounded-full bg-yellow-400"
                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </nav>
      </header>

      {/* Mobile Menu Drawer - Glass Vault */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[85vw] max-w-sm border-l border-yellow-500/20 bg-black/95 backdrop-blur-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] md:hidden"
            >
              {/* Header */}
              <div className="border-b border-yellow-500/20 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-xl font-bold text-transparent">
                    Navigation
                  </span>
                  <button
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-400 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300"
                    aria-label="Close menu"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-400/70">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <span className="font-mono">SECURE ACCESS</span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 p-6">
                {navigationLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="group relative block overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent p-5 transition-all duration-300 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="relative z-10 text-lg font-semibold text-yellow-200 transition-colors duration-300 group-hover:text-yellow-300">
                          {link.label}
                        </span>
                        <svg 
                          className="h-5 w-5 text-yellow-400/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-yellow-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {/* Gold Glow on Tap */}
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                ))}

                {/* Services/Payment Link - Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navigationLinks.length * 0.1 }}
                >
                  <Link
                    href="/payment"
                    onClick={closeMobileMenu}
                    className="group relative block overflow-hidden rounded-xl border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-5 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/20 hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="relative z-10 text-lg font-bold text-yellow-300 transition-colors duration-300 group-hover:text-yellow-200">
                        Services
                      </span>
                      <svg 
                        className="h-5 w-5 text-yellow-400 transition-all duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </motion.div>

                {/* Mobile Portal Button */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navigationLinks.length * 0.1 }}
                  className="mt-4"
                >
                  <Link
                    href="/portal"
                    onClick={closeMobileMenu}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 p-5 font-bold text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]"
                  >
                    <span className="relative z-10 text-lg">Client Portal</span>
                    <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Link>
                </motion.div>
              </nav>

              {/* Footer Badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-300">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Encrypted Connection
                  </div>
                  <div className="text-xs text-yellow-100/60">
                    Military-grade security protocol active
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
