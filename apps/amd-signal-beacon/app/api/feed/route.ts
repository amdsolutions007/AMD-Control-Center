import { NextResponse } from 'next/server';
import { getPublishedPosts, buildPostContent, type Post, type Footers } from '@/lib/content-mixer';
import { generateRSSFeed } from '@/lib/rss-generator';
import { ingestExternalNews, filterFreshArticles } from '@/lib/ingest';
import { filterArticles } from '@/lib/filter';
import { refineArticles, type RefinedArticle } from '@/lib/refine';
import { mixContent, getMixStats, type MixedPost } from '@/lib/mixer';
import { cleanupExpiredCache, getCacheStats } from '@/lib/image-cache';

// Import data files
import postsData from '@/data/posts.json';
import hooksData from '@/data/hooks.json';
import footersData from '@/data/footers.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache for external news (1 hour TTL)
let externalNewsCache: {
  articles: RefinedArticle[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Convert MixedPost to RSS-compatible format
function mixedToRSSItem(mixed: MixedPost) {
  return {
    title: mixed.title,
    description: mixed.content,
    url: mixed.link || 'https://amdsolutions007.com',
    guid: mixed.id,
    date: mixed.publishTime,
    categories: mixed.tags,
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 AMD News Refinery + AI Graphics Engine starting...');
    
    // Cleanup expired image cache
    cleanupExpiredCache();
    
    // Type cast the imported data
    const posts = postsData as Post[];
    const hooks = hooksData as string[];
    const footers = footersData as Footers;

    // Step 1: Get published manual posts (time-gated)
    const publishedPosts = getPublishedPosts(posts);
    console.log(`✓ Manual posts ready: ${publishedPosts.length}`);

    // Step 2: Get external news (with caching)
    let externalArticles = [];
    const now = Date.now();
    
    if (externalNewsCache && (now - externalNewsCache.timestamp) < CACHE_TTL) {
      console.log('✓ Using cached external news');
      externalArticles = externalNewsCache.articles;
    } else {
      console.log('📡 Fetching fresh external news...');
      const rawArticles = await ingestExternalNews();
      const freshArticles = filterFreshArticles(rawArticles);
      const filteredArticles = filterArticles(freshArticles);
      
      // Refine articles WITH graphics generation (async)
      // Note: Graphics generation is rate-limited (5 seconds per image)
      const enableGraphics = process.env.ENABLE_AI_GRAPHICS !== 'false'; // Default: enabled
      externalArticles = await refineArticles(filteredArticles, enableGraphics);
      
      // Update cache
      externalNewsCache = {
        articles: externalArticles,
        timestamp: now,
      };
      console.log(`✓ External news cached: ${externalArticles.length} articles`);
    }

    // Step 3: Mix manual + external content
    const mixedContent = mixContent(publishedPosts, externalArticles);
    
    // Generate stats
    const stats = getMixStats(mixedContent);
    
    if (mixedContent.length === 0) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>AMD Signal Beacon</title><description>No posts available yet</description></channel></rss>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // Step 4: Generate RSS items with images
    const rssItems = mixedContent.map(mixed => ({
      post: {
        id: mixed.id,
        title: mixed.title,
        content: mixed.content,
        publishTime: mixed.publishTime,
        tags: mixed.tags,
        footerType: 'default' as const,
      },
      content: mixed.content,
      imageUrl: (mixed as any).imageUrl, // Include AI-generated image if available
    }));

    // Step 5: Generate RSS XML with image enclosures
    const rssXml = generateRSSFeed(rssItems);

    const duration = Date.now() - startTime;
    const cacheStats = getCacheStats();
    const imagesWithGraphics = rssItems.filter(item => item.imageUrl).length;
    
    console.log(`✓ RSS generated in ${duration}ms`);
    console.log(`📊 Image cache: ${cacheStats.active} active, ${cacheStats.expired} expired`);
    console.log(`🎨 Posts with AI graphics: ${imagesWithGraphics}/${rssItems.length}`);

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Total-Posts': stats.total.toString(),
        'X-Manual-Posts': stats.manual.toString(),
        'X-External-Posts': stats.external.toString(),
        'X-Mix-Ratio': `${stats.manualPercent}% manual / ${stats.externalPercent}% external`,
        'X-AI-Graphics': `${imagesWithGraphics}/${rssItems.length}`,
        'X-Cache-Stats': `${cacheStats.active} active, ${cacheStats.expired} expired`,
        'X-Generated-At': new Date().toISOString(),
        'X-Generation-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>AMD Signal Beacon</title><description>Error generating feed</description></channel></rss>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );
  }
}
