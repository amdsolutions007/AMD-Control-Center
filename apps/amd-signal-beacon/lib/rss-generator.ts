import RSS from 'rss';
import { Post } from './content-mixer';

export function generateRSSFeed(posts: Post[], processedContent: string[]): string {
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

  posts.forEach((post, index) => {
    feed.item({
      title: post.title,
      description: processedContent[index],
      url: `https://www.amdsolutions007.com/signal/${post.id}`,
      guid: post.id,
      date: post.publishTime,
      categories: post.tags,
      custom_elements: [
        { 'content:encoded': processedContent[index] },
      ],
    });
  });

  return feed.xml({ indent: true });
}
