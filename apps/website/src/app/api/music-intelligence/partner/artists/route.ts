import { NextResponse } from 'next/server';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';
import {
  assignPartnerManager,
  invitePartnerArtist,
  listPartnerArtists,
  removePartnerArtist,
} from '@/lib/music-intelligence/partner-service';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const artists = await listPartnerArtists(auth.session);
  return NextResponse.json({ artists });
}

export async function POST(request: Request) {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { action: string; email?: string; artist_id?: string; manager_email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    if (body.action === 'invite') {
      if (!body.email?.trim()) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
      }
      const invite = await invitePartnerArtist(auth.session, body.email);
      return NextResponse.json({ ok: true, invite });
    }

    if (body.action === 'remove') {
      if (!body.artist_id) {
        return NextResponse.json({ error: 'Artist ID is required.' }, { status: 400 });
      }
      await removePartnerArtist(auth.session, body.artist_id);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'assign_manager') {
      if (!body.artist_id || !body.manager_email?.trim()) {
        return NextResponse.json({ error: 'Artist ID and manager email are required.' }, { status: 400 });
      }
      await assignPartnerManager(auth.session, body.artist_id, body.manager_email);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Operation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
