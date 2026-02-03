import RSS from 'rss';
import { Post } from './content-mixer';

interface RSSItem {
  post: Post;
  content: string;
  imageUrl?: string;
}

export function generateRSSFeed(items: RSSItem[]): string {
  const feed = new RSS({
    title: 'AMD Signal Beacon - African Tech Ecosystem',
    description: 'Exclusive insights, state spotlights, and builder updates from AMD Solutions. Join the largest African tech community on Leke Leke.',
    feed_url: 'https://signal-beacon.amdsolutions007.com/api/feed',
    site_url: 'https://www.amdsolutions007.com',
    image_url: 'https://www.amdsolutions007.com/logo.png',
    language: 'en',
    pubDate: new Date().toUTCString(),
    ttl: 120, // 2 hours cache
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
