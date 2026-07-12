import type { MIArtistProfilePayload } from './artist-profile';
import { profileCompletionPercent } from './artist-profile';
import { scoreSubmissionQuality } from './ai-intelligence-processor';
import {
  dspPlatformsFromSubmission,
  METADATA_REQUIRED_FIELDS,
  MI_PLAYLIST_RULES,
  RIGHTS_OPTIONAL_FIELDS,
} from './music-engine-constants';
import type {
  ExecutiveMusicReport,
  MetadataIntelligence,
  MusicCharacteristics,
  MusicEngineConfidence,
  MusicIntelligenceReport,
  MusicEnginePortfolioSummary,
  PlaylistRecommendation,
  RightsIntelligence,
  SubmissionTimelineEvent,
} from './music-engine-types';
import type { MIMusicSubmissionRow } from './submissions';

type SubmissionRecord = MIMusicSubmissionRow & { reviewed_at?: string | null; rejection_reason?: string | null };

function energyFromBpm(bpm: number | null | undefined): string | null {
  if (bpm == null) return null;
  if (bpm < 90) return 'Low';
  if (bpm < 120) return 'Medium';
  if (bpm < 140) return 'High';
  return 'Very High';
}

function buildCharacteristics(submission: SubmissionRecord): MusicCharacteristics {
  const traits: string[] = [];
  if (submission.genre?.trim()) traits.push(`Genre: ${submission.genre}`);
  if (submission.mood?.trim()) traits.push(`Mood: ${submission.mood}`);
  if (submission.language?.trim()) traits.push(`Language: ${submission.language}`);
  if (submission.bpm != null) traits.push(`BPM: ${submission.bpm}`);
  if (submission.territory?.trim()) traits.push(`Territory: ${submission.territory}`);
  if (submission.album?.trim()) traits.push(`Release: ${submission.album}`);

  return {
    genre: submission.genre?.trim() || null,
    subgenre: null,
    language: submission.language?.trim() || null,
    bpm: submission.bpm ?? null,
    mood: submission.mood?.trim() || null,
    energy: energyFromBpm(submission.bpm),
    territory: submission.territory?.trim() || null,
    traits,
  };
}

function buildMetadataIntelligence(submission: SubmissionRecord): MetadataIntelligence {
  const raw = submission as unknown as Record<string, unknown>;
  const missingFields = METADATA_REQUIRED_FIELDS.filter((f) => !f.check(raw)).map((f) => f.label);
  const missingReleaseInfo = ['Release date', 'Album / EP', 'Territory'].filter((label) => {
    const field = METADATA_REQUIRED_FIELDS.find((f) => f.label === label);
    return field && !field.check(raw);
  });
  const missingContributors = ['Writers', 'Producers'].filter(() => true);
  const missingPublishing = ['Publishing information'].filter(() => !submission.press_kit_url?.trim());
  const missingCopyright = ['Copyright declaration'].filter(() => !submission.press_kit_url?.trim());
  const platforms = dspPlatformsFromSubmission(submission.dsp_links as Record<string, string>);
  const filled = METADATA_REQUIRED_FIELDS.length - missingFields.length;
  const metadataQualityScore = Math.round((filled / METADATA_REQUIRED_FIELDS.length) * 100);

  return {
    missingFields,
    missingReleaseInfo,
    missingContributors,
    missingPublishing,
    missingCopyright,
    artworkStatus: submission.artwork_url?.trim() ? 'present' : 'missing',
    dspLinkStatus: {
      connected: platforms.length,
      total: 7,
      platforms,
    },
    metadataQualityScore,
    summary:
      missingFields.length === 0
        ? 'All tracked metadata fields populated in submission record.'
        : `${missingFields.length} metadata field(s) missing from production record.`,
  };
}

function buildRightsIntelligence(submission: SubmissionRecord): RightsIntelligence {
  const raw = submission as unknown as Record<string, unknown>;
  const missingRightsFields = RIGHTS_OPTIONAL_FIELDS.filter((f) => !f.check(raw)).map((f) => f.label);
  const hasPressKit = Boolean(submission.press_kit_url?.trim());
  const hasBio = Boolean(submission.biography?.trim());

  let ownershipStatus: RightsIntelligence['ownershipStatus'] = 'not_provided';
  if (hasPressKit && hasBio) ownershipStatus = 'documented';
  else if (hasPressKit || hasBio) ownershipStatus = 'partial';

  let licensingReadiness: RightsIntelligence['licensingReadiness'] = 'not_ready';
  if (hasPressKit) licensingReadiness = 'ready';
  else if (hasBio) licensingReadiness = 'partial';

  return {
    ownershipStatus,
    writers: [],
    producers: [],
    publishers: [],
    licensingReadiness,
    missingRightsFields: [
      ...missingRightsFields,
      'Writers (not in submission schema)',
      'Producers (not in submission schema)',
      'Publishers (not in submission schema)',
    ],
    summary:
      ownershipStatus === 'documented'
        ? 'Press kit and biography present — rights documentation partially captured.'
        : ownershipStatus === 'partial'
          ? 'Partial rights context available. Writers/producers/publishers not in submission schema.'
          : 'No rights documentation in submission metadata. Press kit and biography absent.',
  };
}

