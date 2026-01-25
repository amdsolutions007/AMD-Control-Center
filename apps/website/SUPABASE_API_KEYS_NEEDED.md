# 🔐 Supabase API Keys - URGENT ACTION REQUIRED

## Status: ⚠️ INCOMPLETE CONFIGURATION

The Supabase client has been created and is ready, but **valid API keys** are needed to complete the connection.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### 1. Open Supabase Dashboard
Go to: **https://supabase.com/dashboard/project/pjoijeligrgttimkqftk/settings/api**

### 2. Copy Keys
You'll see two keys on that page:

#### A) **Project API keys** section:
- **anon / public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` but much longer)

### 3. Update .env.local
Open: `/apps/website/.env.local`

Find this section:
```bash
# Supabase Configuration - Client-Portal-007 (Live)
NEXT_PUBLIC_SUPABASE_URL=https://pjoijeligrgttimkqftk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_FULL_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_FULL_SERVICE_ROLE_KEY_HERE
```

Replace with:
```bash
# Supabase Configuration - Client-Portal-007 (Live)
NEXT_PUBLIC_SUPABASE_URL=https://pjoijeligrgttimkqftk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (paste full anon key - about 200+ chars)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (paste full service_role key - about 300+ chars)
```

### 4. Verify Connection
Run:
```bash
cd /Users/mac/Desktop/AMD_Control_Center/apps/website
node --env-file=.env.local test-supabase-connection.mjs
```

Expected output:
```
✅ Connection established
✅ portal_access table verified
✅ Ready for Phase 2
```

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **Don't copy partial keys** - Must be the FULL JWT token (200-300 chars)
2. **Don't add quotes** - Paste directly without `"` or `'` around the key
3. **Don't add spaces** - Keys should be one continuous string
4. **Check trailing spaces** - Make sure there's no whitespace after pasting

---

## 🔍 TROUBLESHOOTING

### Error: "Invalid API key"
**Fix**: You pasted an incomplete key or added extra characters. Re-copy from dashboard.

### Error: "relation does not exist"
**Fix**: Database schema not executed yet. Run:
```bash
# Open Supabase Dashboard → SQL Editor
# Paste contents of: apps/website/supabase-schema.sql
# Click "Run"
```

### Error: "Failed to fetch"
**Fix**: Check internet connection and verify project is not paused.

---

## 📞 QUICK REFERENCE

| Item | Value |
|------|-------|
| **Project Name** | Client-Portal-007 |
| **Project ID** | pjoijeligrgttimkqftk |
| **Project URL** | https://pjoijeligrgttimkqftk.supabase.co |
| **Dashboard** | https://supabase.com/dashboard/project/pjoijeligrgttimkqftk |
| **API Settings** | https://supabase.com/dashboard/project/pjoijeligrgttimkqftk/settings/api |

---

## ✅ ONCE COMPLETE

After updating keys and running the test successfully:
1. ✅ Database connection verified
2. ✅ Client Portal authentication working
3. ✅ Ready for **Phase 2: CI/CD Automation**

---

**Current Status:** 🟡 Awaiting API keys  
**Next Step:** Paste keys → Run test → Proceed to Phase 2
