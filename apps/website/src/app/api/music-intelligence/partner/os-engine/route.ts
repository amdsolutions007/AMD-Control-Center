import { NextResponse } from 'next/server';
import { loadPartnerOSEngine } from '@/lib/music-intelligence/os-service';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const engine = await loadPartnerOSEngine(auth.session);
  return NextResponse.json(engine);
}
