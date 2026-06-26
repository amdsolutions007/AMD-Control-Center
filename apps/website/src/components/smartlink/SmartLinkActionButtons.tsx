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

/* ─────────────────────────────────────────────────────────────────
   Official SVG brand icons — accurate brand colours & shapes
───────────────────────────────────────────────────────────────── */
function BrandIcon({ id }: { id: string }) {
  switch (id) {
    case 'spotify':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#1ED760">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.12-.779-.18-.899-.54-.12-.42.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      );
    case 'apple_music':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#FC3C44"/>
          <path d="M16.5 7.5L10 9v7.5c0 .83-.67 1.5-1.5 1.5S7 17.33 7 16.5 7.67 15 8.5 15c.28 0 .54.08.76.21L9.5 9.3l7-1.8V14c0-.06.5 0 0 0-.83 0-1.5.67-1.5 1.5S15.67 17 16.5 17 18 16.33 18 15.5V9a1.5 1.5 0 00-1.5-1.5z" fill="white"/>
        </svg>
      );
    case 'audiomack':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFA200">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 13h-2v-2.27l-2.5 2.5-1.41-1.42L9.27 12 7.09 9.79l1.41-1.42L11 10.86V8h2v4.86l2.5-2.5 1.41 1.42L14.73 12l2.18 2.21-1.41 1.42L13 13.14V15z"/>
        </svg>
      );
    case 'boomplay':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#00B4DB"/>
          <path d="M7 8.5A1.5 1.5 0 018.5 7h7A1.5 1.5 0 0117 8.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 15.5v-7z" fill="none" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="2.5" fill="white"/>
          <circle cx="12" cy="12" r="1" fill="#00B4DB"/>
        </svg>
      );
    case 'soundcloud':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF5500">
          <path d="M1.175 12.225c-.051 0-.094.045-.101.096l-.168 1.882c-.007.062.031.119.092.138l.177.051c.051 0 .094-.045.101-.096l.168-1.882c.007-.062-.031-.119-.092-.138l-.177-.051zm-.69.876l-.201 1.008c-.01.053.024.103.077.113l.184.037c.053 0 .1-.036.112-.089l.201-1.008c.01-.053-.024-.103-.077-.113l-.184-.037c-.053 0-.1.036-.112.089zm1.37-.31l-.168 1.882c-.007.062.031.119.092.138l.177.051c.051 0 .094-.045.101-.096l.168-1.882c.007-.062-.031-.119-.092-.138l-.177-.051c-.051 0-.094.045-.101.096zM11.5 8.5c-1.8 0-3.3 1.3-3.5 3-.4-.2-.8-.3-1.3-.3-1.8 0-3.2 1.4-3.2 3.2 0 1.8 1.4 3.1 3.2 3.1h13.1c1.3 0 2.2-1 2.2-2.3 0-1.2-.9-2.1-2.1-2.3 0-2.4-1.9-4.4-4.3-4.4-.7 0-1.4.2-2.1.5-.7-.3-1.3-.5-2-.5z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.06 6.33 6.33 0 00-5.69 9.09 6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      );
    case 'youtube_music':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#FF0000"/>
          <circle cx="12" cy="12" r="4.5" fill="white"/>
          <circle cx="12" cy="12" r="2" fill="#FF0000"/>
          <path d="M10.5 10.5L14.5 12L10.5 13.5V10.5z" fill="white"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <defs>
            <radialGradient id="ig" cx="30%" cy="107%" r="140%">
              <stop offset="0%" stopColor="#fdf497"/>
              <stop offset="5%" stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig)"/>
          <path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm4.7-8.1a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" fill="white"/>
        </svg>
      );
    case 'amazon_music':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#232F3E"/>
          <path d="M7 11.5c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z" fill="none" stroke="#FF9900" strokeWidth="1.5"/>
          <path d="M5 15.5s3 2 7 2 7-2 7-2" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 11l1.5 1.5L14 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'deezer':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="17" y="5" width="4" height="3" rx="0.5" fill="#EF5466"/>
          <rect x="17" y="9.5" width="4" height="3" rx="0.5" fill="#FF92A0"/>
          <rect x="17" y="14" width="4" height="3" rx="0.5" fill="#EF5466"/>
          <rect x="11.5" y="9.5" width="4" height="3" rx="0.5" fill="#1990C6"/>
          <rect x="11.5" y="14" width="4" height="3" rx="0.5" fill="#1990C6"/>
          <rect x="6" y="14" width="4" height="3" rx="0.5" fill="#333"/>
          <rect x="0.5" y="14" width="4" height="3" rx="0.5" fill="#333"/>
        </svg>
      );
    default:
      return <span className="text-xl text-white">♫</span>;
  }
}

