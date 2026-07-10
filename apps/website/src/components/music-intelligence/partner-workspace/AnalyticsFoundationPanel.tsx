'use client';

import { WorkspaceSection } from '@/components/music-intelligence/workspace/WorkspaceShared';
import IntelligenceDashboardSection from '@/components/music-intelligence/intelligence/IntelligenceDashboardSection';

export default function AnalyticsFoundationPanel() {
  return (
    <WorkspaceSection
      eyebrow="Analytics Foundation"
      title="Enterprise Intelligence"
      description="Live hub metrics from production database queries. Streaming performance pipelines activate in Phase 5."
    >
      <IntelligenceDashboardSection scope="partner" className="mt-8" />
    </WorkspaceSection>
  );
}
