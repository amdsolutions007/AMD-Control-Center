'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createMIAuthClient } from '@/lib/supabase/mi-browser'

const gradientCard =
  'rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-black via-yellow-950/10 to-black backdrop-blur-xl'

export default function ClientPortalPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createMIAuthClient()
    if (!supabase) {
      setError('Client Portal authentication is not configured.')
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError || !data.user) {
      setError('Unable to sign in. Check your email and password.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('status')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (profileError || !profile || profile.status !== 'active') {
      await supabase.auth.signOut()
      setError('This account does not have active Client Portal access.')
      setLoading(false)
      return
    }

    router.replace('/client-portal/dashboard')
    router.refresh()
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
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
              <svg className="h-10 w-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="mb-3 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300">
              SECURE CLIENT ACCESS
            </span>
            <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Client Portal
            </h1>
            <p className="mt-2 text-yellow-100/60">
              Invitation-only access using your verified AMD account.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`${gradientCard} relative overflow-hidden p-8`}
          >
            {error && (
              <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="font-semibold uppercase tracking-wider text-yellow-400">Authentication</div>
              <div className="mt-1 text-sm text-yellow-100/60">
                Supabase Auth session + server-protected dashboard + client-specific access control.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-yellow-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-yellow-500/30 bg-black/60 px-4 py-3 text-yellow-100 placeholder-yellow-100/30 transition focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-yellow-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-yellow-500/30 bg-black/60 px-4 py-3 text-yellow-100 placeholder-yellow-100/30 transition focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Enter your password"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 py-4 font-semibold text-black shadow-[0_0_30px_rgba(234,179,8,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'VERIFYING ACCOUNT...' : 'SIGN IN SECURELY'}
              </motion.button>
            </form>

            <div className="mt-6 border-t border-yellow-500/10 pt-5 text-sm text-yellow-100/55">
              Client Portal accounts are activated by AMD. Public self-registration is disabled for this workspace.
            </div>
          </motion.div>

          <div className="mt-6 text-center text-xs text-yellow-200/60">
            Authentication is verified by Supabase Auth. Additional MFA can be enabled after the account foundation is certified.
          </div>
        </div>
      </div>
    </main>
  )
}
