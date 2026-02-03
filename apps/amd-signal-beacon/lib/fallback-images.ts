// Fallback images for when DALL-E 3 generation fails
// Using Unsplash API with African tech/business themes

import type { ImageCategory } from './prompt-templates';

// Unsplash collection IDs for African tech content
const FALLBACK_IMAGES: Record<ImageCategory, string[]> = {
  'ai': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1792&h=1024&fit=crop', // AI neural network
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1792&h=1024&fit=crop', // Tech abstract
  ],
  'fintech': [
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1792&h=1024&fit=crop', // Mobile payment
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1792&h=1024&fit=crop', // Financial tech
  ],
  'startups': [
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1792&h=1024&fit=crop', // Team collaboration
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1792&h=1024&fit=crop', // Office workspace
  ],
  'infrastructure': [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1792&h=1024&fit=crop', // Data center
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1792&h=1024&fit=crop', // Server room
  ],
  'developers': [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1792&h=1024&fit=crop', // Coding
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1792&h=1024&fit=crop', // Code screen
  ],
  'state-spotlight': [
    'https://images.unsplash.com/photo-1589122576653-8016d1b22a17?w=1792&h=1024&fit=crop', // African cityscape
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1792&h=1024&fit=crop', // Lagos aerial
  ],
  'motivation': [
    'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=1792&h=1024&fit=crop', // Sunrise
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=1792&h=1024&fit=crop', // Sky motivation
  ],
  'default': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1792&h=1024&fit=crop', // Global tech
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1792&h=1024&fit=crop', // Digital abstract
  ],
};

/**
 * Get a fallback image for a specific category
 * Returns a random image from the category's pool
 */
export function getFallbackImage(category: ImageCategory): string {
  const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['default'];
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Get all fallback images (useful for preloading)
 */
export function getAllFallbackImages(): string[] {
  return Object.values(FALLBACK_IMAGES).flat();
}
