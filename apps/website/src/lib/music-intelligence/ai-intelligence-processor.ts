import type { MIArtistProfilePayload } from './artist-profile';
import type { MIPartnerProfilePayload } from './partner-profile';
import type { MIMusicSubmissionRow } from './submissions';
import type {
  AIActivityItem,
  AIIntelligencePayload,
  AIIntelligenceScope,
  AIProfileIntelligence,
  AIQualityIndicator,
  AIRecommendation,
  AISubmissionIntelligence,
} from './ai-intelligence-types';
import type { ArtistCollectedData, PartnerCollectedData } from './ai-intelligence-collector';

const ARTIST_PROFILE_FIELDS: Array<[string, (p: MIArtistProfilePayload) => string | undefined]> = [
  ['Artist name', (p) => p.artist_name],
  ['Stage name', (p) => p.stage_name],
  ['Biography', (p) => p.biography],
  ['Country', (p) => p.country],
  ['City', (p) => p.city],
  ['Primary genre', (p) => p.primary_genre],
  ['Profile image', (p) => p.profile_image_url],
];

const PARTNER_PROFILE_FIELDS: Array<[string, (p: MIPartnerProfilePayload) => string | undefined]> = [
  ['Company name', (p) => p.company_name],
  ['Partner category', (p) => p.partner_category],
  ['Country', (p) => p.country],
  ['Contact email', (p) => p.contact_email],
  ['Website', (p) => p.website],
];

