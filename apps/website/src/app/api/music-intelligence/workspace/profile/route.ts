import { NextResponse } from 'next/server';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';
import { loadArtistProfile, saveArtistProfile } from '@/lib/music-intelligence/workspace-service';
import type { MIArtistProfilePayload } from '@/lib/music-intelligence/artist-profile';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const data = await loadArtistProfile(auth.session);
  if (!data) {
    return NextResponse.json({ error: 'Unable to load profile.' }, { status: 503 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: MIArtistProfilePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.artist_name?.trim() || !body.stage_name?.trim()) {
    return NextResponse.json({ error: 'Artist name and stage name are required.' }, { status: 400 });
  }

  try {
    const result = await saveArtistProfile(auth.session, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
