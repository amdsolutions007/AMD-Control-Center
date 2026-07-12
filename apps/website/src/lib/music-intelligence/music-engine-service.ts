import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';
import { collectArtistMusicEngineData, collectPartnerMusicEngineData } from './music-engine-collector';
import { analyzeSubmission, buildPortfolioSummary } from './music-engine-processor';
import type { MusicEnginePayload } from './music-engine-types';

export async function loadArtistMusicEngine(session: MIWorkspaceSession): Promise<MusicEnginePayload> {
  const collected = await collectArtistMusicEngineData(session);

  if (!collected.dataAvailable) {
    return emptyPayload('artist');
  }

  const reports = collected.submissions.map((s) =>
    analyzeSubmission(s, collected.profileCompletion),
  );
  const pending = collected.submissions.filter((s) =>
    ['pending_review', 'revision_requested'].includes(s.status),
  ).length;
  const approved = collected.submissions.filter((s) => s.status === 'approved').length;

  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    portfolioSummary: buildPortfolioSummary(reports, pending, approved),
    reports: reports.sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    ),
  };
}

export async function loadPartnerMusicEngine(
  session: MIPartnerWorkspaceSession,
): Promise<MusicEnginePayload> {
  const collected = await collectPartnerMusicEngineData(session);

  if (!collected.dataAvailable) {
    return emptyPayload('partner');
  }

  const reports = collected.submissions.map((s) => analyzeSubmission(s, 0));
  const pending = collected.submissions.filter((s) =>
    ['pending_review', 'revision_requested'].includes(s.status),
  ).length;
  const approved = collected.submissions.filter((s) => s.status === 'approved').length;

  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    portfolioSummary: buildPortfolioSummary(reports, pending, approved),
    reports: reports.sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    ),
  };
}

function emptyPayload(scope: 'artist' | 'partner'): MusicEnginePayload {
  return {
    scope,
    generatedAt: new Date().toISOString(),
    dataSource: 'fallback',
    portfolioSummary: buildPortfolioSummary([], 0, 0),
    reports: [],
  };
}
