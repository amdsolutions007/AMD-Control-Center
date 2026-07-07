import type { Metadata } from 'next';
import { Suspense } from 'react';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { SignUpForm } from '@/components/music-intelligence/auth/AuthForms';

export const metadata: Metadata = {
  title: 'Sign Up — AMD Music Intelligence',
  description: 'Create your AMD Music Intelligence account and select your role.',
};

export default function SignUpPage() {
  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title="Create Account"
      description="Register with email to access AMD Music Intelligence. Select your role — Artist, Label, Distributor, Publisher, Manager, A&R, Brand Partner, Media, Fan, or Enterprise Partner."
      badge="Role-Based Access"
    >
      <Suspense fallback={<p className="mt-8 text-gray-400 text-sm">Loading…</p>}>
        <SignUpForm />
      </Suspense>
    </MusicIntelligenceShell>
  );
}
