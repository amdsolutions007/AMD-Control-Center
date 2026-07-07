import type { MIMusicSubmissionPayload } from './submissions';

type Agent007Context = {
  artist_profile?: Record<string, unknown>;
  artist_id?: string;
  submissions?: Array<Record<string, unknown>>;
};

export async function tableAvailable(
  service: NonNullable<ReturnType<typeof import('@/lib/supabase/mi-service').createMIServiceClient>>,
  table: string,
): Promise<boolean> {
  const { error } = await service.from(table).select('id').limit(1);
  return !error;
}

export function getContextSubmissions(ctx: Agent007Context | null | undefined) {
  return (ctx?.submissions ?? []) as Array<{
    id: string;
    song_title: string;
    artist_name: string;
    status: string;
    created_at: string;
    dsp_links?: Record<string, string>;
  }>;
}

export function appendContextSubmission(
  ctx: Record<string, unknown>,
  sessionUserId: string,
  payload: MIMusicSubmissionPayload,
  artistId: string | null,
) {
  const row = {
    id: crypto.randomUUID(),
    hub_id: '214a5177-aa98-4a4f-a283-ff2886f9c7fa',
    artist_id: artistId,
    submitted_by: sessionUserId,
    status: 'pending_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...payload,
    audio_upload_ready: false,
  };
  const prior = Array.isArray(ctx.submissions) ? ctx.submissions : [];
  return {
    ...ctx,
    submissions: [row, ...prior],
  };
}
