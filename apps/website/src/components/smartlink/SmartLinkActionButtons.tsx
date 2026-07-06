'use client';

import React, { useState, useId, useEffect } from 'react';
import Link from 'next/link';

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

const BOOMPLAY_PLAYLIST_URL =
  'https://www.boomplay.com/share/playlist/134774932?share_platform=an&srList=ANDROID&srModel=COPYLINK&share_channel=copylink&share_content=playlist';

const AUDIOMACK_PLAYLIST_URL =
  'https://audiomack.com/amdmusicintel/playlist/chrome-afrofusion-radio-6a4572fac3400?share-user-id=60313132';

const TIKTOK_PROFILE_URL = 'https://vt.tiktok.com/ZSCbaGdYU/';

const INSTAGRAM_PROFILE_URL =
  'https://www.instagram.com/amdmusicintel?igsh=MXhpajFxZzdpMGViMQ==';

const COMING_SOON_PLATFORMS = new Set(['amazon_music', 'deezer']);

const GATEWAY_PLATFORMS = [
  'spotify',
  'apple_music',
  'audiomack',
  'boomplay',
  'soundcloud',
  'youtube_music',
  'amazon_music',
  'deezer',
] as const;

const FEATURE_CARDS = [
  { icon: '🧠', color: '#a855f7', title: 'Music Intelligence', sub: 'AI-powered music discovery with intelligent playlist curation.', href: '/music-intelligence' },
  { icon: '🌐', color: '#00E5FF', title: 'Global Reach', sub: 'One Link. Worldwide music access.', href: '/music-intelligence/platforms' },
  { icon: '⭐', color: '#D4AF37', title: 'Smart Recommendations', sub: 'Personalized discovery powered by intelligent insights.', href: '/music-intelligence/coming-soon/discovery-engine' },
  { icon: '📈', color: '#34d399', title: 'Audience Intelligence', sub: 'Real audience insights. Smarter growth decisions.', href: '/music-intelligence/coming-soon/analytics-dashboard' },
  { icon: '👑', color: '#facc15', title: 'Artist Growth', sub: 'More visibility. More opportunities. More listeners.', href: '/music-intelligence/coming-soon/artist-services' },
] as const;

const WORKFLOW_STAGES = [
  { icon: '🔍', title: 'DISCOVER', desc: 'We curate the biggest hits.', href: '/music-intelligence/coming-soon/discovery-engine', action: 'navigate' as const },
  { icon: '🔗', title: 'CONNECT', desc: 'One link connects every platform.', href: '/music-intelligence/coming-soon/smart-link-technology', action: 'navigate' as const },
  { icon: '▶', title: 'STREAM', desc: 'Stream anywhere, anytime.', action: 'gateway' as const },
  { icon: '🧠', title: 'INTELLIGENCE', desc: 'AI-powered music discovery with intelligent playlist curation.', href: '/music-intelligence/coming-soon/agent-007', action: 'navigate' as const },
  { icon: '📈', title: 'AUDIENCE INTELLIGENCE', desc: 'Real audience insights. Smarter growth decisions.', href: '/music-intelligence/coming-soon/analytics-platform', action: 'navigate' as const },
];

