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

const PLATFORM_CONFIG: { [key: string]: { name: string; color: string; icon: string } } = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    icon: '🟢'
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',
    icon: '🎵'
  },
  audiomack: {
    name: 'Audiomack',
    color: '#FFA200',
    icon: '🔥'
  },
  youtube_music: {
    name: 'YouTube Music',
    color: '#FF0000',
    icon: '🔴'
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺'
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    icon: '🟠'
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

  const activeLeft = ['spotify', 'apple_music', 'audiomack'].filter(k => dspLinks && dspLinks[k]);
  const activeRight = ['youtube_music', 'youtube', 'soundcloud'].filter(k => dspLinks && dspLinks[k]);

  const renderDspButton = (key: string) => {
    const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#00E5FF', icon: '🔗' };
    const url = dspLinks[key];

    return (
      <div key={key} className="flex items-center w-full justify-center md:justify-start group">
        <button
          onClick={() => handleDspClick(key, url)}
          className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#7c3aed]/80 hover:border-[#00E5FF] rounded-full py-3.5 px-6 flex items-center justify-between shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(0,229,255,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10"
          aria-label={`Listen on ${cfg.name}`}
        >
          <div className="flex items-center gap-3.5">
            <span className="text-xl filter drop-shadow">{cfg.icon}</span>
            <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors">{cfg.name}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_10px_#ff003c]" />
        </button>

        {/* Desktop/Tablet Angled Circuit Connector Line */}
        <div className="hidden md:block h-[2px] w-8 lg:w-16 bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
      </div>
    );
  };

  const renderRightDspButton = (key: string) => {
    const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#00E5FF', icon: '🔗' };
    const url = dspLinks[key];

    return (
      <div key={key} className="flex items-center w-full justify-center md:justify-end group">
        {/* Desktop/Tablet Angled Circuit Connector Line */}
        <div className="hidden md:block h-[2px] w-8 lg:w-16 bg-gradient-to-l from-[#7c3aed] via-[#3b82f6] to-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />

        <button
          onClick={() => handleDspClick(key, url)}
          className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#7c3aed]/80 hover:border-[#00E5FF] rounded-full py-3.5 px-6 flex items-center justify-between shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(0,229,255,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10"
          aria-label={`Listen on ${cfg.name}`}
        >
          <div className="flex items-center gap-3.5">
            <span className="text-xl filter drop-shadow">{cfg.icon}</span>
            <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors">{cfg.name}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_10px_#ff003c]" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative z-10 w-full">
      {/* COMPOSITION 1: Top Cityscape Stars Collage & Gold Emblem */}
      <div className="w-full flex flex-col items-center relative pt-6 sm:pt-8 overflow-hidden">
        {/* Glowing Gold Rounded Rectangular Badge */}
        <div className="z-20 inline-flex flex-col items-center justify-center bg-[#060614]/90 border-[2px] border-[#D4AF37] rounded-2xl py-2 px-8 shadow-[0_0_35px_rgba(212,175,55,0.5),inset_0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-md mb-3">
          <span className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white leading-none font-serif">AMD</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#D4AF37] bg-clip-text text-transparent mt-1">MUSIC INTEL</span>
        </div>

        {/* Full-Width Floating Artist Collage Backdrop */}
        <div className="w-full max-w-6xl mx-auto relative -mt-8 sm:-mt-12 z-10">
          <img
            src={heroArtworkUrl}
            alt="AfroFusion Radio Campaign Stars"
            className="w-full h-auto max-h-[440px] sm:max-h-[520px] object-cover object-top opacity-95 filter contrast-105 brightness-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05050e] via-[#05050e]/70 to-transparent" />
        </div>

        {/* Giant Headline Typography Hierarchy */}
        <div className="text-center z-20 -mt-28 sm:-mt-40 md:-mt-48 mb-6 px-4">
          <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-none uppercase">
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.95)] tracking-tight">DISCOVER</span>
            <span className="text-6xl sm:text-8xl md:text-9xl lg:text-[140px] bg-gradient-to-r from-[#FFF8D6] via-[#D4AF37] via-[#996515] to-[#FFE58F] bg-clip-text text-transparent filter drop-shadow-[0_0_40px_rgba(255,215,0,0.75)] my-1 sm:my-3 tracking-normal">AFRICA&apos;S</span>
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.95)] tracking-tight">BIGGEST HITS</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-lg tracking-[0.45em] font-black text-[#00E5FF] mt-4 sm:mt-6 drop-shadow-[0_0_18px_rgba(0,229,255,0.95)] uppercase">
            ONE LINK. EVERY PLATFORM.
          </p>
        </div>
      </div>

      {/* Acoustic Audio Stream Banner */}
      {audioPreviewUrl && (
        <div className="w-full max-w-md mx-auto my-3 px-4 z-20">
          <button
            onClick={toggleAudioPreview}
            className={`w-full py-2.5 px-6 rounded-full flex items-center justify-between border text-xs font-bold transition-all duration-300 shadow-xl backdrop-blur-md ${
              isPlaying
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-[#00E5FF] text-[#00E5FF] animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-lg">{isPlaying ? '🔊' : '🎧'}</span>
              <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio Cut...' : 'Preview 30s Master Audio'}</span>
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#00E5FF] border border-[#00E5FF]/40 font-black">
              {isPlaying ? 'PAUSE' : 'LISTEN'}
            </span>
          </button>
        </div>
      )}

      {/* COMPOSITION 2: Circular Core Ring & Flanking Circuit Grid */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 md:gap-0 z-20 my-4 px-4">
        {/* Left Column Platforms */}
        <div className="flex flex-col gap-4 order-2 md:order-1 w-full max-w-sm mx-auto md:max-w-none">
          {activeLeft.map(k => renderDspButton(k))}
        </div>

        {/* Center Neon Hub Ring & Equalizer */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2 my-6 md:my-0 relative">
          {/* Glowing Blue/Cyan Hub Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full p-[3px] bg-gradient-to-tr from-[#00E5FF] via-[#3b82f6] to-[#8a2be2] shadow-[0_0_70px_rgba(0,229,255,0.65),inset_0_0_35px_rgba(138,43,226,0.55)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-full bg-[#060614] flex flex-col items-center justify-center text-center p-6 border-[2.5px] border-[#00E5FF]/50 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.95)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(138,43,226,0.45)_0%,_transparent_75%)] pointer-events-none" />
              <span className="text-2xl sm:text-3xl font-black text-white tracking-widest z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">CHROME</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FFF8D6] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent z-10 tracking-wider my-1 drop-shadow-[0_0_25px_rgba(212,175,55,0.7)]">AFROFUSION</span>
              <span className="text-xs sm:text-sm font-black tracking-[0.35em] text-gray-200 z-10 mb-3">— RADIO —</span>
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-[#00E5FF] z-10 uppercase mt-1 drop-shadow-[0_0_10px_#00E5FF]">POWERED BY</span>
              <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-[#E0F7FA] z-10 uppercase drop-shadow-[0_0_10px_#00E5FF]">MUSIC INTEL</span>
            </div>
          </div>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-end justify-center gap-1.5 mt-6 h-9">
            <div className="w-1.5 bg-[#00E5FF] h-4 rounded-full shadow-[0_0_8px_#00E5FF] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 bg-[#3b82f6] h-7 rounded-full shadow-[0_0_8px_#3b82f6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 bg-[#8a2be2] h-9 rounded-full shadow-[0_0_8px_#8a2be2] animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-1.5 bg-[#00E5FF] h-5 rounded-full shadow-[0_0_8px_#00E5FF] animate-bounce" style={{ animationDelay: '100ms' }} />
            <div className="w-1.5 bg-[#60a5fa] h-8 rounded-full shadow-[0_0_8px_#60a5fa] animate-bounce" style={{ animationDelay: '250ms' }} />
            <div className="w-1.5 bg-[#a855f7] h-4 rounded-full shadow-[0_0_8px_#a855f7] animate-bounce" style={{ animationDelay: '50ms' }} />
            <div className="w-1.5 bg-[#00E5FF] h-6 rounded-full shadow-[0_0_8px_#00E5FF] animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
        </div>

        {/* Right Column Platforms */}
        <div className="flex flex-col gap-4 order-3 w-full max-w-sm mx-auto md:max-w-none">
          {activeRight.map(k => renderRightDspButton(k))}
        </div>
      </div>

      {/* COMPOSITION 3: Stats Ledger Bar */}
      <div className="w-full max-w-3xl mx-auto my-8 px-4 z-20">
        <div className="bg-[#080816]/90 backdrop-blur-xl border border-[#8a2be2]/50 rounded-2xl py-4 px-6 shadow-[0_0_35px_rgba(138,43,226,0.25)]">
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
      <div className="w-full max-w-xl mx-auto z-20 my-4 px-4">
        <button
          onClick={() => handleDspClick('spotify', dspLinks.spotify || dspLinks.apple_music)}
          className="w-full block bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] to-[#FBF5B7] hover:from-[#FCF6BA] hover:to-[#BF953F] text-black font-black text-3xl sm:text-4xl md:text-5xl tracking-widest py-4 sm:py-5 rounded-full shadow-[0_0_50px_rgba(255,215,0,0.7)] hover:shadow-[0_0_70px_rgba(255,215,0,0.95)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 uppercase border-2 border-[#FFF8D6] cursor-pointer group"
        >
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">LISTEN NOW</span>
          <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-[#FFD700] flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-inner">▸</span>
        </button>
      </div>

      {/* Tagline Under CTA */}
      <div className="text-center z-20 mt-6 mb-8 px-4">
        <p className="text-xs sm:text-sm font-black tracking-[0.25em] uppercase">
          <span className="text-[#D4AF37]">AFRICA&apos;S MUSIC.</span> <span className="text-[#a855f7]">POWERED BY INTELLIGENCE.</span>
        </p>
      </div>

      {/* COMPOSITION 5: Bottom 5 Value Pillars Horizontal Strip */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 pb-24 z-20 text-left">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#080816]/70 border border-white/10 backdrop-blur-md">
          <span className="text-[#a855f7] text-xl">🧠</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">MUSIC INTELLIGENCE</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Smart curation. Smarter listening.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#080816]/70 border border-white/10 backdrop-blur-md">
          <span className="text-[#00E5FF] text-xl">🌐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">GLOBAL REACH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">One link. Worldwide.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#080816]/70 border border-white/10 backdrop-blur-md">
          <span className="text-[#D4AF37] text-xl">⭐</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">SMART RECOMMENDATIONS</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Discover more. Love more.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#080816]/70 border border-white/10 backdrop-blur-md">
          <span className="text-[#34d399] text-xl">📈</span>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-200 tracking-wider">DATA-DRIVEN GROWTH</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Real insights. Real results.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#080816]/70 border border-white/10 backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <span className="text-[#facc15] text-xl">👑</span>
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
