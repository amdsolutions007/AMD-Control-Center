import { ingestExternalNews, filterFreshArticles } from './ingest';
import { filterArticles } from './filter';
import { refineArticles, type RefinedArticle } from './refine';

export interface ArticleData {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  categories: string[];
}

// In-memory cache for articles
let articlesCache: {
  articles: ArticleData[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getArticleBySlug(slug: string): Promise<ArticleData | null> {
  const articles = await getAllArticles();
  return articles.find(a => a.id === slug) || null;
}

export async function getAllArticles(): Promise<ArticleData[]> {
  // Check cache
  if (articlesCache && Date.now() - articlesCache.timestamp < CACHE_TTL) {
    return articlesCache.articles;
  }

  // Fetch fresh articles
  const rawArticles = await ingestExternalNews();
  const freshArticles = filterFreshArticles(rawArticles);
  const dedupedArticles = filterArticles(freshArticles);
  const refinedArticles = await refineArticles(dedupedArticles, true); // Generate graphics

  // Transform to ArticleData format
  const articles: ArticleData[] = refinedArticles.map(article => ({
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    imageUrl: article.imageUrl,
    source: article.source,
    sourceUrl: article.sourceUrl,
    publishedAt: article.publishedAt,
    categories: article.categories
  }));

  // Update cache
  articlesCache = {
    articles,
    timestamp: Date.now()
  };

  return articles;
}

export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<ArticleData[]> {
  const allArticles = await getAllArticles();
  return allArticles
    .filter(a => a.id !== currentSlug)
    .slice(0, limit);
}