export function scoreSubmissionQuality(submission: Partial<MIMusicSubmissionRow>): number {
  const checks = [
    Boolean(submission.song_title?.trim()),
    Boolean(submission.artist_name?.trim()),
    Boolean(submission.genre?.trim()),
    Boolean(submission.artwork_url?.trim()),
    Boolean(submission.biography?.trim()),
    Object.values(submission.dsp_links ?? {}).some((v) => Boolean(v?.trim())),
    Boolean(submission.release_date),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function detectMissingFields<T>(
  profile: T | null,
  fieldDefs: Array<[string, (p: T) => string | undefined]>,
): string[] {
  if (!profile) return fieldDefs.map(([label]) => label);
  return fieldDefs.filter(([, getter]) => !getter(profile)?.trim()).map(([label]) => label);
}

function averageQuality(submissions: MIMusicSubmissionRow[]): number | null {
  if (submissions.length === 0) return null;
  const total = submissions.reduce((sum, s) => sum + scoreSubmissionQuality(s), 0);
  return Math.round(total / submissions.length);
}

function countByStatus(submissions: MIMusicSubmissionRow[], status: string): number {
  return submissions.filter((s) => s.status === status).length;
}

function buildSubmissionIntelligence(submissions: MIMusicSubmissionRow[]): AISubmissionIntelligence {
  const pendingCount = submissions.filter((s) =>
    ['pending_review', 'revision_requested'].includes(s.status),
  ).length;
  const approvedCount = countByStatus(submissions, 'approved');
  const rejectedCount = countByStatus(submissions, 'rejected');
  const avg = averageQuality(submissions);

  let summary = 'No submissions on record. Submit music to activate submission intelligence.';
  if (submissions.length > 0) {
    summary = `${submissions.length} submission(s) tracked`;
    if (avg != null) summary += ` · average quality score ${avg}%`;
    if (pendingCount > 0) summary += ` · ${pendingCount} awaiting review`;
  }

  return {
    totalCount: submissions.length,
    averageQualityScore: avg,
    pendingCount,
    approvedCount,
    rejectedCount,
    summary,
  };
}

function buildArtistQualityIndicators(
  profile: MIArtistProfilePayload | null,
  submissions: MIMusicSubmissionRow[],
  hasLinkedArtist: boolean,
): AIQualityIndicator[] {
  const latest = submissions[0];
  const avg = averageQuality(submissions);

  return [
    {
      id: 'profile_link',
      label: 'Artist profile linked',
      status: hasLinkedArtist ? 'complete' : 'missing',
      detail: hasLinkedArtist
        ? 'Catalog artist profile is linked to your account.'
        : 'No linked artist catalog record detected.',
    },
    {
      id: 'profile_complete',
      label: 'Profile completion',
      status: profile
        ? profileCompletionStatus(detectMissingFields(profile, ARTIST_PROFILE_FIELDS).length, ARTIST_PROFILE_FIELDS.length)
        : 'missing',
      detail: profile
        ? `${detectMissingFields(profile, ARTIST_PROFILE_FIELDS).length} profile field(s) still open.`
        : 'Profile data unavailable.',
    },
    {
      id: 'submission_quality',
      label: 'Submission quality',
      status: avg == null ? 'missing' : avg >= 85 ? 'complete' : avg >= 50 ? 'partial' : 'missing',
      detail:
        avg == null
          ? 'Quality scoring activates when you submit music.'
          : `Average completeness across ${submissions.length} submission(s): ${avg}%.`,
    },
    {
      id: 'dsp_coverage',
      label: 'DSP link coverage',
      status: latest
        ? Object.values(latest.dsp_links ?? {}).some((v) => v?.trim())
          ? 'complete'
          : 'missing'
        : 'missing',
      detail: latest
        ? 'Latest submission includes streaming platform URLs.'
        : 'No submission DSP links to evaluate.',
    },
  ];
}

function buildPartnerQualityIndicators(
  profile: MIPartnerProfilePayload | null,
  artistCount: number,
  submissions: MIMusicSubmissionRow[],
  verificationStatus: string,
): AIQualityIndicator[] {
  const pending = submissions.filter((s) =>
    ['pending_review', 'revision_requested'].includes(s.status),
  ).length;

  return [
    {
      id: 'org_profile',
      label: 'Organization profile',
      status: profile
        ? profileCompletionStatus(
            detectMissingFields(profile, PARTNER_PROFILE_FIELDS).length,
            PARTNER_PROFILE_FIELDS.length,
          )
        : 'missing',
      detail: profile ? 'Organization profile data loaded from production records.' : 'Profile unavailable.',
    },
    {
      id: 'verification',
      label: 'Verification status',
      status: verificationStatus === 'verified' ? 'complete' : verificationStatus === 'pending' ? 'partial' : 'missing',
      detail: `Current verification status: ${verificationStatus}.`,
    },
    {
      id: 'artist_portfolio',
      label: 'Artist portfolio',
      status: artistCount > 0 ? 'complete' : 'missing',
      detail: artistCount > 0 ? `${artistCount} active artist(s) on hub.` : 'No active artists in portfolio.',
    },
    {
      id: 'review_pipeline',
      label: 'Review pipeline',
      status: pending > 0 ? 'partial' : submissions.length > 0 ? 'complete' : 'missing',
      detail:
        pending > 0
          ? `${pending} submission(s) require partner review action.`
          : submissions.length > 0
            ? 'Review queue is clear.'
            : 'No submissions in pipeline yet.',
    },
  ];
}

function profileCompletionStatus(missingCount: number, total: number): 'complete' | 'partial' | 'missing' {
  if (missingCount === 0) return 'complete';
  if (missingCount < total) return 'partial';
  return 'missing';
}

function computeArtistReadiness(
  profileCompletion: number,
  avgQuality: number | null,
  hasLinkedArtist: boolean,
  hasDspLinks: boolean,
): number | null {
  if (profileCompletion === 0 && avgQuality == null && !hasLinkedArtist) return null;
  const submissionComponent = avgQuality ?? 0;
  const linkedComponent = hasLinkedArtist ? 100 : 0;
  const dspComponent = hasDspLinks ? 100 : 0;
  return Math.round(
    profileCompletion * 0.4 + submissionComponent * 0.3 + linkedComponent * 0.15 + dspComponent * 0.15,
  );
}

function computePartnerReadiness(
  profileCompletion: number,
  artistCount: number,
  submissionCount: number,
  verificationStatus: string,
): number | null {
  if (profileCompletion === 0 && artistCount === 0 && submissionCount === 0) return null;
  const artistComponent = Math.min(100, artistCount * 25);
  const pipelineComponent = Math.min(100, submissionCount * 15);
  const verificationComponent =
    verificationStatus === 'verified' ? 100 : verificationStatus === 'pending' ? 50 : 0;
  return Math.round(
    profileCompletion * 0.35 +
      artistComponent * 0.25 +
      pipelineComponent * 0.2 +
      verificationComponent * 0.2,
  );
}

function buildArtistRecommendations(
  profile: MIArtistProfilePayload | null,
  missingFields: string[],
  profileCompletion: number,
  submissions: MIMusicSubmissionRow[],
  pendingCount: number,
): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  if (missingFields.length > 0) {
    recs.push({
      id: 'complete-profile',
      priority: profileCompletion < 60 ? 'high' : 'medium',
      title: 'Complete artist profile',
      description: `Missing: ${missingFields.slice(0, 4).join(', ')}${missingFields.length > 4 ? '…' : ''}.`,
      actionHref: '/music-intelligence/account/profile',
      actionLabel: 'Open Profile',
      derivedFrom: `Profile completion ${profileCompletion}% from mi_user_profiles / mi_artists`,
    });
  }

  if (submissions.length === 0) {
    recs.push({
      id: 'first-submission',
      priority: 'high',
      title: 'Submit your first track',
      description: 'No music submissions found. Submit a track to activate playlist consideration workflow.',
      actionHref: '/music-intelligence/account/submissions',
      actionLabel: 'Submit Music',
      derivedFrom: 'mi_music_submissions count = 0',
    });
  }

  const lowQuality = submissions.filter((s) => scoreSubmissionQuality(s) < 70);
  if (lowQuality.length > 0) {
    recs.push({
      id: 'improve-submissions',
      priority: 'medium',
      title: 'Strengthen submission metadata',
      description: `${lowQuality.length} submission(s) below 70% quality score. Add genre, artwork, biography, and DSP links.`,
      actionHref: '/music-intelligence/account/submissions/history',
      actionLabel: 'View Submissions',
      derivedFrom: `Submission quality analysis on ${lowQuality.length} record(s)`,
    });
  }

  if (pendingCount > 0) {
    recs.push({
      id: 'pending-review',
      priority: 'low',
      title: 'Awaiting partner review',
      description: `${pendingCount} submission(s) in review queue. No action required until partner responds.`,
      derivedFrom: `mi_music_submissions status pending_review / revision_requested`,
    });
  }

  return recs;
}

function buildPartnerRecommendations(
  missingFields: string[],
  profileCompletion: number,
  artistCount: number,
  pendingReviews: number,
  verificationStatus: string,
): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  if (missingFields.length > 0) {
    recs.push({
      id: 'complete-org-profile',
      priority: profileCompletion < 70 ? 'high' : 'medium',
      title: 'Complete organization profile',
      description: `Missing: ${missingFields.join(', ')}.`,
      actionHref: '/music-intelligence/partner/profile',
      actionLabel: 'Organization Profile',
      derivedFrom: `Partner profile completion ${profileCompletion}%`,
    });
  }

  if (artistCount === 0) {
    recs.push({
      id: 'invite-artists',
      priority: 'high',
      title: 'Build artist portfolio',
      description: 'No active artists on hub. Invite artists to populate your enterprise portfolio.',
      actionHref: '/music-intelligence/partner/artists',
      actionLabel: 'Manage Artists',
      derivedFrom: 'mi_artists active count = 0',
    });
  }

  if (pendingReviews > 0) {
    recs.push({
      id: 'review-queue',
      priority: 'high',
      title: 'Process submission review queue',
      description: `${pendingReviews} submission(s) awaiting partner review action.`,
      actionHref: '/music-intelligence/partner/submissions',
      actionLabel: 'Review Submissions',
      derivedFrom: 'mi_music_submissions pending_review count',
    });
  }

  if (verificationStatus === 'pending') {
    recs.push({
      id: 'verification-pending',
      priority: 'medium',
      title: 'Verification in progress',
      description: 'Organization verification is pending. Complete profile details to support approval.',
      derivedFrom: 'mi_partner_profiles.verification_status = pending',
    });
  }

  return recs;
}

