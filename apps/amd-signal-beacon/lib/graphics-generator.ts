// DALL-E 3 Graphics Generator - AI-powered image creation

import { detectImageCategory, buildImagePrompt, type ImageCategory } from './prompt-templates';
import { getFallbackImage } from './fallback-images';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

// Debug logging
console.log('🔑 OpenAI API Key status:', OPENAI_API_KEY ? `Present (${OPENAI_API_KEY.substring(0, 10)}...)` : 'MISSING');

export interface ImageGenerationResult {
  imageUrl: string;
  category: ImageCategory;
  prompt: string;
  timestamp: number;
}

// Generate image using DALL-E 3
export async function generateImage(
  title: string,
  tags: string[],
  stateName?: string
): Promise<ImageGenerationResult | null> {
  
  // Detect category from tags
  const category = detectImageCategory(tags);
  
  if (!OPENAI_API_KEY) {
    console.error('⚠️  OpenAI API key not found - using fallback image');
    const fallbackUrl = getFallbackImage(category);
    return {
      imageUrl: fallbackUrl,
      category,
      prompt: 'Fallback image (OpenAI key missing)',
      timestamp: Date.now(),
    };
  }

  try {
    console.log(`🎨 Generating ${category} image for: ${title.substring(0, 50)}...`);

    // Build prompt
    const prompt = buildImagePrompt(category, title, stateName);

    // Call DALL-E 3 API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024', // Wide format (16:9 ratio)
        quality: 'standard', // Use 'hd' for higher quality but costs more
        style: 'vivid', // More dramatic and hyper-real
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ DALL-E API error:', error);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      console.error('❌ No image URL returned from DALL-E');
      return null;
    }

    console.log(`✅ Image generated successfully: ${category}`);

    return {
      imageUrl,
      category,
      prompt: prompt.substring(0, 200), // Store truncated prompt
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return null;
  }
}

// Batch generate images for multiple articles
export async function generateImagesForArticles(
  articles: Array<{ title: string; tags: string[]; id: string }>
): Promise<Map<string, ImageGenerationResult>> {
  
  const results = new Map<string, ImageGenerationResult>();
  
  console.log(`🎨 Starting batch image generation for ${articles.length} articles...`);
  
  // Generate images sequentially to avoid rate limits
  for (const article of articles) {
    const result = await generateImage(article.title, article.tags);
    
    if (result) {
      results.set(article.id, result);
    }
    
    // Rate limit: 1 image per 5 seconds (DALL-E 3 free tier limit)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`✅ Generated ${results.size} images out of ${articles.length} articles`);
  
  return results;
}

// Test generation (for debugging)
export async function testImageGeneration() {
  console.log('🧪 Testing DALL-E 3 image generation...');
  
  const result = await generateImage(
    'Google partners African universities to launch WAXAL, a dataset of African languages',
    ['AI', 'Africa', 'Innovation']
  );
  
  if (result) {
    console.log('✅ Test successful!');
    console.log('Image URL:', result.imageUrl);
    console.log('Category:', result.category);
  } else {
    console.log('❌ Test failed');
  }
  
  return result;
}
