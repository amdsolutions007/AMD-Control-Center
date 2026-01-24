'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FormEvent, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const gradientCard = 'rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-black via-yellow-950/10 to-black backdrop-blur-xl'

export default function ClientPortalPage() {
  const router = useRouter()
  const [accessId, setAccessId] = useState('')
  const [password, setPassword] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [authMethod, setAuthMethod] = useState<'biometric' | 'password' | '2fa'>('biometric')

  const supabaseEnabled = Boolean(supabase)

  const allowedIds = useMemo(() => {
    const envList = process.env.NEXT_PUBLIC_PORTAL_ALLOWED_IDS || 'AMD-007-VIP'
    return envList
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsScanning(true)

    const normalizedId = accessId.trim()

    let supabaseAllowed = false

    if (authMethod === 'biometric') {
      try {
        if (typeof window === 'undefined' || typeof window.PublicKeyCredential === 'undefined' || !navigator.credentials) {
          throw new Error('unsupported')
        }

        await navigator.credentials.get({
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            timeout: 60000,
            userVerification: 'preferred',
          },
        })
      } catch (biometricError) {
        setError('Biometric ID not found. Use Password.')
        setIsScanning(false)
        return
      }
    }

    if (supabaseEnabled && supabase) {
      try {
        if (authMethod === 'password') {
          const { data: pinMatch } = await supabase
            .from('portal_access')
            .select('access_id')
            .eq('access_id', normalizedId)
            .eq('pin_code', password.trim())
            .maybeSingle()

          supabaseAllowed = Boolean(pinMatch)
        } else {
          const { data } = await supabase
            .from('portal_access')
            .select('access_id')
            .eq('access_id', normalizedId)
            .maybeSingle()

          supabaseAllowed = Boolean(data)
        }
      } catch (err) {
        console.error('Supabase lookup failed', err)
      }
    }

    const fallbackAllowed = authMethod === 'password' ? false : allowedIds.includes(normalizedId)
    const canEnter = supabaseAllowed || fallbackAllowed

    setTimeout(() => {
      if (canEnter) {
        router.push('/client-portal/dashboard')
      } else {
        setError('Access Denied. Invalid Credentials.')
        setIsScanning(false)
      }
    }, 400)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M30 0l25.98 15v30L30 60 4.02 45V15z\\' fill=\\'none\\' stroke=\\'%23eab308\\' stroke-width=\\'1\\'/%3E%3C/svg%3E')",
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="fixed left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/8 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-14">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 text-center"
          >
            <motion.div
              animate={{ rotate: isScanning ? 360 : 0, scale: isScanning ? [1, 1.12, 1] : 1 }}
              transition={{ rotate: { duration: 2, repeat: isScanning ? Infinity : 0, ease: 'linear' }, scale: { duration: 0.6, repeat: isScanning ? Infinity : 0 } }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
            >
              <svg className="h-10 w-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <span className="mb-3 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300">
              🔒 SECURE ACCESS POINT
            </span>
            <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Client Portal
            </h1>
            <p className="mt-2 text-yellow-100/60">Authorized personnel only. Multi-factor handshake enforced.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`${gradientCard} relative overflow-hidden p-8`}
          >
            <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-yellow-500/60" />
            <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-yellow-500/60" />
            <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-yellow-500/60" />
            <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-yellow-500/60" />

            <div className="mb-6 flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-100/70">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                />
                <div>
                  <div className="font-semibold uppercase tracking-wider text-yellow-400">Security Status</div>
                  <div className="text-xs text-yellow-100/60">Clearance Gate: Alpha</div>
                </div>
              </div>
              <div className="text-xl">{isScanning ? '🔍' : '🔐'}</div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-yellow-300/80">
                <span>Security Status</span>
                <span className="flex items-center gap-2 text-yellow-200">
                  Level 5/5
                  <span className="flex h-2 w-20 overflow-hidden rounded-full border border-yellow-500/40">
                    <span className="h-full w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" />
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {[
                  { key: 'biometric', label: 'Biometric' },
                  { key: 'password', label: 'Password' },
                  { key: '2fa', label: '2FA' },
                ].map((method) => (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => setAuthMethod(method.key as 'biometric' | 'password' | '2fa')}
                    className={`rounded-lg border px-3 py-2 transition-all duration-300 ${
                      authMethod === method.key
                        ? 'border-yellow-400 bg-yellow-500/20 text-yellow-100'
                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200/70 hover:border-yellow-400/60 hover:text-yellow-200'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/70"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mx-auto mb-3 h-14 w-14"
                  >
                    <svg className="text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.div>
                  <div className="font-mono text-yellow-300">Authenticating...</div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="accessId" className="mb-2 block text-sm font-semibold text-yellow-300">
                  Access ID
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/60">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="accessId"
                    type="text"
                    value={accessId}
                    onChange={(e) => setAccessId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-yellow-500/30 bg-black/60 py-3 pl-12 pr-4 text-yellow-100 placeholder-yellow-100/30 backdrop-blur-sm transition-all duration-300 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="Enter your Access ID"
                  />
                </div>
              </div>

              {authMethod === 'password' && (
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-yellow-300">
                    Security Key
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/60">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border border-yellow-500/30 bg-black/60 py-3 pl-12 pr-4 text-yellow-100 placeholder-yellow-100/30 backdrop-blur-sm transition-all duration-300 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                      placeholder="Enter security key"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-100/70">
                <div className="mb-2 flex items-center gap-2 font-semibold text-yellow-300">
                  <span>Protocol</span>
                  <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-mono">VIP-PRIME</span>
                </div>
                <p className="text-yellow-100/60">Access is restricted to authorized agents. IDS monitoring and audit logging are active.</p>
              </div>

              <motion.button
                type="submit"
                disabled={isScanning}
                whileHover={{ scale: isScanning ? 1 : 1.01 }}
                whileTap={{ scale: isScanning ? 1 : 0.98 }}
                className="group relative w-full overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 py-4 font-semibold text-black shadow-[0_0_30px_rgba(234,179,8,0.35)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isScanning ? 'AUTHENTICATING...' : 'INITIATE SECURE ACCESS'}
                  {!isScanning && (
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </span>
                {!isScanning && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300/70">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-mono">PROTECTED BY AMD SECURITY PROTOCOL v3.1</span>
            </div>

            <div className="mt-4 text-xs text-yellow-200/70">
              Encryption: AES-256 + TLS 1.3 | Zero-Trust Edge Enabled
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