function buildArtistExecutiveInsights(
  profileCompletion: number,
  missingCount: number,
  submissionIntel: AISubmissionIntelligence,
  readiness: number | null,
): string[] {
  const insights: string[] = [];
  insights.push(`Profile is ${profileCompletion}% complete with ${missingCount} field(s) open.`);
  if (submissionIntel.totalCount === 0) {
    insights.push('No submissions recorded — submission intelligence is in standby.');
  } else {
    insights.push(
      `${submissionIntel.totalCount} submission(s) on record · ${submissionIntel.approvedCount} approved · ${submissionIntel.pendingCount} pending.`,
    );
    if (submissionIntel.averageQualityScore != null) {
      insights.push(`Average submission quality score: ${submissionIntel.averageQualityScore}%.`);
    }
  }
  if (readiness != null) {
    insights.push(`Intelligence readiness score: ${readiness}/100 based on profile, submissions, and platform linkage.`);
  }
  return insights;
}

function buildPartnerExecutiveInsights(
  profileCompletion: number,
  artistCount: number,
  submissionIntel: AISubmissionIntelligence,
  readiness: number | null,
  verificationStatus: string,
): string[] {
  const insights: string[] = [];
  insights.push(`Organization profile ${profileCompletion}% complete · verification: ${verificationStatus}.`);
  insights.push(`${artistCount} active artist(s) in portfolio.`);
  insights.push(
    submissionIntel.totalCount === 0
      ? 'Submission pipeline empty — awaiting artist uploads.'
      : `Pipeline: ${submissionIntel.totalCount} total · ${submissionIntel.pendingCount} pending review · ${submissionIntel.approvedCount} approved.`,
  );
  if (readiness != null) {
    insights.push(`Organization readiness score: ${readiness}/100 from profile, portfolio, pipeline, and verification.`);
  }
  return insights;
}

