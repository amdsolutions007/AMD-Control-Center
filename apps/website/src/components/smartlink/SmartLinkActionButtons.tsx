'use client';

import React, { useState, useId } from 'react';

interface DSPLinks { [key: string]: string; }

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

/* ─────────────────── BRAND SVG ICONS ─────────────────── */
function BrandIcon({ id, size = 20 }: { id: string; size?: number }) {
  switch (id) {
    case 'spotify':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1ED760"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.12-.779-.18-.899-.54-.12-.42.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>;
    case 'apple_music':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#FC3C44"/><path d="M16 7.5L10.5 9v7c0 .83-.67 1.5-1.5 1.5S7.5 16.83 7.5 16s.67-1.5 1.5-1.5c.28 0 .54.08.75.21V9.6l5.5-1.5V14c0 .83-.67 1.5-1.5 1.5S12.25 14.83 12.25 14s.67-1.5 1.5-1.5V7.5H16z" fill="white"/></svg>;
    case 'audiomack':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1A1A1A"/><path d="M6 15V9.5l2.5-.5V15M10 15V9l2.5-.5V15M14 15V8.5l2.5-.5V15M18 15v-5" stroke="#FFA200" strokeWidth="1.8" strokeLinecap="round"/></svg>;
    case 'boomplay':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#00B4DB"/><path d="M8 7h5.5a3.5 3.5 0 010 7H8V7z" fill="white"/><circle cx="11" cy="17" r="2" fill="white"/><circle cx="16" cy="17" r="2" fill="white"/></svg>;
    case 'soundcloud':
      return <svg width={size} height={size} viewBox="0 0 300 300" fill="#FF5500"><path d="M0 193q0 20 13.5 33.5T47 240t33.5-13.5T94 193q0-7-2-13 5 2 10 2 21 0 35.5-14.5T152 132t-14.5-35.5T102 82q-11 0-21 4-4-28-25-46T9 22Q0 22 0 30v163zm128-61q0 17-11.5 28.5T89 172h-1q1-4 1-8 0-25-17.5-44T28 100q2-1 5-1 20 0 36 12 3-6 8-10 12-9 27-9 12 0 22 5t16 14 6 21zm21 17q0-10 7-17t17-7 17 7 7 17-7 17-17 7-17-7-7-17zm34 0q0 4 3 7t7 3 7-3 3-7-3-7-7-3-7 3-3 7zm50-60q0-25-17.5-44T172 26q-11 0-21 4 4 10 4 21 0 25-17.5 44T95 119q1 3 1 7 0 25-17.5 44T35 189q6 26 27 43t47 17q20 0 38.5-8t32-21.5 21.5-32 8-38.5q0-15-4-29z"/></svg>;
    case 'tiktok':
      return <svg width={size} height={size} viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#010101"/><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.03a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.84 4.84 0 01-1.01-.07z" fill="white"/></svg>;
    case 'youtube_music':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#FF0000"/><circle cx="12" cy="12" r="5" fill="white"/><path d="M10.5 10l4 2-4 2V10z" fill="#FF0000"/></svg>;
    case 'instagram':
      return <svg width={size} height={size} viewBox="0 0 24 24"><defs><radialGradient id="ig3" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig3)"/><path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm4.7-8.1a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" fill="white"/></svg>;
    case 'amazon_music':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#232F3E"/><path d="M5 15.5s3.5 2 7 2 7-2 7-2" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round"/><path d="M7 9.5a5 5 0 0110 0v2.5a5 5 0 01-10 0V9.5z" fill="none" stroke="white" strokeWidth="1.2"/><path d="M10 11.5L12 13l2-1.5" stroke="#FF9900" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'deezer':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="16.5" y="4" width="4" height="3" rx="0.5" fill="#EF5466"/><rect x="16.5" y="8.5" width="4" height="3" rx="0.5" fill="#FF92A0"/><rect x="16.5" y="13" width="4" height="3" rx="0.5" fill="#EF5466"/><rect x="11" y="8.5" width="4" height="3" rx="0.5" fill="#1990C6"/><rect x="11" y="13" width="4" height="3" rx="0.5" fill="#1990C6"/><rect x="5.5" y="13" width="4" height="3" rx="0.5" fill="#40AB5D"/><rect x="0" y="13" width="4" height="3" rx="0.5" fill="#FFB835"/></svg>;
    default:
      return <span className="text-white shrink-0">♫</span>;
  }
}

