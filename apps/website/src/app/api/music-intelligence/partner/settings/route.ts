import { NextResponse } from 'next/server';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';
import { loadPartnerSettings, savePartnerSettings } from '@/lib/music-intelligence/partner-service';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await loadPartnerSettings(auth.session);
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    await savePartnerSettings(auth.session, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
