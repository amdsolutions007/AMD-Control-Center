import { NextResponse } from 'next/server';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';
import { loadPartnerNotifications } from '@/lib/music-intelligence/partner-service';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const notifications = await loadPartnerNotifications(auth.session);
  return NextResponse.json({ notifications });
}
