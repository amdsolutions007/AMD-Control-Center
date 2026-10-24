import Link from 'next/link'

const links = [
  { href: 'https://www.amdsolutions007.com/about', label: 'About' },
  { href: 'https://www.amdsolutions007.com/#ecosystem', label: 'Ecosystem' },
  { href: 'https://www.amdsolutions007.com/intelligence', label: 'Intelligence' },
  { href: 'https://www.amdsolutions007.com/media', label: 'Media' },
  { href: 'https://www.amdsolutions007.com/links', label: 'Socials' },
  { href: 'https://www.amdsolutions007.com/portfolio', label: 'Portfolio' },
  { href: 'https://www.amdsolutions007.com/payment', label: 'Pricing & Payments' },
]

export default function NavigationHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-amd-gold/20 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="https://www.amdsolutions007.com" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amd-gold/60 text-lg">🌍</div>
          <div className="truncate text-sm font-bold text-amd-gold sm:text-lg">AMD SOLUTIONS 007</div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-300 transition hover:text-amd-gold">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="https://www.amdsolutions007.com/client-portal"
          className="shrink-0 rounded-lg border border-amd-gold/60 px-3 py-2 text-xs font-bold text-amd-gold sm:text-sm"
        >
          Client Portal
        </a>
      </div>
    </header>
  )
}
