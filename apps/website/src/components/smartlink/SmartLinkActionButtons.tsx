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

const PLATFORM_CONFIG: { [key: string]: { name: string; color: string; borderGlow: string; icon: string } } = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    borderGlow: 'rgba(29, 185, 84, 0.5)',
    icon: 'Spotify'
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',
    borderGlow: 'rgba(250, 36, 60, 0.5)',
    icon: 'Apple'
  },
  audiomack: {
    name: 'Audiomack',
    color: '#FFA200',
    borderGlow: 'rgba(255, 162, 0, 0.5)',
    icon: 'Audiomack'
  },
  youtube_music: {
    name: 'YouTube Music',
    color: '#FF0000',
    borderGlow: 'rgba(255, 0, 0, 0.5)',
    icon: 'YTMusic'
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    borderGlow: 'rgba(255, 0, 0, 0.5)',
    icon: 'YouTube'
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    borderGlow: 'rgba(255, 85, 0, 0.5)',
    icon: 'SoundCloud'
  }
};

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

  // Only allow production-ready platforms
  const allowedPlatforms = ['spotify', 'apple_music', 'audiomack', 'youtube_music', 'youtube', 'soundcloud'];
  const activeLeft = ['spotify', 'apple_music', 'audiomack'].filter(k => dspLinks && dspLinks[k]);
  const activeRight = ['youtube_music', 'youtube', 'soundcloud'].filter(k => dspLinks && dspLinks[k]);

  const renderDspButton = (key: string, isLeft: boolean) => {
    const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#00E5FF', borderGlow: 'rgba(0,229,255,0.4)', icon: key };
    const url = dspLinks[key];

    return (
      <div key={key} className="flex items-center w-full justify-center lg:justify-start group">
        <button
          onClick={() => handleDspClick(key, url)}
          className="w-full max-w-[320px] lg:max-w-none bg-[#0a0a16]/90 hover:bg-[#12122a] border-[1.5px] border-purple-500/50 hover:border-cyan-400 rounded-full py-3 px-5 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          aria-label={`Listen on ${cfg.name}`}
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ color: cfg.color }}>
              {key === 'spotify' && <span className="text-xl">🟢</span>}
              {key === 'apple_music' && <span className="text-xl">🎵</span>}
              {key === 'audiomack' && <span className="text-xl">🔥</span>}
              {key === 'youtube_music' && <span className="text-xl">🔴</span>}
              {key === 'youtube' && <span className="text-xl">📺</span>}
              {key === 'soundcloud' && <span className="text-xl">🟠</span>}
            </span>
            <span className="text-sm sm:text-base font-extrabold tracking-wide text-gray-100 group-hover:text-cyan-300">{cfg.name}</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
        </button>

        {/* Desktop Circuit Connector Line */}
        {isLeft && (
          <div className="hidden lg:block h-[2px] w-8 xl:w-16 bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_6px_#3b82f6]" />
        )}
      </div>
    );
  };

  const renderRightDspButton = (key: string) => {
    const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#00E5FF', borderGlow: 'rgba(0,229,255,0.4)', icon: key };
    const url = dspLinks[key];

    return (
      <div key={key} className="flex items-center w-full justify-center lg:justify-end group">
        {/* Desktop Circuit Connector Line */}
        <div className="hidden lg:block h-[2px] w-8 xl:w-16 bg-gradient-to-l from-purple-500 to-blue-500 shadow-[0_0_6px_#3b82f6]" />

        <button
          onClick={() => handleDspClick(key, url)}
          className="w-full max-w-[320px] lg:max-w-none bg-[#0a0a16]/90 hover:bg-[#12122a] border-[1.5px] border-purple-500/50 hover:border-cyan-400 rounded-full py-3 px-5 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          aria-label={`Listen on ${cfg.name}`}
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ color: cfg.color }}>
              {key === 'youtube_music' && <span className="text-xl">🔴</span>}
              {key === 'youtube' && <span className="text-xl">📺</span>}
              {key === 'soundcloud' && <span className="text-xl">🟠</span>}
            </span>
            <span className="text-sm sm:text-base font-extrabold tracking-wide text-gray-100 group-hover:text-cyan-300">{cfg.name}</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative z-10">
      {/* SECTION 1: Top Cityscape Artist Collage Header & Golden Branding */}
      <div className="w-full flex flex-col items-center pt-4 pb-2 relative">
        {/* Golden Rounded Badge Header */}
        <div className="inline-flex flex-col items-center justify-center bg-black/80 border-[2px] border-[#D4AF37] rounded-2xl py-1.5 px-6 shadow-[0_0_25px_rgba(212,175,55,0.4)] mb-4">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-white leading-none">AMD</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-[#D4AF37] via-[#FFDF00] to-[#D4AF37] bg-clip-text text-transparent mt-0.5">MUSIC INTEL</span>
        </div>

        {/* Hero Collage Artwork Overlay Preview */}
        <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden relative shadow-2xl mb-6 border border-purple-500/30">
          <img
            src={heroArtworkUrl}
            alt="AfroFusion Radio Campaign Stars"
            className="w-full max-h-[360px] object-cover object-top filter brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-[#070710]/40 to-transparent" />
        </div>

        {/* Giant Headline Typography */}
        <div className="text-center z-10 -mt-20 sm:-mt-28 mb-4 px-4">
          <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-none uppercase">
            <span className="text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">DISCOVER</span>
            <span className="text-5xl sm:text-7xl md:text-8xl bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] to-[#FBF5B7] bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(212,175,55,0.7)] my-1 sm:my-2">AFRICA&apos;S</span>
            <span className="text-4xl sm:text-6xl md:text-7xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">BIGGEST HITS</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base tracking-[0.35em] font-black text-cyan-400 mt-4 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] uppercase">
            ONE LINK. EVERY PLATFORM.
          </p>
        </div>
      </div>

      {/* Acoustic Audio Preview Bar */}
      {audioPreviewUrl && (
        <div className="w-full max-w-md mx-auto my-3 px-4">
          <button
            onClick={toggleAudioPreview}
            className={`w-full py-2.5 px-5 rounded-full flex items-center justify-between border text-xs font-bold transition-all duration-300 shadow-lg backdrop-blur-md ${
              isPlaying
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{isPlaying ? '🔊' : '🎧'}</span>
              <span>{isPlaying ? 'Playing VaB Master Audio...' : 'Preview Flagship Audio Cut'}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 border border-cyan-400/30 font-black">
              {isPlaying ? 'PAUSE' : 'LISTEN'}
            </span>
          </button>
        </div>
      )}

      {/* SECTION 2: Center Circular Hub & Circuit Platform Arrangement */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 items-center gap-4 lg:gap-0 z-10 my-4 px-4">
        {/* Left Column Platforms */}
        <div className="flex flex-col gap-3.5 order-2 lg:order-1 w-full max-w-sm mx-auto lg:max-w-none">
          {activeLeft.map(k => renderDspButton(k, true))}
        </div>

        {/* Center Circular Core Ring & Equalizer */}
        <div className="flex flex-col items-center justify-center order-1 lg:order-2 my-6 lg:my-0 relative">
          {/* Neon Ring Hub */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-cyan-400 to-purple-600 shadow-[0_0_60px_rgba(59,130,246,0.65)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-full bg-[#080915] flex flex-col items-center justify-center text-center p-6 border-[3px] border-blue-500/60 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.35)_0%,_transparent_70%)] pointer-events-none" />
              <span className="text-2xl sm:text-3xl font-black text-white tracking-widest z-10 drop-shadow">CHROME</span>
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#D4AF37] via-[#FFDF00] to-[#D4AF37] bg-clip-text text-transparent z-10 tracking-wider my-0.5">AFROFUSION</span>
              <span className="text-xs sm:text-sm font-black tracking-[0.3em] text-gray-200 z-10 mb-2">— RADIO —</span>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-cyan-400 z-10 uppercase mt-1">POWERED BY</span>
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-cyan-300 z-10 uppercase">MUSIC INTEL</span>
            </div>
          </div>

          {/* Equalizer Waveform Graphic */}
          <div className="flex items-end justify-center gap-1.5 mt-5 h-8">
            <div className="w-1 bg-cyan-400 h-3 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 bg-blue-500 h-6 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 bg-purple-500 h-8 animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-1 bg-cyan-300 h-5 animate-bounce" style={{ animationDelay: '100ms' }} />
            <div className="w-1 bg-blue-400 h-7 animate-bounce" style={{ animationDelay: '250ms' }} />
            <div className="w-1 bg-purple-400 h-4 animate-bounce" style={{ animationDelay: '50ms' }} />
            <div className="w-1 bg-cyan-500 h-6 animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
        </div>

        {/* Right Column Platforms */}
        <div className="flex flex-col gap-3.5 order-3 w-full max-w-sm mx-auto lg:max-w-none">
          {activeRight.map(k => renderRightDspButton(k))}
        </div>
      </div>

      {/* SECTION 3: Campaign Stats Ledger Bar */}
      <div className="w-full max-w-3xl mx-auto my-6 px-4 z-10">
        <div className="bg-[#0a0a16]/80 backdrop-blur-xl border border-purple-500/40 rounded-2xl py-3.5 px-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-purple-500/30 text-center font-sans">
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-0">
              <span className="text-purple-400 text-lg">♫</span>
              <span className="text-xs sm:text-sm font-black text-gray-200 tracking-wider">50 TRACKS</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-cyan-400 text-lg">👥</span>
              <span className="text-xs sm:text-sm font-black text-gray-200 tracking-wider">40+ ARTISTS</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-amber-400 text-lg">🌐</span>
              <span className="text-xs sm:text-sm font-black text-gray-200 tracking-wider">10 PLATFORMS</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-0 pl-0 sm:pl-4">
              <span className="text-emerald-400 text-lg">📅</span>
              <span className="text-xs sm:text-sm font-black text-gray-200 tracking-wider">UPDATED WEEKLY</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Giant Metallic Gold Conversion CTA Button */}
      <div className="w-full max-w-xl mx-auto z-10 my-4 px-4">
        <button
          onClick={() => handleDspClick('spotify', dspLinks.spotify || dspLinks.apple_music)}
          className="w-full block bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] to-[#FBF5B7] hover:from-[#FCF6BA] hover:to-[#BF953F] text-black font-black text-3xl sm:text-4xl md:text-5xl tracking-widest py-4 sm:py-5 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.7)] hover:shadow-[0_0_60px_rgba(255,215,0,0.95)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 uppercase border-2 border-yellow-100 cursor-pointer group"
        >
          <span>LISTEN NOW</span>
          <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-[#FFD700] flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-inner">▸</span>
        </button>
      </div>

      {/* Tagline Below CTA */}
      <div className="text-center z-10 mt-6 mb-8 px-4">
        <p className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase">
          <span className="text-[#D4AF37]">AFRICA&apos;S MUSIC.</span> <span className="text-purple-400">POWERED BY INTELLIGENCE.</span>
        </p>
      </div>

      {/* SECTION 5: Bottom 5 Value Pillars Horizontal Ledger */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 pb-20 z-10 text-left">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
          <span className="text-purple-400 text-xl">🧠</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">MUSIC INTELLIGENCE</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Smart curation. Smarter listening.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-cyan-400/40 transition-colors">
          <span className="text-cyan-400 text-xl">🌐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">GLOBAL REACH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">One link. Worldwide.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-amber-400/40 transition-colors">
          <span className="text-amber-400 text-xl">⭐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">SMART RECOMMENDATIONS</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Discover more. Love more.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-emerald-400/40 transition-colors">
          <span className="text-emerald-400 text-xl">📈</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">DATA-DRIVEN GROWTH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Real insights. Real results.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-yellow-400/40 transition-colors sm:col-span-2 lg:col-span-1">
          <span className="text-yellow-400 text-xl">👑</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">ARTIST EMPOWERMENT</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">More visibility. More opportunities.</p>
          </div>
        </div>
      </div>

      {/* Floating Sticky WhatsApp Community Access Bar */}
      {whatsappJoinUrl && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-bounce">
          <button
            onClick={() => handleDspClick('whatsapp', whatsappJoinUrl)}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black flex items-center justify-between shadow-2xl border border-emerald-400/40 backdrop-blur-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight leading-none">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] bg-black/30 px-3 py-1 rounded-lg uppercase tracking-wider">JOIN FREE</span>
          </button>
        </div>
      )}
    </div>
  );
}
