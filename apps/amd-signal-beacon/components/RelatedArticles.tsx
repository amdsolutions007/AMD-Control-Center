import Link from 'next/link';
import Image from 'next/image';
import { ArticleData } from '@/lib/article-fetcher';

interface RelatedArticlesProps {
  articles: ArticleData[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-16 pt-16 border-t border-[rgba(250,204,21,0.1)]">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-[#facc15]">📚</span>
        <span>Related Intelligence</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(article => (
          <Link
            key={article.id}
            href={`/signal/${article.id}`}
            className="group p-6 border border-[rgba(250,204,21,0.15)] rounded-lg bg-[rgba(250,204,21,0.03)] hover:border-[#facc15] hover:bg-[rgba(250,204,21,0.08)] transition-all hover:transform hover:scale-105"
          >
            {/* Thumbnail */}
            {article.imageUrl && (
              <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-white group-hover:text-[#facc15] transition-colors mb-2 line-clamp-2">
              {article.title}
            </h3>

            {/* Source */}
            <p className="text-sm text-gray-400 mb-3">
              📰 Via {article.source}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {article.categories.slice(0, 2).map(category => (
                <span
                  key={category}
                  className="px-2 py-1 text-xs bg-[rgba(148,163,184,0.1)] border border-[rgba(148,163,184,0.2)] rounded-full text-gray-400"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Read More Arrow */}
            <div className="mt-4 text-[#facc15] text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              <span>Read Brief</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
