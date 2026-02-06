import { getAllArticles } from '@/lib/article-fetcher';
import NavigationHeader from '@/components/NavigationHeader';
import SiteFooter from '@/components/SiteFooter';
import AMDAgent007 from '@/components/AMDAgent007';
import Agent007Badge from '@/components/Agent007Badge';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 12); // Show 12 latest

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationHeader />

      {/* Hero Section - Linktree Style */}
      <section className="relative py-20 px-6 border-b border-amd-gold/2">
        <div className="max-w-4xl mx-auto text-center">
          {/* Gold Logo Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-amd-gold flex items-center justify-center bg-black shadow-2xl shadow-amd-gold/3">
            <span className="text-5xl">📡</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-amd-gold">
            AMD SIGNAL BEACON
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-12">
            Illuminating the Digital Dark.
          </p>

          {/* Stats Cards - Linktree Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-black border-2 border-amd-gold rounded-lg p-6 hover:shadow-xl hover:shadow-amd-gold/2 transition-all">
              <div className="text-5xl font-bold text-amd-gold mb-2">{articles.length}</div>
              <div className="text-sm text-gray-400">Intel Briefs</div>
            </div>
            <div className="bg-black border-2 border-amd-gold rounded-lg p-6 hover:shadow-xl hover:shadow-amd-gold/2 transition-all">
              <div className="text-5xl font-bold text-amd-gold mb-2">36</div>
              <div className="text-sm text-gray-400">Nigerian States</div>
            </div>
            <div className="bg-black border-2 border-amd-gold rounded-lg p-6 hover:shadow-xl hover:shadow-amd-gold/2 transition-all">
              <div className="text-5xl font-bold text-amd-gold mb-2">Daily</div>
              <div className="text-sm text-gray-400">Updates</div>
            </div>
          </div>

          {/* Contact Email */}
          <div className="mb-8">
            <a href="mailto:ceo@amdsolutions007.com" className="inline-flex items-center gap-2 text-gray-400 hover:text-amd-gold transition-colors">
              <span>📧</span>
              <span className="text-sm">ceo@amdsolutions007.com</span>
            </a>
          </div>

          {/* Priority War Room CTA - Linktree Style */}
          <div className="relative inline-block w-full max-w-2xl mx-auto mb-6">
            <div className="absolute -top-2 -right-2 z-10">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">PRIORITY</span>
            </div>
            <a
              href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-black border-2 border-amd-gold text-white px-8 py-4 rounded-lg hover:bg-amd-gold hover:text-black transition-all font-semibold shadow-xl hover:shadow-2xl hover:shadow-amd-gold/3"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📞</span>
                <span>WhatsApp Hotline (Priority)</span>
              </div>
            </a>
          </div>

          {/* Leke Leke CTA */}
          <div className="mb-6 w-full max-w-2xl mx-auto">
            <a
              href="https://www.lekeelekee.com/@amd"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-black border-2 border-amd-gold text-white px-6 py-3 rounded-lg hover:bg-amd-gold hover:text-black transition-all font-semibold"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">✈️</span>
                <span>Join Telegram Intelligence</span>
              </div>
            </a>
          </div>

          {/* Latest Intel Heading */}
          <div className="mt-16 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-amd-gold mb-2">
              LATEST INTEL FROM THE 36 STATES
            </h2>
            <p className="text-gray-400">Real-time Tech Intelligence • AI-Powered Analysis • Daily Briefs</p>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <article 
                key={article.id}
                className="group relative bg-black border-2 border-amd-gold rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-amd-gold/3 transition-all duration-300"
              >
                {/* Image */}
                {article.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Source Badge */}
                  <div className="mb-3 flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-transparent border border-amd-gold rounded text-amd-gold">
                      {article.source}
                    </span>
                    {article.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2 py-1 bg-transparent border border-gray-600 rounded text-gray-400">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amd-gold transition-colors">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Read Button */}
                  <Link
                    href={`/signal/${article.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-amd-gold text-amd-gold rounded-lg hover:bg-amd-gold hover:text-black transition-all font-semibold text-sm"
                  >
                    <span>Read Brief</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <a
              href="/api/feed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-amd-gold text-amd-gold rounded-lg hover:bg-amd-gold hover:text-black transition-all font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              <span>Subscribe to RSS Feed</span>
            </a>
          </div>
        </div>
      </section>

      {/* Bottom War Room CTA - Enhanced */}
      <section className="py-16 px-6 border-t border-amd-gold/2">
        <div className="max-w-4xl mx-auto">
          {/* CTA Box - Linktree Style */}
          <div className="bg-gradient-to-br from-[rgba(218,165,32,0.1)] to-[rgba(0,0,0,0)] border-2 border-amd-gold rounded-lg p-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-amd-gold mb-4">
              ⚡ JOIN THE WAR ROOM
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              127+ Active Builders Across 36 States
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Daily Intel Briefs at 8:00 AM WAT • Real-time Opportunities • Built by Africans, FOR Africans
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amd-gold text-black font-bold text-lg rounded-lg shadow-2xl hover:bg-amd-gold-light hover:scale-105 transition-all"
              >
                <span>Join AMD HQ on WhatsApp →</span>
              </a>
              
              <a
                href="https://www.lekeelekee.com/@amd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-amd-gold text-amd-gold font-bold text-lg rounded-lg hover:bg-amd-gold hover:text-black transition-all"
              >
                <span>Follow @amd on Leke Leke →</span>
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              🔥 Built by Africans, FOR Africans • 🚀 No Algorithm Suppression
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
      <AMDAgent007 />
      <Agent007Badge />
    </div>
  );
}
