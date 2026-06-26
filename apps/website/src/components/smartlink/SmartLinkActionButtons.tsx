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
function BrandIcon({ id, size = 22 }: { id: string; size?: number }) {
  const s = size;
  switch (id) {
    case 'spotify':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.12-.779-.18-.899-.54-.12-.42.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      );
    case 'apple_music':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect width="24" height="24" rx="5" fill="#FC3C44"/>
          <path d="M16 7.5L10.5 9v7c0 .83-.67 1.5-1.5 1.5S7.5 16.83 7.5 16s.67-1.5 1.5-1.5c.28 0 .54.08.75.21V9.6l5.5-1.5V14c0 .83-.67 1.5-1.5 1.5S12.25 14.83 12.25 14s.67-1.5 1.5-1.5V7.5H16z" fill="white"/>
        </svg>
      );
    case 'audiomack':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="12" cy="12" r="12" fill="#1A1A1A"/>
          <path d="M6 15V9.5l2.5-.5V15M10 15V9l2.5-.5V15M14 15V8.5l2.5-.5V15M18 15v-5" stroke="#FFA200" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'boomplay':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="12" cy="12" r="12" fill="#00B4DB"/>
          <path d="M8 7h5.5a3.5 3.5 0 010 7H8V7z" fill="white"/>
          <circle cx="11" cy="17" r="2" fill="white"/>
          <circle cx="16" cy="17" r="2" fill="white"/>
        </svg>
      );
    case 'soundcloud':
      return (
        <svg width={s} height={s} viewBox="0 0 300 300" fill="#FF5500" className="shrink-0">
          <path d="M0 193q0 20 13.5 33.5T47 240t33.5-13.5T94 193q0-7-2-13 5 2 10 2 21 0 35.5-14.5T152 132t-14.5-35.5T102 82q-11 0-21 4-4-28-25-46T9 22Q0 22 0 30v163zm128-61q0 17-11.5 28.5T89 172h-1q1-4 1-8 0-25-17.5-44T28 100q2-1 5-1 20 0 36 12 3-6 8-10 12-9 27-9 12 0 22 5t16 14 6 21zm21 17q0-10 7-17t17-7 17 7 7 17-7 17-17 7-17-7-7-17zm34 0q0 4 3 7t7 3 7-3 3-7-3-7-7-3-7 3-3 7zm50-60q0-25-17.5-44T172 26q-11 0-21 4 4 10 4 21 0 25-17.5 44T95 119q1 3 1 7 0 25-17.5 44T35 189q6 26 27 43t47 17q20 0 38.5-8t32-21.5 21.5-32 8-38.5q0-15-4-29z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" className="shrink-0">
          <rect width="24" height="24" rx="5" fill="#010101"/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.03a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.84 4.84 0 01-1.01-.07z" fill="white"/>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.03a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.84 4.84 0 01-1.01-.07z" fill="#69C9D0" fillOpacity="0.4"/>
        </svg>
      );
    case 'youtube_music':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect width="24" height="24" rx="5" fill="#FF0000"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
          <path d="M10.5 10l4 2-4 2V10z" fill="#FF0000"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" className="shrink-0">
          <defs>
            <radialGradient id="ig2" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig2)"/>
          <path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm4.7-8.1a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" fill="white"/>
        </svg>
      );
    case 'amazon_music':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect width="24" height="24" rx="4" fill="#232F3E"/>
          <path d="M5 15.5s3.5 2 7 2 7-2 7-2" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M7 9.5a5 5 0 0110 0v2.5a5 5 0 01-10 0V9.5z" fill="none" stroke="white" strokeWidth="1.2"/>
          <path d="M10 11.5L12 13l2-1.5" stroke="#FF9900" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'deezer':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect x="16.5" y="4" width="4" height="3" rx="0.5" fill="#EF5466"/>
          <rect x="16.5" y="8.5" width="4" height="3" rx="0.5" fill="#FF92A0"/>
          <rect x="16.5" y="13" width="4" height="3" rx="0.5" fill="#EF5466"/>
          <rect x="11" y="8.5" width="4" height="3" rx="0.5" fill="#1990C6"/>
          <rect x="11" y="13" width="4" height="3" rx="0.5" fill="#1990C6"/>
          <rect x="5.5" y="13" width="4" height="3" rx="0.5" fill="#40AB5D"/>
          <rect x="0" y="13" width="4" height="3" rx="0.5" fill="#FFB835"/>
        </svg>
      );
    default:
      return <span className="text-base text-white shrink-0">♫</span>;
  }
}

