'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMIAuthClient } from '@/lib/supabase/mi-browser'

export default function ClientPortalResetPasswordPage(){
 const router=useRouter();const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('')
  if(password.length<8){setError('Password must be at least 8 characters.');return}
  if(password!==confirm){setError('Passwords do not match.');return}
  const supabase=createMIAuthClient();if(!supabase){setError('Authentication is not configured.');return}
  setLoading(true);const {error:updateError}=await supabase.auth.updateUser({password});setLoading(false)
  if(updateError){setError(updateError.message);return}
  await supabase.auth.signOut();router.replace('/client-portal');router.refresh()
 }
 return <main className="min-h-screen bg-[#020305] px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32"><div className="mx-auto max-w-xl"><div className="mb-7 text-center"><h1 className="text-4xl font-black text-yellow-300">Reset Password</h1><p className="mt-3 text-yellow-100/60">Choose a new password for your AMD Client Portal account.</p></div><section className="rounded-[28px] border border-yellow-500/35 bg-black/80 p-5 sm:p-8"><form onSubmit={submit} className="space-y-4">{error&&<div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-200">{error}</div>}<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/><input required type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="w-full rounded-2xl border border-yellow-500/30 bg-[#080808] px-4 py-4 outline-none focus:border-yellow-400"/><button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-black text-black disabled:opacity-60">{loading?'UPDATING…':'UPDATE PASSWORD →'}</button></form></section><div className="mt-5 text-center"><Link href="/client-portal" className="text-sm font-semibold text-yellow-300">Back to sign in</Link></div></div></main>
}
