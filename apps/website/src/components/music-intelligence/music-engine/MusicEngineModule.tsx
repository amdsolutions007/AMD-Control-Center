import type { MusicEngineScope } from '@/lib/music-intelligence/music-engine-types';

export default function MusicEngineModule({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
  scope?: MusicEngineScope;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}
