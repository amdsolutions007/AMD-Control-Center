import type { Metadata } from 'next';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { VerifyEmailPanel } from '@/components/music-intelligence/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Verify Email — AMD Music Intelligence',
  description: 'Verify your email address to activate AMD Music Intelligence.',
};

export default function VerifyEmailPage() {
  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title="Verify Email"
      description="Email verification confirms your identity and activates secure sessions for AMD Music Intelligence workflows."
      badge="Email Verification"
    >
      <VerifyEmailPanel />
    </MusicIntelligenceShell>
  );
}
