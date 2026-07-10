export type AIIntelligenceScope = 'artist' | 'partner';

export type AIRecommendationPriority = 'high' | 'medium' | 'low';

export type AIIndicatorStatus = 'complete' | 'partial' | 'missing';

export type AISystemStatusValue = 'active' | 'standby' | 'unavailable';

export interface AIRecommendation {
  id: string;
  priority: AIRecommendationPriority;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  derivedFrom: string;
}

export interface AIQualityIndicator {
  id: string;
  label: string;
  status: AIIndicatorStatus;
  detail: string;
}

export interface AIActivityItem {
  id: string;
  type: 'insight' | 'recommendation' | 'profile' | 'submission' | 'review';
  title: string;
  detail: string;
  timestamp: string;
}

export interface AIProfileIntelligence {
  completionPercent: number;
  missingFields: string[];
  summary: string;
}

export interface AISubmissionIntelligence {
  totalCount: number;
  averageQualityScore: number | null;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  summary: string;
}

export interface AIPlatformHealthSummary {
  score: number | null;
  summary: string;
  artistCount: number;
  reviewWorkload: number;
  pipelineActive: boolean;
}

export interface AISystemStatusModule {
  status: AISystemStatusValue;
  label: string;
  detail: string;
}

export interface AIIntelligencePayload {
  scope: AIIntelligenceScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  systemStatus: AISystemStatusModule;
  readinessScore: number | null;
  readinessLabel: string;
  profileIntelligence: AIProfileIntelligence;
  submissionIntelligence: AISubmissionIntelligence;
  qualityIndicators: AIQualityIndicator[];
  recommendations: AIRecommendation[];
  executiveInsights: string[];
  platformHealth: AIPlatformHealthSummary | null;
  aiActivity: AIActivityItem[];
}
