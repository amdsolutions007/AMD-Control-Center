import { NextResponse } from 'next/server';
import { loadArtistOSEngine } from '@/lib/music-intelligence/os-service';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const engine = await loadArtistOSEngine(auth.session);
  return NextResponse.json(engine);
}
