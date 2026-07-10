import { NextResponse } from 'next/server';
import { loadArtistIntelligence } from '@/lib/music-intelligence/intelligence-service';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const intelligence = await loadArtistIntelligence(auth.session);
  return NextResponse.json(intelligence);
}
