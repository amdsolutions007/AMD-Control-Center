import type { Metadata } from 'next';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { ResetPasswordForm } from '@/components/music-intelligence/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Reset Password — AMD Music Intelligence',
  description: 'Set a new password for your AMD Music Intelligence account.',
};

export default function ResetPasswordPage() {
  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title="Reset Password"
      description="Choose a new password for your AMD Music Intelligence account. Use at least 8 characters."
      badge="Secure Update"
    >
      <ResetPasswordForm />
    </MusicIntelligenceShell>
  );
}
