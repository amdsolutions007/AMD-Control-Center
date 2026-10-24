import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createMIAuthServerClient } from '@/lib/supabase/mi-server'

const card =
  'rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-black via-yellow-900/10 to-black backdrop-blur-xl'

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(amount)
}

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

  const { data: invoices } = await supabase
    .from('client_invoices')
    .select('id, invoice_number, title, currency, amount, amount_paid, status, due_date, payment_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16">
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
            <button type="submit" className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200">
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
              Your portal session and client data are protected by Supabase Auth and Row Level Security.
            </div>
          </section>
        </div>

        <section className={`${card} p-6`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-yellow-100/50">Billing</div>
              <h2 className="mt-2 text-2xl font-bold text-yellow-300">Invoices & Payments</h2>
            </div>
            <Link href="/payment" className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200">
              Request a new quote
            </Link>
          </div>

          {!invoices || invoices.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5 text-sm leading-6 text-yellow-100/60">
              No invoices have been issued to this account yet. Once AMD approves a quote, your deposit, milestone or balance invoice will appear here.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {invoices.map((invoice) => {
                const amount = Number(invoice.amount)
                const paid = Number(invoice.amount_paid)
                const balance = Math.max(0, amount - paid)
                return (
                  <article key={invoice.id} className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-yellow-100/45">{invoice.invoice_number}</div>
                        <h3 className="mt-1 text-lg font-bold text-yellow-200">{invoice.title}</h3>
                        <div className="mt-2 text-sm text-yellow-100/55">
                          Status: <span className="font-semibold text-yellow-100">{invoice.status.replace('_', ' ')}</span>
                          {invoice.due_date ? ` · Due ${invoice.due_date}` : ''}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-black text-yellow-100">{formatMoney(balance, invoice.currency)}</div>
                        <div className="text-xs text-yellow-100/45">Outstanding balance</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl bg-white/[0.03] p-3">Invoice total: {formatMoney(amount, invoice.currency)}</div>
                      <div className="rounded-xl bg-white/[0.03] p-3">Paid: {formatMoney(paid, invoice.currency)}</div>
                    </div>

                    {invoice.payment_url && balance > 0 && (
                      <a href={invoice.payment_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 font-black text-black">
                        Pay Approved Invoice →
                      </a>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className={`${card} p-6`}>
          <h2 className="text-xl font-semibold text-yellow-300">Need help?</h2>
          <p className="mt-3 text-sm leading-6 text-yellow-100/70">
            Contact AMD if you need a new quote, invoice adjustment, project clarification or payment support.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-yellow-200">Return to website</Link>
            <a href="https://wa.me/2348180021007" className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black">Contact AMD</a>
          </div>
        </section>
      </div>
    </main>
  )
}
