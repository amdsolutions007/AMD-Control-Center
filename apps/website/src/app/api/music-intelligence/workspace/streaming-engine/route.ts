import { NextResponse } from 'next/server';
import { loadArtistStreamingEngine } from '@/lib/music-intelligence/streaming-engine-service';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const engine = await loadArtistStreamingEngine(auth.session);
  return NextResponse.json(engine);
}
