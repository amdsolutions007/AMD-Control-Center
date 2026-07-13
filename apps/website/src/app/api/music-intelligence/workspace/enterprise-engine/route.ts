import { NextResponse } from 'next/server';
import { loadArtistEnterpriseEngine } from '@/lib/music-intelligence/enterprise-service';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const engine = await loadArtistEnterpriseEngine(auth.session);
  return NextResponse.json(engine);
}
