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
      return <svg width={size} height={size} viewBox="0 0 24 24"><defs><radialGradient id="ig-v31" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-v31)"/><path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm4.7-8.1a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" fill="white"/></svg>;
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
   PREMIUM PCB-STYLE ORGANIC CIRCUIT SVG — V3.1

   ViewBox: 0 0 1000 520
   Hub center: (500, 260) — hub radius ≈ 115

   Circuit design matches master artwork:
   - Angular routing with smooth bezier joins (not straight lines)
   - Layered: wide purple bleed → narrow cyan core → animated packet
   - Gold/pink glowing junction nodes at every bend
   - Cyan energy packets travel from hub outward
   - Hub perimeter origin nodes pulse cyan

   Left button right edge: X = 215
   Right button left edge: X = 785
   Button Y rows (5 rows × 100px apart, centered at 260):
     Row 0: Y = 60   (Spotify / TikTok)
     Row 1: Y = 160  (Apple Music / YouTube Music)
     Row 2: Y = 260  (Audiomack / Instagram)   ← hub midline
     Row 3: Y = 360  (Boomplay / Amazon Music)
     Row 4: Y = 460  (SoundCloud / Deezer)
────────────────────────────────────────────────────────── */
function CircuitSVG({ uid }: { uid: string }) {
  /*
   Circuit paths — PCB angular routing:
   Each path: M hub_origin → first horizontal/diagonal segment
              → angular bend (using smooth bezier control points)
              → final route to button edge

   The master artwork shows paths that:
   1. Exit the hub perimeter radially
   2. Route with a 90° angular bend (elbow)
   3. Travel horizontally to the button
   Captured with cubic bezier for smooth corners (not hard 90°).
  */

  // LEFT PATHS — exit hub left side, route to left column buttons
  const lP = [
    // Spotify (row 0) — sweeps up-left from hub top-left perimeter
    `M 388,215 C 370,175 330,110 278,80 L 215,62`,
    // Apple Music (row 1) — arc up-left from hub left-upper
    `M 382,240 C 355,210 310,178 260,165 L 215,160`,
    // Audiomack (row 2) — straight left from hub midpoint (slight arc)
    `M 375,258 C 340,256 295,258 260,260 L 215,260`,
    // Boomplay (row 3) — arc down-left
    `M 382,280 C 355,308 310,338 260,352 L 215,360`,
    // SoundCloud (row 4) — sweep down-left from hub bottom-left
    `M 388,305 C 368,345 328,400 278,432 L 215,460`,
  ];

  // RIGHT PATHS — symmetric mirror
  const rP = [
    `M 612,215 C 630,175 670,110 722,80 L 785,62`,
    `M 618,240 C 645,210 690,178 740,165 L 785,160`,
    `M 625,258 C 660,256 705,258 740,260 L 785,260`,
    `M 618,280 C 645,308 690,338 740,352 L 785,360`,
    `M 612,305 C 632,345 672,400 722,432 L 785,460`,
  ];

  // Hub origin nodes (where paths leave the hub ring)
  const hL = [[388,215],[382,240],[375,258],[382,280],[388,305]];
  const hR = [[612,215],[618,240],[625,258],[618,280],[612,305]];

  // Mid-path junction nodes (at the "elbow" bends) — approximate positions along each curve
  const jL = [[310,108],[295,182],[298,258],[300,336],[310,410]];
  const jR = [[690,108],[705,182],[702,258],[700,336],[690,410]];

  // Termination nodes (where circuits touch platform buttons)
  const tL = [[215,62],[215,160],[215,260],[215,360],[215,460]];
  const tR = [[785,62],[785,160],[785,260],[785,360],[785,460]];

  // Energy packet dash lengths — sized to match path visual lengths
  const dashLen = [520, 440, 360, 440, 520];

  return (
    <svg
      viewBox="0 0 1000 520"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* ── Per-path gradient: cyan at hub, purple toward platform ── */}
        {lP.map((_, i) => (
          <linearGradient key={`glg-l${i}`} id={`${uid}-glg-l${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="260" x2="215" y2={[62,160,260,360,460][i]}>
            <stop offset="0%"   stopColor="#00E5FF" stopOpacity="0.1"/>
            <stop offset="12%"  stopColor="#00E5FF" stopOpacity="1"/>
            <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.9"/>
            <stop offset="85%"  stopColor="#9333ea" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.35"/>
          </linearGradient>
        ))}
        {rP.map((_, i) => (
          <linearGradient key={`glg-r${i}`} id={`${uid}-glg-r${i}`} gradientUnits="userSpaceOnUse"
            x1="500" y1="260" x2="785" y2={[62,160,260,360,460][i]}>
            <stop offset="0%"   stopColor="#00E5FF" stopOpacity="0.1"/>
            <stop offset="12%"  stopColor="#00E5FF" stopOpacity="1"/>
            <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.9"/>
            <stop offset="85%"  stopColor="#9333ea" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.35"/>
          </linearGradient>
        ))}

        {/* ── Filters ── */}
        {/* Soft glow — for path bleed */}
        <filter id={`${uid}-blur`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5"/>
        </filter>
        {/* Tight glow — for core line */}
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Node bloom */}
        <filter id={`${uid}-bloom`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Packet glow */}
        <filter id={`${uid}-pkt`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ══════════════ LAYER 1: Wide purple bleed (background glow) ══════════════ */}
      {lP.map((d, i) => (
        <path key={`lb${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-l${i})`} strokeWidth="14" strokeOpacity="0.18"
          filter={`url(#${uid}-blur)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rb${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-r${i})`} strokeWidth="14" strokeOpacity="0.18"
          filter={`url(#${uid}-blur)`}/>
      ))}

      {/* ══════════════ LAYER 2: Medium purple outer line ══════════════ */}
      {lP.map((d, i) => (
        <path key={`lm${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="4" strokeOpacity="0.35"/>
      ))}
      {rP.map((d, i) => (
        <path key={`rm${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="4" strokeOpacity="0.35"/>
      ))}

      {/* ══════════════ LAYER 3: Thin cyan core line ══════════════ */}
      {lP.map((d, i) => (
        <path key={`lc${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-l${i})`} strokeWidth="1.6"
          filter={`url(#${uid}-glow)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rc${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke={`url(#${uid}-glg-r${i})`} strokeWidth="1.6"
          filter={`url(#${uid}-glow)`}/>
      ))}

      {/* ══════════════ LAYER 4: Animated energy packets ══════════════ */}
      {lP.map((d, i) => (
        <path key={`lp${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0"
          style={{
            strokeDasharray: `32 ${dashLen[i]}`,
            animation: `pktL${i} 2.2s linear ${i * 0.44}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}
      {rP.map((d, i) => (
        <path key={`rp${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0"
          style={{
            strokeDasharray: `32 ${dashLen[i]}`,
            animation: `pktR${i} 2.2s linear ${i * 0.44 + 0.22}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}

      {/* ══════════════ JUNCTION NODES — gold-pink dots at elbow bends ══════════════ */}
      {jL.map(([cx, cy], i) => (
        <g key={`jl${i}`}>
          {/* Outer bloom */}
          <circle cx={cx} cy={cy} r="7" fill="#D4AF37" fillOpacity="0.15"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="5;9;5" dur={`${1.6+i*0.15}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.1;0.28;0.1" dur={`${1.6+i*0.15}s`} repeatCount="indefinite"/>
          </circle>
          {/* Inner glow */}
          <circle cx={cx} cy={cy} r="4" fill="#D4AF37" fillOpacity="0.7"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="fill-opacity" values="0.5;1;0.5" dur={`${1.6+i*0.15}s`} repeatCount="indefinite"/>
          </circle>
          {/* Core */}
          <circle cx={cx} cy={cy} r="2" fill="white" fillOpacity="0.95"/>
        </g>
      ))}
      {jR.map(([cx, cy], i) => (
        <g key={`jr${i}`}>
          <circle cx={cx} cy={cy} r="7" fill="#D4AF37" fillOpacity="0.15"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="5;9;5" dur={`${1.6+i*0.15}s`} begin={`${i*0.18}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.1;0.28;0.1" dur={`${1.6+i*0.15}s`} begin={`${i*0.18}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="4" fill="#D4AF37" fillOpacity="0.7"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="fill-opacity" values="0.5;1;0.5" dur={`${1.6+i*0.15}s`} begin={`${i*0.18}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="2" fill="white" fillOpacity="0.95"/>
        </g>
      ))}

      {/* ══════════════ HUB PERIMETER ORIGIN NODES ══════════════ */}
      {hL.map(([cx, cy], i) => (
        <g key={`hl${i}`}>
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.2"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="4;8;4" dur="1.9s" begin={`${i*0.28}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="3.5" fill="#00E5FF" fillOpacity="0.9">
            <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="1.9s" begin={`${i*0.28}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="1.5" fill="white"/>
        </g>
      ))}
      {hR.map(([cx, cy], i) => (
        <g key={`hr${i}`}>
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.2"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="4;8;4" dur="1.9s" begin={`${i*0.28+0.14}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="3.5" fill="#00E5FF" fillOpacity="0.9">
            <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="1.9s" begin={`${i*0.28+0.14}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="1.5" fill="white"/>
        </g>
      ))}

      {/* ══════════════ PLATFORM TERMINATION NODES — energy arrival bloom ══════════════ */}
      {tL.map(([cx, cy], i) => (
        <g key={`tl${i}`}>
          {/* Outer bloom ring */}
          <circle cx={cx} cy={cy} r="12" fill="#00E5FF" fillOpacity="0.08"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="9;16;9" dur="2.4s" begin={`${i*0.38}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.05;0.22;0.05" dur="2.4s" begin={`${i*0.38}s`} repeatCount="indefinite"/>
          </circle>
          {/* Inner ring */}
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.6"
            filter={`url(#${uid}-glow)`}>
            <animate attributeName="fill-opacity" values="0.4;0.95;0.4" dur="2.4s" begin={`${i*0.38}s`} repeatCount="indefinite"/>
          </circle>
          {/* Core dot */}
          <circle cx={cx} cy={cy} r="2.8" fill="white" fillOpacity="0.95"/>
        </g>
      ))}
      {tR.map(([cx, cy], i) => (
        <g key={`tr${i}`}>
          <circle cx={cx} cy={cy} r="12" fill="#00E5FF" fillOpacity="0.08"
            filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="9;16;9" dur="2.4s" begin={`${i*0.38+0.19}s`} repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.05;0.22;0.05" dur="2.4s" begin={`${i*0.38+0.19}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.6"
            filter={`url(#${uid}-glow)`}>
            <animate attributeName="fill-opacity" values="0.4;0.95;0.4" dur="2.4s" begin={`${i*0.38+0.19}s`} repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="2.8" fill="white" fillOpacity="0.95"/>
        </g>
      ))}
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

  /* ── Platform pill — identical appearance for all 10, only interaction & badge differ ── */
  const PillBtn = ({ k }: { k: string }) => {
    const isReady = ready(k);
    const link = href(k);
    const label = PLATFORM_LABELS[k] ?? k;
    return (
      <button
        onClick={isReady ? () => go(k, link) : undefined}
        disabled={!isReady}
        className={[
          'w-full flex items-center justify-between gap-2 rounded-full border',
          'transition-all duration-300 select-none backdrop-blur-xl',
          'bg-[#050512]/88',
          isReady
            ? 'border-[#7c3aed]/80 shadow-[0_0_22px_rgba(124,58,237,0.4),inset_0_0_14px_rgba(0,0,0,0.75)] hover:border-[#00E5FF] hover:shadow-[0_0_36px_rgba(0,229,255,0.7),inset_0_0_20px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 cursor-pointer'
            : 'border-[#7c3aed]/45 shadow-[0_0_14px_rgba(124,58,237,0.2),inset_0_0_10px_rgba(0,0,0,0.7)] cursor-not-allowed opacity-95',
        ].join(' ')}
        style={{ padding: 'clamp(5px,1.1vw,9px) clamp(8px,1.6vw,14px)' }}
        aria-label={isReady ? `Listen on ${label}` : `${label} coming soon`}
      >
        <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
          <BrandIcon id={k} size={18}/>
          <span className="font-bold tracking-wide text-white/95 truncate"
            style={{ fontSize: 'clamp(9px,1.7vw,13px)' }}>{label}</span>
        </span>
        {isReady
          ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 bg-[#ff003c] shadow-[0_0_8px_#ff003c,0_0_16px_#ff003c] animate-pulse"/>
          : <span className="flex-shrink-0 rounded-full font-black uppercase tracking-wider text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              style={{ fontSize: 'clamp(5.5px,1vw,8px)', padding: '2px 5px' }}>SOON</span>
        }
      </button>
    );
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          HERO ARTWORK — 1024×1280 simplified poster
          Crop: show exactly top 79.7% (Y=0 to Y≈1020)
          This reveals: AMD badge + 8 artists + DISCOVER AFRICA'S
          BIGGEST HITS + ONE LINK. EVERY PLATFORM.
          Pure dark background below that is clipped by overflow:hidden.
          Container aspectRatio = width:visible_height = 1024:1020
      ════════════════════════════════════════════════════════════ */}
      <div
        className="w-full relative select-none overflow-hidden"
        style={{ aspectRatio: '1024 / 1020' }}
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
        {/*
          Dissolve — starts at bottom 20% of container.
          The artwork's base color at the "ONE LINK" zone is very dark navy/black (#03030C).
          We dissolve into the EXACT same color as the section below: #05050e
          Gradient: from #05050e solid → semi → transparent
          Height of 20% ensures "ONE LINK. EVERY PLATFORM." text above it is NOT covered.
        */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '20%',
            background: 'linear-gradient(to top, #05050e 0%, rgba(5,5,14,0.96) 25%, rgba(5,5,14,0.7) 55%, rgba(5,5,14,0.2) 80%, transparent 100%)',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          INTERACTIVE LIVING ECOSYSTEM
          Begins directly where ONE LINK. EVERY PLATFORM. ends.
          Background matches the artwork's dark base: #05050e
      ════════════════════════════════════════════════════════════ */}
      <div
        className="w-full relative"
        style={{
          background: 'linear-gradient(180deg, #05050e 0%, #060618 40%, #05050f 100%)',
          marginTop: '-1px',
        }}
      >
        {/* Ambient radial glow — matches artwork's central purple/cyan atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '90%', height: '55%',
              background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.22) 0%, rgba(0,229,255,0.07) 45%, transparent 70%)',
              filter: 'blur(35px)',
            }}/>
        </div>

        <div className="w-full max-w-[1200px] mx-auto px-1 sm:px-3 lg:px-6 relative">

          {/* ── PLATFORM ECOSYSTEM ── */}
          <div
            className="relative w-full"
            style={{
              minHeight: 'clamp(240px,46vw,540px)',
              paddingTop:    'clamp(6px,1.2vw,14px)',
              paddingBottom: 'clamp(4px,0.8vw,10px)',
            }}
          >
            {/* SVG circuit — absolute, covers entire zone */}
            <CircuitSVG uid={uid}/>

            {/* Three-column grid: Left | Hub | Right */}
            <div
              className="relative z-10 flex items-center h-full w-full"
              style={{ minHeight: 'clamp(240px,46vw,540px)' }}
            >
              {/* LEFT COLUMN */}
              <div
                className="flex flex-col justify-center gap-1.5 sm:gap-2.5 flex-1 min-w-0"
                style={{ paddingRight: 'clamp(4px,1.5vw,18px)' }}
              >
                {LEFT_PLATFORMS.map(k => <PillBtn key={k} k={k}/>)}
              </div>

              {/* CENTER HUB — enhanced power-core styling v3.1 */}
              <div
                className="flex-shrink-0 flex flex-col items-center justify-center"
                style={{ width: 'clamp(92px,22vw,220px)', padding: '0 clamp(4px,1vw,12px)' }}
              >
                {/* Triple-ring outer glow */}
                <div className="relative flex items-center justify-center"
                  style={{
                    width:  'clamp(88px,21vw,215px)',
                    height: 'clamp(88px,21vw,215px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,229,255,0.18) 0%, rgba(124,58,237,0.35) 45%, transparent 70%)',
                    animation: 'hubAura 3.5s ease-in-out infinite',
                  }}
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      border: '1.5px solid rgba(0,229,255,0.25)',
                      boxShadow: '0 0 30px rgba(0,229,255,0.2)',
                      animation: 'ringPulse 3.5s ease-in-out infinite',
                    }}/>

                  {/* Main hub circle — gradient border + dark glass core */}
                  <div className="rounded-full flex items-center justify-center"
                    style={{
                      width:  'clamp(82px,20vw,204px)',
                      height: 'clamp(82px,20vw,204px)',
                      padding: '3px',
                      background: 'linear-gradient(135deg,#00E5FF 0%,#3b82f6 22%,#7c3aed 50%,#a855f7 72%,#00E5FF 100%)',
                      boxShadow: '0 0 70px rgba(0,229,255,0.8), 0 0 120px rgba(124,58,237,0.5), 0 0 200px rgba(0,229,255,0.2)',
                      animation: 'hubPulse 3.5s ease-in-out infinite',
                    }}
                  >
                    {/* Inner glass core */}
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                      style={{
                        background: 'radial-gradient(circle at 40% 35%, #0a0a22, #030310 70%)',
                        border: '1.5px solid rgba(0,229,255,0.3)',
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95), inset 0 0 20px rgba(124,58,237,0.3)',
                      }}
                    >
                      {/* Inner purple radial glow */}
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 60%, rgba(124,58,237,0.55) 0%, transparent 65%)' }}/>
                      {/* Top specular highlight */}
                      <div className="absolute top-0 left-1/4 right-1/4 pointer-events-none"
                        style={{ height: '35%', background: 'radial-gradient(ellipse, rgba(0,229,255,0.12) 0%, transparent 80%)', filter: 'blur(4px)' }}/>

                      <span className="relative z-10 font-black text-white"
                        style={{ fontSize: 'clamp(7px,1.8vw,14px)', letterSpacing: '0.22em', fontFamily: 'Georgia,serif', textShadow: '0 0 12px rgba(0,229,255,0.7)' }}>CHROME</span>
                      <span className="relative z-10 font-black leading-tight"
                        style={{
                          fontSize: 'clamp(8.5px,2.2vw,18px)', letterSpacing: '0.1em',
                          background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#D4AF37,#AA771C)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 0 18px rgba(255,215,0,1))',
                        }}>AFROFUSION</span>
                      <span className="relative z-10 font-black text-white/75"
                        style={{ fontSize: 'clamp(5.5px,1.3vw,10px)', letterSpacing: '0.35em', margin: '1px 0' }}>— RADIO —</span>
                      <span className="relative z-10 font-bold text-[#00E5FF]"
                        style={{ fontSize: 'clamp(4.5px,1vw,8px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 0 5px #00E5FF)' }}>POWERED BY</span>
                      <span className="relative z-10 font-bold text-white/85"
                        style={{ fontSize: 'clamp(4.5px,1.1vw,9px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.8))' }}>MUSIC INTEL</span>
                    </div>
                  </div>
                </div>

                {/* Equalizer bars */}
                <div className="flex items-end justify-center gap-0.5 sm:gap-1 mt-2"
                  style={{ height: 'clamp(12px,2.4vw,22px)' }}>
                  {[['#00E5FF','58%','0ms'],['#3b82f6','88%','110ms'],['#7c3aed','100%','220ms'],
                    ['#00E5FF','68%','75ms'],['#60a5fa','82%','185ms'],['#a855f7','48%','35ms'],
                    ['#00E5FF','73%','150ms']].map(([c,h,d],i) => (
                    <div key={i} className="rounded-full animate-bounce"
                      style={{ width:'clamp(2px,0.45vw,4.5px)', height:h, backgroundColor:c, boxShadow:`0 0 6px ${c}`, animationDelay:d }}/>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div
                className="flex flex-col justify-center gap-1.5 sm:gap-2.5 flex-1 min-w-0"
                style={{ paddingLeft: 'clamp(4px,1.5vw,18px)' }}
              >
                {RIGHT_PLATFORMS.map(k => <PillBtn key={k} k={k}/>)}
              </div>
            </div>
          </div>

          {/* ── STATS BAR ── */}
          <div className="mt-1 sm:mt-3">
            <div className="rounded-2xl border border-[#7c3aed]/55 py-3 px-4 sm:py-4 sm:px-8"
              style={{ background: 'rgba(5,5,18,0.92)', backdropFilter: 'blur(28px)', boxShadow: '0 0 44px rgba(124,58,237,0.28), inset 0 0 0 1px rgba(0,229,255,0.06)' }}>
              <div className="grid grid-cols-4 text-center divide-x divide-[#7c3aed]/30">
                {[
                  { icon:'🎵', color:'#a855f7', num:'50',  lbl:'TRACKS' },
                  { icon:'👥', color:'#00E5FF', num:'40+', lbl:'ARTISTS' },
                  { icon:'🌐', color:'#D4AF37', num:'10',  lbl:'PLATFORMS' },
                  { icon:'📅', color:'#34d399', num:'',    lbl:'UPDATED\nWEEKLY' },
                ].map(({ icon, color, num, lbl }) => (
                  <div key={lbl} className="flex flex-col items-center px-1 sm:px-3 gap-0.5">
                    <span style={{ color, fontSize:'clamp(13px,2.5vw,21px)', filter:`drop-shadow(0 0 8px ${color})` }}>{icon}</span>
                    {num && <span className="font-black text-white" style={{ fontSize:'clamp(11px,2.1vw,20px)', textShadow:`0 0 14px ${color}` }}>{num}</span>}
                    <span className="font-black text-gray-300 uppercase leading-tight text-center"
                      style={{ fontSize:'clamp(6px,1.15vw,10px)', letterSpacing:'0.1em', whiteSpace:'pre-line' }}>{lbl}</span>
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
                background: 'linear-gradient(90deg,#BF953F 0%,#FCF6BA 26%,#B38728 50%,#FBF5B7 74%,#AA771C 100%)',
                color: '#000',
                border: '2px solid rgba(255,248,214,0.9)',
                boxShadow: '0 0 60px rgba(255,215,0,0.8), 0 0 110px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              <span style={{ fontFamily:'Georgia,"Times New Roman",serif', textShadow:'0 1px 3px rgba(255,255,255,0.35)' }}>LISTEN NOW</span>
              <span className="rounded-full bg-black text-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ width:'clamp(32px,6vw,54px)', height:'clamp(32px,6vw,54px)', fontSize:'clamp(14px,2.5vw,24px)', boxShadow:'0 0 22px rgba(255,215,0,0.55)' }}>▸</span>
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
            <p className="font-black tracking-[0.25em] uppercase" style={{ fontSize:'clamp(9px,2vw,13px)' }}>
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
                  padding: 'clamp(10px,2vw,16px)',
                  background: 'rgba(5,5,18,0.92)', backdropFilter:'blur(28px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.82), 0 0 20px ${color}14`,
                }}
              >
                <span className="flex-shrink-0 mt-0.5" style={{ color, fontSize:'clamp(14px,2.5vw,20px)', filter:`drop-shadow(0 0 9px ${color})` }}>{icon}</span>
                <div>
                  <h4 className="font-black uppercase text-gray-100 leading-tight"
                    style={{ fontSize:'clamp(7px,1.4vw,11px)', letterSpacing:'0.06em' }}>{title}</h4>
                  <p className="text-gray-400 leading-snug mt-1" style={{ fontSize:'clamp(7px,1.2vw,10px)' }}>{sub}</p>
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
        /* Hub outer aura breathe */
        @keyframes hubAura {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.04); }
        }
        /* Hub gradient ring pulse */
        @keyframes hubPulse {
          0%,100% { box-shadow: 0 0 70px rgba(0,229,255,0.8), 0 0 120px rgba(124,58,237,0.5), 0 0 200px rgba(0,229,255,0.2); }
          50%      { box-shadow: 0 0 100px rgba(0,229,255,1),  0 0 170px rgba(124,58,237,0.75),0 0 260px rgba(0,229,255,0.35); }
        }
        /* Outer ring pulse */
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 30px rgba(0,229,255,0.2); opacity: 0.6; }
          50%      { box-shadow: 0 0 55px rgba(0,229,255,0.5); opacity: 1; }
        }
        /* Energy packets — left paths (hub → platform, high dashoffset → low) */
        ${[0,1,2,3,4].map(i=>`
          @keyframes pktL${i} {
            0%   { stroke-dashoffset:${[560,480,400,480,560][i]}; stroke-opacity:0; }
            12%  { stroke-opacity:0.95; }
            88%  { stroke-opacity:0.95; }
            100% { stroke-dashoffset:0; stroke-opacity:0; }
          }
          @keyframes pktR${i} {
            0%   { stroke-dashoffset:${[560,480,400,480,560][i]}; stroke-opacity:0; }
            12%  { stroke-opacity:0.95; }
            88%  { stroke-opacity:0.95; }
            100% { stroke-dashoffset:0; stroke-opacity:0; }
          }
        `).join('')}
      `}</style>
    </>
  );
}
