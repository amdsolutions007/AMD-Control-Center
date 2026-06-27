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
      return <svg width={size} height={size} viewBox="0 0 300 300" fill="#FF5500"><path d="M0 193q0 20 13.5 33.5T47 240t33.5-13.5T94 193q0-7-2-13 5 2 10 2 21 0 35.5-14.5T152 132t-14.5-35.5T102 82q-11 0-21 4-4-28-25-46T9 22Q0 22 0 30v163zm128-61q0 17-11.5 28.5T89 172h-1q1-4 1-8 0-25-17.5-44T28 100q2-1 5-1 20 0 36 12 3-6 8-10 12-9 27-9 12 0 22 5t16 14 6 21zm21 17q0-10 7-17t17-7 17 7 17-7 17-17 7-17-7-7-17zm34 0q0 4 3 7t7 3 7-3 3-7-3-7-7-3-7 3-3 7zm50-60q0-25-17.5-44T172 26q-11 0-21 4 4 10 4 21 0 25-17.5 44T95 119q1 3 1 7 0 25-17.5 44T35 189q6 26 27 43t47 17q20 0 38.5-8t32-21.5 21.5-32 8-38.5q0-15-4-29z"/></svg>;
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
   PREMIUM PCB-STYLE ORGANIC CIRCUIT SVG — V3.3.1
   FINAL PCB PRECISION REFINEMENT

   1. Perfect Cable Termination: Every branch terminates at exactly X=288 (left)
      and X=712 (right) with identical horizontal arrival geometry.
   2. Middle Connections Corrected: Audiomack and Instagram share exact cubic
      curvature rhythm and vertical grid alignment (Y=250) as all other rows.
   3. Uniform Glow & 4. Uniform Sockets: Identical stroke widths, filters,
      socket diameters, and animation timing across all 10 branches.
   5. Hub Origin Precision: All 10 origins start at exact circular radius R=116
      on desktop and R=104 on mobile around hub center (500,250).
   6. Engineering Symmetry: Junction nodes align vertically along X=330 (left)
      and X=670 (right) forming a true AI motherboard architecture.
