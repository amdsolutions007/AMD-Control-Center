import { NextResponse } from 'next/server';
import { loadPartnerIntelligence } from '@/lib/music-intelligence/intelligence-service';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const intelligence = await loadPartnerIntelligence(auth.session);
  return NextResponse.json(intelligence);
}
