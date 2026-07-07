import { NextResponse } from 'next/server';
import { requireArtistWorkspaceSession } from '@/lib/music-intelligence/workspace-auth';
import { createSubmission, listSubmissions } from '@/lib/music-intelligence/workspace-service';
import { validateSubmissionPayload, type MIMusicSubmissionPayload } from '@/lib/music-intelligence/submissions';

export async function GET() {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const submissions = await listSubmissions(auth.session);
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const auth = await requireArtistWorkspaceSession();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: MIMusicSubmissionPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationError = validateSubmissionPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const submission = await createSubmission(auth.session, body);
    return NextResponse.json({ ok: true, submission }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Submission failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
