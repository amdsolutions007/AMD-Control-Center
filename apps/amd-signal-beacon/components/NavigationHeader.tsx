import Link from 'next/link';

export default function NavigationHeader() {
  return (
    <header className="border-b border-[rgba(250,204,21,0.08)] bg-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="https://www.amdsolutions007.com" className="flex items-center gap-3">
            <div className="text-xl font-bold">
              <span className="text-[#facc15]">AMD SOLUTIONS</span>
              <span className="text-white ml-2">007</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="https://www.amdsolutions007.com#about" className="text-gray-300 hover:text-[#facc15] transition-colors">
              About
            </a>
            <a href="https://www.amdsolutions007.com#ecosystem" className="text-gray-300 hover:text-[#facc15] transition-colors">
              Ecosystem
            </a>
            <a href="https://www.amdsolutions007.com#intelligence" className="text-[#facc15]">
              Intelligence
            </a>
            <a href="https://www.amdsolutions007.com#media" className="text-gray-300 hover:text-[#facc15] transition-colors">
              Media
            </a>
            <a href="https://www.amdsolutions007.com#socials" className="text-gray-300 hover:text-[#facc15] transition-colors">
              Socials
            </a>
            <a href="https://www.amdsolutions007.com#portfolio" className="text-gray-300 hover:text-[#facc15] transition-colors">
              Portfolio
            </a>
            <a href="https://www.amdsolutions007.com#services" className="text-gray-300 hover:text-[#facc15] transition-colors">
              Services
            </a>
            <a 
              href="https://www.amdsolutions007.com/portal" 
              className="px-4 py-2 border border-[#facc15] text-[#facc15] rounded-md hover:bg-[#facc15] hover:text-black transition-all"
            >
              Client Portal
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#facc15]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
