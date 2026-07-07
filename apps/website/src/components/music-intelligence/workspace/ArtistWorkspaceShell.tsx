'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: '/music-intelligence/account', label: 'Dashboard', exact: true },
  { href: '/music-intelligence/account/profile', label: 'Artist Profile' },
  { href: '/music-intelligence/account/submissions', label: 'Submit Music' },
  { href: '/music-intelligence/account/submissions/history', label: 'Submission History' },
];

export default function ArtistWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#05050e] text-gray-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(0,229,255,0.1)_0%,_rgba(124,58,237,0.14)_40%,_transparent_75%)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/sl/pYP56C"
            className="rounded-full border border-[#7c3aed]/50 bg-[#050512]/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00E5FF] transition hover:border-[#00E5FF]"
          >
            ← Smart Link
          </Link>
          <span className="rounded-full border border-[#D4AF37]/45 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">
            Artist Command Center
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav
            aria-label="Artist workspace navigation"
            className="rounded-2xl border border-[#7c3aed]/40 bg-[#050512]/90 p-3 h-fit"
          >
            <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
              Workspace
            </p>
            <ul className="space-y-1">
              {NAV.map(({ href, label, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                        active
                          ? 'bg-gradient-to-r from-[#7c3aed]/40 to-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 px-1">
              <ComingSoonCard label="AI Intelligence" />
              <ComingSoonCard label="Analytics" />
            </div>
          </nav>

          <div
            className="rounded-3xl border border-[#7c3aed]/45 p-6 sm:p-8"
            style={{
              background: 'rgba(5,5,18,0.94)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 0 48px rgba(124,58,237,0.18)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

function ComingSoonCard({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#050512]/60 px-3 py-2 opacity-70">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <span className="mt-1 inline-block text-[8px] font-black uppercase tracking-wider text-gray-500">
        Coming Soon
      </span>
    </div>
  );
}
