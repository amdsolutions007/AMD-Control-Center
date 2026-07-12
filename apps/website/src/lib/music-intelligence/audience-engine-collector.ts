import { MI_DEFAULT_HUB_ID } from './constants';
import { createMIServiceClient } from '@/lib/supabase/mi-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import { resolvePartnerContext } from './partner-service';
import type { MIWorkspaceSession } from './workspace-auth';
import { loadArtistProfile, listSubmissions } from './workspace-service';
import { listPartnerSubmissions } from './partner-service';
import { tableAvailable } from './workspace-fallback';
import type { MIMusicSubmissionRow } from './submissions';

export interface AudienceContactRow {
  id: string;
  created_at: string;
  opt_out_at: string | null;
  email: string | null;
  whatsapp: string | null;
  telegram_username: string | null;
}

export interface AudienceClickRow {
  destination_dsp: string;
  user_country: string | null;
  user_device_type: string | null;
  session_id: string | null;
  created_at: string;
  utm_campaign: string | null;
}

export interface AudienceCollectedData {
  submissions: MIMusicSubmissionRow[];
  audienceContacts: AudienceContactRow[];
  clickTelemetry: AudienceClickRow[];
  hubId: string;
  artistId: string | null;
  dataAvailable: boolean;
}

async function loadAudienceContacts(
  service: NonNullable<ReturnType<typeof createMIServiceClient>>,
  hubId: string,
): Promise<AudienceContactRow[]> {
  if (!(await tableAvailable(service, 'mi_audience'))) return [];

  const { data } = await service
    .from('mi_audience')
    .select('id, created_at, opt_out_at, email, whatsapp, telegram_username')
    .eq('hub_id', hubId)
    .is('opt_out_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  return (data ?? []) as AudienceContactRow[];
}

async function loadAudienceClickTelemetry(
  service: NonNullable<ReturnType<typeof createMIServiceClient>>,
  scope: { artistId?: string | null; hubId: string },
): Promise<AudienceClickRow[]> {
  if (!(await tableAvailable(service, 'mi_click_tracking'))) return [];

  let query = service
    .from('mi_click_tracking')
    .select('destination_dsp, user_country, user_device_type, session_id, created_at, utm_campaign')
    .order('created_at', { ascending: false })
    .limit(500);

  if (scope.artistId) query = query.eq('artist_id', scope.artistId);
  else query = query.eq('hub_id', scope.hubId);

  const { data } = await query;
  return (data ?? []) as AudienceClickRow[];
}

export async function collectArtistAudienceEngineData(
  session: MIWorkspaceSession,
): Promise<AudienceCollectedData> {
  const [profileData, submissions] = await Promise.all([
    loadArtistProfile(session),
    listSubmissions(session),
  ]);

  const artistId = profileData?.catalog?.id ?? session.artistId ?? null;
  const hubId = profileData?.catalog?.hub_id ?? MI_DEFAULT_HUB_ID;
  const service = createMIServiceClient();

  const [audienceContacts, clickTelemetry] = service
    ? await Promise.all([
        loadAudienceContacts(service, hubId),
        loadAudienceClickTelemetry(service, { artistId, hubId }),
      ])
    : [[], []];

  return {
    submissions: submissions as MIMusicSubmissionRow[],
    audienceContacts,
    clickTelemetry,
    hubId,
    artistId,
    dataAvailable: true,
  };
}

export async function collectPartnerAudienceEngineData(
  session: MIPartnerWorkspaceSession,
): Promise<AudienceCollectedData> {
  const { service, hubId } = await resolvePartnerContext(session);
  const submissions = (await listPartnerSubmissions(session)) as MIMusicSubmissionRow[];

  const [audienceContacts, clickTelemetry] = service
    ? await Promise.all([
        loadAudienceContacts(service, hubId),
        loadAudienceClickTelemetry(service, { hubId }),
      ])
    : [[], []];

  return {
    submissions,
    audienceContacts,
    clickTelemetry,
    hubId,
    artistId: null,
    dataAvailable: true,
  };
}
