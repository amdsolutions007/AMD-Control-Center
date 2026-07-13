import { NextResponse } from 'next/server';
import { loadPartnerBusinessEngine } from '@/lib/music-intelligence/business-engine-service';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const engine = await loadPartnerBusinessEngine(auth.session);
  return NextResponse.json(engine);
}
