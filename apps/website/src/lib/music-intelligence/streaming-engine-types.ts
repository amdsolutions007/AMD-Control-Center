import type { MIDspPlatformKey } from './constants';

export type StreamingEngineScope = 'artist' | 'partner';

export type DspConnectionStatus = 'connected' | 'pending' | 'disconnected';
export type SyncHealth = 'healthy' | 'stale' | 'never_synced' | 'api_pending';
export type MetricSource = 'platform_api' | 'smart_link_telemetry' | 'none';

export interface DspConnectorStatus {
  platformKey: MIDspPlatformKey;
  label: string;
  connectionStatus: DspConnectionStatus;
  apiIntegrationReady: boolean;
  supportsLiveMetrics: boolean;
  releaseUrl: string | null;
  platformId: string | null;
  lastSynchronization: string | null;
  synchronizationHealth: SyncHealth;
  summary: string;
}

export interface StreamingProfile {
  connectedPlatforms: MIDspPlatformKey[];
  pendingPlatforms: MIDspPlatformKey[];
  disconnectedPlatforms: MIDspPlatformKey[];
  platformIds: Partial<Record<MIDspPlatformKey, string>>;
  releaseIds: string[];
  connectionStatus: DspConnectionStatus;
  lastSynchronization: string | null;
  synchronizationHealth: SyncHealth;
  totalConnected: number;
  summary: string;
}

export interface StreamingMetric {
  key: string;
  label: string;
  value: number | null;
  available: boolean;
  source: MetricSource;
  unit: string;
  emptyStateMessage: string;
}

export interface StreamingMetricsBundle {
  metrics: StreamingMetric[];
  hasLivePlatformMetrics: boolean;
  hasTelemetryData: boolean;
  summary: string;
}

export interface PlatformPerformanceEntry {
  platformKey: MIDspPlatformKey;
  label: string;
  connectionStatus: DspConnectionStatus;
  redirectClicks: number | null;
  relativeShare: number | null;
  growthIndicator: 'up' | 'down' | 'stable' | 'unknown';
}

export interface PlatformComparison {
  entries: PlatformPerformanceEntry[];
  bestPerformingPlatform: MIDspPlatformKey | null;
  connectedCount: number;
  distributionSummary: string;
}

export interface PlaylistPerformanceItem {
  id: string;
  playlistName: string;
  platform: string;
  playlistType: 'editorial' | 'algorithmic' | 'user' | 'routing_candidate';
  position: number | null;
  dateAdded: string | null;
  estimatedImpact: 'high' | 'medium' | 'low' | 'pending';
  impactExplanation: string;
  derivedFrom: string;
}

export interface StreamingTimelineEvent {
  id: string;
  type:
    | 'platform_connected'
    | 'first_synchronization'
    | 'playlist_added'
    | 'growth_milestone'
    | 'synchronization'
    | 'redirect_click';
  label: string;
  timestamp: string;
  detail: string;
  platformKey?: MIDspPlatformKey;
}

export interface ExecutiveStreamingReport {
  bestPerformingPlatform: string | null;
  platformDistribution: string;
  streamingHealth: 'healthy' | 'developing' | 'needs_attention' | 'awaiting_data';
  connectionHealth: 'strong' | 'partial' | 'minimal' | 'none';
  recommendations: string[];
  summary: string;
}

export interface StreamingStatusPanel {
  connectedDsps: MIDspPlatformKey[];
  activeConnectors: number;
  pendingConnections: MIDspPlatformKey[];
  synchronizationStatus: SyncHealth;
  apiConnectorsReady: number;
  summary: string;
}

export interface StreamingEnginePortfolioSummary {
  totalSubmissions: number;
  connectedPlatforms: number;
  totalRedirectClicks: number | null;
  platformsWithTelemetry: number;
  summary: string;
}

export interface StreamingEnginePayload {
  scope: StreamingEngineScope;
  generatedAt: string;
  dataSource: 'live' | 'fallback';
  portfolioSummary: StreamingEnginePortfolioSummary;
  connectors: DspConnectorStatus[];
  streamingProfile: StreamingProfile;
  metrics: StreamingMetricsBundle;
  platformComparison: PlatformComparison;
  playlistPerformance: PlaylistPerformanceItem[];
  timeline: StreamingTimelineEvent[];
  executiveReport: ExecutiveStreamingReport;
  statusPanel: StreamingStatusPanel;
}
