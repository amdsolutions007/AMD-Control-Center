import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SmartLinkActionButtons from '@/components/smartlink/SmartLinkActionButtons';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjoijeligrgttimkqftk.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Revalidate page data every 60 seconds at edge
export const revalidate = 60;

interface PageProps {
  params: Promise<{ code: string }> | { code: string };
}

async function getSmartLinkData(code: string) {
  const { data, error } = await supabase
    .from('mi_smart_links')
    .select(`
      id,
      short_code,
      hub_id,
      artist_id,
      track_id,
      playlist_id,
      destination_type,
      og_title,
      og_description,
      og_image_url,
      cta_text,
      total_clicks,
      audience_gate,
      is_active,
      hub:mi_client_hubs(id, name, slug, description, logo_url, cover_url),
      artist:mi_artists(id, name, slug, bio, profile_image_url, cover_image_url, dsp_profile_links),
      playlist:mi_playlists(id, name, slug, description, cover_url),
      track:mi_tracks(id, title, duration_seconds, audio_url, dsp_links)
    `)
    .eq('short_code', code)
    .single();

  if (error || !data || !(data as any).is_active) {
    return null;
  }
  return data;
}

const getSingle = (obj: any) => (Array.isArray(obj) ? obj[0] : obj) || {};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const data = await getSmartLinkData(resolved.code);

  if (!data) {
    return {
      title: 'Campaign Not Found — AMD Music Intelligence',
      description: 'The requested streaming campaign link is inactive or unavailable.'
    };
  }

  const pl = getSingle(data.playlist);
  const art = getSingle(data.artist);
  const hb = getSingle(data.hub);

  const title = data.og_title || `${pl.name || 'AfroFusion Radio'} — Curated by ${art.name || 'VaB'}`;
  const desc = data.og_description || pl.description || 'Discover contemporary African popular music from Lagos to the world.';
  const image = data.og_image_url || pl.cover_url || '';

  return {
    title,
    description: desc,
    keywords: ['Chrome AfroFusion Radio', 'VaB', 'Chrome Music Hub', 'Afrobeats', 'Afrofusion', 'AMD Music Intelligence', 'Lagos music'],
    openGraph: {
      title,
      description: desc,
      url: `https://amdsolutions007.com/sl/${data.short_code}`,
      siteName: hb.name || 'Chrome Music Hub',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      type: 'music.playlist'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : [],
      creator: '@amdsolutions007'
    },
    alternates: {
      canonical: `https://amdsolutions007.com/chrome/${pl.slug || 'chrome-afrofusion-radio'}`
    }
  };
}

