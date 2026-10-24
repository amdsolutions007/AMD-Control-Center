'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createMIAuthClient } from '@/lib/supabase/mi-browser'

export default function ClientPortalForgotPasswordPage(){
 const [email,setEmail]=useState('');const [loading,setLoading]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setLoading(true)
  const supabase=createMIAuthClient()
  if(!supabase){setError('Authentication is not configured.');setLoading(false);return}
  const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/client-portal/auth/callback?next=/client-portal/reset-password`})
  setLoading(false)
  if(resetError){setError(resetError.message);return}
  setMessage('If an account exists for this email, a reset link has been sent.')
 }
 return <main className="min-h-screen bg-[#020305] px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32"><div className="mx-auto max-w-xl"><div className="mb-7 text-center"><h1 className="text-4xl font-black text-yellow-300">Forgot Password</h1><p className="mt-3 text-yellow-100/60">Enter your account email and we’ll send a secure reset link.</p></div><section className="rounded-[28px] border border-yellow-500/35 bg-black/80 p-5 sm:p-8">{error&&<div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-200">{error}</div>}{message?<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">{message}</div>:<form onSubmit={submit} className="space-y-4"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" autoComplete="email" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/><button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-black text-black disabled:opacity-60">{loading?'SENDING…':'SEND RESET LINK →'}</button></form>}</section><div className="mt-5 text-center"><Link href="/client-portal" className="text-sm font-semibold text-yellow-300">Back to sign in</Link></div></div></main>
}
