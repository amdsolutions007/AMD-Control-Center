# Supabase Auth — Production URL Configuration

> **Project:** Client-Portal-007 · `pjoijeligrgttimkqftk`  
> **Production domain:** `https://www.amdsolutions007.com`  
> **Classification:** Production configuration only — no application code changes

---

## Problem

Authentication emails (confirmation, password reset, magic link) redirect to `http://localhost:3000` when Supabase **Site URL** is set to localhost.

---

## Required Supabase Dashboard Settings

**Dashboard:** https://supabase.com/dashboard/project/pjoijeligrgttimkqftk/auth/url-configuration

| Setting | Value |
|---|---|
| **Site URL** | `https://www.amdsolutions007.com` |
| **Redirect URLs** | See allow-list below |

### Redirect URL Allow List

```
https://www.amdsolutions007.com/**
https://www.amdsolutions007.com/music-intelligence/auth/callback
https://www.amdsolutions007.com/music-intelligence/auth/callback/**
https://www.amdsolutions007.com/music-intelligence/reset-password
https://www.amdsolutions007.com/music-intelligence/verify-email
https://www.amdsolutions007.com/music-intelligence/onboarding
http://localhost:3000/**
http://localhost:3000/music-intelligence/auth/callback
http://localhost:3000/music-intelligence/auth/callback/**
http://localhost:3000/music-intelligence/reset-password
```

---

## Required Vercel Environment Variable

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.amdsolutions007.com` | Production, Preview, Development |

---

## Automated Apply (Management API)

```bash
# 1. Create token: https://supabase.com/dashboard/account/tokens
# 2. Add to apps/website/.env.local:
#    SUPABASE_ACCESS_TOKEN=sbp_...

cd apps/website
node scripts/configure-supabase-auth-production.mjs
```

---

## Auth Flows Covered

| Flow | App redirect target | Supabase setting |
|---|---|---|
| Email confirmation (sign-up) | `/music-intelligence/auth/callback?next=/music-intelligence/verify-email` | Site URL + Redirect URLs |
| Email confirmation (resend) | `/music-intelligence/auth/callback?next=/music-intelligence/onboarding` | Site URL + Redirect URLs |
| Password reset | `/music-intelligence/reset-password` | Site URL + Redirect URLs |
| OAuth callback (future) | `/music-intelligence/auth/callback` | Redirect URLs |

---

## Verification Checklist

After applying configuration:

1. Sign up on production with a test email
2. Confirm email link host is `www.amdsolutions007.com` (not localhost)
3. Trigger forgot-password — reset link uses production domain
4. Resend verification — link uses production domain

**Status (2026-07-09):** Configuration verified via Supabase Management API. Digital CEO manually verified registration, email verification, and production redirect. Site URL and allow-list match production deployment.

---

*Configuration document · AMD Music Intelligence · Track C*