export default async function SmartLinkPage({ params }: PageProps) {
  const resolved = await params;
  const data = await getSmartLinkData(resolved.code);

  if (!data) {
    notFound();
  }

  const hub = getSingle(data.hub);
  const artist = getSingle(data.artist);
  const playlist = getSingle(data.playlist);
  const track = getSingle(data.track);

  // Master CDN Assets Lookups
  const amdLogoUrl = hub.logo_url || 'https://pjoijeligrgttimkqftk.supabase.co/storage/v1/object/public/mi-hub-assets/amd_music_intelligence_logo.webp';
  const amdBadgeUrl = hub.cover_url || artist.profile_image_url || 'https://pjoijeligrgttimkqftk.supabase.co/storage/v1/object/public/mi-hub-assets/amd_music_intelligence_badge.webp';
  const playlistCoverUrl = playlist.cover_url || track.cover_url || 'https://pjoijeligrgttimkqftk.supabase.co/storage/v1/object/public/mi-covers/chrome_afrofusion_radio_playlist_cover.webp';
  const heroArtworkUrl = data.og_image_url || artist.cover_image_url || 'https://pjoijeligrgttimkqftk.supabase.co/storage/v1/object/public/mi-covers/chrome_afrofusion_radio_smartlink_cover.webp';
  const audioPreviewUrl = track.audio_url || '';

  // Merge DSP links from track or artist
  const dspLinks = track.dsp_links || artist.dsp_profile_links || {};

  return (
    <main className="min-h-screen bg-[#121212] text-gray-100 flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden font-sans pb-24">
      {/* Dark Ambient Glassmorphism Hero Glow Canvas */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <img
          src={heroArtworkUrl}
          alt=""
          className="w-full h-full object-cover blur-[80px] scale-125 transform translate-y-[-10%]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/40 via-[#121212]/80 to-[#121212]" />
      </div>

      {/* Top Tenant Header & AMD Verified Ecosystem Branding Bar */}
      <header className="w-full max-w-4xl mx-auto z-10 flex items-center justify-between py-4 border-b border-white/10 backdrop-blur-md px-4 rounded-2xl bg-black/40 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={amdLogoUrl}
            alt="AMD Music Intelligence"
            className="h-8 w-auto object-contain drop-shadow"
          />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 border-l border-white/15 pl-3">
            {hub?.name || 'Chrome Music'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
          <img
            src={amdBadgeUrl}
            alt="Verified 24K Gold"
            className="h-4 w-4 object-contain"
          />
          <span className="text-[11px] font-black tracking-wider text-amber-400 uppercase">Verified Gold</span>
        </div>
      </header>

      {/* Main Campaign Hero Viewport & Platform Routing Shell */}
      <section className="w-full max-w-4xl mx-auto z-10 flex flex-col md:flex-row items-center justify-center gap-8 my-8 md:my-12">
        {/* Left Column: Flagship Master Artwork Card */}
        <div className="w-full max-w-[340px] md:max-w-[400px] flex flex-col items-center relative">
          <div className="relative group w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl border border-white/20 bg-black/60 backdrop-blur-xl transition-transform duration-500 hover:scale-[1.01]">
            <img
              src={playlistCoverUrl}
              alt={playlist?.name || 'Chrome AfroFusion Radio'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            
            {/* Bottom Left Cover Badge Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-2xl shadow-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold text-white tracking-wide">FLAGSHIP DROP</span>
            </div>

            {/* Bottom Right Verified Emblem Overlay */}
            <div className="absolute bottom-4 right-4">
              <img src={amdBadgeUrl} alt="" className="h-9 w-9 drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Copy Narrative & Interactive Conversion Strike Grid */}
        <div className="w-full max-w-[440px] flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
            <span className="text-amber-400 text-xs">✨</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Curated by {artist?.name || 'VaB'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-outfit leading-tight drop-shadow-md">
            {playlist?.name || 'Chrome AfroFusion Radio'}
          </h1>
          
          <p className="text-sm md:text-base text-gray-300 font-normal mt-3 leading-relaxed max-w-md">
            {data.og_description || playlist?.description || 'Discover contemporary African popular music from Lagos to the world. Experience the cutting edge of Afrofusion.'}
          </p>

          {/* Vibe & Volume Highlights Strip */}
          <div className="flex items-center justify-center md:justify-start gap-4 mt-5 py-2.5 px-5 rounded-2xl bg-white/5 border border-white/10 w-full max-w-md">
            <div className="flex flex-col">
              <span className="text-sm font-black text-amber-400">50 TRACKS</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Weekly Pool</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-200">40+ ARTISTS</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">African Collective</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-emerald-400">UPDATED</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Every Friday</span>
            </div>
          </div>

          {/* Interactive Client Action Buttons (DSP Redirection, Audio Previewing, Telemetry) */}
          <SmartLinkActionButtons
            smartLinkId={(data as any).id}
            hubId={(data as any).hub_id}
            artistId={(data as any).artist_id || undefined}
            trackId={(data as any).track_id || undefined}
            playlistId={(data as any).playlist_id || undefined}
            dspLinks={dspLinks}
            audioPreviewUrl={audioPreviewUrl}
          />
        </div>
      </section>

      {/* Ecosystem Legal Footer */}
      <footer className="w-full max-w-4xl mx-auto z-10 pt-8 mt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="font-bold text-gray-400">© 2026 {hub?.name || 'Chrome Entertainment'}. All rights reserved.</p>
          <p className="mt-1">Powered by AMD Music Intelligence Autonomous Broadcasting Skyscraper.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://amdsolutions007.com" className="hover:text-amber-400 transition-colors font-medium">amdsolutions007.com</a>
          <a href="https://lekeelekee.com" className="hover:text-amber-400 transition-colors font-medium">LekeeLekee 36-State Pipeline</a>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            SYSTEMS LIVE
          </span>
        </div>
      </footer>
    </main>
  );
}
