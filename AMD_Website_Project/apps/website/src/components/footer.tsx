import Link from 'next/link'
import { formatUsBillingAddress, getBillingProfile, getSocialLinks } from '@/lib/config'

export async function Footer() {
  const social = await getSocialLinks()
  const billing = await getBillingProfile()

  const name = social.empire_identity?.name ?? 'AMD Media Solutions'
  const slogan = social.empire_identity?.slogan ?? 'Illuminating the Digital Dark'

  const email = social.contact_channels?.official_email ?? ''
  const phone = social.contact_channels?.official_phone ?? ''
  const website = social.contact_channels?.website ?? ''

  const billingAddress = formatUsBillingAddress(billing)

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold tracking-[0.18em]">{name}</div>
            <div className="mt-3 text-white/70">{slogan}</div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Contact</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              {email ? <div>Email: {email}</div> : null}
              {phone ? <div>Phone: {phone}</div> : null}
              {website ? (
                <div>
                  Website:{' '}
                  <a className="underline decoration-white/20 underline-offset-4" href={website}>
                    {website}
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Billing (US)</div>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              {billingAddress || 'Not configured'}
            </pre>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <div>© {new Date().getFullYear()} {name}. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link className="hover:text-white" href="/intelligence">
              Intelligence
            </Link>
            <Link className="hover:text-white" href="/media">
              Media
            </Link>
            <Link className="hover:text-white" href="/portal">
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
