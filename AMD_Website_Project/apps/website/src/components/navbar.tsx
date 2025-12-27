import Link from 'next/link'

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-gold-500 shadow-[0_0_18px_rgba(212,175,55,0.35)]" />
          <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white">
            AMD AI NEXUS
          </Link>
        </div>

        <div className="hidden items-center gap-7 md:flex">
          <Link href="/#ecosystem" className="text-sm text-white/70 hover:text-white">
            Ecosystem
          </Link>
          <Link href="/intelligence" className="text-sm text-white/70 hover:text-white">
            Intelligence
          </Link>
          <Link href="/media" className="text-sm text-white/70 hover:text-white">
            Media
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Client Portal
          </Link>
        </div>
      </nav>
    </header>
  )
}
