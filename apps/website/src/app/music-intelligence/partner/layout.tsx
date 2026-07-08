import type { Metadata } from 'next';
import PartnerWorkspaceShell from '@/components/music-intelligence/partner-workspace/PartnerWorkspaceShell';

export const metadata: Metadata = {
  title: 'Partner Command Center — AMD Music Intelligence',
  description: 'Enterprise workspace for organization management, artist roster, and submission review.',
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <PartnerWorkspaceShell>{children}</PartnerWorkspaceShell>;
}