/* ─────────────────────────────────────────────────────────────────
   Platform data — exact approved poster layout (Left 5 / Right 5)
───────────────────────────────────────────────────────────────── */
const LEFT_PLATFORMS = [
  { key: 'spotify', name: 'Spotify' },
  { key: 'apple_music', name: 'Apple Music' },
  { key: 'audiomack', name: 'Audiomack' },
  { key: 'boomplay', name: 'Boomplay' },
  { key: 'soundcloud', name: 'SoundCloud' },
];

const RIGHT_PLATFORMS = [
  { key: 'tiktok', name: 'TikTok' },
  { key: 'youtube_music', name: 'YouTube Music' },
  { key: 'instagram', name: 'Instagram' },
  { key: 'amazon_music', name: 'Amazon Music' },
  { key: 'deezer', name: 'Deezer' },
];

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
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
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  /* Telemetry */
  const fire = (dspKey: string, url: string) => {
    try {
      const payload = JSON.stringify({
        smart_link_id: smartLinkId,
        hub_id: hubId,
        artist_id: artistId,
        track_id: trackId,
        playlist_id: playlistId,
        destination_dsp: dspKey,
        destination_url: url,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/v1/telemetry/click', payload);
      } else {
        fetch('/api/v1/telemetry/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
      }
    } catch (_) {}
  };

  const handleClick = (key: string, url?: string) => {
    if (!url) return;
    fire(key, url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleAudio = () => {
    if (!audioPreviewUrl) return;
    if (isPlaying && audioEl) { audioEl.pause(); setIsPlaying(false); return; }
    const audio = audioEl || new Audio(audioPreviewUrl);
    if (!audioEl) { audio.onended = () => setIsPlaying(false); setAudioEl(audio); }
    fire('internal_audio_preview', audioPreviewUrl);
    audio.play();
    setIsPlaying(true);
  };

  const isReady = (key: string) => {
    if (!dspLinks) return false;
    if (key === 'youtube_music') return Boolean(dspLinks.youtube_music || dspLinks.youtube);
    return Boolean(dspLinks[key]);
  };

  const getUrl = (key: string) => {
    if (!dspLinks) return undefined;
    if (key === 'youtube_music') return dspLinks.youtube_music || dspLinks.youtube;
    return dspLinks[key];
  };

  /* Shared button class — identical for both ready and disabled */
  const btnBase =
    'w-full bg-[#080818]/90 border-[1.5px] border-[#8a2be2] rounded-full py-2.5 sm:py-3 px-4 sm:px-5 flex items-center justify-between backdrop-blur-md shadow-[0_0_22px_rgba(138,43,226,0.38)] transition-all duration-300 font-sans select-none gap-2';
  const btnReady =
    `${btnBase} hover:border-[#00E5FF] hover:bg-[#10102a] hover:shadow-[0_0_35px_rgba(0,229,255,0.65)] hover:-translate-y-0.5 cursor-pointer`;
  const btnDisabled =
    `${btnBase} border-[#6d28d9]/55 cursor-not-allowed`;

  /* Connector line — animated energy pulse */
  const connectorLeft = (
    <div className="hidden lg:block relative h-[2px] w-14 xl:w-20 shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-l from-[#00E5FF] via-[#4f46e5] to-[#7c3aed] shadow-[0_0_12px_#00E5FF]" />
      <div className="absolute inset-0 animate-[energyFlow_1.8s_linear_infinite] bg-gradient-to-l from-transparent via-white/90 to-transparent w-1/3" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_20px_#00E5FF]" />
    </div>
  );

  const connectorRight = (
    <div className="hidden lg:block relative h-[2px] w-14 xl:w-20 shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-[#4f46e5] to-[#7c3aed] shadow-[0_0_12px_#00E5FF]" />
      <div className="absolute inset-0 animate-[energyFlow_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-white/90 to-transparent w-1/3" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_20px_#00E5FF]" />
    </div>
  );

  const renderLeft = ({ key, name }: { key: string; name: string }) => {
    const ready = isReady(key);
    const url = getUrl(key);
    return (
      <div key={key} className="flex items-center gap-0 group w-full">
        {ready ? (
          <button onClick={() => handleClick(key, url)} className={btnReady} aria-label={`Listen on ${name}`}>
            <div className="flex items-center gap-3 truncate min-w-0">
              <span className="shrink-0"><BrandIcon id={key} /></span>
              <span className="text-sm sm:text-[15px] font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate">{name}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#ff003c] shadow-[0_0_10px_#ff003c,0_0_16px_#ff003c] animate-pulse shrink-0 ml-2" />
          </button>
        ) : (
          <button disabled className={btnDisabled} aria-label={`${name} coming soon`}>
            <div className="flex items-center gap-3 truncate min-w-0">
              <span className="shrink-0 opacity-75"><BrandIcon id={key} /></span>
              <span className="text-sm sm:text-[15px] font-extrabold tracking-wide text-gray-300 truncate">{name}</span>
            </div>
            <span className="text-[8px] font-black tracking-widest uppercase text-cyan-300/80 bg-white/8 border border-white/15 px-2 py-0.5 rounded shrink-0 ml-2 whitespace-nowrap">SOON</span>
          </button>
        )}
        {connectorLeft}
      </div>
    );
  };

  const renderRight = ({ key, name }: { key: string; name: string }) => {
    const ready = isReady(key);
    const url = getUrl(key);
    return (
      <div key={key} className="flex items-center gap-0 group w-full">
        {connectorRight}
        {ready ? (
          <button onClick={() => handleClick(key, url)} className={btnReady} aria-label={`Listen on ${name}`}>
            <div className="flex items-center gap-3 truncate min-w-0">
              <span className="shrink-0"><BrandIcon id={key} /></span>
              <span className="text-sm sm:text-[15px] font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate">{name}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#ff003c] shadow-[0_0_10px_#ff003c,0_0_16px_#ff003c] animate-pulse shrink-0 ml-2" />
          </button>
        ) : (
          <button disabled className={btnDisabled} aria-label={`${name} coming soon`}>
            <div className="flex items-center gap-3 truncate min-w-0">
              <span className="shrink-0 opacity-75"><BrandIcon id={key} /></span>
              <span className="text-sm sm:text-[15px] font-extrabold tracking-wide text-gray-300 truncate">{name}</span>
            </div>
            <span className="text-[8px] font-black tracking-widest uppercase text-cyan-300/80 bg-white/8 border border-white/15 px-2 py-0.5 rounded shrink-0 ml-2 whitespace-nowrap">SOON</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          COMPOSITION 1 — Master Hero Poster
          Strategy: show full artwork with object-contain, then a
          strong dark gradient covers the bottom ~48% so the HTML
          interactive controls emerge from within the poster rather
          than appearing below it. Zero cropping of top content.
      ════════════════════════════════════════════════════════════ */}
      <div className="w-full relative select-none">
        {/* Full artwork — no cropping, full natural proportions */}
        <img
          src={heroArtworkUrl}
          alt="Chrome AfroFusion Radio — Discover Africa's Biggest Hits"
          className="w-full h-auto block"
          style={{ maxHeight: '680px', objectFit: 'contain', objectPosition: 'top center' }}
          draggable={false}
        />

        {/* Dark vignette over the BOTTOM half of the artwork —
            hides the printed platform buttons / hub / stats / CTA
            so the HTML interactive versions replace them seamlessly */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '54%',
            background: 'linear-gradient(to top, #05050e 0%, #05050e 30%, rgba(5,5,14,0.96) 55%, rgba(5,5,14,0.82) 72%, transparent 100%)',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          COMPOSITION 2 — Interactive Streaming Ecosystem
          Pulled up with negative margin so it sits directly over
          the artwork's lower half — completing the transformation
      ════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 relative z-10" style={{ marginTop: '-46%' }}>

        {/* ── Platform Grid + Center Hub ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-3 lg:gap-0">

          {/* Left platforms */}
          <div className="flex flex-col gap-2.5 sm:gap-3 order-2 lg:order-1 w-full max-w-[340px] mx-auto lg:max-w-none">
            {LEFT_PLATFORMS.map(renderLeft)}
          </div>

          {/* Center Hub */}
          <div className="flex flex-col items-center order-1 lg:order-2 py-3 lg:py-0 lg:px-2 shrink-0">
            {/* Outer glow ring */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-full p-[3px]"
              style={{
                background: 'linear-gradient(135deg, #00E5FF 0%, #3b82f6 30%, #8a2be2 60%, #00E5FF 100%)',
                boxShadow: '0 0 80px rgba(0,229,255,0.72), 0 0 130px rgba(138,43,226,0.48), inset 0 0 40px rgba(0,229,255,0.55)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}
            >
              {/* Inner dark core */}
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden border-2 border-[#00E5FF]/55"
                style={{ background: '#050512', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.95)' }}
              >
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(138,43,226,0.5) 0%, transparent 72%)' }}
                />
                <span className="relative z-10 text-lg sm:text-xl md:text-2xl font-black text-white tracking-[0.22em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ fontFamily: 'Georgia, serif' }}>CHROME</span>
                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-black tracking-wider my-1"
                  style={{ background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#AA771C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))' }}
                >AFROFUSION</span>
                <span className="relative z-10 text-[10px] sm:text-xs font-black tracking-[0.35em] text-gray-100 mb-2">— RADIO —</span>
                <span className="relative z-10 text-[8px] sm:text-[9px] font-black tracking-[0.28em] uppercase text-[#00E5FF] drop-shadow-[0_0_8px_#00E5FF]">POWERED BY</span>
                <span className="relative z-10 text-[9px] sm:text-[10px] font-black tracking-[0.28em] uppercase text-[#E0F7FA] drop-shadow-[0_0_8px_#00E5FF]">MUSIC INTEL</span>
              </div>
            </div>

            {/* Equalizer waveform */}
            <div className="flex items-end gap-1.5 mt-4 h-7 sm:h-8">
              {[
                { h: 'h-4', c: '#00E5FF', d: '0ms' },
                { h: 'h-6', c: '#3b82f6', d: '120ms' },
                { h: 'h-8', c: '#8a2be2', d: '240ms' },
                { h: 'h-5', c: '#00E5FF', d: '80ms' },
                { h: 'h-7', c: '#60a5fa', d: '200ms' },
                { h: 'h-3', c: '#a855f7', d: '40ms' },
                { h: 'h-6', c: '#00E5FF', d: '160ms' },
              ].map((b, i) => (
                <div key={i} className={`w-1.5 ${b.h} rounded-full animate-bounce`}
                  style={{ backgroundColor: b.c, boxShadow: `0 0 8px ${b.c}`, animationDelay: b.d }} />
              ))}
            </div>
          </div>

          {/* Right platforms */}
          <div className="flex flex-col gap-2.5 sm:gap-3 order-3 w-full max-w-[340px] mx-auto lg:max-w-none">
            {RIGHT_PLATFORMS.map(renderRight)}
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-[#080816]/90 backdrop-blur-2xl border border-[#8a2be2]/55 rounded-2xl py-3.5 px-5 shadow-[0_0_40px_rgba(138,43,226,0.3)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:divide-x divide-[#8a2be2]/35 text-center">
              {[
                { icon: '♫', color: '#a855f7', label: '50 TRACKS' },
                { icon: '👥', color: '#00E5FF', label: '40+ ARTISTS' },
                { icon: '🌐', color: '#D4AF37', label: '10 PLATFORMS' },
                { icon: '📅', color: '#34d399', label: 'UPDATED WEEKLY' },
              ].map(({ icon, color, label }) => (
                <div key={label} className="flex items-center justify-center gap-2 py-1 sm:pl-3 first:pl-0">
                  <span style={{ color }}>{icon}</span>
                  <span className="text-[11px] sm:text-xs font-black text-gray-100 tracking-widest uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTEN NOW CTA ── */}
        <div className="mt-5 sm:mt-6">
          <button
            onClick={() => handleClick('spotify', dspLinks?.spotify || dspLinks?.apple_music)}
            className="w-full flex items-center justify-center gap-4 rounded-full uppercase font-black cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            style={{
              padding: '18px 32px',
              fontSize: 'clamp(28px, 6vw, 48px)',
              letterSpacing: '0.17em',
              background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
              color: '#000',
              border: '2.5px solid #FFF8D6',
              boxShadow: '0 0 55px rgba(255,215,0,0.75), 0 0 100px rgba(255,215,0,0.3)',
            }}
          >
            <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>LISTEN NOW</span>
            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-[#FFD700] flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-inner shrink-0">▸</span>
          </button>
        </div>

        {/* ── Audio Preview (secondary — below CTA) ── */}
        {audioPreviewUrl && (
          <div className="mt-4">
            <button
              onClick={toggleAudio}
              className={`w-full max-w-md mx-auto py-3 px-6 rounded-full flex items-center justify-between border text-xs sm:text-sm font-bold transition-all duration-300 backdrop-blur-xl ${
                isPlaying
                  ? 'border-[#00E5FF] text-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.35)]'
                  : 'border-[#8a2be2]/55 text-gray-200 hover:border-[#8a2be2] hover:bg-[#10102a]'
              }`}
              style={{ background: isPlaying ? 'rgba(0,229,255,0.08)' : 'rgba(8,8,22,0.75)' }}
            >
              <span className="flex items-center gap-2.5">
                <span>{isPlaying ? '🔊' : '🎧'}</span>
                <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio Cut...' : 'Preview 30s Master Audio'}</span>
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#00E5FF] border border-[#00E5FF]/40 font-black tracking-wider">
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </span>
            </button>
          </div>
        )}

        {/* ── Tagline ── */}
        <div className="text-center mt-5 mb-2">
          <p className="text-[11px] sm:text-xs font-black tracking-[0.28em] uppercase">
            <span style={{ color: '#D4AF37' }}>AFRICA&apos;S MUSIC.</span>{' '}
            <span style={{ color: '#8a2be2' }}>POWERED BY INTELLIGENCE.</span>
          </p>
        </div>

        {/* ── Value Pillars ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pb-20">
          {[
            { icon: '🧠', color: '#a855f7', title: 'MUSIC INTELLIGENCE', sub: 'Smart curation. Smarter listening.' },
            { icon: '🌐', color: '#00E5FF', title: 'GLOBAL REACH', sub: 'One link. Worldwide.' },
            { icon: '⭐', color: '#D4AF37', title: 'SMART RECOMMENDATIONS', sub: 'Discover more. Love more.' },
            { icon: '📈', color: '#34d399', title: 'DATA-DRIVEN GROWTH', sub: 'Real insights. Real results.' },
            { icon: '👑', color: '#facc15', title: 'ARTIST EMPOWERMENT', sub: 'More visibility. More opportunities.', span: true },
          ].map(({ icon, color, title, sub, span }) => (
            <div key={title} className={`flex items-start gap-3 p-4 rounded-2xl backdrop-blur-2xl border border-white/12 hover:border-opacity-60 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.8)] ${span ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{ background: 'rgba(8,8,22,0.88)', '--tw-border-opacity': '0.6' } as React.CSSProperties}
            >
              <span className="text-xl shrink-0 mt-0.5" style={{ color }}>{icon}</span>
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-100 tracking-wide leading-tight">{title}</h4>
                <p className="text-[9px] text-gray-400 leading-snug mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WhatsApp Sticky ── */}
      {whatsappJoinUrl && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
          <button
            onClick={() => handleClick('whatsapp', whatsappJoinUrl)}
            className="w-full py-3.5 px-6 rounded-2xl flex items-center justify-between shadow-2xl border border-emerald-400/35 cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(90deg, #059669, #16a34a)', color: 'white', fontWeight: 900 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg uppercase tracking-wider">JOIN FREE</span>
          </button>
        </div>
      )}

      {/* ── Circuit energy keyframe animation injected globally ── */}
      <style>{`
        @keyframes energyFlow {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </>
  );
}
