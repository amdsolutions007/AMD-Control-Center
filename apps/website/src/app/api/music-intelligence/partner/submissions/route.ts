import { NextResponse } from 'next/server';
import { requirePartnerWorkspaceSession } from '@/lib/music-intelligence/partner-auth';
import {
  listPartnerSubmissions,
  updatePartnerSubmission,
} from '@/lib/music-intelligence/partner-service';

export async function GET() {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const submissions = await listPartnerSubmissions(auth.session);
  return NextResponse.json({ submissions });
}

export async function PATCH(request: Request) {
  const auth = await requirePartnerWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { submission_id: string; action: 'approve' | 'reject' | 'revision'; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.submission_id || !body.action) {
    return NextResponse.json({ error: 'Submission ID and action are required.' }, { status: 400 });
  }

  try {
    const updated = await updatePartnerSubmission(
      auth.session,
      body.submission_id,
      body.action,
      body.reason,
    );
    return NextResponse.json({ ok: true, submission: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
