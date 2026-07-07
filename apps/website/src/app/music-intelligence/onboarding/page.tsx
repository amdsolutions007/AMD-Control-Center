import type { Metadata } from 'next';
import Link from 'next/link';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { OnboardingForm } from '@/components/music-intelligence/auth/AuthForms';
import { AuthMessage } from '@/components/music-intelligence/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Profile Setup — AMD Music Intelligence',
  description: 'Initialize your AMD Music Intelligence user profile and role.',
};

interface OnboardingPageProps {
  searchParams: Promise<{ complete?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const isComplete = params.complete === '1';

  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title={isComplete ? 'Profile Initialized' : 'Profile Setup'}
      description={
        isComplete
          ? 'Your AMD Music Intelligence profile is ready. Role-based dashboards and AI workflows will unlock in upcoming phases.'
          : 'Complete your profile to prepare role-based access control, secure sessions, and protected routes for your account.'
      }
      badge="User Profile"
    >
      {isComplete ? (
        <div className="mt-8 space-y-4">
          <AuthMessage type="success">
            Profile initialization complete. Your role and organization are saved to your secure session.
          </AuthMessage>
          <Link
            href="/sl/pYP56C"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#7c3aed] to-[#00E5FF] px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(0,229,255,0.35)]"
          >
            Return to Smart Link
          </Link>
        </div>
      ) : (
        <OnboardingForm />
      )}
    </MusicIntelligenceShell>
  );
}
