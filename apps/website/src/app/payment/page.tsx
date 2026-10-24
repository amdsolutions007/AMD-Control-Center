import Link from 'next/link'
import { Footer } from '@/components/footer'

const services = [
  {
    title: 'Professional Business Websites',
    description: 'Responsive business websites, SEO-ready architecture, integrations and optional customer-facing tools.',
    cta: 'Request Website Quote',
  },
  {
    title: 'WhatsApp & Workflow Automation',
    description: 'Customer-enquiry handling, workflow automation, lead routing and operational integrations.',
    cta: 'Request Automation Quote',
  },
  {
    title: 'Google Business Profile & Local Growth',
    description: 'Setup, optimization and verification assistance for eligible businesses with genuine local operations.',
    cta: 'Request Local Growth Quote',
  },
]

export default function PaymentPage() {
  const whatsappBase = 'https://wa.me/2348180021007'

  return (
    <div className="min-h-screen bg-[#020305] text-white">
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Pricing, Quotes & Approved Payments
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
            Scope first. Quote clearly. Pay only an approved invoice.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            AMD Solutions 007 delivers professional technology services rather than one-size-fits-all products.
            Bespoke work is scoped before payment so the commercial terms are agreed before an invoice is issued.
          </p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const message = encodeURIComponent(`Hi AMD Solutions 007, I would like a quote for: ${service.title}`)
            return (
              <article key={service.title} className="rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6">
                <h2 className="text-xl font-bold text-yellow-300">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-yellow-100/60">{service.description}</p>
                <div className="mt-6 text-sm font-semibold text-yellow-100">Pricing: Custom quote after scope review</div>
                <a
                  href={`${whatsappBase}?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 font-black text-black"
                >
                  {service.cta}
                </a>
              </article>
            )
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/25 bg-black/70 p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">How AMD commercial work proceeds</div>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-yellow-100/70">
              <li><strong className="text-yellow-200">1. Discuss scope.</strong> Define the problem, desired outcome and operating context.</li>
              <li><strong className="text-yellow-200">2. Approve quote.</strong> Review deliverables, amount, currency, timing and commercial terms.</li>
              <li><strong className="text-yellow-200">3. Receive invoice.</strong> AMD issues the agreed deposit, milestone or full-payment request.</li>
              <li><strong className="text-yellow-200">4. Use the approved payment method.</strong> The invoice or authenticated client account identifies the correct payment route.</li>
              <li><strong className="text-yellow-200">5. Track the balance.</strong> Issued invoices can show the total, amount paid and outstanding balance in the Client Portal.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Already have an AMD invoice?</div>
            <h2 className="mt-3 text-2xl font-black text-yellow-200">Open your Client Portal</h2>
            <p className="mt-3 text-sm leading-6 text-yellow-100/65">
              Approved invoices, deposits and outstanding balances are associated with the authenticated customer account.
              This avoids anonymous public checkout amounts for bespoke projects.
            </p>
            <Link
              href="/client-portal/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-yellow-500 bg-yellow-500/10 px-4 py-4 font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              View My Invoices →
            </Link>
            <p className="mt-4 text-xs leading-5 text-yellow-100/45">
              Approved payment methods are stated on the specific invoice or payment instruction. This public page does not collect card or bank credentials.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="text-sm font-bold text-emerald-300">No anonymous bespoke checkout</div>
            <p className="mt-2 text-sm leading-6 text-emerald-100/65">A visitor cannot choose an arbitrary public amount and treat it as an approved project payment.</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="text-sm font-bold text-emerald-300">One commercial source</div>
            <p className="mt-2 text-sm leading-6 text-emerald-100/65">The quote or invoice is the authoritative source for the approved amount, currency and payment terms.</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="text-sm font-bold text-emerald-300">No card details on this page</div>
            <p className="mt-2 text-sm leading-6 text-emerald-100/65">Payment credentials are not entered into this public AMD pricing page.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