function buildActivityFeed(
  scope: AIIntelligenceScope,
  submissions: MIMusicSubmissionRow[],
  recommendations: AIRecommendation[],
): AIActivityItem[] {
  const items: AIActivityItem[] = [];

  submissions.slice(0, 5).forEach((s) => {
    items.push({
      id: `sub-${s.id}`,
      type: 'submission',
      title: s.song_title,
      detail: `Status: ${s.status.replace(/_/g, ' ')} · quality ${scoreSubmissionQuality(s)}%`,
      timestamp: s.created_at,
    });
  });

  recommendations.slice(0, 3).forEach((r) => {
    items.push({
      id: `rec-${r.id}`,
      type: 'recommendation',
      title: r.title,
      detail: r.description,
      timestamp: new Date().toISOString(),
    });
  });

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, 8);
}

export function processArtistIntelligence(data: ArtistCollectedData): AIIntelligencePayload {
  const { profile, profileCompletion, hasLinkedArtist, submissions, dataAvailable } = data;
  const missingFields = detectMissingFields(profile, ARTIST_PROFILE_FIELDS);
  const submissionIntel = buildSubmissionIntelligence(submissions);
  const hasDspLinks = submissions.some((s) =>
    Object.values(s.dsp_links ?? {}).some((v) => v?.trim()),
  );
  const readiness = computeArtistReadiness(
    profileCompletion,
    submissionIntel.averageQualityScore,
    hasLinkedArtist,
    hasDspLinks,
  );

  const profileIntelligence: AIProfileIntelligence = {
    completionPercent: profileCompletion,
    missingFields,
    summary:
      missingFields.length === 0
        ? 'Profile fields required for intelligence are complete.'
        : `${missingFields.length} profile field(s) need attention.`,
  };

  const recommendations = buildArtistRecommendations(
    profile,
    missingFields,
    profileCompletion,
    submissions,
    submissionIntel.pendingCount,
  );

  const executiveInsights = buildArtistExecutiveInsights(
    profileCompletion,
    missingFields.length,
    submissionIntel,
    readiness,
  );

  const qualityIndicators = buildArtistQualityIndicators(profile, submissions, hasLinkedArtist);

  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: dataAvailable ? 'live' : 'fallback',
    systemStatus: {
      status: dataAvailable ? (submissions.length > 0 || profileCompletion > 0 ? 'active' : 'standby') : 'unavailable',
      label: dataAvailable ? 'AI Engine Active' : 'AI Engine Unavailable',
      detail: dataAvailable
        ? 'Analyzing production profile and submission records.'
        : 'Database unavailable — intelligence modules in fallback mode.',
    },
    readinessScore: readiness,
    readinessLabel: readiness == null ? 'Insufficient data' : readiness >= 85 ? 'Ready' : readiness >= 50 ? 'Developing' : 'Needs attention',
    profileIntelligence,
    submissionIntelligence: submissionIntel,
    qualityIndicators,
    recommendations,
    executiveInsights,
    platformHealth: null,
    aiActivity: buildActivityFeed('artist', submissions, recommendations),
  };
}

