import { getAllArticles } from '@/lib/article-fetcher';
import NavigationHeader from '@/components/NavigationHeader';
import SiteFooter from '@/components/SiteFooter';
import AMDAgent007 from '@/components/AMDAgent007';
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

      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-amd-gold/1">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amd-gold via-amd-gold-light to-amd-gold bg-clip-text text-transparent">
            LATEST INTEL FROM THE 37 STATES
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Real-time Tech Intelligence. AI-Powered Analysis. Daily Briefs for African Builders.
          </p>

          {/* War Room CTA - Top */}
          <a
            href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-amd-gold text-black font-bold text-lg rounded-lg shadow-2xl hover:bg-amd-gold-light hover:scale-105 transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Join War Room</span>
          </a>

          {/* Stats Bar */}
          <div className="mt-12 flex items-center justify-center gap-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-amd-gold text-2xl font-bold">{articles.length}</span>
              <span>Intel Briefs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amd-gold text-2xl font-bold">37</span>
              <span>States Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amd-gold text-2xl font-bold">Daily</span>
              <span>Updates</span>
            </div>
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
                className="group relative bg-black border border-amd-gold rounded-lg overflow-hidden hover:border-amd-gold-light hover:shadow-2xl hover:shadow-amd-gold/3 transition-all duration-300"
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
                    <span className="px-2 py-1 bg-amd-gold/1 border border-amd-gold/3 rounded text-amd-gold">
                      {article.source}
                    </span>
                    {article.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2 py-1 bg-[rgba(148,163,184,0.1)] border border-[rgba(148,163,184,0.2)] rounded text-gray-400">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amd-gold/1 border border-amd-gold text-amd-gold rounded hover:bg-amd-gold hover:text-black transition-all font-semibold text-sm"
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

      {/* Bottom War Room CTA */}
      <section className="py-16 px-6 border-t border-amd-gold/1">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 127+ builders in the War Room. Daily intel at 8 AM WAT.
          </p>
          <a
            href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-amd-gold text-black font-bold text-lg rounded-lg shadow-2xl hover:bg-amd-gold-light hover:scale-105 transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Join AMD HQ Now</span>
          </a>
        </div>
      </section>

      <SiteFooter />
      <AMDAgent007 />
    </div>
  );
}
