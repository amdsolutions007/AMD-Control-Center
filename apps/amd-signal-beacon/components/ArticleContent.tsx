interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {/* Executive Summary - Gold Border */}
      <div className="mb-12 p-8 border-2 border-[#facc15] rounded-lg bg-[rgba(250,204,21,0.05)]">
        <h2 className="text-2xl font-bold text-[#facc15] mb-4 flex items-center gap-3">
          <span>🎯</span>
          <span>Executive Summary</span>
        </h2>
        <ul className="space-y-3 text-gray-300">
          {paragraphs.slice(0, 3).map((para, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-[#facc15] mt-1">•</span>
              <span>{para.substring(0, 150)}{para.length > 150 ? '...' : ''}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Article Body - Clean Typography */}
      <div className="space-y-6 text-gray-200 leading-relaxed">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="text-lg">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
