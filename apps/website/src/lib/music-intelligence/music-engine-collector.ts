import { loadArtistProfile, listSubmissions } from './workspace-service';
import { listPartnerSubmissions } from './partner-service';
import type { MIWorkspaceSession } from './workspace-auth';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIMusicSubmissionRow } from './submissions';

export interface ArtistMusicEngineData {
  profileCompletion: number;
  submissions: MIMusicSubmissionRow[];
  dataAvailable: boolean;
}

export interface PartnerMusicEngineData {
  submissions: MIMusicSubmissionRow[];
  dataAvailable: boolean;
}

export async function collectArtistMusicEngineData(
  session: MIWorkspaceSession,
): Promise<ArtistMusicEngineData> {
  const [profileData, submissions] = await Promise.all([
    loadArtistProfile(session),
    listSubmissions(session),
  ]);

  return {
    profileCompletion: profileData?.completion ?? 0,
    submissions: submissions as MIMusicSubmissionRow[],
    dataAvailable: true,
  };
}

export async function collectPartnerMusicEngineData(
  session: MIPartnerWorkspaceSession,
): Promise<PartnerMusicEngineData> {
  const submissions = await listPartnerSubmissions(session);
  return {
    submissions: submissions as MIMusicSubmissionRow[],
    dataAvailable: true,
  };
}
