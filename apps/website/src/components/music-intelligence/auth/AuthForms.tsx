'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createMIAuthClient } from '@/lib/supabase/mi-browser';
import { getSiteOrigin } from '@/lib/supabase/mi-auth-config';
import { isValidRoleSlug, type MIAuthRoleSlug } from '@/lib/music-intelligence/auth-roles';
import { getPostOnboardingPath } from '@/lib/music-intelligence/partner-constants';
import RoleSelector, { AuthField, AuthSubmitButton, AuthMessage } from '@/components/music-intelligence/auth/AuthForm';
import SocialAuthComingSoon, { AuthDivider, AuthFooterLinks } from '@/components/music-intelligence/auth/AuthShared';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/music-intelligence/onboarding';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createMIAuthClient();
    if (!supabase) {
      setError('Authentication service is not configured. Contact support.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField id="signin-email" label="Email Address" type="email" value={email} onChange={setEmail} required autoComplete="email" placeholder="you@example.com" />
        <AuthField id="signin-password" label="Password" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <AuthSubmitButton loading={loading}>Sign In</AuthSubmitButton>
      </form>
      <AuthDivider />
      <SocialAuthComingSoon />
      <AuthFooterLinks links={[
        { href: '/music-intelligence/forgot-password', label: 'Forgot password?' },
        { href: '/music-intelligence/sign-up', label: 'Create account' },
      ]} />
    </>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole: MIAuthRoleSlug = roleParam && isValidRoleSlug(roleParam) ? roleParam : 'fan';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<MIAuthRoleSlug>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createMIAuthClient();
    if (!supabase) {
      setError('Authentication service is not configured. Contact support.');
      return;
    }
    setLoading(true);
    const origin = getSiteOrigin();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/music-intelligence/auth/callback?next=/music-intelligence/verify-email`,
        data: { role, display_name: displayName, onboarding_complete: false },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSuccess(true);
    router.push('/music-intelligence/verify-email');
  }

  if (success) {
    return <AuthMessage type="success">Account created. Check your email to verify your address.</AuthMessage>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField id="signup-name" label="Display Name" value={displayName} onChange={setDisplayName} required autoComplete="name" placeholder="Your professional name" />
        <RoleSelector value={role} onChange={setRole} />
        <AuthField id="signup-email" label="Email Address" type="email" value={email} onChange={setEmail} required autoComplete="email" placeholder="you@example.com" />
        <AuthField id="signup-password" label="Password" type="password" value={password} onChange={setPassword} required autoComplete="new-password" placeholder="Minimum 8 characters" />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <AuthSubmitButton loading={loading}>Create Account</AuthSubmitButton>
      </form>
      <AuthDivider />
      <SocialAuthComingSoon />
      <AuthFooterLinks links={[{ href: '/music-intelligence/sign-in', label: 'Already have an account? Sign in' }]} />
    </>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createMIAuthClient();
    if (!supabase) {
      setError('Authentication service is not configured. Contact support.');
      return;
    }
    setLoading(true);
    const origin = getSiteOrigin();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/music-intelligence/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthMessage type="success">
        If an account exists for {email}, you will receive a password reset link shortly.
      </AuthMessage>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField id="forgot-email" label="Email Address" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <AuthSubmitButton loading={loading}>Send Reset Link</AuthSubmitButton>
      </form>
      <AuthFooterLinks links={[{ href: '/music-intelligence/sign-in', label: 'Back to sign in' }]} />
    </>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createMIAuthClient();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    setReady(true);
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const supabase = createMIAuthClient();
    if (!supabase) {
      setError('Authentication service is not configured.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push('/music-intelligence/sign-in');
  }

  return (
    <>
      {!ready && <AuthMessage type="info">Open the reset link from your email to set a new password.</AuthMessage>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <AuthField id="reset-password" label="New Password" type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
        <AuthField id="reset-confirm" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required autoComplete="new-password" />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <AuthSubmitButton loading={loading}>Update Password</AuthSubmitButton>
      </form>
      <AuthFooterLinks links={[{ href: '/music-intelligence/sign-in', label: 'Back to sign in' }]} />
    </>
  );
}

export function VerifyEmailPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    const supabase = createMIAuthClient();
    if (!supabase) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setMessage('Sign in or sign up first to resend verification.');
      setLoading(false);
      return;
    }
    const origin = getSiteOrigin();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${origin}/music-intelligence/auth/callback?next=/music-intelligence/onboarding` },
    });
    setLoading(false);
    setMessage(error ? error.message : 'Verification email sent. Check your inbox.');
  }

  return (
    <div className="mt-8 space-y-4">
      <AuthMessage type="info">
        We sent a verification link to your email. Click the link to activate your AMD Music Intelligence account.
      </AuthMessage>
      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="w-full rounded-full border border-[#D4AF37]/50 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#D4AF37] disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Resend Verification Email'}
      </button>
      {message && <AuthMessage type="success">{message}</AuthMessage>}
      <AuthFooterLinks links={[
        { href: '/music-intelligence/sign-in', label: 'Sign in' },
        { href: '/music-intelligence/onboarding', label: 'Continue to onboarding' },
      ]} />
    </div>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<MIAuthRoleSlug>('fan');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const supabase = createMIAuthClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? '');
        const meta = user.user_metadata ?? {};
        if (meta.display_name) setDisplayName(meta.display_name);
        if (meta.organization) setOrganization(meta.organization);
        if (meta.role && isValidRoleSlug(meta.role)) setRole(meta.role);
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createMIAuthClient();
    if (!supabase) {
      setError('Authentication service is not configured.');
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        role,
        display_name: displayName,
        organization,
        onboarding_complete: true,
      },
    });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(getPostOnboardingPath(role));
    router.refresh();
  }

  if (loading) {
    return <AuthMessage type="info">Loading your profile…</AuthMessage>;
  }

  return (
    <>
      <AuthMessage type="info">
        Initialize your AMD Music Intelligence profile{email ? ` for ${email}` : ''}. This prepares your role-based access for future dashboards and AI workflows.
      </AuthMessage>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <AuthField id="onboard-name" label="Display Name" value={displayName} onChange={setDisplayName} required autoComplete="name" />
        <AuthField id="onboard-org" label="Organization (Optional)" value={organization} onChange={setOrganization} autoComplete="organization" placeholder="Label, agency or company name" />
        <RoleSelector value={role} onChange={setRole} id="onboard-role" />
        {error && <AuthMessage type="error">{error}</AuthMessage>}
        <AuthSubmitButton loading={submitting}>Complete Profile Setup</AuthSubmitButton>
      </form>
    </>
  );
}
