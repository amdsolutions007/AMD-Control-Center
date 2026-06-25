import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjoijeligrgttimkqftk.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      smart_link_id,
      hub_id,
      artist_id,
      track_id,
      playlist_id,
      destination_dsp,
      destination_url
    } = body;

    if (!smart_link_id || !hub_id || !destination_dsp) {
      return NextResponse.json({ error: 'Missing required telemetry fields' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    const { error } = await supabase.from('mi_click_tracking').insert({
      smart_link_id,
      hub_id,
      artist_id: artist_id || null,
      track_id: track_id || null,
      playlist_id: playlist_id || null,
      destination_dsp,
      destination_url: destination_url || null,
      user_device_type: deviceType,
      user_browser: userAgent.slice(0, 250)
    });

    if (error) {
      console.error('Telemetry ingestion error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: 'INGESTED' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
