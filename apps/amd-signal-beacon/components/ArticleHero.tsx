import Image from 'next/image';

interface ArticleHeroProps {
  title: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  categories: string[];
}

export default function ArticleHero({ title, imageUrl, source, publishedAt, categories }: ArticleHeroProps) {
  const readingTime = Math.ceil(title.length / 200); // Rough estimate

  return (
    <div className="mb-12">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-400 flex items-center gap-2">
        <a href="https://www.amdsolutions007.com" className="hover:text-[#facc15] transition-colors">
          AMD Intelligence
        </a>
        <span>/</span>
        <span className="text-[#facc15]">Brief</span>
      </div>

      {/* DALL-E Generated Image - Full Width */}
      {imageUrl && (
        <div className="mb-8 rounded-lg overflow-hidden border border-[rgba(250,204,21,0.2)]">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Title - HUGE, Gold, Bold */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        {title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        {/* Source Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(250,204,21,0.1)] border border-[rgba(250,204,21,0.2)] rounded-full">
          <span className="text-[#facc15]">📰</span>
          <span className="text-[#facc15]">Via {source}</span>
        </div>

        {/* Reading Time */}
        <span>{readingTime} min read</span>

        {/* Categories */}
        {categories.slice(0, 3).map(category => (
          <span 
            key={category}
            className="px-3 py-1 bg-[rgba(148,163,184,0.1)] border border-[rgba(148,163,184,0.2)] rounded-full text-gray-300"
          >
            {category}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-8 border-b border-[rgba(250,204,21,0.1)]"></div>
    </div>
  );
}
