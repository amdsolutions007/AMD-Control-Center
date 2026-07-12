import type { MIMusicSubmissionRow } from './submissions';

export type MusicEngineScope = 'artist' | 'partner';

export type MusicEngineConfidence = 'high' | 'medium' | 'low' | 'none';

export interface MusicCharacteristics {
  genre: string | null;
  subgenre: string | null;
  language: string | null;
  bpm: number | null;
  mood: string | null;
  energy: string | null;
  territory: string | null;
  traits: string[];
}

export interface MetadataIntelligence {
  missingFields: string[];
  missingReleaseInfo: string[];
  missingContributors: string[];
  missingPublishing: string[];
  missingCopyright: string[];
  artworkStatus: 'present' | 'missing';
  dspLinkStatus: { connected: number; total: number; platforms: string[] };
  metadataQualityScore: number;
  summary: string;
}

export interface RightsIntelligence {
  ownershipStatus: 'documented' | 'partial' | 'not_provided';
  writers: string[];
  producers: string[];
  publishers: string[];
  licensingReadiness: 'ready' | 'partial' | 'not_ready';
  missingRightsFields: string[];
  summary: string;
}

export interface PlaylistRecommendation {
  id: string;
  playlistName: string;
  confidence: MusicEngineConfidence;
  confidencePercent: number;
  explanation: string;
  derivedFrom: string;
}

export interface SubmissionTimelineEvent {
  id: string;
  type: 'submitted' | 'updated' | 'reviewed' | 'intelligence_generated' | 'approved' | 'archived' | 'rejected' | 'revision';
  label: string;
  timestamp: string;
  detail: string;
}

export interface ExecutiveMusicReport {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  missingInformation: string[];
  recommendedActions: string[];
}

export interface MusicIntelligenceReport {
  submissionId: string;
  songTitle: string;
  artistName: string;
  status: string;
  characteristics: MusicCharacteristics;
  metadataIntelligence: MetadataIntelligence;
  rightsIntelligence: RightsIntelligence;
  submissionQualityScore: number;
  releaseReadinessScore: number;
  playlistRecommendations: PlaylistRecommendation[];
  executiveReport: ExecutiveMusicReport;
  timeline: SubmissionTimelineEvent[];
  generatedAt: string;
}

export interface MusicEnginePortfolioSummary {
  totalSubmissions: number;
  averageQualityScore: number | null;
  averageReadinessScore: number | null;
  pendingReview: number;
  approved: number;
  metadataIssues: number;
  rightsGaps: number;
  summary: string;
}

export interface MusicEnginePayload {
  scope: MusicEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  portfolioSummary: MusicEnginePortfolioSummary;
  reports: MusicIntelligenceReport[];
}