const LEFT_PLATFORMS  = ['spotify','apple_music','audiomack','boomplay','soundcloud'] as const;
const RIGHT_PLATFORMS = ['tiktok','youtube_music','instagram','amazon_music','deezer'] as const;
const PLATFORM_LABELS: Record<string,string> = {
  spotify: 'Spotify', apple_music: 'Apple Music', audiomack: 'Audiomack',
  boomplay: 'Boomplay', soundcloud: 'SoundCloud',
  tiktok: 'TikTok', youtube_music: 'YouTube Music', instagram: 'Instagram',
  amazon_music: 'Amazon Music', deezer: 'Deezer',
};

/* ─────────────────── ORGANIC CURVED SVG CIRCUIT ─────────────────── */
/*
  The SVG uses a responsive viewBox (0 0 1000 680) laid over the full ecosystem.
  Hub center: (500, 340)
  Left button anchor points (right edge of button → circuit terminus at hub perimeter):
    Spotify (row 0):      (220, 80)
    Apple Music (row 1):  (220, 190)
    Audiomack (row 2):    (220, 300)
    Boomplay (row 3):     (220, 410)
    SoundCloud (row 4):   (220, 520)
  Right button anchor points (left edge of button → circuit terminus at hub perimeter):
    TikTok (row 0):       (780, 80)
    YouTube Music (row 1):(780, 190)
    Instagram (row 2):    (780, 300)
    Amazon Music (row 3): (780, 410)
    Deezer (row 4):       (780, 520)
  Hub radius: ~110 units
  Circuit style: curved bezier paths with angular mid-points matching artwork geometry
*/
function CircuitSVG({ uid }: { uid: string }) {
  // Left circuits: from hub perimeter to each left button
  // Each path goes: hub edge → horizontal segment → 45° angular bend → button edge
  const leftPaths = [
    // Spotify - curves upward from hub
    `M 390,280 C 360,240 300,120 220,90`,
    // Apple Music
    `M 380,310 C 340,285 290,225 220,200`,
    // Audiomack - straight horizontal with slight curve
    `M 375,330 C 330,320 280,310 220,308`,
    // Boomplay - curves downward
    `M 378,358 C 335,375 285,395 220,410`,
    // SoundCloud
    `M 390,375 C 355,415 300,490 220,518`,
  ];
  const rightPaths = [
    // TikTok - curves upward
    `M 610,280 C 640,240 700,120 780,90`,
    // YouTube Music
    `M 620,310 C 660,285 710,225 780,200`,
    // Instagram - straight with slight curve
    `M 625,330 C 670,320 720,310 780,308`,
    // Amazon Music
    `M 622,358 C 665,375 715,395 780,410`,
    // Deezer
    `M 610,375 C 645,415 700,490 780,518`,
  ];

  // Node positions (left button right edge termination)
  const leftNodes = [[220,90],[220,200],[220,308],[220,410],[220,518]];
  // Node positions (right button left edge termination)
  const rightNodes = [[780,90],[780,200],[780,308],[780,410],[780,518]];
  // Hub perimeter nodes
  const hubLeftNodes = [[390,280],[380,310],[375,330],[378,358],[390,375]];
  const hubRightNodes = [[610,280],[620,310],[625,330],[622,358],[610,375]];

  return (
    <svg
      viewBox="0 0 1000 620"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Animated energy gradient for left paths */}
        {leftPaths.map((_, i) => (
          <linearGradient key={`lg-l-${i}`} id={`${uid}-lg-l-${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="340" x2="220" y2={[90,200,308,410,518][i]}>
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0"/>
            <stop offset="20%" stopColor="#00E5FF" stopOpacity="0.9"/>
            <stop offset="60%" stopColor="#8a2be2" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#8a2be2" stopOpacity="0.3"/>
          </linearGradient>
        ))}
        {/* Animated energy gradient for right paths */}
        {rightPaths.map((_, i) => (
          <linearGradient key={`lg-r-${i}`} id={`${uid}-lg-r-${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="340" x2="780" y2={[90,200,308,410,518][i]}>
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0"/>
            <stop offset="20%" stopColor="#00E5FF" stopOpacity="0.9"/>
            <stop offset="60%" stopColor="#8a2be2" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#8a2be2" stopOpacity="0.3"/>
          </linearGradient>
        ))}
        {/* Pulse gradient - for animated energy packet */}
        <linearGradient id={`${uid}-pulse`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="40%" stopColor="white" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="transparent"/>
        </linearGradient>
        {/* Glow filter */}
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Strong glow for nodes */}
        <filter id={`${uid}-node-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Base circuit paths (permanent glow lines) ── */}
      {leftPaths.map((d, i) => (
        <g key={`l-${i}`}>
          {/* Outer glow */}
          <path d={d} stroke="#8a2be2" strokeWidth="4" fill="none" strokeOpacity="0.25" strokeLinecap="round"/>
          {/* Core line */}
          <path d={d} stroke={`url(#${uid}-lg-l-${i})`} strokeWidth="1.8" fill="none" strokeLinecap="round"
            filter={`url(#${uid}-glow)`}/>
        </g>
      ))}
      {rightPaths.map((d, i) => (
        <g key={`r-${i}`}>
          <path d={d} stroke="#8a2be2" strokeWidth="4" fill="none" strokeOpacity="0.25" strokeLinecap="round"/>
          <path d={d} stroke={`url(#${uid}-lg-r-${i})`} strokeWidth="1.8" fill="none" strokeLinecap="round"
            filter={`url(#${uid}-glow)`}/>
        </g>
      ))}

      {/* ── Animated energy packets travelling along each path ── */}
      {leftPaths.map((d, i) => (
        <path key={`pulse-l-${i}`} d={d} stroke="white" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeOpacity="0.9"
          style={{
            strokeDasharray: '40 1000',
            animation: `dashL${i} 2.5s linear ${i * 0.5}s infinite`,
            filter: 'drop-shadow(0 0 6px #00E5FF)',
          }}
        />
      ))}
      {rightPaths.map((d, i) => (
        <path key={`pulse-r-${i}`} d={d} stroke="white" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeOpacity="0.9"
          style={{
            strokeDasharray: '40 1000',
            animation: `dashR${i} 2.5s linear ${i * 0.5 + 0.25}s infinite`,
            filter: 'drop-shadow(0 0 6px #00E5FF)',
          }}
        />
      ))}

      {/* ── Branch intersection nodes along left paths ── */}
      {[
        [310,190],[260,150],  // Spotify branch
        [295,255],[250,228],  // Apple Music branch
        [300,319],[255,314],  // Audiomack branch
        [298,383],[255,397],  // Boomplay branch
        [310,430],[265,475],  // SoundCloud branch
      ].map(([cx, cy], i) => (
        <circle key={`bn-l-${i}`} cx={cx} cy={cy} r="4" fill="#a855f7" fillOpacity="0.8"
          filter={`url(#${uid}-glow)`}>
          <animate attributeName="fill-opacity" values="0.5;1;0.5" dur={`${1.5 + i*0.2}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* Branch intersection nodes along right paths */}
      {[
        [690,190],[740,150],
        [705,255],[750,228],
        [700,319],[745,314],
        [702,383],[745,397],
        [690,430],[735,475],
      ].map(([cx, cy], i) => (
        <circle key={`bn-r-${i}`} cx={cx} cy={cy} r="4" fill="#a855f7" fillOpacity="0.8"
          filter={`url(#${uid}-glow)`}>
          <animate attributeName="fill-opacity" values="0.5;1;0.5" dur={`${1.5 + i*0.2}s`} repeatCount="indefinite"/>
        </circle>
      ))}

      {/* ── Left platform termination nodes (glowing energy arrival) ── */}
      {leftNodes.map(([cx, cy], i) => (
        <g key={`tn-l-${i}`}>
          {/* Outer bloom */}
          <circle cx={cx} cy={cy} r="10" fill="#00E5FF" fillOpacity="0.15">
            <animate attributeName="r" values="8;14;8" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.1;0.3;0.1" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
          </circle>
          {/* Inner core */}
          <circle cx={cx} cy={cy} r="5" fill="#00E5FF" filter={`url(#${uid}-node-glow)`}>
            <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite"/>
          </circle>
          {/* Bright center */}
          <circle cx={cx} cy={cy} r="2.5" fill="white"/>
        </g>
      ))}
      {/* ── Right platform termination nodes ── */}
      {rightNodes.map(([cx, cy], i) => (
        <g key={`tn-r-${i}`}>
          <circle cx={cx} cy={cy} r="10" fill="#00E5FF" fillOpacity="0.15">
            <animate attributeName="r" values="8;14;8" dur="2s" begin={`${i*0.4+0.2}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.1;0.3;0.1" dur="2s" begin={`${i*0.4+0.2}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="5" fill="#00E5FF" filter={`url(#${uid}-node-glow)`}>
            <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="2s" begin={`${i*0.4+0.2}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="2.5" fill="white"/>
        </g>
      ))}

      {/* ── Hub perimeter nodes (where circuits begin) ── */}
      {hubLeftNodes.map(([cx, cy], i) => (
        <circle key={`hn-l-${i}`} cx={cx} cy={cy} r="4" fill="#00E5FF" filter={`url(#${uid}-glow)`}>
          <animate attributeName="r" values="3;5;3" dur="1.8s" begin={`${i*0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {hubRightNodes.map(([cx, cy], i) => (
        <circle key={`hn-r-${i}`} cx={cx} cy={cy} r="4" fill="#00E5FF" filter={`url(#${uid}-glow)`}>
          <animate attributeName="r" values="3;5;3" dur="1.8s" begin={`${i*0.3+0.15}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function SmartLinkActionButtons({
  smartLinkId, hubId, artistId, trackId, playlistId,
  dspLinks, audioPreviewUrl, whatsappJoinUrl,
  heroArtworkUrl, playlistCoverUrl, amdLogoUrl, amdBadgeUrl,
  playlistName = 'Chrome AfroFusion Radio',
}: ActionButtonsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const uid = useId().replace(/:/g, '');

  const fire = (key: string, url: string) => {
    try {
      const p = JSON.stringify({ smart_link_id: smartLinkId, hub_id: hubId, artist_id: artistId,
        track_id: trackId, playlist_id: playlistId, destination_dsp: key, destination_url: url });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/v1/telemetry/click', p);
      else fetch('/api/v1/telemetry/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: p }).catch(() => {});
    } catch (_) {}
  };

  const go = (key: string, url?: string) => { if (!url) return; fire(key, url); window.open(url, '_blank', 'noopener,noreferrer'); };

  const toggleAudio = () => {
    if (!audioPreviewUrl) return;
    if (isPlaying && audioEl) { audioEl.pause(); setIsPlaying(false); return; }
    const a = audioEl || new Audio(audioPreviewUrl);
    if (!audioEl) { a.onended = () => setIsPlaying(false); setAudioEl(a); }
    fire('internal_audio_preview', audioPreviewUrl);
    a.play(); setIsPlaying(true);
  };

  const ready = (k: string) => !dspLinks ? false : k === 'youtube_music' ? Boolean(dspLinks.youtube_music || dspLinks.youtube) : Boolean(dspLinks[k]);
  const href  = (k: string) => !dspLinks ? undefined : k === 'youtube_music' ? (dspLinks.youtube_music || dspLinks.youtube) : dspLinks[k];

  /* ── Platform pill button — identical for all 10 platforms ── */
  const PillBtn = ({ k }: { k: string }) => {
    const isReady = ready(k);
    const link = href(k);
    const label = PLATFORM_LABELS[k] ?? k;
    return (
      <button
        onClick={isReady ? () => go(k, link) : undefined}
        disabled={!isReady}
        className={[
          'w-full flex items-center justify-between gap-2 rounded-full border transition-all duration-300 select-none',
          'bg-[#07071a]/90 backdrop-blur-xl',
          isReady
            ? 'border-[#8a2be2] shadow-[0_0_20px_rgba(138,43,226,0.45),inset_0_0_12px_rgba(0,0,0,0.7)] hover:border-[#00E5FF] hover:shadow-[0_0_32px_rgba(0,229,255,0.65)] hover:-translate-y-0.5 cursor-pointer'
            : 'border-[#8a2be2]/70 shadow-[0_0_14px_rgba(138,43,226,0.25),inset_0_0_8px_rgba(0,0,0,0.7)] cursor-not-allowed',
        ].join(' ')}
        style={{ padding: 'clamp(5px,1.1vw,9px) clamp(8px,1.6vw,14px)' }}
        aria-label={isReady ? `Listen on ${label}` : `${label} coming soon`}
      >
        <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          <BrandIcon id={k} size={18} />
          <span className="font-bold tracking-wide text-white/95 truncate"
            style={{ fontSize: 'clamp(9px, 1.7vw, 13px)' }}>{label}</span>
        </span>
        {isReady
          ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 bg-[#ff003c] shadow-[0_0_8px_#ff003c,0_0_14px_#ff003c] animate-pulse"/>
          : <span className="flex-shrink-0 rounded-full font-black uppercase tracking-wider text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              style={{ fontSize: 'clamp(6px,1.1vw,8px)', padding: '2px 5px' }}>SOON</span>
        }
      </button>
    );
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════
          HERO ARTWORK — simplified poster showing:
          AMD badge · 8 artists · DISCOVER AFRICA'S BIGGEST HITS · ONE LINK. EVERY PLATFORM.
          Cropped to exactly 79.7% height (where ONE LINK text ends)
          Aspect ratio: 1024w × 1020h visible = 1024/1020 ≈ 1/0.996 portrait
          But we contain the image inside a clipped box for responsive layout:
          container height = 79.7% of image's natural rendered height
          With object-fit:cover + object-position:top, we crop bottom 20.3%
      ════════════════════════════════════════════════════ */}
      <div
        className="w-full relative select-none overflow-hidden"
        style={{ aspectRatio: '1024 / 1022' }}
      >
        <picture>
          <source srcSet="/sl_hero.webp" type="image/webp"/>
          <img
            src="/sl_hero.png"
            alt="Chrome AfroFusion Radio — Discover Africa's Biggest Hits"
            className="absolute inset-0 w-full h-auto"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
            draggable={false}
            fetchPriority="high"
          />
        </picture>
        {/* Seamless dissolve at the crop point — only covers the dark region below ONE LINK */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '10%',
            background: 'linear-gradient(to top, #05050e 0%, rgba(5,5,14,0.85) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════
          INTERACTIVE LIVING POSTER — begins exactly where the
          artwork's ONE LINK. EVERY PLATFORM. text ends.
          This section IS the artwork's platform ecosystem — made interactive.
      ════════════════════════════════════════════════════ */}
      <div
        className="w-full relative"
        style={{
          background: 'linear-gradient(to bottom, #05050e 0%, #060616 30%, #050510 100%)',
          marginTop: '-2px',
        }}
      >
        {/* Ambient glow backdrop — matches artwork's central purple/cyan glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: '80%', height: '60%',
              background: 'radial-gradient(ellipse, rgba(138,43,226,0.18) 0%, rgba(0,229,255,0.08) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        <div className="w-full max-w-[1200px] mx-auto px-1 sm:px-3 lg:px-6 relative">

          {/* ── ECOSYSTEM GRID: Left buttons | SVG circuit | Hub | SVG circuit | Right buttons ── */}
          <div className="relative w-full" style={{ minHeight: 'clamp(260px, 52vw, 620px)', paddingTop: 'clamp(16px, 3vw, 32px)', paddingBottom: 'clamp(8px, 2vw, 20px)' }}>

            {/* SVG Organic Circuitry — absolute, covers the full ecosystem area */}
            <CircuitSVG uid={uid} />

            {/* Three-column layout: Left | Hub | Right — SVG is behind everything */}
            <div className="relative z-10 flex items-center h-full w-full"
              style={{ minHeight: 'clamp(260px, 52vw, 620px)' }}
            >
              {/* LEFT PLATFORM COLUMN */}
              <div className="flex flex-col justify-center gap-1.5 sm:gap-2.5 flex-1 min-w-0"
                style={{ paddingRight: 'clamp(4px, 1.5vw, 16px)' }}>
                {LEFT_PLATFORMS.map(k => <PillBtn key={k} k={k} />)}
              </div>

              {/* CENTER HUB */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center"
                style={{ width: 'clamp(90px, 22vw, 220px)', padding: '0 clamp(4px, 1vw, 12px)' }}>
                {/* Outer animated ring */}
                <div className="relative rounded-full flex items-center justify-center"
                  style={{
                    width: 'clamp(86px, 21vw, 210px)',
                    height: 'clamp(86px, 21vw, 210px)',
                    padding: '3px',
                    background: 'linear-gradient(135deg, #00E5FF 0%, #3b82f6 25%, #8a2be2 55%, #00E5FF 100%)',
                    boxShadow: '0 0 60px rgba(0,229,255,0.7), 0 0 100px rgba(138,43,226,0.45)',
                    animation: 'hubPulse 3s ease-in-out infinite',
                  }}
                >
                  {/* Inner core */}
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                    style={{ background: '#030310', border: '2px solid rgba(0,229,255,0.4)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.95)' }}>
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.5) 0%, transparent 70%)' }}/>
                    <span className="relative z-10 font-black text-white"
                      style={{ fontSize: 'clamp(7px, 1.8vw, 14px)', letterSpacing: '0.2em', fontFamily: 'Georgia, serif', textShadow: '0 0 10px rgba(0,229,255,0.6)' }}>CHROME</span>
                    <span className="relative z-10 font-black"
                      style={{
                        fontSize: 'clamp(9px, 2.4vw, 19px)', letterSpacing: '0.12em',
                        background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#AA771C)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 16px rgba(255,215,0,0.9))',
                      }}>AFROFUSION</span>
                    <span className="relative z-10 font-black text-white/80"
                      style={{ fontSize: 'clamp(6px, 1.4vw, 10px)', letterSpacing: '0.32em', margin: '1px 0' }}>— RADIO —</span>
                    <span className="relative z-10 font-black text-[#00E5FF]"
                      style={{ fontSize: 'clamp(5px, 1.1vw, 8.5px)', letterSpacing: '0.22em', filter: 'drop-shadow(0 0 6px #00E5FF)' }}>POWERED BY</span>
                    <span className="relative z-10 font-black text-white/90"
                      style={{ fontSize: 'clamp(5px, 1.2vw, 9.5px)', letterSpacing: '0.22em', filter: 'drop-shadow(0 0 8px #00E5FF)' }}>MUSIC INTEL</span>
                  </div>
                </div>

                {/* Equalizer bars */}
                <div className="flex items-end justify-center gap-0.5 sm:gap-1 mt-2"
                  style={{ height: 'clamp(12px, 2.5vw, 22px)' }}>
                  {[['#00E5FF','60%','0ms'],['#3b82f6','90%','120ms'],['#8a2be2','100%','240ms'],
                    ['#00E5FF','70%','80ms'],['#60a5fa','85%','200ms'],['#a855f7','50%','40ms'],
                    ['#00E5FF','75%','160ms']].map(([c,h,d], i) => (
                    <div key={i} className="rounded-full animate-bounce"
                      style={{ width: 'clamp(2px,0.45vw,4.5px)', height: h, backgroundColor: c, boxShadow: `0 0 5px ${c}`, animationDelay: d }}/>
                  ))}
                </div>
              </div>

              {/* RIGHT PLATFORM COLUMN */}
              <div className="flex flex-col justify-center gap-1.5 sm:gap-2.5 flex-1 min-w-0"
                style={{ paddingLeft: 'clamp(4px, 1.5vw, 16px)' }}>
                {RIGHT_PLATFORMS.map(k => <PillBtn key={k} k={k} />)}
              </div>
            </div>
          </div>

          {/* ── STATS BAR ── */}
          <div className="mt-1 sm:mt-3">
            <div className="rounded-2xl border border-[#8a2be2]/55 py-3 px-4 sm:py-4 sm:px-8"
              style={{ background: 'rgba(7,7,20,0.9)', backdropFilter: 'blur(24px)', boxShadow: '0 0 40px rgba(138,43,226,0.28)' }}>
              <div className="grid grid-cols-4 text-center divide-x divide-[#8a2be2]/30">
                {[
                  { icon: '🎵', color: '#a855f7', num: '50', lbl: 'TRACKS' },
                  { icon: '👥', color: '#00E5FF', num: '40+', lbl: 'ARTISTS' },
                  { icon: '🌐', color: '#D4AF37', num: '10', lbl: 'PLATFORMS' },
                  { icon: '📅', color: '#34d399', num: '', lbl: 'UPDATED\nWEEKLY' },
                ].map(({ icon, color, num, lbl }) => (
                  <div key={lbl} className="flex flex-col items-center px-1 sm:px-3 gap-0.5">
                    <span style={{ color, fontSize: 'clamp(13px,2.5vw,21px)', filter: `drop-shadow(0 0 6px ${color})` }}>{icon}</span>
                    {num && <span className="font-black text-white" style={{ fontSize: 'clamp(11px,2.1vw,20px)', textShadow: `0 0 12px ${color}` }}>{num}</span>}
                    <span className="font-black text-gray-300 uppercase leading-tight text-center"
                      style={{ fontSize: 'clamp(6px,1.15vw,10px)', letterSpacing: '0.1em', whiteSpace: 'pre-line' }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── LISTEN NOW CTA ── */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => go('spotify', dspLinks?.spotify || dspLinks?.apple_music)}
              className="w-full flex items-center justify-center gap-3 sm:gap-5 rounded-full font-black uppercase cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:brightness-110"
              style={{
                padding: 'clamp(14px,3vw,22px) 24px',
                fontSize: 'clamp(22px,5vw,48px)',
                letterSpacing: '0.16em',
                background: 'linear-gradient(90deg, #BF953F 0%, #FCF6BA 28%, #B38728 52%, #FBF5B7 74%, #AA771C 100%)',
                color: '#000',
                border: '2px solid rgba(255,248,214,0.9)',
                boxShadow: '0 0 55px rgba(255,215,0,0.75), 0 0 100px rgba(255,215,0,0.3)',
              }}
            >
              <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: '0 1px 3px rgba(255,255,255,0.4)' }}>LISTEN NOW</span>
              <span className="rounded-full bg-black text-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ width: 'clamp(32px,6vw,54px)', height: 'clamp(32px,6vw,54px)', fontSize: 'clamp(14px,2.5vw,24px)', boxShadow: '0 0 20px rgba(255,215,0,0.5)' }}>▸</span>
            </button>
          </div>

          {/* ── AUDIO PREVIEW ── */}
          {audioPreviewUrl && (
            <div className="mt-3 sm:mt-4">
              <button onClick={toggleAudio}
                className="w-full max-w-md mx-auto flex items-center justify-between gap-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300"
                style={{
                  display: 'flex', padding: '10px 20px',
                  background: isPlaying ? 'rgba(0,229,255,0.08)' : 'rgba(7,7,20,0.8)',
                  border: `1px solid ${isPlaying ? '#00E5FF' : 'rgba(138,43,226,0.5)'}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: isPlaying ? '0 0 24px rgba(0,229,255,0.35)' : 'none',
                }}
              >
                <span className="flex items-center gap-2.5 text-gray-200">
                  <span>{isPlaying ? '🔊' : '🎧'}</span>
                  <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio...' : 'Preview 30s Master Audio'}</span>
                </span>
                <span className="px-3 py-1 rounded-full font-black tracking-wider flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF', fontSize: '10px' }}>
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </button>
            </div>
          )}

          {/* ── TAGLINE ── */}
          <div className="text-center mt-4 mb-2">
            <p className="font-black tracking-[0.25em] uppercase" style={{ fontSize: 'clamp(9px,2vw,13px)' }}>
              <span style={{ color: '#D4AF37', textShadow: '0 0 12px rgba(212,175,55,0.6)' }}>AFRICA&apos;S MUSIC.</span>{' '}
              <span style={{ color: '#8a2be2', textShadow: '0 0 12px rgba(138,43,226,0.6)' }}>POWERED BY INTELLIGENCE.</span>
            </p>
          </div>

          {/* ── VALUE CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4 pb-24">
            {[
              { icon: '🧠', color: '#a855f7', title: 'MUSIC INTELLIGENCE', sub: 'Smart curation. Smarter listening.' },
              { icon: '🌐', color: '#00E5FF', title: 'GLOBAL REACH', sub: 'One link. Worldwide.' },
              { icon: '⭐', color: '#D4AF37', title: 'SMART RECS', sub: 'Discover more. Love more.' },
              { icon: '📈', color: '#34d399', title: 'DATA GROWTH', sub: 'Real insights. Real results.' },
              { icon: '👑', color: '#facc15', title: 'ARTIST POWER', sub: 'More visibility. More opportunities.' },
            ].map(({ icon, color, title, sub }) => (
              <div key={title} className="flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl"
                style={{
                  padding: 'clamp(10px,2vw,16px)',
                  background: 'rgba(7,7,20,0.9)', backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${color}18`,
                }}>
                <span className="flex-shrink-0 mt-0.5" style={{ color, fontSize: 'clamp(14px,2.5vw,20px)', filter: `drop-shadow(0 0 8px ${color})` }}>{icon}</span>
                <div>
                  <h4 className="font-black uppercase text-gray-100 leading-tight"
                    style={{ fontSize: 'clamp(7px,1.4vw,11px)', letterSpacing: '0.06em' }}>{title}</h4>
                  <p className="text-gray-400 leading-snug mt-1" style={{ fontSize: 'clamp(7px,1.2vw,10px)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHATSAPP STICKY CTA ── */}
      {whatsappJoinUrl && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
          <button
            onClick={() => go('whatsapp', whatsappJoinUrl)}
            className="w-full flex items-center justify-between rounded-2xl font-black cursor-pointer transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{ padding: '14px 20px', background: 'linear-gradient(90deg, #059669, #16a34a)', color: 'white', border: '1px solid rgba(52,211,153,0.5)', boxShadow: '0 4px 24px rgba(5,150,105,0.5)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>JOIN FREE</span>
          </button>
        </div>
      )}

      {/* ── KEYFRAME ANIMATIONS ── */}
      <style>{`
        /* Hub breathing pulse */
        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(0,229,255,0.7), 0 0 100px rgba(138,43,226,0.45); }
          50%       { box-shadow: 0 0 90px rgba(0,229,255,0.95), 0 0 140px rgba(138,43,226,0.65); }
        }
        /* Stroke-dash animation for energy packets travelling along SVG circuit paths */
        /* Each left path dash travels from hub (high dashoffset) to platform (low dashoffset) */
        ${[0,1,2,3,4].map(i => `
          @keyframes dashL${i} {
            0%   { stroke-dashoffset: 600; stroke-opacity: 0; }
            15%  { stroke-opacity: 0.95; }
            85%  { stroke-opacity: 0.95; }
            100% { stroke-dashoffset: 0; stroke-opacity: 0; }
          }
          @keyframes dashR${i} {
            0%   { stroke-dashoffset: 600; stroke-opacity: 0; }
            15%  { stroke-opacity: 0.95; }
            85%  { stroke-opacity: 0.95; }
            100% { stroke-dashoffset: 0; stroke-opacity: 0; }
          }
        `).join('')}
      `}</style>
    </>
  );
}
