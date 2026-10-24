export default function SiteFooter() {
  return (
    <footer className="border-t border-amd-gold/20 bg-black py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-lg font-bold text-amd-gold">AMD SIGNAL BEACON</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          A curated technology briefing surface from AMD Solutions 007. External articles remain the work of their original publishers and should be verified at source.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
          <a href="https://www.amdsolutions007.com/intelligence" className="text-gray-400 hover:text-amd-gold">Intelligence</a>
          <a href="https://www.amdsolutions007.com/portfolio" className="text-gray-400 hover:text-amd-gold">Portfolio</a>
          <a href="https://www.amdsolutions007.com/payment" className="text-gray-400 hover:text-amd-gold">Pricing & Payments</a>
          <a href="https://wa.me/2348180021007" className="text-gray-400 hover:text-amd-gold">Contact</a>
        </div>
        <p className="mt-6 text-xs text-gray-600">© 2026 AMD Solutions 007.</p>
      </div>
    </footer>
  )
}
