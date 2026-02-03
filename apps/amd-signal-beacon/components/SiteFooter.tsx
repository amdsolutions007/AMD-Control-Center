export default function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(250,204,21,0.08)] bg-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2025 AMD Media Solutions.
            </p>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Built with AI. Shipped with Speed. 🚀
            </p>
          </div>

          {/* Tech Stack */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs bg-[rgba(250,204,21,0.1)] text-[#facc15] border border-[rgba(250,204,21,0.2)] rounded-full">
              Python
            </span>
            <span className="px-3 py-1 text-xs bg-[rgba(250,204,21,0.1)] text-[#facc15] border border-[rgba(250,204,21,0.2)] rounded-full">
              Next.js
            </span>
            <span className="px-3 py-1 text-xs bg-[rgba(250,204,21,0.1)] text-[#facc15] border border-[rgba(250,204,21,0.2)] rounded-full">
              AI/ML
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
