import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createMIAuthServerClient } from '@/lib/supabase/mi-server'

const card =
  'rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-black via-yellow-900/10 to-black backdrop-blur-xl'

export default async function ClientPortalDashboard() {
  const supabase = await createMIAuthServerClient()
  if (!supabase) redirect('/client-portal')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/client-portal')

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('display_name, company_name, status, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.status !== 'active') {
    await supabase.auth.signOut()
    redirect('/client-portal')
  }

  async function signOut() {
    'use server'
    const server = await createMIAuthServerClient()
    if (server) await server.auth.signOut()
    redirect('/client-portal')
  }

  const displayName = profile.display_name || user.email || 'AMD Client'
  const company = profile.company_name || 'AMD Client Account'

  return (
    <main className="min-h-screen bg-[#03060c] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300">
              VERIFIED CLIENT SESSION
            </span>
            <h1 className="mt-4 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 text-yellow-100/65">{company}</p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              Sign out
            </button>
          </form>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <section className={`${card} p-6`}>
            <div className="text-xs uppercase tracking-widest text-yellow-100/50">Account status</div>
            <div className="mt-2 text-2xl font-bold text-green-400">Active</div>
            <div className="mt-3 text-sm text-yellow-100/60">Role: {profile.role}</div>
          </section>

          <section className={`${card} p-6 md:col-span-2`}>
            <div className="text-xs uppercase tracking-widest text-yellow-100/50">Secure identity</div>
            <div className="mt-2 break-all text-lg font-semibold text-yellow-200">{user.email}</div>
            <div className="mt-3 text-sm text-yellow-100/60">
              This dashboard is now gated by a real Supabase Auth session and an active client profile.
            </div>
          </section>
        </div>

        <section className={`${card} p-6`}>
          <h2 className="text-xl font-semibold text-yellow-300">Client Workspace Foundation</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-yellow-100/70">
            Authentication and account isolation are active. Project tracking, secure documents, support requests,
            invoices and payments will be added as separate governed modules so customer data is never mixed with
            placeholder dashboard content.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-yellow-200 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              Return to website
            </Link>
            <a
              href="https://wa.me/2348180021007"
              className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:bg-yellow-400"
            >
              Contact AMD
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
