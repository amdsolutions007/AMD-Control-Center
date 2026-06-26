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

  // Official Brand Brand SVGs & Identifiers for all 10 Platforms
  const renderBrandIcon = (key: string) => {
    switch (key) {
      case 'spotify':
        return (
          <svg className="w-6 h-6 text-[#1ED760] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      case 'apple_music':
        return (
          <svg className="w-6 h-6 text-[#FA243C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.707 3.535A1.002 1.002 0 0017.84 3H7.16a1 1 0 00-.972.768l-2.062 8.618C3.606 14.567 5.234 17 7.498 17h9.004c2.264 0 3.892-2.433 3.372-4.614l-2.062-8.618a1.006 1.006 0 00-.105-.233zM9.5 13.5A1.5 1.5 0 1111 12a1.502 1.502 0 01-1.5 1.5zm5 0A1.5 1.5 0 1116 12a1.502 1.502 0 01-1.5 1.5z"/>
          </svg>
        );
      case 'audiomack':
        return (
          <svg className="w-6 h-6 text-[#FFA200] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5h-2.25v-4.125c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125 1.125V16.5H9.75v-4.125c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125 1.125V16.5H5.25V9h2.25v1.875c.483-.699 1.284-1.125 2.25-1.125 1.149 0 2.115.75 2.475 1.8.36-1.05 1.326-1.8 2.475-1.8.966 0 1.767.426 2.25 1.125V9h2.25v7.5z"/>
          </svg>
        );
      case 'boomplay':
        return (
          <svg className="w-6 h-6 text-[#00B4FF] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm3.89 15.35c-1.33 1.14-3.52 1.15-4.88-.04l-3.32 2.82c2.61 2.43 7.02 2.41 9.68-.02l-1.48-2.76zm1.88-3.41a6.85 6.85 0 01-2.21 4.79l1.49 2.76a10.027 10.027 0 003.22-7.07l-2.5-.48zM12 6.5a5.5 5.5 0 105.5 5.5A5.506 5.506 0 0012 6.5z"/>
          </svg>
        );
      case 'soundcloud':
        return (
          <svg className="w-6 h-6 text-[#FF5500] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.175 12.225c-.051 0-.094.045-.101.096l-.168 1.882c-.007.062.031.119.092.138l.177.051c.051 0 .094-.045.101-.096l.168-1.882c.007-.062-.031-.119-.092-.138l-.177-.051zm2.148-.521c-.062 0-.119.043-.131.104l-.408 2.301c-.012.068.035.131.103.144l.215.039c.062 0 .119-.043.131-.104l.408-2.301c.012-.068-.035-.131-.103-.144l-.215-.039zm2.348-.92c-.074 0-.139.052-.151.125l-.75 3.328c-.014.075.039.146.114.159l.26.046c.074 0 .139-.052.151-.125l.75-3.328c.014-.075-.039-.146-.114-.159l-.26-.046zm2.592-1.328c-.085 0-.159.062-.172.146l-1.123 4.604c-.016.084.044.164.128.179l.311.054c.085 0 .159-.062.172-.146l1.123-4.604c.016-.084-.044-.164-.128-.179l-.311-.054zm2.846-1.344c-.098 0-.181.071-.194.168l-1.465 5.861c-.018.094.051.184.145.2l.363.062c.098 0 .181-.071.194-.168l1.465-5.861c.018-.094-.051-.184-.145-.2l-.363-.062zm11.477 4.197c-.604-1.346-1.954-2.285-3.52-2.307-.15-.002-.3.008-.448.031-.502-2.455-2.673-4.336-5.3-4.336-.312 0-.62.027-.923.078l-1.07 7.746c-.01.074.043.141.118.153l10.435 1.76c1.602-.676 2.452-2.435 1.848-4.125z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-6 h-6 text-[#00f2fe] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      case 'youtube_music':
        return (
          <svg className="w-6 h-6 text-[#FF0000] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2c-3.972 0-7.2-3.228-7.2-7.2S8.028 4.8 12 4.8s7.2 3.228 7.2 7.2-3.228 7.2-7.2 7.2zm-2.4-10.8v7.2l6.4-3.6-6.4-3.6z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-6 h-6 text-[#E1306C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        );
      case 'amazon_music':
        return (
          <svg className="w-6 h-6 text-[#00A8E1] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.953 14.168c-.375-.386-1.018-.403-1.423-.035-.386.353-.404.978-.04 1.366 1.637 1.745 3.931 2.766 6.435 2.766 2.316 0 4.453-.902 6.037-2.456.38-.372.385-.998.013-1.378-.372-.38-1.002-.386-1.382-.014-1.229 1.203-2.882 1.905-4.668 1.905-1.928 0-3.693-.78-5.01-2.181l.038-.027zm10.015 3.864c-.16-.24-.515-.302-.756-.142-.24.16-.301.516-.141.756.634.952 1.464 1.758 2.451 2.37.234.145.545.073.69-.161.145-.235.073-.546-.161-.69-.844-.523-1.554-1.213-2.083-2.008v-.125zM12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9z"/>
          </svg>
        );
      case 'deezer':
        return (
          <svg className="w-6 h-6 text-[#EF5466] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.44 14.71h3.45v3.45h-3.45v-3.45zm0-4.56h3.45v3.45h-3.45v-3.45zm0-4.56h3.45v3.45h-3.45V5.59zm-4.56 9.12h3.45v3.45h-3.45v-3.45zm0-4.56h3.45v3.45h-3.45v-3.45zm-4.56 4.56h3.45v3.45H9.32v-3.45zm0 4.56h3.45v3.45H9.32v-3.45zm-4.56 0h3.45v3.45H4.76v-3.45zm0-4.56h3.45v3.45H4.76v-3.45z"/>
          </svg>
        );
      default:
        return <span className="text-xl">♫</span>;
    }
  };

  // Ten streaming platform positions strictly matching approved Friday campaign artwork
  const leftPlatforms = [
    { key: 'spotify', name: 'Spotify' },
    { key: 'apple_music', name: 'Apple Music' },
    { key: 'audiomack', name: 'Audiomack' },
    { key: 'boomplay', name: 'Boomplay' },
    { key: 'soundcloud', name: 'SoundCloud' }
  ];

  const rightPlatforms = [
    { key: 'tiktok', name: 'TikTok' },
    { key: 'youtube_music', name: 'YouTube Music' },
    { key: 'instagram', name: 'Instagram' },
    { key: 'amazon_music', name: 'Amazon Music' },
    { key: 'deezer', name: 'Deezer' }
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

  const renderLeftButton = (item: { key: string; name: string }) => {
    const ready = isPlatformReady(item.key);
    const url = getPlatformUrl(item.key);

    return (
      <div key={item.key} className="flex items-center w-full justify-center md:justify-start group">
        {ready ? (
          <button
            onClick={() => handleDspClick(item.key, url)}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#8a2be2] hover:border-[#00E5FF] rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_25px_rgba(138,43,226,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.75)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10 shrink-0 font-sans"
            aria-label={`Listen on ${item.name}`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              {renderBrandIcon(item.key)}
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate">{item.name}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_12px_#ff003c] animate-pulse shrink-0" />
          </button>
        ) : (
          <button
            disabled={true}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 border-[1.5px] border-[#7c3aed]/60 rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_20px_rgba(138,43,226,0.25)] cursor-not-allowed select-none z-10 shrink-0 font-sans opacity-90"
            aria-label={`${item.name} coming soon`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <div className="opacity-80">{renderBrandIcon(item.key)}</div>
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-gray-200 truncate">{item.name}</span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/10 border border-white/20 text-cyan-200 px-2.5 py-1 rounded-md shrink-0">
              COMING SOON
            </span>
          </button>
        )}

        {/* Desktop/Tablet Circuit Energy Line (flowing outward from Center Hub to Left Platform) */}
        <div className="hidden md:block h-[2.5px] w-8 lg:w-16 xl:w-24 bg-gradient-to-l from-[#00E5FF] via-[#3b82f6] to-[#8a2be2] shadow-[0_0_14px_#00E5FF,0_0_22px_#8a2be2] relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[pulse_1.5s_ease-in-out_infinite]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_15px_#00E5FF]" />
        </div>
      </div>
    );
  };

  const renderRightButton = (item: { key: string; name: string }) => {
    const ready = isPlatformReady(item.key);
    const url = getPlatformUrl(item.key);

    return (
      <div key={item.key} className="flex items-center w-full justify-center md:justify-end group">
        {/* Desktop/Tablet Circuit Energy Line (flowing outward from Center Hub to Right Platform) */}
        <div className="hidden md:block h-[2.5px] w-8 lg:w-16 xl:w-24 bg-gradient-to-r from-[#00E5FF] via-[#3b82f6] to-[#8a2be2] shadow-[0_0_14px_#00E5FF,0_0_22px_#8a2be2] relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[pulse_1.5s_ease-in-out_infinite]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_15px_#00E5FF]" />
        </div>

        {ready ? (
          <button
            onClick={() => handleDspClick(item.key, url)}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 hover:bg-[#12122e] border-[1.5px] border-[#8a2be2] hover:border-[#00E5FF] rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_25px_rgba(138,43,226,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.75)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer z-10 shrink-0 font-sans"
            aria-label={`Listen on ${item.name}`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              {renderBrandIcon(item.key)}
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#00E5FF] transition-colors truncate">{item.name}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] shadow-[0_0_12px_#ff003c] animate-pulse shrink-0" />
          </button>
        ) : (
          <button
            disabled={true}
            className="w-full max-w-[340px] md:max-w-none bg-[#080818]/95 border-[1.5px] border-[#7c3aed]/60 rounded-full py-3 sm:py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-[0_0_20px_rgba(138,43,226,0.25)] cursor-not-allowed select-none z-10 shrink-0 font-sans opacity-90"
            aria-label={`${item.name} coming soon`}
          >
            <div className="flex items-center gap-3.5 truncate pr-2">
              <div className="opacity-80">{renderBrandIcon(item.key)}</div>
              <span className="text-sm sm:text-base font-extrabold tracking-wide text-gray-200 truncate">{item.name}</span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/10 border border-white/20 text-cyan-200 px-2.5 py-1 rounded-md shrink-0">
              COMING SOON
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative z-10 max-w-6xl mx-auto px-2 sm:px-4 pb-24 font-sans">
      {/* COMPOSITION 1: Master Hero Poster Framing (renders Top Badge, Artists, DISCOVER AFRICA'S BIGGEST HITS, and ONE LINK. EVERY PLATFORM. uncropped) */}
      <div className="w-full max-w-5xl mx-auto relative z-10 pt-2 sm:pt-4 overflow-hidden select-none aspect-[10/7] sm:aspect-[143/100] md:aspect-[145/100] flex items-start justify-center">
        <img
          src={heroArtworkUrl}
          alt="Chrome AfroFusion Radio - Discover Africa's Biggest Hits - One Link Every Platform"
          className="w-full h-auto object-cover object-top filter drop-shadow-[0_12px_40px_rgba(0,0,0,0.95)]"
        />
        {/* Dark seamless blending mask so HTML interactive platforms emerge naturally from ONE LINK. EVERY PLATFORM. */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-44 md:h-52 bg-gradient-to-t from-[#05050e] via-[#05050e]/90 to-transparent pointer-events-none z-10" />
      </div>

      {/* COMPOSITION 2: Interactive Flanking Streaming Ecosystem & Center Hub Core */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 md:gap-0 z-20 -mt-14 sm:-mt-22 md:-mt-28 relative px-2 sm:px-4">
        {/* Left Column Interactive Platforms (5) */}
        <div className="flex flex-col gap-3 sm:gap-3.5 order-2 md:order-1 w-full max-w-sm mx-auto md:max-w-none">
          {leftPlatforms.map(item => renderLeftButton(item))}
        </div>

        {/* Center Chrome AfroFusion Hub Ring (calibrated 6% smaller to preserve hero proportions) & Waveform Equalizer */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2 my-2 md:my-0 relative shrink-0 px-2 md:px-0">
          {/* Neon Energy Core Ring */}
          <div className="relative w-60 h-60 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-full p-[3.5px] bg-gradient-to-tr from-[#00E5FF] via-[#3b82f6] via-[#8a2be2] to-[#00E5FF] shadow-[0_0_95px_rgba(0,229,255,0.8),0_0_145px_rgba(138,43,226,0.55),inset_0_0_45px_rgba(0,229,255,0.65)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-full bg-[#050512] flex flex-col items-center justify-center text-center p-5 border-[2.5px] border-[#00E5FF]/65 relative overflow-hidden shadow-[inset_0_0_65px_rgba(0,0,0,0.95)]">
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

        {/* Right Column Interactive Platforms (5) */}
        <div className="flex flex-col gap-3 sm:gap-3.5 order-3 w-full max-w-sm mx-auto md:max-w-none">
          {rightPlatforms.map(item => renderRightButton(item))}
        </div>
      </div>

      {/* COMPOSITION 3: Campaign Statistics Bar */}
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

      {/* COMPOSITION 4: Giant Metallic Gold Conversion Strike Button */}
      <div className="w-full max-w-xl mx-auto z-20 my-3 sm:my-4 px-4">
        <button
          onClick={() => handleDspClick('spotify', dspLinks.spotify || dspLinks.apple_music)}
          className="w-full block bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] via-[#B38728] via-[#FBF5B7] to-[#AA771C] hover:from-[#FCF6BA] hover:to-[#BF953F] text-black font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.18em] py-4 sm:py-5 md:py-6 rounded-full shadow-[0_0_60px_rgba(255,215,0,0.8)] hover:shadow-[0_0_85px_rgba(255,215,0,1)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 uppercase border-[2.5px] border-[#FFF8D6] cursor-pointer group"
        >
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] font-serif">LISTEN NOW</span>
          <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black text-[#FFD700] flex items-center justify-center text-xl sm:text-2xl md:text-3xl group-hover:scale-110 transition-transform shadow-inner shrink-0">▸</span>
        </button>
      </div>

      {/* COMPOSITION 5: Acoustic Master Audio Preview Bar (secondary feature integrated naturally below CTA without breaking poster flow) */}
      {audioPreviewUrl && (
        <div className="w-full max-w-md mx-auto mt-3 mb-6 px-4 z-20">
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

      {/* COMPOSITION 6: Bottom 5 Value Pillars Futuristic Strip */}
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

      {/* Floating Sticky WhatsApp Community Gate */}
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
