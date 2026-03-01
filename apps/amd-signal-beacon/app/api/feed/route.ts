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
// revalidate removed — ONE-PER-HOUR LAW uses Cache-Control: public, s-maxage=3600
// on the response so Vercel's CDN edge caches the single item for a full clock-hour.

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
    
    // Use cache (TTL = 1 hour) to stay well within Leke Leke's 30s cURL deadline
    const forceFresh = false;
    
    if (!forceFresh && externalNewsCache && (now - externalNewsCache.timestamp) < CACHE_TTL) {
      console.log('✓ Using cached external news');
      externalArticles = externalNewsCache.articles;
    } else {
      console.log('📡 Fetching fresh external news...');
      const rawArticles = await ingestExternalNews();
      const freshArticles = filterFreshArticles(rawArticles);
      const filteredArticles = filterArticles(freshArticles);
      
      // AI graphics disabled — each image adds 5s delay → easily exceeds 30s cURL timeout
      // Re-enable only for offline batch runs, never for live feed endpoint.
      const enableGraphics = false;
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

    // Step 4: ONE-PER-HOUR LAW — drip-feed the single most relevant item for this clock hour.
    //
    // WHY: LekeeLekee polls the RSS endpoint multiple times per hour.
    //   • Old behaviour (20 items/poll × N polls/hour) → 311+ imports/hour — SPAM VIOLATION.
    //   • New behaviour: same GUID + same pubDate for the entire hour → LekeeLekee de-dupes,
    //     imports exactly 1 item, and Cache-Control prevents redundant polls.
    //
    // ROTATION: hourIndex advances every real clock-hour, cycling through all content
    //   indefinitely so the feed stays fresh day after day with zero manual input.
    //
    // NOTE: mixedContent.slice(0,20) cap is RETAINED as the source pool for the rotation
    //   to stay well within the 30s cURL deadline when the cache is cold.
    const sourcePool = mixedContent.slice(0, 20);
    const hourIndex = Math.floor(Date.now() / (1000 * 60 * 60)); // advances every hour
    const hourlyItem = sourcePool[hourIndex % sourcePool.length];

    // Lock the pubDate to the START of the current clock-hour so the GUID+date is
    // identical on every poll within the same hour — LekeeLekee will not re-import it.
    const hourStart = new Date(hourIndex * 60 * 60 * 1000);
    const lockedItem: typeof hourlyItem = {
      ...hourlyItem,
      publishTime: hourStart.toISOString(),  // MixedPost.publishTime is string
    };

    const rssItems = [lockedItem].map(mixed => ({
      post: {
        id: mixed.id,
        title: mixed.title,
        content: mixed.content,
        publishTime: mixed.publishTime,
        tags: mixed.tags,
        footerType: 'default' as const,
      },
      content: mixed.content,
      imageUrl: (mixed as any).imageUrl,
    }));

    // Step 5: Generate RSS XML with image enclosures
    const rssXml = generateRSSFeed(rssItems);

    const duration = Date.now() - startTime;
    const cacheStats = getCacheStats();
    const imagesWithGraphics = rssItems.filter(item => item.imageUrl).length;

    console.log(`✓ RSS generated in ${duration}ms`);
    console.log(`🕐 ONE-PER-HOUR LAW: serving slot ${hourIndex % sourcePool.length + 1}/${sourcePool.length} — pubDate locked to ${hourStart.toISOString()}`);
    console.log(`📊 Image cache: ${cacheStats.active} active, ${cacheStats.expired} expired`);
    console.log(`🎨 Posts with AI graphics: ${imagesWithGraphics}/${rssItems.length}`);

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // ONE-PER-HOUR LAW: cache this response for a full clock-hour.
        // Vercel CDN + LekeeLekee's poller both honour max-age=3600.
        // Result: at most 1 new import per hour regardless of poll frequency.
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Total-Posts': stats.total.toString(),
        'X-Manual-Posts': stats.manual.toString(),
        'X-External-Posts': stats.external.toString(),
        'X-Mix-Ratio': `${stats.manualPercent}% manual / ${stats.externalPercent}% external`,
        'X-AI-Graphics': `${imagesWithGraphics}/${rssItems.length}`,
        'X-Cache-Stats': `${cacheStats.active} active, ${cacheStats.expired} expired`,
        'X-Feed-Law': '1-item-per-hour drip feed',
        'X-Hour-Slot': `${hourIndex % sourcePool.length + 1}/${sourcePool.length}`,
        'X-Hour-Start': hourStart.toISOString(),
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