export function processPartnerIntelligence(data: PartnerCollectedData): AIIntelligencePayload {
  const { profile, profileCompletion, verificationStatus, artists, submissions, dataAvailable } = data;
  const missingFields = detectMissingFields(profile, PARTNER_PROFILE_FIELDS);
  const submissionIntel = buildSubmissionIntelligence(submissions);
  const activeArtists = artists.filter((a) => a.is_active !== false).length;
  const readiness = computePartnerReadiness(
    profileCompletion,
    activeArtists,
    submissions.length,
    verificationStatus,
  );

  const profileIntelligence: AIProfileIntelligence = {
    completionPercent: profileCompletion,
    missingFields,
    summary:
      missingFields.length === 0
        ? 'Organization profile meets intelligence baseline.'
        : `${missingFields.length} organization field(s) open.`,
  };

  const recommendations = buildPartnerRecommendations(
    missingFields,
    profileCompletion,
    activeArtists,
    submissionIntel.pendingCount,
    verificationStatus,
  );

  const executiveInsights = buildPartnerExecutiveInsights(
    profileCompletion,
    activeArtists,
    submissionIntel,
    readiness,
    verificationStatus,
  );

  const platformHealth = {
    score: readiness,
    summary:
      submissionIntel.pendingCount > 0
        ? `Review workload active — ${submissionIntel.pendingCount} submission(s) pending.`
        : activeArtists > 0
          ? 'Portfolio active with clear review queue.'
          : 'Organization health baseline — expand artist portfolio.',
    artistCount: activeArtists,
    reviewWorkload: submissionIntel.pendingCount,
    pipelineActive: submissions.length > 0,
  };

  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: dataAvailable ? 'live' : 'fallback',
    systemStatus: {
      status: dataAvailable ? (submissions.length > 0 || activeArtists > 0 ? 'active' : 'standby') : 'unavailable',
      label: dataAvailable ? 'AI Engine Active' : 'AI Engine Unavailable',
      detail: dataAvailable
        ? 'Analyzing hub artists, submissions, and organization records.'
        : 'Database unavailable — intelligence modules in fallback mode.',
    },
    readinessScore: readiness,
    readinessLabel:
      readiness == null ? 'Insufficient data' : readiness >= 85 ? 'Enterprise Ready' : readiness >= 50 ? 'Developing' : 'Needs attention',
    profileIntelligence,
    submissionIntelligence: submissionIntel,
    qualityIndicators: buildPartnerQualityIndicators(profile, activeArtists, submissions, verificationStatus),
    recommendations,
    executiveInsights,
    platformHealth,
    aiActivity: buildActivityFeed('partner', submissions, recommendations),
  };
}
