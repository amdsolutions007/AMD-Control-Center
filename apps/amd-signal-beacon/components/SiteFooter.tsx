export default function SiteFooter() {
  return (
    <footer className="border-t border-amd-gold border-opacity-20 bg-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          {/* 007 Branding */}
          <div className="text-center">
            <p className="text-amd-gold text-lg font-bold mb-2">🎖️ AMD SOLUTIONS 007</p>
            <p className="text-gray-400 text-sm mb-1">🤖 Intelligence powered by OpenAI GPT-4 + DALL-E 3</p>
            <p className="text-gray-400 text-sm">🌍 Illuminating the Digital Dark Since 2011</p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="https://www.amdsolutions007.com#about" className="text-gray-400 hover:text-amd-gold transition-colors">About</a>
            <a href="https://www.amdsolutions007.com#ecosystem" className="text-gray-400 hover:text-amd-gold transition-colors">Ecosystem</a>
            <a href="https://www.amdsolutions007.com#portfolio" className="text-gray-400 hover:text-amd-gold transition-colors">Portfolio</a>
            <a href="https://wa.me/2348180021007" className="text-gray-400 hover:text-amd-gold transition-colors">Contact</a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-amd-gold/1 my-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            © 2026 AMD Solutions 007.
          </p>

          {/* Tagline */}
          <p className="text-gray-400 text-sm">
            Built with AI. Shipped with Speed. 🚀
          </p>

          {/* Tech Stack */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs bg-transparent text-amd-gold border border-amd-gold rounded-full hover:bg-amd-gold hover:text-black transition-all">
              Python
            </span>
            <span className="px-3 py-1 text-xs bg-transparent text-amd-gold border border-amd-gold rounded-full hover:bg-amd-gold hover:text-black transition-all">
              Next.js
            </span>
            <span className="px-3 py-1 text-xs bg-transparent text-amd-gold border border-amd-gold rounded-full hover:bg-amd-gold hover:text-black transition-all">
              AI/ML
            </span>
          </div>
        </div>

        {/* License Notice */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">Licensed to Build • 007 Protocol Compliant</p>
        </div>
      </div>
    </footer>
  );
}
