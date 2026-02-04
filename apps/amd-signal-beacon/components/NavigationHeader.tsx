import Link from 'next/link';

export default function NavigationHeader() {
  return (
    <header className="border-b border-[rgba(255,215,0,0.2)] bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Icon */}
          <Link href="https://www.amdsolutions007.com" className="flex items-center gap-3 group">
            {/* Gold Circle Icon */}
            <div className="w-10 h-10 rounded-full border-2 border-[#FFD700] flex items-center justify-center group-hover:bg-[#FFD700] transition-all">
              <span className="text-[#FFD700] group-hover:text-black text-xl font-bold">🌍</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-[#FFD700]">AMD SOLUTIONS</span>
              <span className="text-white ml-2">007</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="https://www.amdsolutions007.com#about" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              About
            </a>
            <a href="https://www.amdsolutions007.com#ecosystem" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              Ecosystem
            </a>
            <a href="https://www.amdsolutions007.com#intelligence" className="text-[#FFD700] font-semibold">
              Intelligence
            </a>
            <a href="https://www.amdsolutions007.com#media" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              Media
            </a>
            <a href="https://www.amdsolutions007.com#socials" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              Socials
            </a>
            <a href="https://www.amdsolutions007.com#portfolio" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              Portfolio
            </a>
            <a href="https://www.amdsolutions007.com#services" className="text-gray-300 hover:text-[#FFD700] transition-colors">
              Services
            </a>
            <a 
              href="https://www.amdsolutions007.com/portal" 
              className="px-4 py-2 border-2 border-[#FFD700] text-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-black transition-all font-semibold"
            >
              Client Portal
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#FFD700] hover:text-[#FFED4E] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
