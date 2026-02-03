import { Metadata } from 'next';
import { getArticleBySlug, getRelatedArticles } from '@/lib/article-fetcher';
import { notFound } from 'next/navigation';
import ArticleHero from '@/components/ArticleHero';
import ArticleContent from '@/components/ArticleContent';
import WhatsAppShareButton from '@/components/WhatsAppShareButton';
import AMDCTABox from '@/components/AMDCTABox';
import RelatedArticles from '@/components/RelatedArticles';
import NavigationHeader from '@/components/NavigationHeader';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} | AMD Intelligence Brief`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(params.slug, 3);

  return (
    <div className="min-h-screen bg-black">
      <NavigationHeader />
      
      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <ArticleHero 
          title={article.title}
          imageUrl={article.imageUrl}
          source={article.source}
          publishedAt={article.publishedAt}
          categories={article.categories}
        />

        <ArticleContent content={article.content} />

        {/* Source Attribution */}
        <div className="mt-8 p-6 border border-[rgba(250,204,21,0.2)] rounded-lg bg-[rgba(250,204,21,0.05)]">
          <p className="text-sm text-gray-400 mb-3">📰 Original Source</p>
          <a 
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#facc15] hover:text-[#fde047] transition-colors"
          >
            Read full article on {article.source} →
          </a>
        </div>

        {/* WhatsApp Share Button - Sticky/Floating */}
        <WhatsAppShareButton 
          title={article.title}
          url={`https://www.amdsolutions007.com/signal/${article.id}`}
        />

        {/* AMD CTA - Join War Room */}
        <AMDCTABox />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
