'use client';

import { WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';
import IntelligenceDashboardSection from '@/components/music-intelligence/intelligence/IntelligenceDashboardSection';
import AIIntelligenceSection from '@/components/music-intelligence/ai-intelligence/AIIntelligenceSection';

export default function AnalyticsFoundationPanel() {
  return (
    <WorkspaceSection
      eyebrow="Analytics Foundation"
      title="Enterprise Intelligence"
      description="Live hub metrics and AI intelligence analysis from production database records."
    >
      <IntelligenceDashboardSection scope="partner" className="mt-8" />
      <AIIntelligenceSection scope="partner" />
    </WorkspaceSection>
  );
}
