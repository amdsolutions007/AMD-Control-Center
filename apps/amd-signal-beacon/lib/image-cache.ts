// Image Cache System - Store generated images to avoid regeneration

import type { ImageGenerationResult } from './graphics-generator';

interface CachedImage {
  imageUrl: string;
  category: string;
  titleHash: string;
  generatedAt: number;
  expiresAt: number;
}

// In-memory cache (persists for server lifetime)
const imageCache = new Map<string, CachedImage>();

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate hash for title (simple hash function)
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Store image in cache
export function cacheImage(
  articleId: string,
  title: string,
  result: ImageGenerationResult
): void {
  const titleHash = hashString(title);
  const now = Date.now();
  
  imageCache.set(articleId, {
    imageUrl: result.imageUrl,
    category: result.category,
    titleHash,
    generatedAt: now,
    expiresAt: now + CACHE_DURATION,
  });
  
  console.log(`💾 Cached image for article: ${articleId}`);
}

// Retrieve image from cache
export function getCachedImage(articleId: string, title: string): string | null {
  const cached = imageCache.get(articleId);
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > cached.expiresAt) {
    console.log(`⏰ Cache expired for article: ${articleId}`);
    imageCache.delete(articleId);
    return null;
  }
  
  // Verify title hasn't changed significantly
  const currentTitleHash = hashString(title);
  if (cached.titleHash !== currentTitleHash) {
    console.log(`🔄 Title changed for article: ${articleId}, regenerating...`);
    imageCache.delete(articleId);
    return null;
  }
  
  console.log(`✅ Cache hit for article: ${articleId}`);
  return cached.imageUrl;
}

// Check if image generation is needed
export function needsImageGeneration(articleId: string, title: string): boolean {
  return getCachedImage(articleId, title) === null;
}

// Clear expired cache entries
export function cleanupExpiredCache(): number {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [id, cached] of imageCache.entries()) {
    if (now > cached.expiresAt) {
      imageCache.delete(id);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
  }
  
  return deletedCount;
}

// Get cache statistics
export function getCacheStats() {
  const total = imageCache.size;
  const now = Date.now();
  const expired = Array.from(imageCache.values()).filter(
    cached => now > cached.expiresAt
  ).length;
  
  return {
    total,
    active: total - expired,
    expired,
  };
}

// Pre-warm cache with common categories (optional optimization)
export function prewarmCache() {
  console.log('🔥 Cache prewarming not implemented (images generated on-demand)');
  // Could pre-generate common category images here if needed
}
