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
}

const PLATFORM_CONFIG: { [key: string]: { name: string; color: string; bgHover: string; icon: string } } = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    bgHover: 'rgba(29, 185, 84, 0.15)',
    icon: '🎵'
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',
    bgHover: 'rgba(250, 36, 60, 0.15)',
    icon: '🍎'
  },
  audiomack: {
    name: 'Audiomack',
    color: '#FFA200',
    bgHover: 'rgba(255, 162, 0, 0.15)',
    icon: '🔥'
  },
  boomplay: {
    name: 'Boomplay',
    color: '#00E5FF',
    bgHover: 'rgba(0, 229, 255, 0.15)',
    icon: '💥'
  },
  youtube_music: {
    name: 'YouTube Music',
    color: '#FF0000',
    bgHover: 'rgba(255, 0, 0, 0.15)',
    icon: '▶️'
  },
  youtube: {
    name: 'YouTube Video',
    color: '#FF0000',
    bgHover: 'rgba(255, 0, 0, 0.15)',
    icon: '📺'
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    bgHover: 'rgba(255, 85, 0, 0.15)',
    icon: '☁️'
  },
  deezer: {
    name: 'Deezer',
    color: '#A238FF',
    bgHover: 'rgba(162, 56, 255, 0.15)',
    icon: '🎚️'
  },
  amazon_music: {
    name: 'Amazon Music',
    color: '#00A8E1',
    bgHover: 'rgba(0, 168, 225, 0.15)',
    icon: '🛒'
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
  whatsappJoinUrl
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

  const handleDspClick = (dspKey: string, url: string) => {
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

    dispatchTelemetry('internal', audioPreviewUrl);
    audio.play();
    setIsPlaying(true);
  };

  // Rank platforms order: spotify, apple_music, audiomack, boomplay, youtube_music, youtube, soundcloud, deezer, amazon_music
  const orderedKeys = ['spotify', 'apple_music', 'audiomack', 'boomplay', 'youtube_music', 'youtube', 'soundcloud', 'deezer', 'amazon_music'];
  const availableKeys = orderedKeys.filter(key => dspLinks && dspLinks[key]);

  const topThree = availableKeys.slice(0, 3);
  const remaining = availableKeys.slice(3);

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-6">
      {/* 30-Second Acoustic Preview Stream Banner */}
      {audioPreviewUrl && (
        <button
          onClick={toggleAudioPreview}
          className={`w-full max-w-md py-3 px-6 rounded-2xl flex items-center justify-between border transition-all duration-300 shadow-lg ${
            isPlaying
              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 text-amber-300 scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
          }`}
          aria-label="Play 30 second acoustic preview"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">{isPlaying ? '🔊' : '🎧'}</span>
            <div className="text-left">
              <p className="text-sm font-semibold tracking-wide">{isPlaying ? 'Playing VaB Preview...' : 'Preview 30s Master Audio'}</p>
              <p className="text-xs text-gray-400">Afrofusion Flagship Cut</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-amber-400 border border-amber-400/30">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </span>
        </button>
      )}

      {/* Top 3 High-Intent Conversion Strike Action Buttons */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-left pl-1">Primary Destinations</p>
        {topThree.map(key => {
          const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#C0C0C0', bgHover: 'rgba(255,255,255,0.1)', icon: '🔗' };
          const url = dspLinks[key];
          return (
            <button
              key={key}
              onClick={() => handleDspClick(key, url)}
              className="group w-full py-4 px-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/30 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-xl"
              style={{ '--hover-bg': cfg.bgHover } as any}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{cfg.icon}</span>
                <span className="text-base font-bold text-white group-hover:text-gray-100">{cfg.name}</span>
              </div>
              <span
                className="text-xs font-extrabold px-4 py-2 rounded-xl transition-all duration-300 bg-white/10 text-white group-hover:bg-white group-hover:text-black shadow-md"
              >
                STREAM NOW
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary DSP Platform Grid */}
      {remaining.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-3 mt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-left pl-1">More Platforms</p>
          <div className="grid grid-cols-2 gap-3">
            {remaining.map(key => {
              const cfg = PLATFORM_CONFIG[key] || { name: key, color: '#C0C0C0', bgHover: 'rgba(255,255,255,0.1)', icon: '🔗' };
              const url = dspLinks[key];
              return (
                <button
                  key={key}
                  onClick={() => handleDspClick(key, url)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center gap-3 transition-all duration-200 text-left"
                >
                  <span className="text-xl">{cfg.icon}</span>
                  <span className="text-xs font-semibold text-gray-300 truncate">{cfg.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Floating VIP WhatsApp Community Fan Acquisition Gate */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-bounce">
        <button
          onClick={() => handleDspClick('other', whatsappJoinUrl || 'https://chat.whatsapp.com/vab_vip_community')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold flex items-center justify-between shadow-2xl border border-emerald-400/40 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="text-left">
              <p className="text-sm font-black tracking-tight leading-none">Join VaB VIP WhatsApp Community</p>
              <p className="text-[10px] font-medium text-emerald-100 mt-0.5">Weekly unreleased cuts & exclusive voice notes</p>
            </div>
          </div>
          <span className="text-xs bg-black/30 px-3 py-1.5 rounded-xl uppercase font-black tracking-wider">JOIN</span>
        </button>
      </div>
    </div>
  );
}
