'use client';

import Link from 'next/link';

const SOCIAL_PROVIDERS = [
  { id: 'google', label: 'Google', icon: 'G', color: '#EA4335' },
  { id: 'apple', label: 'Apple', icon: '', color: '#E8E8E8' },
  { id: 'microsoft', label: 'Microsoft', icon: '⊞', color: '#00A4EF' },
  { id: 'github', label: 'GitHub', icon: '⎇', color: '#E8E8E8' },
] as const;

export default function SocialAuthComingSoon() {
  return (
    <div className="mt-6">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
        Or continue with
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SOCIAL_PROVIDERS.map(({ id, label, icon, color }) => (
          <div
            key={id}
            role="group"
            aria-label={`${label} sign-in — Coming Soon`}
            className="relative flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-[#050512]/80 px-2 py-3 opacity-70 cursor-not-allowed"
          >
            <span style={{ color, fontSize: '18px' }} aria-hidden>{icon || ''}</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{label}</span>
            <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[8px] font-black uppercase text-gray-500">
              Coming Soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Secure Access</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthFooterLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <p className="mt-6 text-center text-sm text-gray-400">
      {links.map((link, i) => (
        <span key={link.href}>
          {i > 0 && ' · '}
          <Link href={link.href} className="text-[#00E5FF] hover:underline font-semibold">
            {link.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