const LEFT_PLATFORMS  = ['spotify','apple_music','audiomack','boomplay','soundcloud'];
const RIGHT_PLATFORMS = ['tiktok','youtube_music','instagram','amazon_music','deezer'];
const PLATFORM_LABELS: Record<string,string> = {
  spotify: 'Spotify', apple_music: 'Apple Music', audiomack: 'Audiomack',
  boomplay: 'Boomplay', soundcloud: 'SoundCloud',
  tiktok: 'TikTok', youtube_music: 'YouTube Music', instagram: 'Instagram',
  amazon_music: 'Amazon Music', deezer: 'Deezer',
};

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
export default function SmartLinkActionButtons({
  smartLinkId, hubId, artistId, trackId, playlistId,
  dspLinks, audioPreviewUrl, whatsappJoinUrl,
  heroArtworkUrl, playlistCoverUrl, amdLogoUrl, amdBadgeUrl,
  playlistName = 'Chrome AfroFusion Radio', artistName = 'VaB'
}: ActionButtonsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl]     = useState<HTMLAudioElement | null>(null);

  const fire = (key: string, url: string) => {
    try {
      const p = JSON.stringify({ smart_link_id: smartLinkId, hub_id: hubId, artist_id: artistId,
        track_id: trackId, playlist_id: playlistId, destination_dsp: key, destination_url: url });
      navigator.sendBeacon ? navigator.sendBeacon('/api/v1/telemetry/click', p)
        : fetch('/api/v1/telemetry/click',{ method:'POST', headers:{'Content-Type':'application/json'}, body:p }).catch(()=>{});
    } catch(_) {}
  };

  const go = (key: string, url?: string) => { if(!url) return; fire(key, url); window.open(url,'_blank','noopener,noreferrer'); };

  const toggleAudio = () => {
    if (!audioPreviewUrl) return;
    if (isPlaying && audioEl) { audioEl.pause(); setIsPlaying(false); return; }
    const a = audioEl || new Audio(audioPreviewUrl);
    if (!audioEl) { a.onended = () => setIsPlaying(false); setAudioEl(a); }
    fire('internal_audio_preview', audioPreviewUrl);
    a.play(); setIsPlaying(true);
  };

  const ready = (key: string) => {
    if (!dspLinks) return false;
    return key === 'youtube_music' ? Boolean(dspLinks.youtube_music || dspLinks.youtube) : Boolean(dspLinks[key]);
  };
  const url = (key: string) => {
    if (!dspLinks) return undefined;
    return key === 'youtube_music' ? (dspLinks.youtube_music || dspLinks.youtube) : dspLinks[key];
  };

  /* ── Button renderer — identical glassmorphism, border, glow, & lighting for active & inactive ── */
  const Btn = ({ k }: { k: string }) => {
    const isReady = ready(k);
    const href = url(k);
    const label = PLATFORM_LABELS[k] ?? k;
    const base = 'w-full flex items-center justify-between gap-1 sm:gap-1.5 rounded-full border transition-all duration-300 bg-[#07071a]/85 backdrop-blur-lg overflow-hidden';
    const active = `${base} border-[#8a2be2] shadow-[0_0_18px_rgba(138,43,226,0.4),inset_0_0_10px_rgba(0,0,0,0.6)] hover:border-[#00E5FF] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:-translate-y-px cursor-pointer`;
    const disabled = `${base} border-[#8a2be2] shadow-[0_0_18px_rgba(138,43,226,0.4),inset_0_0_10px_rgba(0,0,0,0.6)] cursor-not-allowed opacity-95`;
    return (
      <button
        onClick={isReady ? () => go(k, href) : undefined}
        disabled={!isReady}
        className={isReady ? active : disabled}
        style={{ padding: '6px 10px' }}
        aria-label={isReady ? `Listen on ${label}` : `${label} coming soon`}
      >
        <span className="flex items-center gap-1.5 min-w-0 shrink">
          <BrandIcon id={k} size={18} />
          <span className="font-bold tracking-wide truncate text-white/95" style={{ fontSize: 'clamp(8px, 1.8vw, 13px)' }}>{label}</span>
        </span>
        {isReady
          ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff003c] shadow-[0_0_8px_#ff003c] animate-pulse shrink-0"/>
          : <span className="text-[7px] sm:text-[9px] font-black tracking-widest text-[#00E5FF] border border-[#00E5FF]/40 rounded px-1 py-0.5 whitespace-nowrap shrink-0 shadow-[0_0_6px_rgba(0,229,255,0.3)]">SOON</span>
        }
      </button>
    );
  };

  /* ── Circuit Connectors — visible on ALL breakpoints, terminating with glowing nodes touching button and hub ── */
  const ConnL = () => (
    <div className="flex items-center shrink-0 self-center relative" style={{ width: 'clamp(8px, 2.5vw, 32px)' }}>
      <div className="w-full relative" style={{ height: '2px' }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to left, #00E5FF 0%, #3b82f6 50%, #8a2be2 100%)', boxShadow: '0 0 8px #00E5FF' }}/>
        <div className="absolute inset-0 animate-[energyL_2s_linear_infinite]" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.95), transparent)', width: '40%' }}/>
      </div>
      {/* Node touching streaming button (Left edge) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF,0_0_14px_#00E5FF]" style={{ width: '4px', height: '4px', zIndex: 5 }}/>
      {/* Node touching center hub (Right edge) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF,0_0_14px_#00E5FF]" style={{ width: '4px', height: '4px', zIndex: 5 }}/>
    </div>
  );
  const ConnR = () => (
    <div className="flex items-center shrink-0 self-center relative" style={{ width: 'clamp(8px, 2.5vw, 32px)' }}>
      <div className="w-full relative" style={{ height: '2px' }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #00E5FF 0%, #3b82f6 50%, #8a2be2 100%)', boxShadow: '0 0 8px #00E5FF' }}/>
        <div className="absolute inset-0 animate-[energyR_2s_linear_infinite]" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent)', width: '40%' }}/>
      </div>
      {/* Node touching center hub (Left edge) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF,0_0_14px_#00E5FF]" style={{ width: '4px', height: '4px', zIndex: 5 }}/>
      {/* Node touching streaming button (Right edge) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF,0_0_14px_#00E5FF]" style={{ width: '4px', height: '4px', zIndex: 5 }}/>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO POSTER — reveals precisely the top 57.4% of the artwork:
          AMD badge + all 8 artists + DISCOVER AFRICA'S BIGGEST HITS +
          ONE LINK. EVERY PLATFORM.
          Stops immediately before the printed platforms begin.
      ═══════════════════════════════════════════════════════════ */}
      <div className="w-full relative select-none overflow-hidden"
        style={{ aspectRatio: '1 / 0.72' }}
      >
        <img
          src={heroArtworkUrl}
          alt="Chrome AfroFusion Radio — Discover Africa's Biggest Hits"
          className="absolute inset-0 w-full h-auto"
          style={{ objectFit: 'cover', objectPosition: 'top center', top: 0 }}
          draggable={false}
        />
        {/* Subtle bottom dissolve covering only the dark background behind ONE LINK */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '14%',
            background: 'linear-gradient(to top, #05050e 0%, rgba(5,5,14,0.7) 40%, transparent 100%)',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE ECOSYSTEM — living continuation of the artwork.
      ═══════════════════════════════════════════════════════════ */}
      <div className="w-full" style={{ background: 'linear-gradient(to bottom, #05050e 0%, #060616 100%)', marginTop: '-4px' }}>
        <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6 pt-2">

          {/* ── PLATFORM ECOSYSTEM: Left | Hub | Right ── */}
          <div className="flex items-stretch justify-center gap-0 w-full" style={{ minHeight: '280px' }}>

            {/* LEFT COLUMN */}
            <div className="flex flex-col justify-center gap-2 sm:gap-2.5 flex-1 min-w-0 pr-0">
              {LEFT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center">
                  <Btn k={k} />
                  <ConnL />
                </div>
              ))}
            </div>

            {/* CENTER HUB */}
            <div className="flex flex-col items-center justify-center shrink-0 px-0.5 sm:px-2 relative z-10"
              style={{ width: 'clamp(84px, 20vw, 200px)' }}
            >
              {/* Outer energy ring */}
              <div className="relative rounded-full flex items-center justify-center"
                style={{
                  width: 'clamp(80px, 19vw, 190px)',
                  height: 'clamp(80px, 19vw, 190px)',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #00E5FF 0%, #3b82f6 25%, #8a2be2 55%, #00E5FF 100%)',
                  boxShadow: '0 0 50px rgba(0,229,255,0.65), 0 0 90px rgba(138,43,226,0.4)',
                  animation: 'hubPulse 3s ease-in-out infinite',
                }}
              >
                {/* Inner dark core */}
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{
                    background: '#030310',
                    border: '2px solid rgba(0,229,255,0.4)',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.95)',
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.45) 0%, transparent 70%)' }}/>
                  <span className="relative z-10 font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
                    style={{ fontSize: 'clamp(7px, 1.8vw, 14px)', letterSpacing: '0.2em', fontFamily: 'Georgia, serif' }}>CHROME</span>
                  <span className="relative z-10 font-black"
                    style={{
                      fontSize: 'clamp(9px, 2.3vw, 19px)', letterSpacing: '0.12em',
                      background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#AA771C)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 14px rgba(255,215,0,0.8))',
                    }}>AFROFUSION</span>
                  <span className="relative z-10 font-black text-gray-200"
                    style={{ fontSize: 'clamp(6px, 1.4vw, 10px)', letterSpacing: '0.3em', margin: '2px 0' }}>— RADIO —</span>
                  <span className="relative z-10 font-black text-[#00E5FF]"
                    style={{ fontSize: 'clamp(4.5px, 1.1vw, 8.5px)', letterSpacing: '0.22em', filter: 'drop-shadow(0 0 6px #00E5FF)' }}>POWERED BY</span>
                  <span className="relative z-10 font-black text-[#E0F7FA]"
                    style={{ fontSize: 'clamp(4.5px, 1.2vw, 9.5px)', letterSpacing: '0.22em', filter: 'drop-shadow(0 0 6px #00E5FF)' }}>MUSIC INTEL</span>
                </div>
              </div>

              {/* Equalizer bars */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 mt-2 sm:mt-3"
                style={{ height: 'clamp(14px, 2.5vw, 24px)' }}
              >
                {[
                  ['#00E5FF','60%','0ms'], ['#3b82f6','90%','120ms'], ['#8a2be2','100%','240ms'],
                  ['#00E5FF','70%','80ms'], ['#60a5fa','85%','200ms'], ['#a855f7','50%','40ms'],
                  ['#00E5FF','75%','160ms'],
                ].map(([c,h,d], i) => (
                  <div key={i} className="rounded-full animate-bounce"
                    style={{ width: 'clamp(2px, 0.5vw, 5px)', height: h, backgroundColor: c, boxShadow: `0 0 6px ${c}`, animationDelay: d }}/>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col justify-center gap-2 sm:gap-2.5 flex-1 min-w-0 pl-0">
              {RIGHT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center">
                  <ConnR />
                  <Btn k={k} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="mt-4 sm:mt-6">
            <div className="rounded-2xl border border-[#8a2be2]/50 py-3 px-4 sm:py-4 sm:px-6"
              style={{ background: 'rgba(8,8,22,0.85)', backdropFilter: 'blur(20px)', boxShadow: '0 0 35px rgba(138,43,226,0.25)' }}
            >
              <div className="grid grid-cols-4 text-center divide-x divide-[#8a2be2]/30">
                {[['♫','#a855f7','50','TRACKS'],['👥','#00E5FF','40+','ARTISTS'],['🌐','#D4AF37','10','PLATFORMS'],['📅','#34d399','','UPDATED\nWEEKLY']].map(
                  ([icon, color, num, lbl]) => (
                    <div key={lbl as string} className="flex flex-col items-center px-1 sm:px-3">
                      <span style={{ color: color as string, fontSize: 'clamp(12px, 2.5vw, 20px)' }}>{icon}</span>
                      {num && <span className="font-black text-white" style={{ fontSize: 'clamp(10px, 2vw, 18px)' }}>{num}</span>}
                      <span className="font-black text-gray-300 uppercase leading-tight text-center" style={{ fontSize: 'clamp(6px, 1.2vw, 10px)', letterSpacing: '0.1em', whiteSpace: 'pre-line' }}>{lbl}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ── LISTEN NOW CTA ── */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => go('spotify', dspLinks?.spotify || dspLinks?.apple_music)}
              className="w-full flex items-center justify-center gap-3 sm:gap-5 rounded-full font-black uppercase cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              style={{
                padding: 'clamp(14px, 3vw, 22px) 24px',
                fontSize: 'clamp(20px, 4.5vw, 44px)',
                letterSpacing: '0.16em',
                background: 'linear-gradient(90deg, #BF953F 0%, #FCF6BA 30%, #B38728 55%, #FBF5B7 75%, #AA771C 100%)',
                color: '#000',
                border: '2px solid rgba(255,248,214,0.8)',
                boxShadow: '0 0 50px rgba(255,215,0,0.7), 0 0 90px rgba(255,215,0,0.25)',
              }}
            >
              <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>LISTEN NOW</span>
              <span className="rounded-full bg-black text-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
                style={{ width: 'clamp(32px, 6vw, 52px)', height: 'clamp(32px, 6vw, 52px)', fontSize: 'clamp(14px, 2.5vw, 24px)' }}>▸</span>
            </button>
          </div>

          {/* ── Audio Preview ── */}
          {audioPreviewUrl && (
            <div className="mt-3 sm:mt-4">
              <button onClick={toggleAudio}
                className="w-full max-w-md mx-auto flex items-center justify-between gap-3 rounded-full border font-bold text-xs sm:text-sm transition-all duration-300"
                style={{
                  padding: '10px 20px',
                  background: isPlaying ? 'rgba(0,229,255,0.08)' : 'rgba(8,8,22,0.75)',
                  border: isPlaying ? '1px solid #00E5FF' : '1px solid rgba(138,43,226,0.5)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: isPlaying ? '0 0 22px rgba(0,229,255,0.3)' : 'none',
                }}
              >
                <span className="flex items-center gap-2.5 text-gray-200">
                  <span>{isPlaying ? '🔊' : '🎧'}</span>
                  <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio...' : 'Preview 30s Master Audio'}</span>
                </span>
                <span className="px-3 py-1 rounded-full font-black tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(0,229,255,0.35)', color: '#00E5FF', fontSize: '10px' }}>
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </button>
            </div>
          )}

          {/* ── Tagline ── */}
          <div className="text-center mt-4 mb-2">
            <p className="font-black tracking-[0.25em] uppercase" style={{ fontSize: 'clamp(9px, 2vw, 13px)' }}>
              <span style={{ color: '#D4AF37' }}>AFRICA&apos;S MUSIC.</span>{' '}
              <span style={{ color: '#8a2be2' }}>POWERED BY INTELLIGENCE.</span>
            </p>
          </div>

          {/* ── Value Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4 pb-24">
            {[
              { icon: '🧠', color: '#a855f7', title: 'MUSIC INTELLIGENCE', sub: 'Smart curation. Smarter listening.' },
              { icon: '🌐', color: '#00E5FF', title: 'GLOBAL REACH', sub: 'One link. Worldwide.' },
              { icon: '⭐', color: '#D4AF37', title: 'SMART RECS', sub: 'Discover more. Love more.' },
              { icon: '📈', color: '#34d399', title: 'DATA GROWTH', sub: 'Real insights. Real results.' },
              { icon: '👑', color: '#facc15', title: 'ARTIST POWER', sub: 'More visibility. More opportunities.' },
            ].map(({ icon, color, title, sub }) => (
              <div key={title} className="flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl transition-colors"
                style={{
                  padding: 'clamp(10px, 2vw, 16px)',
                  background: 'rgba(8,8,22,0.88)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.75)',
                }}
              >
                <span className="shrink-0 mt-0.5" style={{ color, fontSize: 'clamp(14px, 2.5vw, 20px)' }}>{icon}</span>
                <div>
                  <h4 className="font-black uppercase text-gray-100 leading-tight" style={{ fontSize: 'clamp(7px, 1.4vw, 11px)', letterSpacing: '0.06em' }}>{title}</h4>
                  <p className="text-gray-400 leading-snug mt-1" style={{ fontSize: 'clamp(7px, 1.2vw, 10px)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WhatsApp Sticky CTA ── */}
      {whatsappJoinUrl && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
          <button
            onClick={() => go('whatsapp', whatsappJoinUrl)}
            className="w-full flex items-center justify-between rounded-2xl border font-black cursor-pointer transition-all hover:brightness-110"
            style={{ padding: '14px 20px', background: 'linear-gradient(90deg, #059669, #16a34a)', color: 'white', border: '1px solid rgba(52,211,153,0.4)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>JOIN FREE</span>
          </button>
        </div>
      )}

      {/* ── Keyframe animations — energy flowing outward from Center Hub to buttons ── */}
      <style>{`
        @keyframes energyL {
          0%   { transform: translateX(250%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(-50%); opacity: 0; }
        }
        @keyframes energyR {
          0%   { transform: translateX(-50%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(250%); opacity: 0; }
        }
        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 50px rgba(0,229,255,0.65), 0 0 90px rgba(138,43,226,0.4); }
          50%       { box-shadow: 0 0 80px rgba(0,229,255,0.9), 0 0 130px rgba(138,43,226,0.6); }
        }
      `}</style>
    </>
  );
}
