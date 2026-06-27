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

/* ──────────────────────────────────────────────────────────
   BRAND ICONS
────────────────────────────────────────────────────────── */
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
      return <svg width={size} height={size} viewBox="0 0 24 24"><defs><radialGradient id="ig-v32" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-v32)"/><path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm4.7-8.1a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" fill="white"/></svg>;
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

/* ──────────────────────────────────────────────────────────
   PREMIUM PCB-STYLE ORGANIC CIRCUIT SVG — V3.2

   ViewBox: 0 0 1000 500  (preserveAspectRatio="none")
   This maps 1:1 with container percentage dimensions:
   - X: 0..1000 = 0%..100% width
   - Y: 0..500  = 0%..100% height

   HTML layout grid: 5 equal vertical rows (grid-rows-5).
   Button centers are locked at exactly Y = 50, 150, 250, 350, 450 (10%, 30%, 50%, 70%, 90%).

   Desktop coordinates (sm: and above):
     Left buttons right-edge:  X = 290  (left-[7%] w-[22%])
     Right buttons left-edge:  X = 710  (right-[7%] w-[22%])
     Hub perimeter origin:     X ≈ 385 (left) / 615 (right)

   Mobile coordinates (default below sm:):
     Left buttons right-edge:  X = 330  (left-[3%] w-[30%])
     Right buttons left-edge:  X = 670  (right-[3%] w-[30%])
     Hub perimeter origin:     X ≈ 365 (left) / 635 (right)
────────────────────────────────────────────────────────── */
function CircuitSVG({ uid }: { uid: string }) {
  // Desktop Paths (terminate at X=290 on left, X=710 on right)
  const lP_desk = [
    `M 390,205 C 370,165 335,110 310,80 L 290,50`,
    `M 384,230 C 355,200 325,170 305,155 L 290,150`,
    `M 378,250 C 345,250 315,250 300,250 L 290,250`,
    `M 384,270 C 355,300 325,330 305,345 L 290,350`,
    `M 390,295 C 370,335 335,390 310,420 L 290,450`,
  ];
  const rP_desk = [
    `M 610,205 C 630,165 665,110 690,80 L 710,50`,
    `M 616,230 C 645,200 675,170 695,155 L 710,150`,
    `M 622,250 C 655,250 685,250 700,250 L 710,250`,
    `M 616,270 C 645,300 675,330 695,345 L 710,350`,
    `M 610,295 C 630,335 665,390 690,420 L 710,450`,
  ];
  const jL_desk = [[330,105], [315,175], [318,250], [315,325], [330,395]];
  const jR_desk = [[670,105], [685,175], [682,250], [685,325], [670,395]];
  const tL_desk = [[290,50], [290,150], [290,250], [290,350], [290,450]];
  const tR_desk = [[710,50], [710,150], [710,250], [710,350], [710,450]];

  // Mobile Paths (terminate at X=330 on left, X=670 on right)
  const lP_mob = [
    `M 368,205 C 360,170 350,110 340,75 L 330,50`,
    `M 362,230 C 354,200 346,170 338,155 L 330,150`,
    `M 356,250 C 346,250 338,250 334,250 L 330,250`,
    `M 362,270 C 354,300 346,330 338,345 L 330,350`,
    `M 368,295 C 360,330 350,390 340,425 L 330,450`,
  ];
  const rP_mob = [
    `M 632,205 C 640,170 650,110 660,75 L 670,50`,
    `M 638,230 C 646,200 654,170 662,155 L 670,150`,
    `M 644,250 C 654,250 662,250 666,250 L 670,250`,
    `M 638,270 C 646,300 654,330 662,345 L 670,350`,
    `M 632,295 C 640,330 650,390 660,425 L 670,450`,
  ];
  const jL_mob = [[346,105], [342,175], [344,250], [342,325], [346,395]];
  const jR_mob = [[654,105], [658,175], [656,250], [658,325], [654,395]];
  const tL_mob = [[330,50], [330,150], [330,250], [330,350], [330,450]];
  const tR_mob = [[670,50], [670,150], [670,250], [670,350], [670,450]];

  const dashLen = [450, 380, 300, 380, 450];

  const renderPaths = (lP: string[], rP: string[], jL: number[][], jR: number[][], tL: number[][], tR: number[][], prefix: string) => (
    <>
      {/* Layer 1: Ambient purple bleed */}
      {lP.map((d, i) => (
        <path key={`lb-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-l-${i})`} strokeWidth="12" strokeOpacity="0.22" filter={`url(#${uid}-blur)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rb-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-r-${i})`} strokeWidth="12" strokeOpacity="0.22" filter={`url(#${uid}-blur)`}/>
      ))}

      {/* Layer 2: Medium purple track */}
      {lP.map((d, i) => (
        <path key={`lm-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="3.5" strokeOpacity="0.4"/>
      ))}
      {rP.map((d, i) => (
        <path key={`rm-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="3.5" strokeOpacity="0.4"/>
      ))}

      {/* Layer 3: Cyan core wire */}
      {lP.map((d, i) => (
        <path key={`lc-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-l-${i})`} strokeWidth="1.8" filter={`url(#${uid}-glow)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rc-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-r-${i})`} strokeWidth="1.8" filter={`url(#${uid}-glow)`}/>
      ))}

      {/* Layer 4: Animated energy packets */}
      {lP.map((d, i) => (
        <path key={`lp-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0"
          style={{
            strokeDasharray: `28 ${dashLen[i]}`,
            animation: `pktL${i} 2.2s linear ${i * 0.44}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}
      {rP.map((d, i) => (
        <path key={`rp-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0"
          style={{
            strokeDasharray: `28 ${dashLen[i]}`,
            animation: `pktR${i} 2.2s linear ${i * 0.44 + 0.22}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}

      {/* Junction Nodes at elbow bends */}
      {jL.map(([cx, cy], i) => (
        <g key={`jl-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="8" fill="#D4AF37" fillOpacity="0.18" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="6;10;6" dur={`${1.6+i*0.15}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="4" fill="#D4AF37" fillOpacity="0.8" filter={`url(#${uid}-bloom)`}/>
          <circle cx={cx} cy={cy} r="1.8" fill="white" fillOpacity="0.95"/>
        </g>
      ))}
      {jR.map(([cx, cy], i) => (
        <g key={`jr-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="8" fill="#D4AF37" fillOpacity="0.18" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="6;10;6" dur={`${1.6+i*0.15}s`} begin={`${i*0.18}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="4" fill="#D4AF37" fillOpacity="0.8" filter={`url(#${uid}-bloom)`}/>
          <circle cx={cx} cy={cy} r="1.8" fill="white" fillOpacity="0.95"/>
        </g>
      ))}

      {/* Termination Sockets overlapping button edges */}
      {tL.map(([cx, cy], i) => (
        <g key={`tl-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="10" fill="#00E5FF" fillOpacity="0.15" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="8;14;8" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="5" fill="#00E5FF" fillOpacity="0.8" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2.2" fill="white"/>
        </g>
      ))}
      {tR.map(([cx, cy], i) => (
        <g key={`tr-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="10" fill="#00E5FF" fillOpacity="0.15" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="8;14;8" dur="2s" begin={`${i*0.3+0.15}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="5" fill="#00E5FF" fillOpacity="0.8" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2.2" fill="white"/>
        </g>
      ))}
    </>
  );

  return (
    <svg
      viewBox="0 0 1000 500"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {[0,1,2,3,4].map(i => (
          <linearGradient key={`glg-l-${i}`} id={`${uid}-glg-l-${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="250" x2="250" y2={[50,150,250,350,450][i]}>
            <stop offset="0%"   stopColor="#00E5FF" stopOpacity="0.1"/>
            <stop offset="15%"  stopColor="#00E5FF" stopOpacity="1"/>
            <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4"/>
          </linearGradient>
        ))}
        {[0,1,2,3,4].map(i => (
          <linearGradient key={`glg-r-${i}`} id={`${uid}-glg-r-${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="250" x2="750" y2={[50,150,250,350,450][i]}>
            <stop offset="0%"   stopColor="#00E5FF" stopOpacity="0.1"/>
            <stop offset="15%"  stopColor="#00E5FF" stopOpacity="1"/>
            <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4"/>
          </linearGradient>
        ))}
        <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6"/>
        </filter>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-bloom`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-pkt`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Render Desktop Circuitry */}
      <g className="hidden sm:block">
        {renderPaths(lP_desk, rP_desk, jL_desk, jR_desk, tL_desk, tR_desk, 'desk')}
      </g>

      {/* Render Mobile Circuitry */}
      <g className="block sm:hidden">
        {renderPaths(lP_mob, rP_mob, jL_mob, jR_mob, tL_mob, tR_mob, 'mob')}
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */
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

  /* ── Platform pill — sleeker width, modular PCB cartridge styling ── */
  const PillBtn = ({ k }: { k: string }) => {
    const isReady = ready(k);
    const link = href(k);
    const label = PLATFORM_LABELS[k] ?? k;
    return (
      <button
        onClick={isReady ? () => go(k, link) : undefined}
        disabled={!isReady}
        className={[
          'w-full flex items-center justify-between gap-1.5 sm:gap-2 rounded-full border',
          'transition-all duration-300 select-none backdrop-blur-xl relative z-10',
          'bg-[#050512]/92',
          isReady
            ? 'border-[#7c3aed]/85 shadow-[0_0_20px_rgba(124,58,237,0.45),inset_0_0_12px_rgba(0,0,0,0.8)] hover:border-[#00E5FF] hover:shadow-[0_0_32px_rgba(0,229,255,0.75),inset_0_0_16px_rgba(0,0,0,0.85)] hover:-translate-y-0.5 cursor-pointer'
            : 'border-[#7c3aed]/45 shadow-[0_0_12px_rgba(124,58,237,0.2),inset_0_0_10px_rgba(0,0,0,0.7)] cursor-not-allowed opacity-90',
        ].join(' ')}
        style={{ padding: 'clamp(5px,1vw,8px) clamp(8px,1.4vw,14px)' }}
        aria-label={isReady ? `Listen on ${label}` : `${label} coming soon`}
      >
        <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          <BrandIcon id={k} size={17}/>
          <span className="font-bold tracking-wide text-white/95 truncate"
            style={{ fontSize: 'clamp(8.5px,1.5vw,12.5px)' }}>{label}</span>
        </span>
        {isReady
          ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 bg-[#ff003c] shadow-[0_0_8px_#ff003c,0_0_16px_#ff003c] animate-pulse"/>
          : <span className="flex-shrink-0 rounded-full font-black uppercase tracking-wider text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              style={{ fontSize: 'clamp(5px,0.9vw,7.5px)', padding: '2px 5px' }}>SOON</span>
        }
      </button>
    );
  };

  return (
    <div className="w-full max-w-[980px] mx-auto">
      {/* ════════════════════════════════════════════════════════════
          HERO ARTWORK — Capped width, balanced proportions
          Crop: top 80% shows AMD badge, 8 artists, DISCOVER AFRICA'S
          BIGGEST HITS, ONE LINK. EVERY PLATFORM.
          Dissolve fades smoothly into #05050e.
      ════════════════════════════════════════════════════════════ */}
      <div
        className="w-full relative select-none overflow-hidden"
        style={{ aspectRatio: '1024 / 1010' }}
      >
        <picture>
          <source srcSet="/sl_hero.webp" type="image/webp"/>
          <img
            src="/sl_hero.png"
            alt="Chrome AfroFusion Radio — Discover Africa's Biggest Hits. One Link. Every Platform."
            className="absolute top-0 left-0 w-full"
            style={{ height: 'auto' }}
            draggable={false}
            fetchPriority="high"
          />
        </picture>
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '18%',
            background: 'linear-gradient(to top, #05050e 0%, rgba(5,5,14,0.96) 25%, rgba(5,5,14,0.65) 55%, transparent 100%)',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          INTERACTIVE LIVING ECOSYSTEM — V3.2
          Exact grid-rows-5 alignment locking circuits into buttons
      ════════════════════════════════════════════════════════════ */}
      <div
        className="w-full relative px-2 sm:px-4"
        style={{
          background: 'linear-gradient(180deg, #05050e 0%, #060618 40%, #05050f 100%)',
          marginTop: '-1px',
        }}
      >
        {/* Ambient radial glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '90%', height: '60%',
              background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.25) 0%, rgba(0,229,255,0.08) 45%, transparent 70%)',
              filter: 'blur(35px)',
            }}/>
        </div>

        <div className="relative w-full">
          {/* Stage box: explicit height ensuring consistent 5-row geometry */}
          <div className="relative w-full h-[360px] sm:h-[460px] my-2 sm:my-4">
            {/* SVG PCB circuit lines */}
            <CircuitSVG uid={uid}/>

            {/* LEFT BUTTONS COLUMN — sleek width, moved closer to hub */}
            <div className="absolute left-[3%] sm:left-[7%] top-0 bottom-0 w-[30%] sm:w-[22%] grid grid-rows-5 z-10">
              {LEFT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center justify-center w-full px-0.5 sm:px-1">
                  <PillBtn k={k}/>
                </div>
              ))}
            </div>

            {/* CENTER POWER HUB — visual focus commanding the ecosystem */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[32%] sm:w-[26%] max-w-[220px] flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="relative flex items-center justify-center pointer-events-auto"
                style={{
                  width:  'clamp(86px,21vw,210px)',
                  height: 'clamp(86px,21vw,210px)',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,229,255,0.22) 0%, rgba(124,58,237,0.4) 45%, transparent 70%)',
                  animation: 'hubAura 3.5s ease-in-out infinite',
                }}
              >
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full"
                  style={{
                    border: '1.5px solid rgba(0,229,255,0.3)',
                    boxShadow: '0 0 35px rgba(0,229,255,0.25)',
                    animation: 'ringPulse 3.5s ease-in-out infinite',
                  }}/>

                {/* Main hub circle */}
                <div className="rounded-full flex items-center justify-center"
                  style={{
                    width:  'clamp(80px,19.5vw,198px)',
                    height: 'clamp(80px,19.5vw,198px)',
                    padding: '3px',
                    background: 'linear-gradient(135deg,#00E5FF 0%,#3b82f6 22%,#7c3aed 50%,#a855f7 72%,#00E5FF 100%)',
                    boxShadow: '0 0 70px rgba(0,229,255,0.85), 0 0 130px rgba(124,58,237,0.6), 0 0 220px rgba(0,229,255,0.25)',
                    animation: 'hubPulse 3.5s ease-in-out infinite',
                  }}
                >
                  {/* Inner glass core */}
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at 40% 35%, #0a0a22, #030310 70%)',
                      border: '1.5px solid rgba(0,229,255,0.35)',
                      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95), inset 0 0 20px rgba(124,58,237,0.35)',
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(circle at 50% 60%, rgba(124,58,237,0.6) 0%, transparent 65%)' }}/>
                    <div className="absolute top-0 left-1/4 right-1/4 pointer-events-none"
                      style={{ height: '35%', background: 'radial-gradient(ellipse, rgba(0,229,255,0.15) 0%, transparent 80%)', filter: 'blur(4px)' }}/>

                    <span className="relative z-10 font-black text-white"
                      style={{ fontSize: 'clamp(6.5px,1.6vw,13.5px)', letterSpacing: '0.22em', fontFamily: 'Georgia,serif', textShadow: '0 0 12px rgba(0,229,255,0.7)' }}>CHROME</span>
                    <span className="relative z-10 font-black leading-tight"
                      style={{
                        fontSize: 'clamp(8px,2vw,17px)', letterSpacing: '0.1em',
                        background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#D4AF37,#AA771C)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 18px rgba(255,215,0,1))',
                      }}>AFROFUSION</span>
                    <span className="relative z-10 font-black text-white/75"
                      style={{ fontSize: 'clamp(5px,1.2vw,9.5px)', letterSpacing: '0.35em', margin: '1px 0' }}>— RADIO —</span>
                    <span className="relative z-10 font-bold text-[#00E5FF]"
                      style={{ fontSize: 'clamp(4.5px,0.95vw,7.5px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 0 5px #00E5FF)' }}>POWERED BY</span>
                    <span className="relative z-10 font-bold text-white/85"
                      style={{ fontSize: 'clamp(4.5px,1vw,8.5px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.8))' }}>MUSIC INTEL</span>
                  </div>
                </div>
              </div>

              {/* Equalizer bars */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 mt-2.5 pointer-events-auto"
                style={{ height: 'clamp(12px,2.2vw,20px)' }}>
                {[['#00E5FF','58%','0ms'],['#3b82f6','88%','110ms'],['#7c3aed','100%','220ms'],
                  ['#00E5FF','68%','75ms'],['#60a5fa','82%','185ms'],['#a855f7','48%','35ms'],
                  ['#00E5FF','73%','150ms']].map(([c,h,d],i) => (
                  <div key={i} className="rounded-full animate-bounce"
                    style={{ width:'clamp(2px,0.45vw,4px)', height:h, backgroundColor:c, boxShadow:`0 0 6px ${c}`, animationDelay:d }}/>
                ))}
              </div>
            </div>

            {/* RIGHT BUTTONS COLUMN */}
            <div className="absolute right-[3%] sm:right-[7%] top-0 bottom-0 w-[30%] sm:w-[22%] grid grid-rows-5 z-10">
              {RIGHT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center justify-center w-full px-0.5 sm:px-1">
                  <PillBtn k={k}/>
                </div>
              ))}
            </div>
          </div>

          {/* ── STATS BAR ── */}
          <div className="mt-4 sm:mt-6">
            <div className="rounded-2xl border border-[#7c3aed]/55 py-3 px-3 sm:py-4 sm:px-8"
              style={{ background: 'rgba(5,5,18,0.92)', backdropFilter: 'blur(28px)', boxShadow: '0 0 44px rgba(124,58,237,0.28), inset 0 0 0 1px rgba(0,229,255,0.06)' }}>
              <div className="grid grid-cols-4 text-center divide-x divide-[#7c3aed]/30">
                {[
                  { icon:'🎵', color:'#a855f7', num:'50',  lbl:'TRACKS' },
                  { icon:'👥', color:'#00E5FF', num:'40+', lbl:'ARTISTS' },
                  { icon:'🌐', color:'#D4AF37', num:'10',  lbl:'PLATFORMS' },
                  { icon:'📅', color:'#34d399', num:'',    lbl:'UPDATED\nWEEKLY' },
                ].map(({ icon, color, num, lbl }) => (
                  <div key={lbl} className="flex flex-col items-center px-1 sm:px-3 gap-0.5">
                    <span style={{ color, fontSize:'clamp(13px,2.4vw,20px)', filter:`drop-shadow(0 0 8px ${color})` }}>{icon}</span>
                    {num && <span className="font-black text-white" style={{ fontSize:'clamp(11px,2vw,19px)', textShadow:`0 0 14px ${color}` }}>{num}</span>}
                    <span className="font-black text-gray-300 uppercase leading-tight text-center"
                      style={{ fontSize:'clamp(6px,1.1vw,9.5px)', letterSpacing:'0.1em', whiteSpace:'pre-line' }}>{lbl}</span>
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
                padding: 'clamp(14px,2.8vw,20px) 24px',
                fontSize: 'clamp(20px,4.5vw,44px)',
                letterSpacing: '0.16em',
                background: 'linear-gradient(90deg,#BF953F 0%,#FCF6BA 26%,#B38728 50%,#FBF5B7 74%,#AA771C 100%)',
                color: '#000',
                border: '2px solid rgba(255,248,214,0.9)',
                boxShadow: '0 0 60px rgba(255,215,0,0.8), 0 0 110px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              <span style={{ fontFamily:'Georgia,"Times New Roman",serif', textShadow:'0 1px 3px rgba(255,255,255,0.35)' }}>LISTEN NOW</span>
              <span className="rounded-full bg-black text-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ width:'clamp(30px,5.5vw,50px)', height:'clamp(30px,5.5vw,50px)', fontSize:'clamp(14px,2.4vw,22px)', boxShadow:'0 0 22px rgba(255,215,0,0.55)' }}>▸</span>
            </button>
          </div>

          {/* ── AUDIO PREVIEW ── */}
          {audioPreviewUrl && (
            <div className="mt-3 sm:mt-4">
              <button onClick={toggleAudio}
                className="w-full max-w-md mx-auto flex items-center justify-between gap-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300"
                style={{
                  display:'flex', padding:'10px 20px',
                  background: isPlaying ? 'rgba(0,229,255,0.08)' : 'rgba(5,5,18,0.82)',
                  border: `1px solid ${isPlaying ? '#00E5FF' : 'rgba(124,58,237,0.5)'}`,
                  backdropFilter: 'blur(24px)',
                  boxShadow: isPlaying ? '0 0 26px rgba(0,229,255,0.38)' : 'none',
                }}
              >
                <span className="flex items-center gap-2.5 text-gray-200">
                  <span>{isPlaying ? '🔊' : '🎧'}</span>
                  <span className="tracking-wide">{isPlaying ? 'Playing VaB Flagship Audio...' : 'Preview 30s Master Audio'}</span>
                </span>
                <span className="px-3 py-1 rounded-full font-black tracking-wider flex-shrink-0"
                  style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(0,229,255,0.4)', color:'#00E5FF', fontSize:'10px' }}>
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </span>
              </button>
            </div>
          )}

          {/* ── TAGLINE ── */}
          <div className="text-center mt-4 mb-2">
            <p className="font-black tracking-[0.25em] uppercase" style={{ fontSize:'clamp(9px,1.8vw,12.5px)' }}>
              <span style={{ color:'#D4AF37', textShadow:'0 0 14px rgba(212,175,55,0.65)' }}>AFRICA&apos;S MUSIC.</span>{' '}
              <span style={{ color:'#7c3aed', textShadow:'0 0 14px rgba(124,58,237,0.7)' }}>POWERED BY INTELLIGENCE.</span>
            </p>
          </div>

          {/* ── VALUE CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4 pb-24">
            {[
              { icon:'🧠', color:'#a855f7', title:'MUSIC INTELLIGENCE', sub:'Smart curation. Smarter listening.' },
              { icon:'🌐', color:'#00E5FF', title:'GLOBAL REACH',        sub:'One link. Worldwide.' },
              { icon:'⭐', color:'#D4AF37', title:'SMART RECS',          sub:'Discover more. Love more.' },
              { icon:'📈', color:'#34d399', title:'DATA GROWTH',         sub:'Real insights. Real results.' },
              { icon:'👑', color:'#facc15', title:'ARTIST POWER',        sub:'More visibility. More opportunities.' },
            ].map(({ icon, color, title, sub }) => (
              <div key={title} className="flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl"
                style={{
                  padding: 'clamp(10px,1.8vw,15px)',
                  background: 'rgba(5,5,18,0.92)', backdropFilter:'blur(28px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.82), 0 0 20px ${color}14`,
                }}
              >
                <span className="flex-shrink-0 mt-0.5" style={{ color, fontSize:'clamp(14px,2.4vw,19px)', filter:`drop-shadow(0 0 9px ${color})` }}>{icon}</span>
                <div>
                  <h4 className="font-black uppercase text-gray-100 leading-tight"
                    style={{ fontSize:'clamp(7px,1.3vw,10.5px)', letterSpacing:'0.06em' }}>{title}</h4>
                  <p className="text-gray-400 leading-snug mt-1" style={{ fontSize:'clamp(7px,1.1vw,9.5px)' }}>{sub}</p>
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
            style={{ padding:'14px 20px', background:'linear-gradient(90deg,#059669,#16a34a)', color:'white', border:'1px solid rgba(52,211,153,0.5)', boxShadow:'0 4px 26px rgba(5,150,105,0.55)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-xs sm:text-sm tracking-tight">VaB VIP WhatsApp Community Gate</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ background:'rgba(0,0,0,0.3)' }}>JOIN FREE</span>
          </button>
        </div>
      )}

      {/* ── KEYFRAME ANIMATIONS ── */}
      <style>{`
        @keyframes hubAura {
          0%,100% { opacity: 0.75; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes hubPulse {
          0%,100% { box-shadow: 0 0 70px rgba(0,229,255,0.85), 0 0 130px rgba(124,58,237,0.6), 0 0 220px rgba(0,229,255,0.25); }
          50%      { box-shadow: 0 0 100px rgba(0,229,255,1),  0 0 180px rgba(124,58,237,0.8), 0 0 280px rgba(0,229,255,0.4); }
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 35px rgba(0,229,255,0.25); opacity: 0.65; }
          50%      { box-shadow: 0 0 60px rgba(0,229,255,0.55); opacity: 1; }
        }
        ${[0,1,2,3,4].map(i=>`
          @keyframes pktL${i} {
            0%   { stroke-dashoffset:${[480,410,330,410,480][i]}; stroke-opacity:0; }
            12%  { stroke-opacity:0.95; }
            88%  { stroke-opacity:0.95; }
            100% { stroke-dashoffset:0; stroke-opacity:0; }
          }
          @keyframes pktR${i} {
            0%   { stroke-dashoffset:${[480,410,330,410,480][i]}; stroke-opacity:0; }
            12%  { stroke-opacity:0.95; }
            88%  { stroke-opacity:0.95; }
            100% { stroke-dashoffset:0; stroke-opacity:0; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
