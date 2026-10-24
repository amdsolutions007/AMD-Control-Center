'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createMIAuthClient } from '@/lib/supabase/mi-browser'

export default function ClientPortalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const pending = searchParams.get('status') === 'pending'
  const reset = searchParams.get('reset') === 'sent'

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
      router.replace('/client-portal?status=pending')
      router.refresh()
      return
    }
    router.replace('/client-portal/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    const supabase = createMIAuthClient()
    if (!supabase) {
      setError('Client Portal authentication is not configured.')
      setGoogleLoading(false)
      return
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/client-portal/auth/callback?next=/client-portal/dashboard`,
      },
    })
    if (oauthError) {
      setError('Google sign-in is not enabled for this AMD account yet. Use email/password for now.')
      setGoogleLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020305] px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32">
      <div className="pointer-events-none fixed inset-0 opacity-[0.08]" style={{backgroundImage:"radial-gradient(circle at 50% 10%, rgba(234,179,8,.24), transparent 30%), linear-gradient(rgba(234,179,8,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,.06) 1px, transparent 1px)",backgroundSize:"auto, 34px 34px, 34px 34px"}} />
      <div className="pointer-events-none fixed left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-500/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-xl">
        <motion.header initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} className="mb-6 text-center sm:mb-8">
          <span className="mb-3 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300">
            Secure Client Access
          </span>
          <h1 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Client Portal
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-yellow-100/60 sm:text-base">
            Sign in with your verified AMD account or create a new client account.
          </p>
        </motion.header>

        <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} className="rounded-[28px] border border-yellow-500/35 bg-black/80 p-5 shadow-[0_0_55px_rgba(234,179,8,0.12)] backdrop-blur-xl sm:p-8">
          {pending && <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">Your account exists, but Client Portal access is awaiting AMD activation.</div>}
          {reset && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">Password reset link sent. Check your email.</div>}
          {error && <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-yellow-300">Email address</span>
              <input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/15" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-yellow-300">Password</span>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 pr-14 text-base text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/15" />
                <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-300/70">{showPassword ? 'HIDE' : 'SHOW'}</button>
              </div>
            </label>

            <button type="submit" disabled={loading} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 px-5 py-4 text-base font-black uppercase tracking-[0.08em] text-black shadow-[0_0_28px_rgba(234,179,8,0.3)] disabled:opacity-60">
              {loading ? 'VERIFYING ACCOUNT…' : 'Sign In Securely →'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-white/40"><span className="h-px flex-1 bg-white/10"/><span>OR</span><span className="h-px flex-1 bg-white/10"/></div>

          <button type="button" onClick={handleGoogle} disabled={googleLoading} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-yellow-500/40 bg-black px-5 py-4 font-bold text-white transition hover:bg-yellow-500/5 disabled:opacity-60">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-[#4285F4]">G</span>
            {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Link href="/client-portal/sign-up" className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-3 text-center font-semibold text-yellow-300 transition hover:border-yellow-400">Create account</Link>
            <Link href="/client-portal/forgot-password" className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-3 text-center font-semibold text-yellow-300 transition hover:border-yellow-400">Forgot password?</Link>
          </div>

          <div className="mt-6 grid gap-3 border-t border-yellow-500/10 pt-5 text-xs text-yellow-100/55 sm:grid-cols-2">
            <div>Client Portal accounts are activated by AMD.</div>
            <div className="sm:text-right">Protected by Supabase Auth</div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
