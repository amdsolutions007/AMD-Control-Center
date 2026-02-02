import { NextResponse } from 'next/server';
import { getPublishedPosts, buildPostContent, type Post, type Footers } from '@/lib/content-mixer';
import { generateRSSFeed } from '@/lib/rss-generator';

// Import data files
import postsData from '@/data/posts.json';
import hooksData from '@/data/hooks.json';
import footersData from '@/data/footers.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Type cast the imported data
    const posts = postsData as Post[];
    const hooks = hooksData as string[];
    const footers = footersData as Footers;

    // Filter posts that should be published (time-gated)
    const publishedPosts = getPublishedPosts(posts);

    if (publishedPosts.length === 0) {
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

    // Build processed content for each post
    const processedContent = publishedPosts.map(post =>
      buildPostContent(post, hooks, footers)
    );

    // Generate RSS XML
    const rssXml = generateRSSFeed(publishedPosts, processedContent);

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Total-Posts': publishedPosts.length.toString(),
        'X-Generated-At': new Date().toISOString(),
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
