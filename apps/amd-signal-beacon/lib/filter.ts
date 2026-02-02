// Content Filtering System - Deduplication + Sentiment Analysis

import type { ExternalArticle } from './ingest';

// Negative keywords that indicate depressing/unhelpful news
const NEGATIVE_KEYWORDS = [
  'shutdown', 'shuts down', 'closes', 'closed', 'bankruptcy', 'bankrupt',
  'layoff', 'layoffs', 'fired', 'terminated', 'scandal', 'fraud', 'scam',
  'collapse', 'collapsed', 'crisis', 'disaster', 'failure', 'failed startup',
  'massive losses', 'investigation', 'arrested', 'lawsuit', 'sued',
];

// Calculate Levenshtein distance for string similarity
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

// Calculate similarity percentage
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return ((maxLength - distance) / maxLength) * 100;
}

// Remove duplicate articles based on title similarity
export function deduplicateArticles(articles: ExternalArticle[]): ExternalArticle[] {
  const uniqueArticles: ExternalArticle[] = [];
  const seenHashes = new Set<string>();

  for (const article of articles) {
    // Content hash check (exact duplicates)
    const contentHash = hashString(article.title + article.description.substring(0, 100));
    
    if (seenHashes.has(contentHash)) {
      console.log(`⊗ Duplicate (hash): ${article.title.substring(0, 50)}...`);
      continue;
    }

    // Title similarity check
    let isDuplicate = false;
    for (const existing of uniqueArticles) {
      const similarity = calculateSimilarity(article.title, existing.title);
      
      if (similarity > 70) {
        console.log(`⊗ Duplicate (${similarity.toFixed(0)}% similar): ${article.title.substring(0, 50)}...`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      uniqueArticles.push(article);
      seenHashes.add(contentHash);
    }
  }

  console.log(`✓ Deduplicated: ${articles.length} → ${uniqueArticles.length} articles`);
  return uniqueArticles;
}

// Simple hash function for content
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Filter out negative/depressing news
export function filterNegativeContent(articles: ExternalArticle[]): ExternalArticle[] {
  const positiveArticles = articles.filter(article => {
    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    const combined = titleLower + ' ' + descLower;

    // Check for negative keywords
    for (const keyword of NEGATIVE_KEYWORDS) {
      if (combined.includes(keyword)) {
        // Allow if it's a "learning negative" (contains positive redemption keywords)
        const hasRedemption = 
          combined.includes('lesson') ||
          combined.includes('pivot') ||
          combined.includes('comeback') ||
          combined.includes('despite') ||
          combined.includes('overcame') ||
          combined.includes('bounced back');

        if (!hasRedemption) {
          console.log(`⊗ Negative content filtered: ${article.title.substring(0, 50)}...`);
          return false;
        }
      }
    }

    return true;
  });

  console.log(`✓ Sentiment filtered: ${articles.length} → ${positiveArticles.length} articles`);
  return positiveArticles;
}

// Master filter pipeline
export function filterArticles(articles: ExternalArticle[]): ExternalArticle[] {
  console.log('🔍 Starting filter pipeline...');
  
  // Step 1: Remove duplicates
  let filtered = deduplicateArticles(articles);
  
  // Step 2: Remove negative content
  filtered = filterNegativeContent(filtered);
  
  console.log(`✓ Filter complete: ${articles.length} → ${filtered.length} articles passed`);
  return filtered;
}
