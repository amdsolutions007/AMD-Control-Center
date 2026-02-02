// Hybrid Content Mixer - 20% manual, 80% external with time-slot reservation

import type { RefinedArticle } from './refine';
import type { Post } from './content-mixer';

export interface MixedPost {
  id: string;
  title: string;
  content: string;
  publishTime: string;
  tags: string[];
  priority: number; // Higher = more important
  source: 'manual' | 'external';
  link?: string;
}

// Reserved time slots for manual content (WAT timezone)
const RESERVED_TIME_SLOTS = [
  { hour: 8, minute: 0 },  // 8:00 AM
  { hour: 13, minute: 0 }, // 1:00 PM  
  { hour: 20, minute: 0 }, // 8:00 PM
];

// Check if a timestamp falls within reserved slot (±30 min window)
function isReservedTimeSlot(date: Date): boolean {
  const hour = date.getUTCHours() + 1; // WAT = UTC+1
  const minute = date.getUTCMinutes();
  
  for (const slot of RESERVED_TIME_SLOTS) {
    const timeDiff = Math.abs((hour * 60 + minute) - (slot.hour * 60 + slot.minute));
    if (timeDiff <= 30) return true; // Within 30-minute window
  }
  
  return false;
}

// Convert manual post to mixed format
function manualToMixed(post: Post): MixedPost {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    publishTime: post.publishTime,
    tags: post.tags,
    priority: 100, // Manual posts always have highest priority
    source: 'manual',
  };
}

// Convert refined article to mixed format
function refinedToMixed(article: RefinedArticle): MixedPost {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    publishTime: article.publishTime,
    tags: article.tags,
    priority: 10, // External posts have lower priority
    source: 'external',
    link: article.link,
  };
}

// Calculate recency score (newer = higher score)
function calculateRecencyScore(publishTime: string): number {
  const pubDate = new Date(publishTime);
  const now = new Date();
  const hoursSincePub = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
  
  // Fresh content (0-6 hours) = score 100
  // Recent content (6-24 hours) = score 50
  // Older content (24-48 hours) = score 10
  if (hoursSincePub <= 6) return 100;
  if (hoursSincePub <= 24) return 50;
  return 10;
}

// Main mixing algorithm
export function mixContent(
  manualPosts: Post[],
  externalArticles: RefinedArticle[]
): MixedPost[] {
  console.log('🔀 Mixing content: manual + external...');
  console.log(`   Manual posts: ${manualPosts.length}`);
  console.log(`   External articles: ${externalArticles.length}`);
  
  const mixed: MixedPost[] = [];
  
  // Step 1: Add all manual posts (they ALWAYS appear)
  for (const post of manualPosts) {
    mixed.push(manualToMixed(post));
  }
  
  // Step 2: Filter external articles to avoid reserved time slots
  const safeExternalArticles = externalArticles.filter(article => {
    const pubDate = new Date(article.publishTime);
    const isReserved = isReservedTimeSlot(pubDate);
    
    if (isReserved) {
      console.log(`   ⊗ Skipping external article in reserved slot: ${article.title.substring(0, 40)}...`);
    }
    
    return !isReserved;
  });
  
  console.log(`   Safe external articles: ${safeExternalArticles.length}`);
  
  // Step 3: Add external articles with recency-based priority
  for (const article of safeExternalArticles) {
    const mixedArticle = refinedToMixed(article);
    mixedArticle.priority += calculateRecencyScore(article.publishTime);
    mixed.push(mixedArticle);
  }
  
  // Step 4: Sort by priority (high to low), then by publish time (newest first)
  mixed.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
  });
  
  // Step 5: Cap at 20 items for RSS feed (keep it lean)
  const finalMix = mixed.slice(0, 20);
  
  const manualCount = finalMix.filter(p => p.source === 'manual').length;
  const externalCount = finalMix.filter(p => p.source === 'external').length;
  
  console.log(`✓ Mixed content complete:`);
  console.log(`   Final mix: ${finalMix.length} posts`);
  console.log(`   Manual: ${manualCount} (${((manualCount/finalMix.length)*100).toFixed(0)}%)`);
  console.log(`   External: ${externalCount} (${((externalCount/finalMix.length)*100).toFixed(0)}%)`);
  
  return finalMix;
}

// Calculate mix ratio for display
export function getMixStats(posts: MixedPost[]) {
  const manual = posts.filter(p => p.source === 'manual').length;
  const external = posts.filter(p => p.source === 'external').length;
  const total = posts.length;
  
  return {
    total,
    manual,
    external,
    manualPercent: total > 0 ? ((manual / total) * 100).toFixed(1) : '0',
    externalPercent: total > 0 ? ((external / total) * 100).toFixed(1) : '0',
  };
}
