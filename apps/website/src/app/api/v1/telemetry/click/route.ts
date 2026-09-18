import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pjoijeligrgttimkqftk.supabase.co';

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const clean = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function getDeviceType(userAgent: string) {
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  if (userAgent) return 'desktop';
  return 'unknown';
}

function normalizeDestinationDsp(value: unknown, isLanding: boolean) {
  if (isLanding) return 'internal';

  const key = clean(value, 80).toLowerCase();
  const canonical: Record<string, string> = {
    spotify: 'spotify',
    apple_music: 'apple_music',
    apple: 'apple_music',
    audiomack: 'audiomack',
    boomplay: 'boomplay',
    youtube: 'youtube',
    youtube_music: 'youtube',
    smart_link_gateway: 'internal',
    internal_audio_preview: 'internal',
    whatsapp: 'internal',
    tiktok: 'other',
    instagram: 'other',
    soundcloud: 'other',
    amazon_music: 'other',
    deezer: 'other',
  };

  return canonical[key] || 'other';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const smartLinkId = clean(body.smart_link_id, 100);
    const hubId = clean(body.hub_id, 100);
    const artistId = clean(body.artist_id, 100);
    const trackId = clean(body.track_id, 100);
    const playlistId = clean(body.playlist_id, 100);

    const requestedEvent = clean(body.event_type, 40).toLowerCase();
    const isLanding =
      requestedEvent === 'landing' ||
      requestedEvent === 'page_view' ||
      requestedEvent === 'page_view_impression';

    const destinationDsp = normalizeDestinationDsp(
      body.destination_dsp,
      isLanding
    );

    const destinationUrl = isLanding
      ? clean(body.page_url || body.destination_url, 2000)
      : clean(body.destination_url, 2000);

    if (!smartLinkId || !hubId || !destinationDsp) {
      return NextResponse.json(
        { error: 'Missing required telemetry fields' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    const headerCountry =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      '';

    const userCountry = clean(body.user_country || headerCountry, 2).toUpperCase();

    const referrerUrl = clean(
      body.referrer_url || req.headers.get('referer') || '',
      2000
    );

    const sessionId = clean(body.session_id, 200);
    const utmSource = clean(body.utm_source, 250);
    const utmMedium = clean(body.utm_medium, 250);
    const utmCampaign = clean(body.utm_campaign, 250);

    const { error } = await supabase.from('mi_click_tracking').insert({
      smart_link_id: smartLinkId,
      hub_id: hubId,
      artist_id: artistId || null,
      track_id: trackId || null,
      playlist_id: playlistId || null,
      destination_dsp: destinationDsp,
      destination_url: destinationUrl || null,
      referrer_url: referrerUrl || null,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      user_country: userCountry || null,
      user_device_type: deviceType,
      user_browser: userAgent.slice(0, 250),
      session_id: sessionId || null
    });

    if (error) {
      console.error('Telemetry ingestion error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: 'INGESTED',
      event_type: isLanding ? 'landing' : 'dsp_click'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Telemetry ingestion failed' },
      { status: 500 }
    );
  }
}
