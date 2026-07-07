import type { Metadata } from 'next';
import { Suspense } from 'react';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import SignInForm from '@/components/music-intelligence/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Sign In — AMD Music Intelligence',
  description: 'Secure sign in to AMD Music Intelligence.',
};

export default function SignInPage() {
  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title="Sign In"
      description="Access your AMD Music Intelligence account with secure email authentication. Role-based dashboards and AI workflows unlock after profile setup."
      badge="Secure Session"
    >
      <Suspense fallback={<p className="mt-8 text-gray-400 text-sm">Loading…</p>}>
        <SignInForm />
      </Suspense>
    </MusicIntelligenceShell>
  );
}
