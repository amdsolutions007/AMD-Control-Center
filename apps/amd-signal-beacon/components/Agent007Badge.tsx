'use client';

export default function Agent007Badge() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* 007 Badge */}
      <div className="w-16 h-16 rounded-full bg-amd-gold flex items-center justify-center shadow-2xl shadow-amd-gold cursor-pointer hover:scale-110 transition-transform duration-300">
        <span className="text-black text-2xl font-bold tracking-tighter">007</span>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black border-2 border-amd-gold rounded-lg px-4 py-2 whitespace-nowrap shadow-xl">
          <p className="text-amd-gold text-xs font-semibold">AMD SOLUTIONS 007</p>
          <p className="text-gray-400 text-xs">Licensed to Build</p>
        </div>
      </div>
    </div>
  );
}
