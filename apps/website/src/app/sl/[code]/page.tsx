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
    <main className="min-h-screen bg-[#05050e] text-gray-100 flex flex-col items-center justify-start relative overflow-x-hidden font-sans select-none">
      {/* Dark Cyberpunk Night Cityscape Atmosphere & Bokeh Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(0,229,255,0.14)_0%,_rgba(138,43,226,0.18)_35%,_transparent_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_#05050e_0%,_transparent_20%,_transparent_80%,_#05050e_100%)]" />
      </div>

      <SmartLinkActionButtons
        smartLinkId={(data as any).id}
        hubId={(data as any).hub_id}
        artistId={(data as any).artist_id || undefined}
        trackId={(data as any).track_id || undefined}
        playlistId={(data as any).playlist_id || undefined}
        dspLinks={dspLinks}
        audioPreviewUrl={audioPreviewUrl}
        whatsappJoinUrl={(data as any).cta_url || undefined}
        heroArtworkUrl={heroArtworkUrl}
        playlistCoverUrl={playlistCoverUrl}
        amdLogoUrl={amdLogoUrl}
        amdBadgeUrl={amdBadgeUrl}
        playlistName={playlist.name || 'Chrome AfroFusion Radio'}
        artistName={artist.name || 'VaB'}
      />
    </main>
  );
}
