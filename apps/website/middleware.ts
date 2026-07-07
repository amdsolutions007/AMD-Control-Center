import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAuthConfig } from '@/lib/supabase/mi-auth-config';
import { updateMISession } from '@/lib/supabase/mi-middleware';
import { isValidRoleSlug } from '@/lib/music-intelligence/auth-roles';

const PROTECTED_PREFIXES = ['/music-intelligence/onboarding', '/music-intelligence/account'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  const sessionResponse = await updateMISession(request);

  if (!isProtected) return sessionResponse;

  const { url, anonKey, configured } = getSupabaseAuthConfig();
  if (!configured) {
    const redirect = NextResponse.redirect(new URL('/music-intelligence/sign-in', request.url));
    return redirect;
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL('/music-intelligence/sign-in', request.url);
    signIn.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signIn);
  }

  if (pathname.startsWith('/music-intelligence/account')) {
    const role = user.user_metadata?.role;
    const artistRole = typeof role === 'string' && isValidRoleSlug(role) && role === 'artist';
    const onboardingComplete = Boolean(user.user_metadata?.onboarding_complete);
    if (!artistRole || !onboardingComplete) {
      const onboarding = new URL('/music-intelligence/onboarding', request.url);
      return NextResponse.redirect(onboarding);
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    '/music-intelligence/onboarding/:path*',
    '/music-intelligence/account/:path*',
    '/music-intelligence/sign-in',
    '/music-intelligence/sign-up',
    '/music-intelligence/forgot-password',
    '/music-intelligence/reset-password',
    '/music-intelligence/verify-email',
  ],
};
