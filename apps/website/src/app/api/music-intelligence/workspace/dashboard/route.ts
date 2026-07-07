import { NextResponse } from 'next/server';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';
import { loadWorkspaceDashboard } from '@/lib/music-intelligence/workspace-service';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const dashboard = await loadWorkspaceDashboard(auth.session);
  return NextResponse.json(dashboard);
}
