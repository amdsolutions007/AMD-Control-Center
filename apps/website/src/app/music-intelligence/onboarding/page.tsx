import type { Metadata } from 'next';
import Link from 'next/link';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { OnboardingForm } from '@/components/music-intelligence/auth/AuthForms';
import { AuthMessage } from '@/components/music-intelligence/auth/AuthForm';
import { createMIAuthServerClient } from '@/lib/supabase/mi-server';
import { isValidRoleSlug } from '@/lib/music-intelligence/auth-roles';
import { getPostOnboardingPath, isPartnerWorkspaceRole } from '@/lib/music-intelligence/partner-constants';

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

  let workspaceLabel = 'Command Center';
  let workspaceHref = '/music-intelligence/account';
  let workspaceDescription =
    'Your AMD Music Intelligence profile is ready. Enter your workspace to continue.';

  const supabase = await createMIAuthServerClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (role && isValidRoleSlug(role)) {
      workspaceHref = getPostOnboardingPath(role);
      if (isPartnerWorkspaceRole(role)) {
        workspaceLabel = 'Partner Command Center';
        workspaceDescription =
          'Your enterprise profile is ready. Enter the Partner Command Center to manage your organization.';
      } else if (role === 'artist') {
        workspaceLabel = 'Artist Command Center';
        workspaceDescription =
          'Your artist profile is ready. Enter the Artist Command Center to manage your profile and submit music.';
      }
    }
  }

  return (
    <MusicIntelligenceShell
      eyebrow="Authentication & User Management"
      title={isComplete ? 'Profile Initialized' : 'Profile Setup'}
      description={
        isComplete
          ? workspaceDescription
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
            href={workspaceHref}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#7c3aed] to-[#00E5FF] px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(0,229,255,0.35)]"
          >
            Enter {workspaceLabel}
          </Link>
        </div>
      ) : (
        <OnboardingForm />
      )}
    </MusicIntelligenceShell>
  );
}
