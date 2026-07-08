import { NextResponse } from 'next/server';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';
import { loadPartnerProfile, savePartnerProfile } from '@/lib/music-intelligence/partner-service';
import type { MIPartnerProfilePayload } from '@/lib/music-intelligence/partner-profile';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const data = await loadPartnerProfile(auth.session);
  if (!data) {
    return NextResponse.json({ error: 'Unable to load organization profile.' }, { status: 503 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: MIPartnerProfilePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.company_name?.trim() || !body.contact_email?.trim()) {
    return NextResponse.json({ error: 'Company name and contact email are required.' }, { status: 400 });
  }

  try {
    const result = await savePartnerProfile(auth.session, body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
