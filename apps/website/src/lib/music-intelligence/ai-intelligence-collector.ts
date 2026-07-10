import type { MIArtistProfilePayload } from './artist-profile';
import { loadArtistProfile } from './workspace-service';
import { listSubmissions } from './workspace-service';
import { loadArtistIntelligence } from './intelligence-service';
import type { MIWorkspaceSession } from './workspace-auth';
import { loadPartnerProfile, listPartnerArtists, listPartnerSubmissions } from './partner-service';
import { loadPartnerIntelligence } from './intelligence-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIMusicSubmissionRow } from './submissions';
import type { MIPartnerProfilePayload } from './partner-profile';

export interface ArtistCollectedData {
  profile: MIArtistProfilePayload | null;
  profileCompletion: number;
  hasLinkedArtist: boolean;
  submissions: MIMusicSubmissionRow[];
  metrics: Awaited<ReturnType<typeof loadArtistIntelligence>>;
  dataAvailable: boolean;
}

export interface PartnerCollectedData {
  profile: MIPartnerProfilePayload | null;
  profileCompletion: number;
  verificationStatus: string;
  artists: Array<{ id: string; name: string; is_active: boolean | null }>;
  submissions: MIMusicSubmissionRow[];
  metrics: Awaited<ReturnType<typeof loadPartnerIntelligence>>;
  dataAvailable: boolean;
}

export async function collectArtistIntelligenceData(
  session: MIWorkspaceSession,
): Promise<ArtistCollectedData> {
  const [profileData, submissions, metrics] = await Promise.all([
    loadArtistProfile(session),
    listSubmissions(session),
    loadArtistIntelligence(session),
  ]);

  const profile = profileData?.profile ?? null;
  const profileCompletion = profileData?.completion ?? 0;
  const hasLinkedArtist = Boolean(profileData?.catalog?.id ?? session.artistId);

  return {
    profile,
    profileCompletion,
    hasLinkedArtist,
    submissions: submissions as MIMusicSubmissionRow[],
    metrics,
    dataAvailable: metrics.dataSource === 'live',
  };
}

export async function collectPartnerIntelligenceData(
  session: MIPartnerWorkspaceSession,
): Promise<PartnerCollectedData> {
  const [profileData, artists, submissions, metrics] = await Promise.all([
    loadPartnerProfile(session),
    listPartnerArtists(session),
    listPartnerSubmissions(session),
    loadPartnerIntelligence(session),
  ]);

  return {
    profile: profileData?.profile ?? null,
    profileCompletion: profileData?.completion ?? 0,
    verificationStatus: profileData?.verificationStatus ?? 'pending',
    artists: artists as Array<{ id: string; name: string; is_active: boolean | null }>,
    submissions: submissions as MIMusicSubmissionRow[],
    metrics,
    dataAvailable: metrics.dataSource === 'live',
  };
}
