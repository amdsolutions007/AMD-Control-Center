import Link from 'next/link'
import { Footer } from '@/components/footer'

const services = [
  {
    title: 'Professional Business Websites',
    description: 'Responsive business websites, SEO-ready architecture, integrations and optional AI/customer tools.',
    cta: 'Request Website Quote',
  },
  {
    title: 'WhatsApp & Workflow Automation',
    description: 'Customer enquiry handling, workflow automation, lead routing and operational integrations.',
    cta: 'Request Automation Quote',
  },
  {
    title: 'Google Business Profile & Local Growth',
    description: 'Setup, optimization and verification assistance for eligible businesses with real local operations.',
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
            Pricing & Secure Payments
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
            Scope first. Quote clearly. Pay securely.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-yellow-100/65 sm:text-base">
            AMD Solutions 007 delivers professional technology services, not one-size-fits-all products.
            Bespoke work is scoped before payment so the amount you approve is the amount you are asked to pay.
          </p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const message = encodeURIComponent(`Hi AMD Solutions 007, I would like a quote for: ${service.title}`)
            return (
              <article key={service.title} className="rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6">
                <h2 className="text-xl font-bold text-yellow-300">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-yellow-100/60">{service.description}</p>
                <div className="mt-6 text-sm font-semibold text-yellow-100">Pricing: Custom quote</div>
                <a
                  href={`${whatsappBase}?text=${message}`}
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
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">How payment works</div>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-yellow-100/70">
              <li><strong className="text-yellow-200">1. Discuss scope.</strong> Tell us what you need and the outcome you want.</li>
              <li><strong className="text-yellow-200">2. Approve quote.</strong> AMD confirms deliverables, timeline and commercial terms.</li>
              <li><strong className="text-yellow-200">3. Receive invoice.</strong> Deposit, milestone or full-payment amount is issued to your account.</li>
              <li><strong className="text-yellow-200">4. Pay securely.</strong> Use the approved payment method attached to that invoice.</li>
              <li><strong className="text-yellow-200">5. Track progress.</strong> Invoice status and client activity stay associated with your portal account.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-black p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Already have an AMD invoice?</div>
            <h2 className="mt-3 text-2xl font-black text-yellow-200">Open your Client Portal</h2>
            <p className="mt-3 text-sm leading-6 text-yellow-100/65">
              Approved invoices, deposits and outstanding balances are shown only inside the authenticated Client Portal.
              This prevents amount mismatches and avoids anonymous public payment links for bespoke projects.
            </p>
            <Link
              href="/client-portal/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-yellow-500 bg-yellow-500/10 px-4 py-4 font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              View My Invoices →
            </Link>
            <p className="mt-4 text-xs leading-5 text-yellow-100/45">
              Nigeria: Paystack or bank transfer may be attached to an approved invoice. International payment methods are confirmed on the invoice.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm leading-6 text-emerald-100/80 sm:p-8">
          <strong className="text-emerald-300">Payment integrity rule:</strong> AMD does not ask a customer to pay a hard-coded public service amount for bespoke work.
          The payable amount must come from an approved quote or invoice.
        </section>
      </main>
      <Footer />
    </div>
  )
}
