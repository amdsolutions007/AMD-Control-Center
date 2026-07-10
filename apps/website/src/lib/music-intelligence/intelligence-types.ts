export type IntelligenceWidgetId =
  | 'total_artists'
  | 'total_partners'
  | 'total_organizations'
  | 'total_submissions'
  | 'pending_reviews'
  | 'approved_submissions'
  | 'active_campaigns'
  | 'connected_streaming_platforms'
  | 'ai_processing_status';

export type IntelligenceScope = 'artist' | 'partner';

export type IntelligenceAccent = 'artist' | 'partner' | 'neutral';

export interface IntelligenceWidgetMetric {
  id: IntelligenceWidgetId;
  icon: IntelligenceWidgetId;
  title: string;
  value: number | string;
  subtitle: string;
  emptyState: boolean;
  accent: IntelligenceAccent;
  ariaLabel: string;
}

export interface PlatformActivityItem {
  id: string;
  type: 'submission' | 'review' | 'profile';
  title: string;
  subtitle: string;
  status?: string;
  timestamp: string;
}

export interface IntelligenceDashboardPayload {
  scope: IntelligenceScope;
  generatedAt: string;
  widgets: IntelligenceWidgetMetric[];
  recentActivity: PlatformActivityItem[];
  dataSource: 'live' | 'fallback';
}
