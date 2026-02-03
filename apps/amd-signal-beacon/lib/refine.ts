// Content Refinery - Rebrand external news with AMD identity + AI graphics

import type { ExternalArticle } from './ingest';
import { generateImage } from './graphics-generator';
import { cacheImage, getCachedImage } from './image-cache';
import footers from '../data/footers.json';

export interface RefinedArticle {
  id: string;
  title: string;
  description: string; // Short description for previews
  content: string;
  publishTime: string;
  publishedAt: string; // Human-readable date
  tags: string[];
  categories: string[]; // For article classification
  source: string;
  sourceUrl: string; // Original article URL
  link: string;
  type: 'external';
  imageUrl?: string; // AI-generated image URL
}

// Truncate text to fit character limit
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Find last complete sentence before limit
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclaim = truncated.lastIndexOf('!');
  
  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclaim);
  
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // Otherwise, truncate at last space
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Extract relevant tags from content
function extractTags(title: string, description: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const tags: string[] = [];

  // Technology tags
  if (text.match(/\b(ai|artificial intelligence|machine learning|ml)\b/)) tags.push('AI');
  if (text.match(/\b(blockchain|crypto|web3|bitcoin|ethereum)\b/)) tags.push('Blockchain');
  if (text.match(/\b(fintech|payment|mobile money|banking)\b/)) tags.push('Fintech');
  if (text.match(/\b(startup|funding|investment|venture|series a|seed)\b/)) tags.push('Startups');
  if (text.match(/\b(developer|coding|programming|software)\b/)) tags.push('Developers');
  if (text.match(/\b(lagos|nigeria|nigerian|naija|abuja|portharcourt)\b/)) tags.push('Nigeria');
  if (text.match(/\b(africa|african|kenya|ghana|south africa|egypt)\b/)) tags.push('Africa');
  if (text.match(/\b(innovation|tech hub|ecosystem|accelerator)\b/)) tags.push('Innovation');
  if (text.match(/\b(mobile|smartphone|app|android|ios)\b/)) tags.push('Mobile');
  if (text.match(/\b(ecommerce|e-commerce|retail|marketplace)\b/)) tags.push('E-commerce');

  // Ensure at least 2 tags
  if (tags.length === 0) {
    tags.push('Tech', 'Africa');
  } else if (tags.length === 1) {
    tags.push('Africa');
  }

  return tags.slice(0, 4); // Max 4 tags
}

// Select appropriate footer type based on content
function selectFooterType(tags: string[]): keyof typeof footers {
  if (tags.includes('Nigeria')) return 'state';
  if (tags.includes('Startups') || tags.includes('Funding')) return 'urgent';
  if (tags.includes('Developers')) return 'movement';
  return 'default';
}

// Refine external article with AMD branding
export async function refineArticle(
  article: ExternalArticle,
  generateGraphics: boolean = true
): Promise<RefinedArticle> {
  // Extract tags
  const tags = extractTags(article.title, article.description);
  
  // Build refined content
  const intro = `🌍 AMD Intel: ${article.title}`;
  
  // Truncate description to fit within ~280 chars after intro and footer
  const maxDescLength = 180;
  const refinedDesc = truncateText(article.description, maxDescLength);
  
  // Select footer
  const footerType = selectFooterType(tags);
  const footerText = footers[footerType];
  
  // Source attribution
  const sourceAttr = `\n\n📰 Via ${article.source}`;
  
  // Combine all elements
  const content = `${intro}\n\n${refinedDesc}${sourceAttr}\n\n${footerText}`;
  
  // Generate unique ID from guid
  const id = `ext_${hashGuid(article.guid)}`;
  
  // Check for cached image or generate new one
  let imageUrl: string | undefined;
  
  if (generateGraphics) {
    // Check cache first
    const cachedImageUrl = getCachedImage(id, article.title);
    
    if (cachedImageUrl) {
      imageUrl = cachedImageUrl;
      console.log(`✅ Using cached image for: ${article.title.substring(0, 40)}...`);
    } else {
      // Generate new image
      console.log(`🎨 Generating image for: ${article.title.substring(0, 40)}...`);
      const imageResult = await generateImage(article.title, tags);
      
      if (imageResult) {
        imageUrl = imageResult.imageUrl;
        cacheImage(id, article.title, imageResult);
      }
    }
  }
  
  return {
    id,
    title: article.title,
    description: refinedDesc, // Short description for previews
    content,
    publishTime: article.pubDate,
    publishedAt: new Date(article.pubDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    tags,
    categories: tags, // Same as tags for now
    source: article.source,
    sourceUrl: article.link, // Original article URL
    link: article.link,
    type: 'external',
    imageUrl,
  };
}

// Hash GUID to create short ID
function hashGuid(guid: string): string {
  let hash = 0;
  for (let i = 0; i < guid.length; i++) {
    const char = guid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Batch refine articles
export async function refineArticles(
  articles: ExternalArticle[],
  generateGraphics: boolean = true
): Promise<RefinedArticle[]> {
  console.log('✨ Refining articles with AMD branding...');
  
  const refined: RefinedArticle[] = [];
  
  // Process articles sequentially if generating graphics (to respect DALL-E rate limits)
  if (generateGraphics) {
    for (const article of articles) {
      const refinedArticle = await refineArticle(article, true);
      refined.push(refinedArticle);
      
      // Rate limit: wait 5 seconds between generations if not cached
      if (refinedArticle.imageUrl) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } else {
    // Process all at once if not generating graphics
    const promises = articles.map(article => refineArticle(article, false));
    refined.push(...await Promise.all(promises));
  }
  
  console.log(`✓ Refined ${refined.length} articles`);
  return refined;
}
