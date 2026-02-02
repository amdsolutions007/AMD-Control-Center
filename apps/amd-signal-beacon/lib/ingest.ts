// RSS Ingestion Engine - Fetches external news from trusted sources

export interface ExternalArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  guid: string;
}

const RSS_SOURCES = [
  {
    name: 'TechCabal',
    url: 'https://techcabal.com/feed/',
  },
  {
    name: 'TechPoint Africa',
    url: 'https://techpoint.africa/feed/',
  },
];

// Simple XML parser for RSS feeds
function parseRSSItem(item: string, source: string): ExternalArticle | null {
  try {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const guidMatch = item.match(/<guid.*?>(.*?)<\/guid>/);

    const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
    const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
    const link = (linkMatch?.[1] || '').trim();
    const pubDate = (pubDateMatch?.[1] || new Date().toISOString()).trim();
    const guid = (guidMatch?.[1] || link).trim();

    if (!title || !link) return null;

    return {
      title,
      description: stripHtml(description),
      link,
      pubDate,
      source,
      guid,
    };
  } catch (error) {
    console.error(`Parse error for ${source}:`, error);
    return null;
  }
}

// Strip HTML tags from content
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Fetch and parse RSS feed
async function fetchRSSFeed(url: string, source: string): Promise<ExternalArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AMDSignalBeacon/1.0; +https://amdsolutions007.com)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${source}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    
    // Split by <item> tags
    const items = xml.split(/<item>/).slice(1); // Skip first split (header)
    
    const articles: ExternalArticle[] = [];
    for (const item of items.slice(0, 15)) { // Max 15 items per source
      const article = parseRSSItem(item, source);
      if (article) {
        articles.push(article);
      }
    }

    console.log(`✓ Fetched ${articles.length} articles from ${source}`);
    return articles;
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);
    return [];
  }
}

// Main ingestion function
export async function ingestExternalNews(): Promise<ExternalArticle[]> {
  console.log('📡 Starting RSS ingestion...');
  
  const allArticles: ExternalArticle[] = [];

  // Fetch all sources in parallel
  const results = await Promise.all(
    RSS_SOURCES.map(source => fetchRSSFeed(source.url, source.name))
  );

  // Flatten results
  for (const articles of results) {
    allArticles.push(...articles);
  }

  console.log(`✓ Total articles ingested: ${allArticles.length}`);
  return allArticles;
}

// Calculate freshness (articles from last 48 hours only)
export function filterFreshArticles(articles: ExternalArticle[]): ExternalArticle[] {
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return articles.filter(article => {
    const pubDate = new Date(article.pubDate);
    return pubDate > fortyEightHoursAgo && pubDate <= now;
  });
}
