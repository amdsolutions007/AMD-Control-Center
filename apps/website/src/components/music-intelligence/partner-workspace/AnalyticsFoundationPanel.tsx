'use client';

import { WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';
import IntelligenceDashboardSection from '@/components/music-intelligence/intelligence/IntelligenceDashboardSection';
import AIIntelligenceSection from '@/components/music-intelligence/ai-intelligence/AIIntelligenceSection';
import MusicEngineSection from '@/components/music-intelligence/music-engine/MusicEngineSection';
import StreamingEngineSection from '@/components/music-intelligence/streaming-engine/StreamingEngineSection';
import AudienceEngineSection from '@/components/music-intelligence/audience-engine/AudienceEngineSection';
import MarketingEngineSection from '@/components/music-intelligence/marketing-engine/MarketingEngineSection';
import BusinessEngineSection from '@/components/music-intelligence/business-engine/BusinessEngineSection';
import AutomationEngineSection from '@/components/music-intelligence/automation-engine/AutomationEngineSection';
import EnterpriseEngineSection from '@/components/music-intelligence/enterprise-engine/EnterpriseEngineSection';
import GlobalEngineSection from '@/components/music-intelligence/global-engine/GlobalEngineSection';
import OperatingSystemSection from '@/components/music-intelligence/operating-system/OperatingSystemSection';

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
      <AudienceEngineSection scope="partner" />
      <MarketingEngineSection scope="partner" />
      <BusinessEngineSection scope="partner" />
      <AutomationEngineSection scope="partner" />
      <EnterpriseEngineSection scope="partner" />
      <GlobalEngineSection scope="partner" />
      <OperatingSystemSection scope="partner" />
    </WorkspaceSection>
  );
}