/* ──────────────────────────────────────────────────────────
   MASTER BLUEPRINT MOTHERBOARD MODEL
   Static coordinate map for the approved motherboard artwork:
   platform pills, sockets, stepped PCB routes, hub, Energy Core,
   gold junctions, and lower U-shaped chassis.
────────────────────────────────────────────────────────── */
const MOTHERBOARD = {
  width: 1024,
  height: 382,
  svg: { x: -16, y: -6, width: 1056, height: 394 },
  button: { w: 244, h: 35 },
  leftX: 132,
  rightX: 892,
  hub: { x: 512, y: 154, size: 184 },
  core: { x: 512, y: 318, w: 292, h: 82 },
  rows: [
    {
      left: 'spotify',
      right: 'tiktok',
      y: 42,
      path: [[254, 42], [294, 42], [324, 70], [358, 70], [358, 108], [428, 108]],
      nodes: [[324, 70], [358, 108], [428, 108]],
      hub: [428, 108],
    },
    {
      left: 'apple_music',
      right: 'youtube_music',
      y: 102,
      path: [[254, 102], [294, 102], [326, 130], [374, 130], [392, 142], [424, 142]],
      nodes: [[292, 102], [392, 142], [424, 142]],
      hub: [424, 142],
    },
    {
      left: 'audiomack',
      right: 'instagram',
      y: 162,
      path: [[254, 162], [304, 162], [332, 174], [374, 174], [398, 184], [424, 184]],
      nodes: [[304, 162], [374, 174], [424, 184]],
      hub: [424, 184],
    },
    {
      left: 'boomplay',
      right: 'amazon_music',
      y: 234,
      path: [[254, 234], [294, 234], [328, 206], [374, 206], [398, 218], [438, 218]],
      nodes: [[292, 234], [398, 218], [438, 218]],
      hub: [438, 218],
    },
    {
      left: 'soundcloud',
      right: 'deezer',
      y: 306,
      path: [[254, 306], [316, 306], [346, 306], [346, 360], [410, 360], [410, 364], [466, 364]],
      nodes: [[292, 306], [346, 306], [410, 364]],
      hub: [466, 364],
    },
  ],
  lowerRail: [[346, 254], [346, 364], [466, 364], [466, 378], [558, 378], [558, 364], [678, 364], [678, 254]],
  coreRail: [[366, 256], [402, 256], [402, 254], [622, 254], [622, 256], [658, 256]],
  coreFeeds: [
    [[430, 272], [430, 294]],
    [[512, 272], [512, 294]],
    [[594, 272], [594, 294]],
  ],
  coreBusLinks: [
    [[466, 359], [558, 359]],
    [[466, 359], [466, 378]],
    [[512, 359], [512, 378]],
    [[558, 359], [558, 378]],
  ],
  coreBusNodes: [
    [466, 359],
    [512, 359],
    [558, 359],
  ],
} as const;

type BoardSide = 'left' | 'right';
type BoardRow = typeof MOTHERBOARD.rows[number];
type BoardPoint = readonly [number, number];

const mirrorBoardX = (x: number) => MOTHERBOARD.width - x;
const boardPctX = (x: number) => `${(x / MOTHERBOARD.width) * 100}%`;
const boardPctY = (y: number) => `${(y / MOTHERBOARD.height) * 100}%`;

function sidePoint([x, y]: BoardPoint, side: BoardSide): [number, number] {
  return [side === 'left' ? x : mirrorBoardX(x), y];
}

function rowPlatformKey(row: BoardRow, side: BoardSide) {
  return side === 'left' ? row.left : row.right;
}

function platformCenter(side: BoardSide) {
  return side === 'left' ? MOTHERBOARD.leftX : MOTHERBOARD.rightX;
}

function coordBoxStyle(x: number, y: number, w: number, h: number): React.CSSProperties {
  return {
    left: boardPctX(x - w / 2),
    top: boardPctY(y - h / 2),
    width: boardPctX(w),
    height: boardPctY(h),
  };
}

function platformBoxStyle(side: BoardSide, y: number): React.CSSProperties {
  return coordBoxStyle(platformCenter(side), y, MOTHERBOARD.button.w, MOTHERBOARD.button.h);
}

function hubBoxStyle(): React.CSSProperties {
  return coordBoxStyle(MOTHERBOARD.hub.x, MOTHERBOARD.hub.y, MOTHERBOARD.hub.size, MOTHERBOARD.hub.size);
}

function coreBoxStyle(): React.CSSProperties {
  return coordBoxStyle(MOTHERBOARD.core.x, MOTHERBOARD.core.y, MOTHERBOARD.core.w, MOTHERBOARD.core.h);
}

function pathFromPoints(points: readonly BoardPoint[], side: BoardSide = 'left') {
  return points.map((point, index) => {
    const [x, y] = sidePoint(point, side);
    return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');
}

function mirroredRows(side: BoardSide) {
  return MOTHERBOARD.rows.map((row) => pathFromPoints(row.path, side));
}

function mirroredNodePoints(side: BoardSide) {
  return MOTHERBOARD.rows.flatMap((row) => [
    sidePoint(row.path[0], side),
    ...row.nodes.map((point) => sidePoint(point, side)),
  ]);
}

function mirroredHubSockets(side: BoardSide) {
  return MOTHERBOARD.rows.map((row) => sidePoint(row.hub, side));
}

function lowerRailPath(side: BoardSide) {
  return pathFromPoints(MOTHERBOARD.lowerRail, side);
}

function coreRailPath() {
  return pathFromPoints(MOTHERBOARD.coreRail);
}

function coreFramePath() {
  const left = MOTHERBOARD.core.x - MOTHERBOARD.core.w / 2;
  const right = MOTHERBOARD.core.x + MOTHERBOARD.core.w / 2;
  const top = MOTHERBOARD.core.y - MOTHERBOARD.core.h / 2;
  const bottom = MOTHERBOARD.core.y + MOTHERBOARD.core.h / 2;
  return `M ${left},${top} L ${left},${bottom} L ${right},${bottom} L ${right},${top} L ${left},${top}`;
}

function GoldNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill="#D4AF37" fillOpacity="0.25" filter="url(#gold-bloom)">
        <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx={cx} cy={cy} r="5" fill="#D4AF37" fillOpacity="0.85" filter="url(#cyan-glow)"/>
      <circle cx={cx} cy={cy} r="2.2" fill="#FFFFFF" fillOpacity="1"/>
    </g>
  );
}