function confidenceLabel(percent: number): MusicEngineConfidence {
  if (percent >= 70) return 'high';
  if (percent >= 45) return 'medium';
  if (percent > 0) return 'low';
  return 'none';
}

function buildPlaylistRecommendations(submission: SubmissionRecord): PlaylistRecommendation[] {
  const genre = submission.genre ?? '';
  const mood = submission.mood ?? '';
  const language = submission.language ?? '';
  const recommendations: PlaylistRecommendation[] = [];

  for (const rule of MI_PLAYLIST_RULES) {
    const genreMatch = rule.genrePatterns.some((p) => p.test(genre));
    const moodMatch = !rule.moodPatterns || rule.moodPatterns.some((p) => p.test(mood));
    const langMatch = !rule.languagePatterns || rule.languagePatterns.some((p) => p.test(language));

    if (!genreMatch || !moodMatch || !langMatch) continue;

    let confidence = rule.baseConfidence;
    if (submission.artwork_url?.trim()) confidence += 5;
    if (dspPlatformsFromSubmission(submission.dsp_links as Record<string, string>).length >= 2) confidence += 5;
    confidence = Math.min(95, confidence);

    recommendations.push({
      id: `${rule.id}-${submission.id}`,
      playlistName: rule.playlistName,
      confidence: confidenceLabel(confidence),
      confidencePercent: confidence,
      explanation: rule.explanation,
      derivedFrom: `genre="${genre || 'empty'}" mood="${mood || 'empty'}" language="${language || 'empty'}"`,
    });
  }

  if (recommendations.length === 0 && genre.trim()) {
    recommendations.push({
      id: `insufficient-${submission.id}`,
      playlistName: 'Insufficient metadata for playlist routing',
      confidence: 'none',
      confidencePercent: 0,
      explanation: 'Genre present but no playlist rule matched. Add mood and language for better routing.',
      derivedFrom: `genre="${genre}"`,
    });
  }

  return recommendations.sort((a, b) => b.confidencePercent - a.confidencePercent);
}

function buildReleaseReadiness(
  submission: SubmissionRecord,
  profileCompletion: number,
  qualityScore: number,
): number {
  const metadata = buildMetadataIntelligence(submission);
  const rights = buildRightsIntelligence(submission);
  const artworkScore = metadata.artworkStatus === 'present' ? 100 : 0;
  const rightsScore =
    rights.licensingReadiness === 'ready' ? 100 : rights.licensingReadiness === 'partial' ? 50 : 0;

  return Math.round(
    profileCompletion * 0.25 +
      metadata.metadataQualityScore * 0.25 +
      artworkScore * 0.15 +
      rightsScore * 0.15 +
      qualityScore * 0.2,
  );
}

function buildExecutiveReport(
  submission: SubmissionRecord,
  metadata: MetadataIntelligence,
  rights: RightsIntelligence,
  characteristics: MusicCharacteristics,
  qualityScore: number,
  readinessScore: number,
): ExecutiveMusicReport {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const missingInformation: string[] = [...metadata.missingFields];
  const recommendedActions: string[] = [];

  if (characteristics.genre) strengths.push(`Genre documented: ${characteristics.genre}`);
  if (characteristics.mood) strengths.push(`Mood documented: ${characteristics.mood}`);
  if (metadata.artworkStatus === 'present') strengths.push('Artwork URL present in submission.');
  if (metadata.dspLinkStatus.connected > 0) {
    strengths.push(`${metadata.dspLinkStatus.connected} DSP link(s) connected.`);
  }
  if (qualityScore >= 70) strengths.push(`Submission quality score ${qualityScore}% meets baseline.`);

  if (metadata.missingFields.length > 0) {
    weaknesses.push(`${metadata.missingFields.length} metadata field(s) incomplete.`);
  }
  if (rights.ownershipStatus === 'not_provided') {
    weaknesses.push('Rights documentation not provided in submission record.');
  }
  if (qualityScore < 70) weaknesses.push(`Submission quality ${qualityScore}% below 70% threshold.`);

  if (rights.licensingReadiness === 'not_ready') {
    risks.push('Licensing readiness not met — press kit absent.');
  }
  if (metadata.dspLinkStatus.connected === 0) {
    risks.push('No valid DSP links in submission metadata.');
  }
  if (submission.status === 'rejected') {
    risks.push(`Submission rejected${submission.rejection_reason ? `: ${submission.rejection_reason}` : '.'}`);
  }

  if (metadata.artworkStatus === 'missing') recommendedActions.push('Upload artwork URL to submission.');
  if (!characteristics.language) recommendedActions.push('Add language metadata for diaspora routing.');
  if (!submission.press_kit_url?.trim()) recommendedActions.push('Attach press kit for rights verification.');
  if (readinessScore < 70) recommendedActions.push('Complete profile and metadata to raise release readiness.');

  return {
    strengths,
    weaknesses,
    risks,
    missingInformation,
    recommendedActions,
  };
}

