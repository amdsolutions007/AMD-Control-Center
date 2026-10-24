import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAuthConfig } from '@/lib/supabase/mi-auth-config';
import { updateMISession } from '@/lib/supabase/mi-middleware';
import { isValidRoleSlug } from '@/lib/music-intelligence/auth-roles';
import { isPartnerWorkspaceRole } from '@/lib/music-intelligence/partner-constants';

const MI_PROTECTED_PREFIXES = [
  '/music-intelligence/onboarding',
  '/music-intelligence/account',
  '/music-intelligence/partner',
];

const CLIENT_PORTAL_PROTECTED_PREFIXES = ['/client-portal/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMIProtected = MI_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isClientPortalProtected = CLIENT_PORTAL_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtected = isMIProtected || isClientPortalProtected;

  const sessionResponse = await updateMISession(request);

  if (!isProtected) return sessionResponse;

  const { url, anonKey, configured } = getSupabaseAuthConfig();
  if (!configured) {
    return NextResponse.redirect(
      new URL(isClientPortalProtected ? '/client-portal' : '/music-intelligence/sign-in', request.url),
    );
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          sessionResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL(
      isClientPortalProtected ? '/client-portal' : '/music-intelligence/sign-in',
      request.url,
    );
    if (!isClientPortalProtected) signIn.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signIn);
  }

  if (isClientPortalProtected) {
    return sessionResponse;
  }

  if (pathname.startsWith('/music-intelligence/account')) {
    const role = user.user_metadata?.role;
    const artistRole = typeof role === 'string' && isValidRoleSlug(role) && role === 'artist';
    const onboardingComplete = Boolean(user.user_metadata?.onboarding_complete);
    if (!artistRole || !onboardingComplete) {
      return NextResponse.redirect(new URL('/music-intelligence/onboarding', request.url));
    }
  }

  if (pathname.startsWith('/music-intelligence/partner')) {
    const role = user.user_metadata?.role;
    const partnerRole =
      typeof role === 'string' && isValidRoleSlug(role) && isPartnerWorkspaceRole(role);
    const onboardingComplete = Boolean(user.user_metadata?.onboarding_complete);
    if (!partnerRole || !onboardingComplete) {
      return NextResponse.redirect(new URL('/music-intelligence/onboarding', request.url));
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    '/client-portal/dashboard/:path*',
    '/music-intelligence/onboarding/:path*',
    '/music-intelligence/account/:path*',
    '/music-intelligence/partner/:path*',
    '/music-intelligence/sign-in',
    '/music-intelligence/sign-up',
    '/music-intelligence/forgot-password',
    '/music-intelligence/reset-password',
    '/music-intelligence/verify-email',
  ],
};