function HubSocket({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="6" fill="#00E5FF" fillOpacity="0.4" filter="url(#cyan-glow)"/>
      <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" fillOpacity="0.9"/>
    </g>
  );
}

function CircuitSVG({ uid }: { uid: string }) {
  const paths = [
    ...mirroredRows('left'),
    ...mirroredRows('right'),
    lowerRailPath('left'),
    lowerRailPath('right'),
    coreRailPath(),
    coreFramePath(),
    ...MOTHERBOARD.coreFeeds.map((feed) => pathFromPoints(feed)),
    ...MOTHERBOARD.coreBusLinks.map((link) => pathFromPoints(link)),
  ];
  const nodes = [
    ...mirroredNodePoints('left'),
    ...mirroredNodePoints('right'),
    ...MOTHERBOARD.coreBusNodes,
    [MOTHERBOARD.core.x, 378],
  ];
  const sockets = [...mirroredHubSockets('left'), ...mirroredHubSockets('right')];

  return (
    <svg
      viewBox={`${MOTHERBOARD.svg.x} ${MOTHERBOARD.svg.y} ${MOTHERBOARD.svg.width} ${MOTHERBOARD.svg.height}`}
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
        <filter id="cyan-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gold-bloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {paths.map((d, i) => (
        <path key={`blur-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#00E5FF" strokeWidth="14" strokeOpacity="0.22" filter={`url(#${uid}-blur)`}/>
      ))}
      {paths.map((d, i) => (
        <path key={`mid-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#7c3aed" strokeWidth="5" strokeOpacity="0.75" filter={`url(#${uid}-glow)`}/>
      ))}
      {paths.map((d, i) => (
        <path key={`core-${i}`} d={d} fill="none" strokeLinecap="round" strokeLinejoin="round"
          stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0.98" filter={`url(#${uid}-glow)`}/>
      ))}
      {paths.map((d, i) => (
        <path key={`pkt-${i}`} d={d} fill="none" strokeLinecap="round"
          stroke="#00FFFF" strokeWidth="2.8" strokeOpacity="0"
          style={{
            strokeDasharray: '32 350',
            animation: `${i < 5 ? 'pktL' : 'pktR'}${i % 6} 2.0s linear ${(i % 6) * 0.35}s infinite`,
          }}
          filter={`url(#${uid}-pkt)`}
        />
      ))}
      {sockets.map(([cx, cy], i) => <HubSocket key={`socket-${i}`} cx={cx} cy={cy}/>)}
      {nodes.map(([cx, cy], i) => <GoldNode key={`node-${i}`} cx={cx} cy={cy}/>)}
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
  const [gatewayOpen, setGatewayOpen] = useState(false);
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

  const ready = (k: string) => {
    if (COMING_SOON_PLATFORMS.has(k)) return false;
    if (k === 'boomplay' || k === 'audiomack' || k === 'tiktok' || k === 'instagram') return true;
    if (!dspLinks) return false;
    return k === 'youtube_music' ? Boolean(dspLinks.youtube_music || dspLinks.youtube) : Boolean(dspLinks[k]);
  };
  const href = (k: string) => {
    if (k === 'boomplay') return dspLinks?.boomplay || BOOMPLAY_PLAYLIST_URL;
    if (k === 'audiomack') return AUDIOMACK_PLAYLIST_URL;
    if (k === 'tiktok') return TIKTOK_PROFILE_URL;
    if (k === 'instagram') return INSTAGRAM_PROFILE_URL;
    if (!dspLinks) return undefined;
    return k === 'youtube_music' ? (dspLinks.youtube_music || dspLinks.youtube) : dspLinks[k];
  };

  const openGateway = () => {
    fire('smart_link_gateway', window.location.href);
    setGatewayOpen(true);
  };

  const closeGateway = () => setGatewayOpen(false);

  const selectPlatform = (k: string) => {
    if (!ready(k)) return;
    const link = href(k);
    if (!link) return;
    setGatewayOpen(false);
    go(k, link);
  };

  useEffect(() => {
    if (!gatewayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGatewayOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [gatewayOpen]);

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
        style={{ padding: 'clamp(4px,0.85vw,6px) clamp(8px,1.4vw,14px)' }}
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
          {/* Stage box: every motherboard element is positioned by the Master Blueprint coordinate plane */}
          <div
            id="smart-link-gateway"
            className="relative w-full my-2 sm:my-4 scroll-mt-6"
            style={{
              aspectRatio: `${MOTHERBOARD.width} / ${MOTHERBOARD.height}`,
              width: 'calc(100% + clamp(18px, 3.5vw, 38px))',
              marginLeft: '50%',
              transform: 'translateX(-50%)',
              scrollMarginTop: '24px',
            }}
          >
            {/* SVG PCB circuit lines */}
            <CircuitSVG uid={uid}/>

            {MOTHERBOARD.rows.flatMap((row) => ([
              <div key={row.left} className="absolute z-10 flex items-center justify-center" style={platformBoxStyle('left', row.y)}>
                <PillBtn k={rowPlatformKey(row, 'left')}/>
              </div>,
              <div key={row.right} className="absolute z-10 flex items-center justify-center" style={platformBoxStyle('right', row.y)}>
                <PillBtn k={rowPlatformKey(row, 'right')}/>
              </div>,
            ]))}

            {/* CENTER POWER HUB — visual generator commanding the ecosystem */}
            <div className="absolute z-20 flex items-center justify-center" style={hubBoxStyle()}>
              <button
                type="button"
                onClick={openGateway}
                aria-label="Choose your streaming platform"
                className="relative flex h-full w-full items-center justify-center cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]"
                style={{
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, rgba(124,58,237,0.18) 45%, transparent 70%)',
                  animation: 'hubAura 3.5s ease-in-out infinite',
                }}
              >
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(0,229,255,0.3)',
                    boxShadow: '0 0 22px rgba(0,229,255,0.18)',
                    animation: 'ringPulse 3.5s ease-in-out infinite',
                  }}/>

                {/* Main hub circle */}
                <div className="h-[94%] w-[94%] rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    padding: '3px',
                    background: 'linear-gradient(135deg,#00E5FF 0%,#3b82f6 22%,#7c3aed 50%,#a855f7 72%,#00E5FF 100%)',
                    boxShadow: '0 0 42px rgba(0,229,255,0.52), 0 0 78px rgba(124,58,237,0.34), 0 0 118px rgba(0,229,255,0.12)',
                    animation: 'hubPulse 3.5s ease-in-out infinite',
                  }}
                >
                  {/* Inner glass core */}
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden gap-[3px] sm:gap-[5px] px-1.5 py-0.5"
                    style={{
                      background: 'radial-gradient(circle at 40% 35%, #07071a 0%, #020208 72%)',
                      border: '1.5px solid rgba(0,229,255,0.35)',
                      boxShadow: 'inset 0 0 58px rgba(0,0,0,0.98), inset 0 0 14px rgba(124,58,237,0.18)',
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(circle at 50% 60%, rgba(124,58,237,0.12) 0%, transparent 62%)' }}/>
                    <div className="absolute top-0 left-1/4 right-1/4 pointer-events-none"
                      style={{ height: '35%', background: 'radial-gradient(ellipse, rgba(0,229,255,0.025) 0%, transparent 80%)', filter: 'blur(4px)' }}/>
                    <div className="absolute inset-x-[6%] inset-y-[16%] pointer-events-none z-[8] rounded-full"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(2,2,8,0.93) 0%, rgba(2,2,8,0.58) 58%, transparent 88%)' }}/>

                    <span className="relative z-10 font-black text-white leading-none"
                      style={{
                        fontSize: 'clamp(7px,1.75vw,14.8px)', letterSpacing: '0.22em', fontFamily: 'Georgia,serif',
                        WebkitTextStroke: '0.35px rgba(255,255,255,0.92)',
                        paintOrder: 'stroke fill',
                        textShadow: '0 1px 3px rgba(0,0,0,0.98), 0 0 2px rgba(0,229,255,0.15)',
                      }}>CHROME</span>
                    <span className="relative z-10 font-black leading-tight hub-afrofusion-title"
                      style={{
                        fontSize: 'clamp(8.8px,2.2vw,18.5px)', letterSpacing: '0.1em',
                        background: 'linear-gradient(90deg,#FFF8D6,#D4AF37,#FFDF00,#D4AF37,#AA771C)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.94)) drop-shadow(0 0 7px rgba(255,215,0,0.48))',
                      }}>AFROFUSION</span>
                    <span className="relative z-10 font-black text-white leading-none"
                      style={{ fontSize: 'clamp(5.5px,1.32vw,10.5px)', letterSpacing: '0.35em', textShadow: '0 1px 2px rgba(0,0,0,0.95)' }}>— RADIO —</span>
                    <span className="relative z-10 font-bold text-[#00E5FF] leading-none"
                      style={{ fontSize: 'clamp(5px,1.05vw,8.2px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.92)) drop-shadow(0 0 2px rgba(0,229,255,0.28))' }}>POWERED BY</span>
                    <span className="relative z-10 font-bold text-white leading-none"
                      style={{ fontSize: 'clamp(5px,1.1vw,9.3px)', letterSpacing: '0.2em', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.94)) drop-shadow(0 0 3px rgba(0,229,255,0.28))' }}>MUSIC INTEL</span>
                  </div>
                </div>
              </button>
            </div>

            {/* AI Energy Core Equalizer — physically mounted inside the shared board rails */}
            <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-auto px-3 sm:px-6 py-2 rounded-xl"
              style={{
                ...coreBoxStyle(),
                animation: 'eqCoreContainerPulse 3.5s ease-in-out infinite',
              }}>
              <div className="flex h-[58%] items-end justify-center gap-[3.8px] sm:gap-[7.2px]">
                {[
                  ['#00E5FF', '80%',  'eqSine1 2.1s ease-in-out 0.75s infinite'],
                  ['#00C4FF', '90%',  'eqSine4 2.0s ease-in-out 0.55s infinite'],
                  ['#0099FF', '85%',  'eqSine3 1.9s ease-in-out 0.35s infinite'],
                  ['#3b82f6', '95%',  'eqSine2 1.8s ease-in-out 0.15s infinite'],
                  ['#6366f1', '100%', 'eqSine1 1.6s ease-in-out 0.0s infinite'],
                  ['#8b5cf6', '95%',  'eqSine4 1.75s ease-in-out 0.20s infinite'],
                  ['#a855f7', '85%',  'eqSine2 1.85s ease-in-out 0.40s infinite'],
                  ['#d946ef', '90%',  'eqSine3 1.95s ease-in-out 0.60s infinite'],
                  ['#ff007f', '80%',  'eqSine4 2.15s ease-in-out 0.80s infinite'],
                ].map(([color, height, anim], i) => (
                  <div key={i} className="rounded-full origin-bottom transition-all"
                    style={{
                      width: 'clamp(3.2px,0.75vw,6.1px)',
                      height,
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}, 0 0 24px ${color}, 0 0 36px ${color}`,
                      animation: anim,
                      willChange: 'transform',
                    }}/>
                ))}
              </div>
              <div className="mt-1 text-center leading-none">
                <div className="font-black uppercase text-[#00E5FF]"
                  style={{ fontSize: 'clamp(4.5px,0.95vw,7.5px)', letterSpacing: '0.18em', textShadow: '0 0 8px rgba(0,229,255,0.75)' }}>
                  AI ENERGY CORE
                </div>
                <div className="mt-0.5 font-bold uppercase text-white/55"
                  style={{ fontSize: 'clamp(3.5px,0.75vw,6px)', letterSpacing: '0.14em' }}>
                  INTELLIGENT AUDIO POWER ENGINE
                </div>
              </div>
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
              type="button"
              onClick={openGateway}
              aria-label="Choose your streaming platform"
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
          <div className="text-center mt-4 mb-3">
            <p className="font-black tracking-[0.25em] uppercase leading-snug"
              style={{ fontSize:'clamp(10px,2vw,14px)', fontWeight: 900 }}>
              <span style={{ color:'#E8C547', textShadow:'0 1px 3px rgba(0,0,0,0.92), 0 0 16px rgba(212,175,55,0.75)' }}>AFRICA&apos;S MUSIC.</span>{' '}
              <span style={{ color:'#9d6ef7', textShadow:'0 1px 3px rgba(0,0,0,0.92), 0 0 16px rgba(124,58,237,0.8)' }}>POWERED BY INTELLIGENCE.</span>
            </p>
          </div>

          {/* ── AMD MUSIC INTELLIGENCE FEATURE GRID (Platform Capabilities) ── */}
          <div className="mx-auto mt-4 max-w-4xl border-b border-white/[0.06] pb-6 sm:pb-7">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 auto-rows-fr items-stretch">
            {FEATURE_CARDS.map(({ icon, color, title, sub, href }, index) => {
              const placement =
                index === 3 ? 'md:col-start-2 md:col-span-2' :
                index === 4 ? 'col-span-2 flex justify-center md:col-start-4 md:col-span-2 md:block' :
                'md:col-span-2';
              const card = (
                <Link
                  href={href}
                  aria-label={`${title} — ${sub}`}
                  className="group flex h-full min-h-[64px] md:min-h-[72px] w-full items-start gap-3 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]"
                  style={{
                    padding: 'clamp(13px,2.1vw,17px)',
                    background: 'rgba(5,5,18,0.92)', backdropFilter:'blur(28px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.82), 0 0 20px rgba(124,58,237,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${color}66`;
                    e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.88), 0 0 28px ${color}33`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.82), 0 0 20px rgba(124,58,237,0.08)';
                  }}
                >
                  <span className="flex h-[clamp(16px,2.5vw,20px)] w-[clamp(16px,2.5vw,20px)] flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 mt-0.5"
                    style={{ color, fontSize:'clamp(16px,2.5vw,20px)', filter:`drop-shadow(0 0 9px ${color})` }}>{icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black uppercase text-gray-50 leading-tight"
                      style={{ fontSize:'clamp(8px,1.45vw,11.5px)', letterSpacing:'0.07em', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.85)' }}>{title}</h4>
                    <p className="text-gray-300/95 leading-relaxed mt-1.5"
                      style={{ fontSize:'clamp(8px,1.2vw,10.5px)', lineHeight: 1.5 }}>{sub}</p>
                  </div>
                </Link>
              );
              return (
                <div key={title} className={`${placement} h-full`}>
                  {index === 4 ? (
                    <div className="w-[calc(50%-6px)] md:w-full h-full">{card}</div>
                  ) : card}
                </div>
              );
            })}
            </div>
          </div>

          {/* ── OFFICIAL BRAND POSITIONING ── */}
          <div className="text-center mt-7 sm:mt-9 px-2">
            <p className="font-black uppercase tracking-[0.22em] sm:tracking-[0.28em] leading-snug"
              style={{
                fontSize: 'clamp(11px,2.25vw,15.5px)',
                fontWeight: 900,
                background: 'linear-gradient(90deg,#00E5FF,#9d6ef7,#E8C547,#00E5FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.88)) drop-shadow(0 0 16px rgba(0,229,255,0.35))',
              }}>
              ONE SYSTEM. ONE INTELLIGENCE. EVERY PLATFORM CONNECTED.
            </p>
          </div>

          {/* ── CUSTOMER JOURNEY TIMELINE ── */}
          <div className="mt-7 sm:mt-9 pb-20">
            <p className="text-center mb-6 sm:mb-8 font-black uppercase tracking-[0.26em] text-[#00E5FF]/70"
              style={{ fontSize: 'clamp(10px,1.6vw,11px)', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.85)' }}>
              How It Works
            </p>
            <div className="mx-auto max-w-5xl px-1">
              {/* Desktop / tablet — connected horizontal journey */}
              <div className="relative hidden md:block">
                <div className="pointer-events-none absolute top-[18px] left-[4%] right-[4%] h-px bg-gradient-to-r from-transparent via-[#00E5FF]/45 to-transparent" />
                <div className="flex items-start justify-evenly gap-3 lg:gap-4">
                  {WORKFLOW_STAGES.map((stage, index) => {
                    const node = (
                      <>
                        <span className="mx-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#00E5FF]/35 bg-[#050512]/95 text-base"
                          style={{ boxShadow: '0 0 14px rgba(0,229,255,0.22)' }}>
                          {stage.icon}
                        </span>
                        <h4 className="mt-3 font-black uppercase text-[#00E5FF] tracking-[0.12em] leading-tight"
                          style={{ fontSize: 'clamp(9px,1.25vw,11.5px)', fontWeight: 900 }}>{stage.title}</h4>
                        <p className="mt-2 text-gray-200/90 leading-relaxed px-0.5"
                          style={{ fontSize: 'clamp(8px,1.05vw,10.5px)', lineHeight: 1.5 }}>{stage.desc}</p>
                      </>
                    );
                    const nodeClass = 'group flex-1 min-w-0 max-w-[148px] flex flex-col items-center text-center px-1.5 py-2.5 transition-all duration-200 hover:opacity-100 opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]';
                    return (
                      <React.Fragment key={stage.title}>
                        {stage.action === 'gateway' ? (
                          <button type="button" onClick={openGateway} aria-label={`${stage.title} — ${stage.desc}`} className={nodeClass}>
                            {node}
                          </button>
                        ) : (
                          <Link href={stage.href!} aria-label={`${stage.title} — ${stage.desc}`} className={nodeClass}>
                            {node}
                          </Link>
                        )}
                        {index < WORKFLOW_STAGES.length - 1 && (
                          <span className="flex-shrink-0 pt-[13px] text-[#00E5FF]/55 select-none px-0.5" style={{ fontSize: '12px' }} aria-hidden="true">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Mobile — premium vertical journey timeline */}
              <div className="md:hidden relative">
                <div className="pointer-events-none absolute left-[21px] top-5 bottom-5 w-px bg-gradient-to-b from-[#00E5FF]/45 via-[#7c3aed]/35 to-[#00E5FF]/45" aria-hidden="true" />
                <div className="flex flex-col">
                  {WORKFLOW_STAGES.map((stage, index) => {
                    const row = (
                      <div className="relative flex items-start gap-4 py-4">
                        <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#00E5FF]/40 bg-[#050512] text-lg"
                          style={{ boxShadow: '0 0 16px rgba(0,229,255,0.28)' }}>
                          {stage.icon}
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5 text-left">
                          <h4 className="font-black uppercase text-[#00E5FF] tracking-[0.1em] leading-tight"
                            style={{ fontSize: 'clamp(12px,3.2vw,15px)', fontWeight: 900 }}>{stage.title}</h4>
                          <p className="mt-2 text-gray-200 leading-relaxed"
                            style={{ fontSize: 'clamp(11px,2.8vw,13px)', lineHeight: 1.52 }}>{stage.desc}</p>
                        </div>
                      </div>
                    );
                    const rowClass = 'w-full text-left transition-opacity duration-200 hover:opacity-100 opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF] rounded-lg';
                    return (
                      <React.Fragment key={stage.title}>
                        {stage.action === 'gateway' ? (
                          <button type="button" onClick={openGateway} aria-label={`${stage.title} — ${stage.desc}`} className={rowClass}>
                            {row}
                          </button>
                        ) : (
                          <Link href={stage.href!} aria-label={`${stage.title} — ${stage.desc}`} className={rowClass}>
                            {row}
                          </Link>
                        )}
                        {index < WORKFLOW_STAGES.length - 1 && (
                          <div className="flex items-center pl-[18px] py-1.5" aria-hidden="true">
                            <span className="text-[#00E5FF]/60 font-bold" style={{ fontSize: '13px' }}>↓</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREMIUM STREAMING PLATFORM GATEWAY ── */}
      {gatewayOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close platform gateway"
            className="absolute inset-0 border-0 bg-[#05050e]/78 backdrop-blur-md cursor-pointer animate-[gatewayFadeIn_0.28s_ease-out]"
            onClick={closeGateway}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gateway-title"
            className="relative z-[201] w-full max-h-[88vh] overflow-y-auto rounded-t-[28px] border border-[#00E5FF]/25 bg-[rgba(5,5,18,0.94)] shadow-[0_0_48px_rgba(0,229,255,0.22),0_0_80px_rgba(124,58,237,0.28),inset_0_0_0_1px_rgba(124,58,237,0.18)] backdrop-blur-2xl animate-[gatewaySheetUp_0.34s_cubic-bezier(0.22,1,0.36,1)] sm:max-w-[480px] sm:rounded-2xl sm:animate-[gatewayModalIn_0.3s_ease-out]"
            style={{ padding: 'clamp(18px,4vw,28px) clamp(16px,3.5vw,24px) calc(18px + env(safe-area-inset-bottom))' }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/70 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
              <div>
                <h2 id="gateway-title" className="font-black uppercase tracking-[0.12em] text-white"
                  style={{ fontSize: 'clamp(16px,3.2vw,22px)', textShadow: '0 0 18px rgba(0,229,255,0.35)' }}>
                  Choose Your Streaming Platform
                </h2>
                <p className="mt-1 font-bold uppercase tracking-[0.22em] text-[#00E5FF]/85"
                  style={{ fontSize: 'clamp(9px,1.6vw,11px)' }}>
                  One Link. Every Platform.
                </p>
              </div>
              <button
                type="button"
                onClick={closeGateway}
                aria-label="Close"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#7c3aed]/50 bg-[#050512]/90 text-[#00E5FF] transition hover:border-[#00E5FF] hover:shadow-[0_0_16px_rgba(0,229,255,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {GATEWAY_PLATFORMS.map((k) => {
                const isReady = ready(k);
                const label = PLATFORM_LABELS[k] ?? k;
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!isReady}
                    onClick={() => selectPlatform(k)}
                    aria-label={isReady ? `Listen on ${label}` : `${label} coming soon`}
                    className={[
                      'flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-300',
                      isReady
                        ? 'cursor-pointer border-[#7c3aed]/70 bg-[#050512]/88 shadow-[0_0_18px_rgba(124,58,237,0.28),inset_0_0_12px_rgba(0,0,0,0.75)] hover:border-[#00E5FF] hover:shadow-[0_0_28px_rgba(0,229,255,0.45)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00E5FF]'
                        : 'cursor-not-allowed border-[#7c3aed]/35 bg-[#050512]/65 opacity-80',
                    ].join(' ')}
                  >
                    <BrandIcon id={k} size={24}/>
                    <span className="font-bold leading-tight text-white/95"
                      style={{ fontSize: 'clamp(10px,1.8vw,12.5px)' }}>{label}</span>
                    {isReady
                      ? <span className="h-1.5 w-1.5 rounded-full bg-[#ff003c] shadow-[0_0_8px_#ff003c,0_0_14px_#ff003c] animate-pulse"/>
                      : <span className="rounded-full border border-[#00E5FF]/45 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.25)]">Coming Soon</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
        @media (min-width: 768px) {
          .hub-afrofusion-title {
            display: block;
            width: 100%;
            max-width: 92%;
            margin-inline: auto;
            text-align: center;
            font-size: clamp(8.8px, 2.2vw, 17.75px) !important;
            letter-spacing: 0.075em !important;
            padding-inline: 2px;
          }
        }
        @keyframes hubAura {
          0%,100% { opacity: 0.62; transform: scale(1); }
          50%      { opacity: 0.82; transform: scale(1.03); }
        }
        @keyframes hubPulse {
          0%,100% { box-shadow: 0 0 42px rgba(0,229,255,0.52), 0 0 78px rgba(124,58,237,0.34), 0 0 118px rgba(0,229,255,0.12); }
          50%      { box-shadow: 0 0 58px rgba(0,229,255,0.68), 0 0 98px rgba(124,58,237,0.48), 0 0 148px rgba(0,229,255,0.2); }
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 22px rgba(0,229,255,0.18); opacity: 0.62; }
          50%      { box-shadow: 0 0 36px rgba(0,229,255,0.32); opacity: 0.88; }
        }
        @keyframes eqCoreContainerPulse {
          0%, 100% {
            background: radial-gradient(ellipse at center, rgba(124,58,237,0.35) 0%, rgba(0,229,255,0.20) 45%, transparent 80%);
            box-shadow: 0 0 25px rgba(0,229,255,0.25), 0 0 45px rgba(124,58,237,0.20);
            border: 1px solid rgba(0,229,255,0.18);
          }
          50% {
            background: radial-gradient(ellipse at center, rgba(124,58,237,0.55) 0%, rgba(0,229,255,0.38) 55%, transparent 85%);
            box-shadow: 0 0 45px rgba(0,229,255,0.55), 0 0 75px rgba(124,58,237,0.45);
            border: 1px solid rgba(0,229,255,0.40);
          }
        }
        @keyframes eqSine1 {
          0%, 100% { transform: scaleY(0.35); opacity: 0.70; }
          30%      { transform: scaleY(0.95); opacity: 1.00; }
          65%      { transform: scaleY(0.55); opacity: 0.85; }
        }
        @keyframes eqSine2 {
          0%, 100% { transform: scaleY(0.60); opacity: 0.85; }
          40%      { transform: scaleY(0.28); opacity: 0.65; }
          75%      { transform: scaleY(1.00); opacity: 1.00; }
        }
        @keyframes eqSine3 {
          0%, 100% { transform: scaleY(0.85); opacity: 0.95; }
          35%      { transform: scaleY(0.40); opacity: 0.75; }
          70%      { transform: scaleY(0.90); opacity: 1.00; }
        }
        @keyframes eqSine4 {
          0%, 100% { transform: scaleY(0.50); opacity: 0.80; }
          25%      { transform: scaleY(0.88); opacity: 0.95; }
          60%      { transform: scaleY(0.32); opacity: 0.70; }
          85%      { transform: scaleY(0.78); opacity: 0.90; }
        }
        ${[0,1,2,3,4,5].map(i=>`
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
        @keyframes gatewayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gatewaySheetUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gatewayModalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
