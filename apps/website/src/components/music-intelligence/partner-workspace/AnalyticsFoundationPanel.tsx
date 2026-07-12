'use client';

import { WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';
import IntelligenceDashboardSection from '@/components/music-intelligence/intelligence/IntelligenceDashboardSection';
import AIIntelligenceSection from '@/components/music-intelligence/ai-intelligence/AIIntelligenceSection';
import MusicEngineSection from '@/components/music-intelligence/music-engine/MusicEngineSection';
import StreamingEngineSection from '@/components/music-intelligence/streaming-engine/StreamingEngineSection';

export default function AnalyticsFoundationPanel() {
  return (
    <WorkspaceSection
      eyebrow="Analytics Foundation"
      title="Enterprise Intelligence"
      description="Live hub metrics and AI intelligence analysis from production database records."
    >
      <IntelligenceDashboardSection scope="partner" className="mt-8" />
      <AIIntelligenceSection scope="partner" />
      <MusicEngineSection scope="partner" />
      <StreamingEngineSection scope="partner" />
    </WorkspaceSection>
  );
}
