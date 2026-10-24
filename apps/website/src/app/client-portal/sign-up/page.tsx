'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createMIAuthClient } from '@/lib/supabase/mi-browser'

export default function ClientPortalSignUpPage() {
  const [name,setName]=useState('')
  const [company,setCompany]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState(false)

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError('')
    if(password.length<8){setError('Password must be at least 8 characters.');return}
    if(password!==confirm){setError('Passwords do not match.');return}
    const supabase=createMIAuthClient()
    if(!supabase){setError('Authentication is not configured.');return}
    setLoading(true)
    const {data,error:signUpError}=await supabase.auth.signUp({
      email:email.trim(),
      password,
      options:{
        emailRedirectTo:`${window.location.origin}/client-portal/auth/callback?next=/client-portal?status=pending`,
        data:{display_name:name.trim(),company_name:company.trim()}
      }
    })
    if(signUpError){setError(signUpError.message);setLoading(false);return}
    if(data.session && data.user){
      await supabase.from('client_profiles').insert({
        user_id:data.user.id,
        display_name:name.trim()||null,
        company_name:company.trim()||null,
        status:'invited',
        role:'client'
      })
    }
    setLoading(false);setSuccess(true)
  }

  return <main className="min-h-screen bg-[#020305] px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32">
    <div className="mx-auto max-w-xl">
      <div className="mb-7 text-center"><h1 className="text-4xl font-black text-yellow-300">Create Client Account</h1><p className="mt-3 text-sm text-yellow-100/60">Create your AMD account. Client Portal access is activated by AMD after verification.</p></div>
      <section className="rounded-[28px] border border-yellow-500/35 bg-black/80 p-5 sm:p-8">
        {success ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-100">Account created. Check your email to verify your address. After verification, AMD can activate your Client Portal access.<div className="mt-5"><Link href="/client-portal" className="font-bold text-yellow-300">Return to sign in →</Link></div></div> :
        <form onSubmit={submit} className="space-y-4">
          {error&&<div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
          <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/>
          <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company / organization (optional)" autoComplete="organization" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/>
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" autoComplete="email" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/>
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (minimum 8 characters)" autoComplete="new-password" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/>
          <input required type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/>
          <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-black text-black disabled:opacity-60">{loading?'CREATING ACCOUNT…':'CREATE ACCOUNT →'}</button>
          <p className="text-center text-xs text-yellow-100/50">Creating an account does not automatically grant access to another client’s data.</p>
        </form>}
      </section>
      <div className="mt-5 text-center"><Link href="/client-portal" className="text-sm font-semibold text-yellow-300">Already have an account? Sign in</Link></div>
    </div>
  </main>
}
