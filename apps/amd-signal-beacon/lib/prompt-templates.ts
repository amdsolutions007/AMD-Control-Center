// AI Prompt Templates - Category-specific image generation prompts

export type ImageCategory = 
  | 'ai' 
  | 'fintech' 
  | 'startups' 
  | 'infrastructure'
  | 'developers'
  | 'state-spotlight'
  | 'motivation'
  | 'default';

// Base style that applies to all images
const BASE_STYLE = `
Cinematic wide-angle professional image, African cyberpunk aesthetic,
dark dramatic background with neon teal and cyan holographic elements,
purple and pink accent lighting, high detail, ultra-realistic,
16:9 aspect ratio, marketing-quality composition
`.trim();

// Category-specific prompt templates
export const PROMPT_TEMPLATES: Record<ImageCategory, string> = {
  'ai': `
African continent as glowing holographic circuit board with AI neural network nodes,
machine learning data streams flowing across the map, neon teal circuits,
purple accent lights, futuristic AI infrastructure, brain-like network patterns,
floating code snippets, ${BASE_STYLE}
  `.trim(),

  'fintech': `
African savanna landscape at golden hour with floating holographic payment terminals,
mobile money icons and financial data streams in the sky, neon teal digital currency symbols,
purple glow illuminating acacia trees, blend of natural African beauty and financial technology,
${BASE_STYLE}
  `.trim(),

  'startups': `
African tech hub workspace with holographic startup rocket launching from continent map,
founders silhouettes around glowing table with neon teal data projections,
purple lighting highlighting collaboration, circuit board patterns on walls,
innovation and entrepreneurship atmosphere, ${BASE_STYLE}
  `.trim(),

  'infrastructure': `
Futuristic African data centers emerging from savanna landscape,
holographic fiber optic cables connecting across continent outline,
neon teal server racks with purple accent lights, blend of nature and technology,
satellite dishes and tech towers with African sunset, ${BASE_STYLE}
  `.trim(),

  'developers': `
African developer at holographic keyboard with code flowing in neon teal streams,
purple accent lighting on focused face, Africa map circuit board in background,
multiple floating screens with terminal windows, dark dramatic workspace,
builder energy and determination, ${BASE_STYLE}
  `.trim(),

  'state-spotlight': `
Nigerian state outline filled with holographic cityscape and innovation hubs,
neon teal circuits forming state borders, purple lighting highlighting major cities,
tech ecosystem visualization within state boundaries, floating data nodes,
"STATE NAME" text overlay in futuristic font, ${BASE_STYLE}
  `.trim(),

  'motivation': `
African skyscraper cityscape at sunrise with holographic keyboard in foreground,
neon teal code streams ascending like pillars of light, purple accent lighting,
dramatic sunrise breaking through tech architecture, builder's hands on keyboard,
inspirational atmosphere blending ambition and technology, ${BASE_STYLE}
  `.trim(),

  'default': `
African continent map with holographic circuit board patterns in neon teal,
purple and pink accent lighting, futuristic tech ecosystem visualization,
glowing data nodes across major tech hubs, dramatic dark background,
professional technology branding aesthetic, ${BASE_STYLE}
  `.trim(),
};

// Detect category from content tags
export function detectImageCategory(tags: string[]): ImageCategory {
  const tagLower = tags.map(t => t.toLowerCase());
  
  if (tagLower.some(t => ['ai', 'machine learning', 'ml'].includes(t))) {
    return 'ai';
  }
  if (tagLower.some(t => ['fintech', 'blockchain', 'crypto'].includes(t))) {
    return 'fintech';
  }
  if (tagLower.some(t => ['startups', 'funding', 'venture'].includes(t))) {
    return 'startups';
  }
  if (tagLower.some(t => ['infrastructure', 'fiber', 'connectivity'].includes(t))) {
    return 'infrastructure';
  }
  if (tagLower.some(t => ['developers', 'coding', 'programming'].includes(t))) {
    return 'developers';
  }
  if (tagLower.some(t => t.includes('state') || t.includes('lagos') || t.includes('abuja'))) {
    return 'state-spotlight';
  }
  
  return 'default';
}

// Build final prompt with title context
export function buildImagePrompt(category: ImageCategory, title: string, stateName?: string): string {
  let prompt = PROMPT_TEMPLATES[category];
  
  // Replace state placeholder if applicable
  if (category === 'state-spotlight' && stateName) {
    prompt = prompt.replace('STATE NAME', stateName.toUpperCase());
  }
  
  // Add title context for more relevant generation
  const titleContext = `Image should relate to: "${title.substring(0, 100)}"`;
  
  return `${prompt}\n\n${titleContext}`;
}

// Text overlay suggestions for each category
export const TEXT_OVERLAYS: Record<ImageCategory, string[]> = {
  'ai': ['AI IN AFRICA', 'MACHINE LEARNING', 'AFRICAN AI'],
  'fintech': ['DIGITAL PAYMENTS', 'FINANCIAL TECH', 'FINTECH AFRICA'],
  'startups': ['AFRICAN STARTUPS', 'BUILD IN AFRICA', 'INNOVATION HUB'],
  'infrastructure': ['DIGITAL INFRASTRUCTURE', 'TECH BACKBONE', 'CONNECTIVITY'],
  'developers': ['AFRICAN DEVELOPERS', 'CODE IN AFRICA', 'BUILD THE FUTURE'],
  'state-spotlight': ['TECH ECOSYSTEM', 'INNOVATION HUB', 'BUILDERS'],
  'motivation': ['SHIP IT', 'BUILD WITH DISCIPLINE', 'MONDAY MOTIVATION'],
  'default': ['AFRICAN TECH ECOSYSTEM', 'BUILDERS. FOUNDERS. INNOVATORS', 'TECH NEWS'],
};
