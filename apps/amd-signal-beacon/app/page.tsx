import { getAllArticles } from '@/lib/article-fetcher'
import NavigationHeader from '@/components/NavigationHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function Home() {
  const articles = await getAllArticles()
  const latestArticles = articles.slice(0, 12)

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationHeader />

      <section className="border-b border-amd-gold/20 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amd-gold/60 bg-amd-gold/5 text-4xl">📡</div>
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amd-gold">AMD Signal Beacon</div>
          <h1 className="text-4xl font-black text-amd-gold sm:text-5xl">Curated technology signals with source attribution.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-300 sm:text-lg">
            Signal Beacon collects and organizes selected technology, AI and African digital-economy briefings.
            It is a discovery surface, not a prediction engine or a substitute for checking the original source.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/api/feed" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-amd-gold px-5 py-3 font-bold text-black">Subscribe to RSS</a>
            <Link href="https://www.amdsolutions007.com/intelligence" className="rounded-xl border border-amd-gold/50 px-5 py-3 font-bold text-amd-gold">AMD Intelligence</Link>
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amd-gold/15 bg-amd-gold/[0.04] p-4 text-left text-sm leading-6 text-gray-400">
            <strong className="text-amd-gold">Evidence rule:</strong> article summaries are curated from attributed sources.
            Source accuracy, dates and material claims should be checked at the original publication before making a consequential decision.
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-amd-gold">Latest signals</div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Recent briefings from attributed sources</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400">
              {articles.length} briefing{articles.length === 1 ? '' : 's'} currently available in the feed.
            </p>
          </div>

          {latestArticles.length === 0 ? (
            <div className="rounded-2xl border border-amd-gold/20 bg-amd-gold/[0.03] p-8 text-center text-gray-400">
              No briefings are available right now. The feed will update when supported sources return new items.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-2xl border border-amd-gold/20 bg-gradient-to-br from-amd-gold/[0.04] to-black">
                  {article.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image src={article.imageUrl} alt="" fill loading="lazy" className="object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-amd-gold/30 px-2 py-1 text-amd-gold">{article.source}</span>
                      {article.categories.slice(0, 2).map((category) => (
                        <span key={category} className="rounded-full border border-gray-700 px-2 py-1 text-gray-400">{category}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold leading-6 text-white">{article.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{article.description}</p>
                    <Link href={`/signal/${article.id}`} className="mt-5 inline-flex items-center gap-2 font-bold text-amd-gold">Read briefing →</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-amd-gold/15 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-amd-gold/20 bg-amd-gold/[0.04] p-6 text-center sm:p-8">
          <h2 className="text-2xl font-black text-amd-gold">Need intelligence for a business decision?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            Signal Beacon is a discovery feed. For source-backed research, comparison or decision support, use the main AMD Intelligence service.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="https://www.amdsolutions007.com/intelligence" className="rounded-xl bg-amd-gold px-5 py-3 font-bold text-black">Open AMD Intelligence</Link>
            <a href="https://wa.me/2348180021007?text=Hi%20AMD%20Solutions%20007%2C%20I%27d%20like%20to%20discuss%20an%20intelligence%20project." target="_blank" rel="noopener noreferrer" className="rounded-xl border border-amd-gold/50 px-5 py-3 font-bold text-amd-gold">Discuss a Project</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