function buildTimeline(submission: SubmissionRecord, generatedAt: string): SubmissionTimelineEvent[] {
  const events: SubmissionTimelineEvent[] = [
    {
      id: `${submission.id}-submitted`,
      type: 'submitted',
      label: 'Submitted',
      timestamp: submission.created_at,
      detail: `${submission.song_title} submitted for review.`,
    },
  ];

  if (submission.updated_at && submission.updated_at !== submission.created_at) {
    events.push({
      id: `${submission.id}-updated`,
      type: 'updated',
      label: 'Updated',
      timestamp: submission.updated_at,
      detail: 'Submission metadata updated.',
    });
  }

  if (submission.reviewed_at) {
    events.push({
      id: `${submission.id}-reviewed`,
      type: 'reviewed',
      label: 'Reviewed',
      timestamp: submission.reviewed_at,
      detail: `Partner review recorded · status: ${submission.status}.`,
    });
  }

  events.push({
    id: `${submission.id}-intel`,
    type: 'intelligence_generated',
    label: 'Intelligence Generated',
    timestamp: generatedAt,
    detail: 'Music Intelligence Engine analysis computed from production metadata.',
  });

  if (submission.status === 'approved') {
    events.push({
      id: `${submission.id}-approved`,
      type: 'approved',
      label: 'Approved',
      timestamp: submission.reviewed_at ?? submission.updated_at,
      detail: 'Submission approved for playlist consideration.',
    });
  }
  if (submission.status === 'rejected') {
    events.push({
      id: `${submission.id}-rejected`,
      type: 'rejected',
      label: 'Rejected',
      timestamp: submission.reviewed_at ?? submission.updated_at,
      detail: submission.rejection_reason ?? 'Submission rejected.',
    });
  }
  if (submission.status === 'revision_requested') {
    events.push({
      id: `${submission.id}-revision`,
      type: 'revision',
      label: 'Revision Requested',
      timestamp: submission.reviewed_at ?? submission.updated_at,
      detail: submission.rejection_reason ?? 'Revision requested by partner.',
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function analyzeSubmission(
  submission: SubmissionRecord,
  profileCompletion: number,
): MusicIntelligenceReport {
  const generatedAt = new Date().toISOString();
  const characteristics = buildCharacteristics(submission);
  const metadataIntelligence = buildMetadataIntelligence(submission);
  const rightsIntelligence = buildRightsIntelligence(submission);
  const submissionQualityScore = scoreSubmissionQuality(submission);
  const releaseReadinessScore = buildReleaseReadiness(submission, profileCompletion, submissionQualityScore);
  const playlistRecommendations = buildPlaylistRecommendations(submission);
  const executiveReport = buildExecutiveReport(
    submission,
    metadataIntelligence,
    rightsIntelligence,
    characteristics,
    submissionQualityScore,
    releaseReadinessScore,
  );
  const timeline = buildTimeline(submission, generatedAt);

  return {
    submissionId: submission.id,
    songTitle: submission.song_title,
    artistName: submission.artist_name,
    status: submission.status,
    characteristics,
    metadataIntelligence,
    rightsIntelligence,
    submissionQualityScore,
    releaseReadinessScore,
    playlistRecommendations,
    executiveReport,
    timeline,
    generatedAt,
  };
}

export function buildPortfolioSummary(
  reports: MusicIntelligenceReport[],
  pendingReview: number,
  approved: number,
): MusicEnginePortfolioSummary {
  if (reports.length === 0) {
    return {
      totalSubmissions: 0,
      averageQualityScore: null,
      averageReadinessScore: null,
      pendingReview: 0,
      approved: 0,
      metadataIssues: 0,
      rightsGaps: 0,
      summary: 'No submissions available for music intelligence analysis.',
    };
  }

  const avgQuality = Math.round(
    reports.reduce((s, r) => s + r.submissionQualityScore, 0) / reports.length,
  );
  const avgReadiness = Math.round(
    reports.reduce((s, r) => s + r.releaseReadinessScore, 0) / reports.length,
  );
  const metadataIssues = reports.filter((r) => r.metadataIntelligence.missingFields.length > 0).length;
  const rightsGaps = reports.filter((r) => r.rightsIntelligence.licensingReadiness !== 'ready').length;

  return {
    totalSubmissions: reports.length,
    averageQualityScore: avgQuality,
    averageReadinessScore: avgReadiness,
    pendingReview,
    approved,
    metadataIssues,
    rightsGaps,
    summary: `${reports.length} submission(s) analysed · avg quality ${avgQuality}% · avg readiness ${avgReadiness}%`,
  };
}

export function defaultProfileCompletion(profile: MIArtistProfilePayload | null): number {
  if (!profile) return 0;
  return profileCompletionPercent(profile);
}
