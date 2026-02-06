import Link from 'next/link';

export default function NavigationHeader() {
  return (
    <header className="border-b border-amd-gold border-opacity-20 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Icon */}
          <Link href="https://www.amdsolutions007.com" className="flex items-center gap-3 group">
            {/* Gold Circle Icon */}
            <div className="w-10 h-10 rounded-full border-2 border-amd-gold flex items-center justify-center group-hover:bg-amd-gold transition-all">
              <span className="text-amd-gold group-hover:text-black text-xl font-bold">🌍</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-amd-gold">AMD SOLUTIONS</span>
              <span className="text-white ml-2">007</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="https://www.amdsolutions007.com#about" className="text-gray-300 hover:text-amd-gold transition-colors">
              About
            </a>
            <a href="https://www.amdsolutions007.com#ecosystem" className="text-gray-300 hover:text-amd-gold transition-colors">
              Ecosystem
            </a>
            <a href="https://www.amdsolutions007.com#intelligence" className="text-amd-gold font-semibold">
              Intelligence
            </a>
            <a href="https://www.amdsolutions007.com#media" className="text-gray-300 hover:text-amd-gold transition-colors">
              Media
            </a>
            <a href="https://www.amdsolutions007.com#socials" className="text-gray-300 hover:text-amd-gold transition-colors">
              Socials
            </a>
            <a href="https://www.amdsolutions007.com#portfolio" className="text-gray-300 hover:text-amd-gold transition-colors">
              Portfolio
            </a>
            <a href="https://www.amdsolutions007.com#services" className="text-gray-300 hover:text-amd-gold transition-colors">
              Services
            </a>
            <a 
              href="https://www.amdsolutions007.com/portal" 
              className="px-4 py-2 border-2 border-amd-gold text-amd-gold rounded-lg hover:bg-amd-gold hover:text-black transition-all font-semibold"
            >
              Client Portal
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-amd-gold hover:text-amd-gold-light transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
