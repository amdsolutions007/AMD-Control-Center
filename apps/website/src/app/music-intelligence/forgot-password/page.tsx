import type { Metadata } from 'next';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { ForgotPasswordForm } from '@/components/music-intelligence/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Forgot Password — AMD Music Intelligence',
  description: 'Reset your AMD Music Intelligence account password.',
};

export default function ForgotPasswordPage() {
  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title="Forgot Password"
      description="Enter the email associated with your account. We will send a secure link to reset your password."
      badge="Account Recovery"
    >
      <ForgotPasswordForm />
    </MusicIntelligenceShell>
  );
}
