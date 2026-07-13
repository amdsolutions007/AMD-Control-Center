import type { MarketingEngineScope } from '@/lib/music-intelligence/marketing-engine-types';

export default function MarketingEngineModule({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  scope?: MarketingEngineScope;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#050512]/60 p-4 ${className}`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}