────────────────────────────────────────────────────────── */
function CircuitSVG({ uid }: { uid: string }) {
  // Desktop Paths (Origins on R=116 circle, junctions at X=330/670, endpoints at X=288/712)
  const lP_desk = [
    `M 406,182 C 375,182 350,135 330,100 C 315,75 295,50 278,50`,
    `M 390,214 C 368,214 345,190 330,175 C 315,160 295,150 278,150`,
    `M 384,250 C 360,250 345,250 330,250 C 315,250 295,250 278,250`,
    `M 390,286 C 368,286 345,310 330,325 C 315,340 295,350 278,350`,
    `M 406,318 C 375,318 350,365 330,400 C 315,425 295,450 278,450`,
  ];
  const rP_desk = [
    `M 594,182 C 625,182 650,135 670,100 C 685,75 705,50 722,50`,
    `M 610,214 C 632,214 655,190 670,175 C 685,160 705,150 722,150`,
    `M 616,250 C 640,250 655,250 670,250 C 685,250 705,250 722,250`,
    `M 610,286 C 632,286 655,310 670,325 C 685,340 705,350 722,350`,
    `M 594,318 C 625,318 650,365 670,400 C 685,425 705,450 722,450`,
  ];
  const jL_desk = [[330,100], [330,175], [330,250], [330,325], [330,400]];
  const jR_desk = [[670,100], [670,175], [670,250], [670,325], [670,400]];
  const tL_desk = [[285,50], [285,150], [285,250], [285,350], [285,450]];
  const tR_desk = [[715,50], [715,150], [715,250], [715,350], [715,450]];
  const oL_desk = [[406,182], [390,214], [384,250], [390,286], [406,318]];
  const oR_desk = [[594,182], [610,214], [616,250], [610,286], [594,318]];

  // Mobile Paths (Origins on R=104 circle, junctions at X=360/640, endpoints at X=318/682)
  const lP_mob = [
    `M 412,188 C 390,188 375,145 360,110 C 348,80 335,50 318,50`,
    `M 398,216 C 380,216 368,190 360,175 C 348,160 335,150 318,150`,
    `M 396,250 C 380,250 368,250 360,250 C 348,250 335,250 318,250`,
    `M 398,284 C 380,284 368,310 360,325 C 348,340 335,350 318,350`,
    `M 412,312 C 390,312 375,355 360,390 C 348,420 335,450 318,450`,
  ];
  const rP_mob = [
    `M 588,188 C 610,188 625,145 640,110 C 652,80 665,50 682,50`,
    `M 602,216 C 620,216 632,190 640,175 C 652,160 665,150 682,150`,
    `M 604,250 C 620,250 632,250 640,250 C 652,250 665,250 682,250`,
    `M 602,284 C 620,284 632,310 640,325 C 652,340 665,350 682,350`,
    `M 588,312 C 610,312 625,355 640,390 C 652,420 665,450 682,450`,
  ];
  const jL_mob = [[360,110], [360,175], [360,250], [360,325], [360,390]];
  const jR_mob = [[640,110], [640,175], [640,250], [640,325], [640,390]];
  const tL_mob = [[325,50], [325,150], [325,250], [325,350], [325,450]];
  const tR_mob = [[675,50], [675,150], [675,250], [675,350], [675,450]];
  const oL_mob = [[412,188], [398,216], [396,250], [398,284], [412,312]];
  const oR_mob = [[588,188], [602,216], [604,250], [602,284], [588,312]];

  const renderPaths = (
    lP: string[], rP: string[],
    jL: number[][], jR: number[][],
    tL: number[][], tR: number[][],
    oL: number[][], oR: number[][],
    prefix: string
  ) => (
    <>
      {/* Layer 1: Uniform Outer Purple Ambient Glow */}
      {lP.map((d, i) => (
        <path key={`lb-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#8a2be2" strokeWidth="12" strokeOpacity="0.25" filter={`url(#${uid}-blur)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rb-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#8a2be2" strokeWidth="12" strokeOpacity="0.25" filter={`url(#${uid}-blur)`}/>
      ))}

      {/* Layer 2: Uniform Purple Neon Track */}
      {lP.map((d, i) => (
        <path key={`lm-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="3.5" strokeOpacity="0.65" filter={`url(#${uid}-glow)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rm-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="3.5" strokeOpacity="0.65" filter={`url(#${uid}-glow)`}/>
      ))}

      {/* Layer 3: Uniform Bright Cyan Core Wire */}
      {lP.map((d, i) => (
        <path key={`lc-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#00E5FF" strokeWidth="1.8" strokeOpacity="0.95" filter={`url(#${uid}-glow)`}/>
      ))}
      {rP.map((d, i) => (
        <path key={`rc-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#00E5FF" strokeWidth="1.8" strokeOpacity="0.95" filter={`url(#${uid}-glow)`}/>
      ))}

      {/* Layer 4: Uniform Moving Cyan Energy Packets */}
      {lP.map((d, i) => (
        <path key={`lp-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00FFFF" strokeWidth="2.8" strokeOpacity="0"
          style={{
            strokeDasharray: '32 350',
            animation: `pktL${i} 2.0s linear ${i * 0.4}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}
      {rP.map((d, i) => (
        <path key={`rp-${prefix}-${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00FFFF" strokeWidth="2.8" strokeOpacity="0"
          style={{
            strokeDasharray: '32 350',
            animation: `pktR${i} 2.0s linear ${i * 0.4 + 0.2}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}

      {/* Hub Origin Socket Nodes (visibly socketing out of the power generator) */}
      {oL.map(([cx, cy], i) => (
        <g key={`ol-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.4" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" fillOpacity="0.9"/>
        </g>
      ))}
      {oR.map(([cx, cy], i) => (
        <g key={`or-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.4" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" fillOpacity="0.9"/>
        </g>
      ))}

      {/* Gold Junction Nodes at elbow bends (Identical specification & timing) */}
      {jL.map(([cx, cy], i) => (
        <g key={`jl-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="10" fill="#D4AF37" fillOpacity="0.25" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="5" fill="#D4AF37" fillOpacity="0.85" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2.2" fill="#FFFFFF" fillOpacity="1"/>
        </g>
      ))}
      {jR.map(([cx, cy], i) => (
        <g key={`jr-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="10" fill="#D4AF37" fillOpacity="0.25" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="5" fill="#D4AF37" fillOpacity="0.85" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2.2" fill="#FFFFFF" fillOpacity="1"/>
        </g>
      ))}

      {/* Termination Hardware Sockets clamping onto button borders */}
      {tL.map(([cx, cy], i) => (
        <g key={`tl-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="9" fill="#00E5FF" fillOpacity="0.25" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="4.5" fill="#00E5FF" fillOpacity="0.9" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2" fill="#FFFFFF"/>
        </g>
      ))}
      {tR.map(([cx, cy], i) => (
        <g key={`tr-${prefix}-${i}`}>
          <circle cx={cx} cy={cy} r="9" fill="#00E5FF" fillOpacity="0.25" filter={`url(#${uid}-bloom)`}>
            <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={cx} cy={cy} r="4.5" fill="#00E5FF" fillOpacity="0.9" filter={`url(#${uid}-glow)`}/>
          <circle cx={cx} cy={cy} r="2" fill="#FFFFFF"/>
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
        {renderPaths(lP_desk, rP_desk, jL_desk, jR_desk, tL_desk, tR_desk, oL_desk, oR_desk, 'desk')}
      </g>

      {/* Render Mobile Circuitry */}
      <g className="block sm:hidden">
        {renderPaths(lP_mob, rP_mob, jL_mob, jR_mob, tL_mob, tR_mob, oL_mob, oR_mob, 'mob')}
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

  /* ── Platform pill — modular PCB cartridge styling ── */
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
          HERO ARTWORK — V3.4.3 Final Hero Slogan Refinement
          Increased HTML/CSS slogan font size (+30%) & weight with
          opaque bottom masking band concealing embedded text underneath.
      ════════════════════════════════════════════════════════════ */}
      <div
        className="w-full relative select-none overflow-hidden"
        style={{ aspectRatio: '1024 / 1025' }}
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
            height: '4.8%',
            background: 'linear-gradient(to top, #05050e 0%, #05050e 65%, rgba(5,5,14,0.88) 85%, transparent 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-[1.1%] flex justify-center items-center pointer-events-none select-none z-10 px-2">
          <p
            className="font-black uppercase tracking-[0.16em] sm:tracking-[0.24em] text-center drop-shadow-[0_2px_14px_rgba(0,229,255,0.65)] drop-shadow-[0_4px_24px_rgba(124,58,237,0.55)]"
            style={{
              fontSize: 'clamp(14.5px, 2.75vw, 26px)',
              background: 'linear-gradient(90deg, #00E5FF 0%, #3b82f6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ONE LINK. EVERY PLATFORM.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          INTERACTIVE LIVING ECOSYSTEM — V3.3.1
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

            {/* LEFT BUTTONS COLUMN — zero inner padding ensuring exact X=290 alignment */}
            <div className="absolute left-[3%] sm:left-[7%] top-0 bottom-0 w-[30%] sm:w-[22%] grid grid-rows-5 z-10">
              {LEFT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center justify-center w-full">
                  <PillBtn k={k}/>
                </div>
              ))}
            </div>

            {/* CENTER POWER HUB — visual generator commanding the ecosystem */}
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

            {/* RIGHT BUTTONS COLUMN — zero inner padding ensuring exact X=710 alignment */}
            <div className="absolute right-[3%] sm:right-[7%] top-0 bottom-0 w-[30%] sm:w-[22%] grid grid-rows-5 z-10">
              {RIGHT_PLATFORMS.map(k => (
                <div key={k} className="flex items-center justify-center w-full">
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
            0%   { stroke-dashoffset: 380; stroke-opacity: 0; }
            12%  { stroke-opacity: 0.95; }
            88%  { stroke-opacity: 0.95; }
            100% { stroke-dashoffset: 0; stroke-opacity: 0; }
          }
          @keyframes pktR${i} {
            0%   { stroke-dashoffset: 380; stroke-opacity: 0; }
            12%  { stroke-opacity: 0.95; }
            88%  { stroke-opacity: 0.95; }
            100% { stroke-dashoffset: 0; stroke-opacity: 0; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
