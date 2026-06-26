'use client';

import React, { useState } from 'react';

interface DSPLinks {
  [key: string]: string;
}

interface ActionButtonsProps {
  smartLinkId: string;
  hubId: string;
  artistId?: string;
  trackId?: string;
  playlistId?: string;
  dspLinks: DSPLinks;
  audioPreviewUrl?: string;
  whatsappJoinUrl?: string;
  heroArtworkUrl: string;
  playlistCoverUrl: string;
  amdLogoUrl: string;
  amdBadgeUrl: string;
  playlistName?: string;
  artistName?: string;
}

export default function SmartLinkActionButtons({
  smartLinkId,
  hubId,
  artistId,
  trackId,
  playlistId,
  dspLinks,
  audioPreviewUrl,
  whatsappJoinUrl,
  heroArtworkUrl,
  playlistCoverUrl,
  amdLogoUrl,
  amdBadgeUrl,
  playlistName = 'Chrome AfroFusion Radio',
  artistName = 'VaB'
}: ActionButtonsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const dispatchTelemetry = (dspKey: string, destUrl: string) => {
    try {
      const payload = JSON.stringify({
        smart_link_id: smartLinkId,
        hub_id: hubId,
        artist_id: artistId,
        track_id: trackId,
        playlist_id: playlistId,
        destination_dsp: dspKey,
        destination_url: destUrl
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/v1/telemetry/click', payload);
      } else {
        fetch('/api/v1/telemetry/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Telemetry dispatch error:', err);
    }
  };

  const handleDspClick = (dspKey: string, url?: string) => {
    if (!url) return;
    dispatchTelemetry(dspKey, url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    const audio = audioElement || new Audio(audioPreviewUrl);
    if (!audioElement) {
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    }

    dispatchTelemetry('internal_audio_preview', audioPreviewUrl);
    audio.play();
    setIsPlaying(true);
  };

  // Ten platform positions exactly matching the approved campaign poster ecosystem
  const leftPlatforms = [
    { key: 'spotify', name: 'Spotify', icon: '🟢' },
    { key: 'apple_music', name: 'Apple Music', icon: '🎵' },
    { key: 'audiomack', name: 'Audiomack', icon: '🔥' },
    { key: 'boomplay', name: 'Boomplay', icon: '💥' },
    { key: 'soundcloud', name: 'SoundCloud', icon: '🟠' }
  ];

  const rightPlatforms = [
    { key: 'tiktok', name: 'TikTok', icon: '⚡' },
    { key: 'youtube_music', name: 'YouTube Music', icon: '🔴' },
    { key: 'instagram', name: 'Instagram', icon: '📸' },
    { key: 'amazon_music', name: 'Amazon Music', icon: '🛒' },
    { key: 'deezer', name: 'Deezer', icon: '🎚️' }
  ];

  const isPlatformReady = (key: string) => {
    if (!dspLinks) return false;
    if (key === 'youtube_music') return Boolean(dspLinks.youtube_music || dspLinks.youtube);
    return Boolean(dspLinks[key]);
  };

  const getPlatformUrl = (key: string) => {
    if (!dspLinks) return undefined;
    if (key === 'youtube_music') return dspLinks.youtube_music || dspLinks.youtube;
    return dspLinks[key];
  };

  const renderLeftButton = (item: { key: string; name: string; icon: string }) => {
    const ready = isPlatformReady(item.key);
    const url = getPlatformUrl(item.key);

    return (
      <div key={item.key} className="flex items-center w-full justify-center md:justify-start group">
        {ready ? (
          <button
            onClick={() => handleDspClick(item.key, url)}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#8a2be2] hover:border-[#00E5FF] rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_25px_rgba(138,43,226,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10 shrink-0"
            aria-label={`Listen on ${item.name}`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <span className="text-xl filter drop-shadow group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate font-sans">{item.name}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_12px_#ff003c] animate-pulse shrink-0" />
          </button>
        ) : (
          <button
            disabled={true}
            className="w-full max-w-[340px] md:max-w-none bg-[#080816]/90 border border-gray-700/80 rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between opacity-80 cursor-not-allowed select-none transition-none shadow-[0_0_15px_rgba(0,0,0,0.6)] z-10 shrink-0"
            aria-label={`${item.name} coming soon`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <span className="text-xl opacity-75 grayscale">{item.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-300 tracking-wider truncate">{item.name}</span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-md shrink-0">
              COMING SOON
            </span>
          </button>
        )}

        {/* Desktop/Tablet Angled Circuit Connector Line */}
        <div className="hidden md:block h-[2.5px] w-8 lg:w-16 xl:w-24 bg-gradient-to-r from-[#8a2be2] via-[#3b82f6] to-[#00E5FF] shadow-[0_0_12px_#00E5FF,0_0_20px_#8a2be2] relative shrink-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_15px_#00E5FF]" />
        </div>
      </div>
    );
  };

  const renderRightButton = (item: { key: string; name: string; icon: string }) => {
    const ready = isPlatformReady(item.key);
    const url = getPlatformUrl(item.key);

    return (
      <div key={item.key} className="flex items-center w-full justify-center md:justify-end group">
        {/* Desktop/Tablet Angled Circuit Connector Line */}
        <div className="hidden md:block h-[2.5px] w-8 lg:w-16 xl:w-24 bg-gradient-to-l from-[#8a2be2] via-[#3b82f6] to-[#00E5FF] shadow-[0_0_12px_#00E5FF,0_0_20px_#8a2be2] relative shrink-0">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_15px_#00E5FF]" />
        </div>

        {ready ? (
          <button
            onClick={() => handleDspClick(item.key, url)}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#8a2be2] hover:border-[#00E5FF] rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_25px_rgba(138,43,226,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10 shrink-0"
            aria-label={`Listen on ${item.name}`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <span className="text-xl filter drop-shadow group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate font-sans">{item.name}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_12px_#ff003c] animate-pulse shrink-0" />
          </button>
        ) : (
          <button
            disabled={true}
            className="w-full max-w-[340px] md:max-w-none bg-[#080816]/90 border border-gray-700/80 rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between opacity-80 cursor-not-allowed select-none transition-none shadow-[0_0_15px_rgba(0,0,0,0.6)] z-10 shrink-0"
            aria-label={`${item.name} coming soon`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <span className="text-xl opacity-75 grayscale">{item.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-300 tracking-wider truncate">{item.name}</span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-md shrink-0">
              COMING SOON
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative z-10 max-w-6xl mx-auto px-2 sm:px-4 pb-24">
      {/* COMPOSITION 1: Master Hero Interactive Poster (contains Top Badge, Artists, Headline, and Subtitle) */}
      <div className="w-full max-w-5xl mx-auto relative z-10 pt-2 sm:pt-4">
        <img
          src={heroArtworkUrl}
          alt="Chrome AfroFusion Radio - Discover Africa's Biggest Hits - One Link Every Platform"
          className="w-full h-auto max-h-[560px] sm:max-h-[700px] object-contain object-top mx-auto filter drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)]"
        />
        {/* Seamless transition blending mask into circuit board ecosystem */}
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-t from-[#05050e] via-[#05050e]/60 to-transparent pointer-events-none" />
      </div>

      {/* COMPOSITION 2: Flanking Interactive Streaming Ecosystem & Center Core Hub */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 md:gap-0 z-20 -mt-6 sm:-mt-12 md:-mt-16">
        {/* Left Column Platforms (5) */}
        <div className="flex flex-col gap-3 sm:gap-3.5 order-2 md:order-1 w-full max-w-sm mx-auto md:max-w-none">
          {leftPlatforms.map(item => renderLeftButton(item))}
        </div>

        {/* Center Neon Chrome AfroFusion Hub Ring & Equalizer */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2 my-2 md:my-0 relative shrink-0 px-2 md:px-0">
          {/* High-Fidelity Neon Outer Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full p-[3px] bg-gradient-to-tr from-[#00E5FF] via-[#3b82f6] via-[#8a2be2] to-[#00E5FF] shadow-[0_0_90px_rgba(0,229,255,0.75),0_0_140px_rgba(138,43,226,0.5),inset_0_0_45px_rgba(0,229,255,0.6)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-full bg-[#050512] flex flex-col items-center justify-center text-center p-5 border-[2.5px] border-[#00E5FF]/60 relative overflow-hidden shadow-[inset_0_0_65px_rgba(0,0,0,0.95)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(138,43,226,0.55)_0%,_transparent_75%)] pointer-events-none" />
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-[0.22em] z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] font-serif">CHROME</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#FFF8D6] via-[#D4AF37] via-[#FFDF00] to-[#AA771C] bg-clip-text text-transparent z-10 tracking-wider my-1 drop-shadow-[0_0_25px_rgba(255,215,0,0.85)]">AFROFUSION</span>
              <span className="text-xs sm:text-sm font-black tracking-[0.35em] text-gray-100 z-10 mb-3">— RADIO —</span>
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-[#00E5FF] z-10 uppercase mt-0.5 drop-shadow-[0_0_10px_#00E5FF]">POWERED BY</span>
              <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-[#E0F7FA] z-10 uppercase drop-shadow-[0_0_10px_#00E5FF]">MUSIC INTEL</span>
            </div>
          </div>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-end justify-center gap-1.5 mt-5 sm:mt-6 h-8 sm:h-9">
            <div className="w-1.5 bg-[#00E5FF] h-4 rounded-full shadow-[0_0_10px_#00E5FF] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 bg-[#3b82f6] h-7 rounded-full shadow-[0_0_10px_#3b82f6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 bg-[#8a2be2] h-9 rounded-full shadow-[0_0_10px_#8a2be2] animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-1.5 bg-[#00E5FF] h-5 rounded-full shadow-[0_0_10px_#00E5FF] animate-bounce" style={{ animationDelay: '100ms' }} />
            <div className="w-1.5 bg-[#60a5fa] h-8 rounded-full shadow-[0_0_10px_#60a5fa] animate-bounce" style={{ animationDelay: '250ms' }} />
            <div className="w-1.5 bg-[#a855f7] h-4 rounded-full shadow-[0_0_10px_#a855f7] animate-bounce" style={{ animationDelay: '50ms' }} />
            <div className="w-1.5 bg-[#00E5FF] h-6 rounded-full shadow-[0_0_10px_#00E5FF] animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
        </div>

        {/* Right Column Platforms (5) */}
        <div className="flex flex-col gap-3 sm:gap-3.5 order-3 w-full max-w-sm mx-auto md:max-w-none">
          {rightPlatforms.map(item => renderRightButton(item))}
        </div>
      </div>

      {/* COMPOSITION 3: Campaign Statistics Strip */}
      <div className="w-full max-w-3xl mx-auto my-6 sm:my-8 px-4 z-20">
        <div className="bg-[#080816]/95 backdrop-blur-2xl border border-[#8a2be2]/60 rounded-2xl py-4 px-6 shadow-[0_0_45px_rgba(138,43,226,0.35)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#8a2be2]/40 text-center font-sans">
            <div className="flex items-center justify-center gap-2.5 pt-2 sm:pt-0">
              <span className="text-[#a855f7] text-lg">♫</span>
              <span className="text-xs sm:text-sm font-black text-gray-100 tracking-widest">50 TRACKS</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-[#00E5FF] text-lg">👥</span>
              <span className="text-xs sm:text-sm font-black text-gray-100 tracking-widest">40+ ARTISTS</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-[#D4AF37] text-lg">🌐</span>
              <span className="text-xs sm:text-sm font-black text-gray-100 tracking-widest">10 PLATFORMS</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-[#34d399] text-lg">📅</span>
              <span className="text-xs sm:text-sm font-black text-gray-100 tracking-widest">UPDATED WEEKLY</span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPOSITION 4: Giant Metallic Gold Conversion CTA Button */}
      <div className="w-full max-w-xl mx-auto z-20 my-3 sm:my-4 px-4">
        <button
          onClick={() => handleDspClick('spotify', dspLinks.spotify || dspLinks.apple_music)}
          className="w-full block bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] via-[#FBF5B7] to-[#AA771C] hover:from-[#FCF6BA] hover:to-[#BF953F] text-black font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.18em] py-4 sm:py-5 md:py-6 rounded-full shadow-[0_0_60px_rgba(255,215,0,0.8)] hover:shadow-[0_0_85px_rgba(255,215,0,1)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 uppercase border-[2.5px] border-[#FFF8D6] cursor-pointer group"
        >
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] font-serif">LISTEN NOW</span>
          <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black text-[#FFD700] flex items-center justify-center text-xl sm:text-2xl md:text-3xl group-hover:scale-110 transition-transform shadow-inner shrink-0">▸</span>
        </button>
      </div>

      {/* COMPOSITION 5: Acoustic Master Audio Preview Banner (integrated naturally below CTA without interrupting poster flow) */}
      {audioPreviewUrl && (
        <div className="w-full max-w-md mx-auto mt-2 mb-6 px-4 z-20">
          <button
            onClick={toggleAudioPreview}
            className={`w-full py-3 px-6 rounded-full flex items-center justify-between border text-xs sm:text-sm font-bold transition-all duration-300 shadow-2xl backdrop-blur-xl ${
              isPlaying
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-[#00E5FF] text-[#00E5FF] animate-pulse shadow-[0_0_30px_rgba(0,229,255,0.4)]'
                : 'bg-[#080816]/80 hover:bg-[#12122e] border-[#8a2be2]/60 text-gray-200'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{isPlaying ? '🔊' : '🎧'}</span>
              <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio Cut...' : 'Preview 30s Master Audio'}</span>
            </span>
            <span className="px-4 py-1 rounded-full bg-white/10 text-[#00E5FF] border border-[#00E5FF]/50 font-black tracking-wider">
              {isPlaying ? 'PAUSE' : 'LISTEN'}
            </span>
          </button>
        </div>
      )}

      {/* Tagline Under CTA/Preview */}
      <div className="text-center z-20 mb-8 px-4">
        <p className="text-xs sm:text-sm font-black tracking-[0.28em] uppercase">
          <span className="text-[#D4AF37]">AFRICA&apos;S MUSIC.</span> <span className="text-[#8a2be2]">POWERED BY INTELLIGENCE.</span>
        </p>
      </div>

      {/* COMPOSITION 6: Bottom 5 Value Pillars Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 pb-16 z-20 text-left">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#080816]/90 border border-white/15 hover:border-[#8a2be2]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors">
          <span className="text-[#a855f7] text-xl shrink-0 mt-0.5">🧠</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-100 tracking-wider">MUSIC INTELLIGENCE</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Smart curation. Smarter listening.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#080816]/90 border border-white/15 hover:border-[#00E5FF]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors">
          <span className="text-[#00E5FF] text-xl shrink-0 mt-0.5">🌐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-100 tracking-wider">GLOBAL REACH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">One link. Worldwide.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#080816]/90 border border-white/15 hover:border-[#D4AF37]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors">
          <span className="text-[#D4AF37] text-xl shrink-0 mt-0.5">⭐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-100 tracking-wider">SMART RECOMMENDATIONS</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Discover more. Love more.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#080816]/90 border border-white/15 hover:border-[#34d399]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors">
          <span className="text-[#34d399] text-xl shrink-0 mt-0.5">📈</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-100 tracking-wider">DATA-DRIVEN GROWTH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Real insights. Real results.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#080816]/90 border border-white/15 hover:border-[#facc15]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-colors sm:col-span-2 lg:col-span-1">
          <span className="text-[#facc15] text-xl shrink-0 mt-0.5">👑</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-100 tracking-wider">ARTIST EMPOWERMENT</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">More visibility. More opportunities.</p>
          </div>
        </div>
      </div>

      {/* Floating Sticky WhatsApp Community Access Gate */}
      {whatsappJoinUrl && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-bounce">
          <button
            onClick={() => handleDspClick('whatsapp', whatsappJoinUrl)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black flex items-center justify-between shadow-2xl border border-emerald-400/40 backdrop-blur-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight leading-none">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg uppercase tracking-wider">JOIN FREE</span>
          </button>
        </div>
      )}
    </div>
  );
}
