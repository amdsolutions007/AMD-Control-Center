import RSS from 'rss';
import { Post } from './content-mixer';

interface RSSItem {
  post: Post;
  content: string;
  imageUrl?: string;
}

export function generateRSSFeed(items: RSSItem[]): string {
  const feed = new RSS({
    title: 'AMD Signal Beacon | Curated Technology Briefings',
    description: 'Curated technology, AI and African digital-economy briefings with source attribution from AMD Solutions 007.',
    feed_url: 'https://amd-signal-beacon.vercel.app/api/feed',
    site_url: 'https://amd-signal-beacon.vercel.app',
    image_url: 'https://www.amdsolutions007.com/amd_logo.png',
    language: 'en',
    pubDate: new Date().toUTCString(),
    ttl: 60, // Align RSS TTL with the one-hour feed/cache law
    custom_namespaces: {
      'content': 'http://purl.org/rss/1.0/modules/content/',
    },
  });

  items.forEach(({ post, content, imageUrl }) => {
    const itemConfig: any = {
      title: post.title,
      description: content,
      url: `https://amd-signal-beacon.vercel.app/signal/${post.id}`,
      guid: post.id,
      date: post.publishTime,
      categories: post.tags,
      custom_elements: [
        { 'content:encoded': content },
      ],
    };

    // Add image enclosure if available
    if (imageUrl) {
      itemConfig.enclosure = {
        url: imageUrl,
        type: 'image/png',
      };
    }

    feed.item(itemConfig);
  });

  return feed.xml({ indent: true });
}
