# Supabase Setup Guide for AMD Solutions 007

## Prerequisites
- Supabase account (free tier works)
- Project created at https://app.supabase.com

## Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: `amd-control-center`
4. Database Password: (save this securely)
5. Region: Choose closest to Nigeria (eu-west-1 or eu-central-1)
6. Click "Create Project" (takes ~2 minutes)

## Step 2: Execute Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify tables created: `clients`, `chat_logs`, `automation_runs`, `portal_access`

## Step 3: Get API Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key (keep secret!)

## Step 4: Update Environment Variables
Edit `/apps/website/.env.local`:

```bash
# Replace these with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Verify Connection
Run the test script:

```bash
cd /Users/mac/Desktop/AMD_Control_Center/apps/website
npm run dev
```

Open browser:
- Visit: http://localhost:3000/client-portal
- Enter access ID: `AMD-007-VIP`
- Should authenticate successfully (fallback + Supabase)

## Step 6: Test Database Operations

### Test Client Portal Form
1. Go to client portal login
2. Submit a test inquiry
3. Check Supabase Dashboard → Table Editor → `clients`
4. Should see new row

### Test Chat Widget
1. Open any page with ChatWidget
2. Send a test message
3. Check `chat_logs` table
4. Should see logged conversation

## Database Tables Overview

### `clients`
- **Purpose**: Store client inquiries from portal
- **Public Access**: Anyone can insert (form submissions)
- **Admin Access**: Only authenticated users can read

### `chat_logs`
- **Purpose**: Log ChatWidget conversations
- **Retention**: Keep for analytics/training
- **Privacy**: IP addresses hashed

### `automation_runs`
- **Purpose**: Track social engine posts
- **Integration**: Python scripts will log here via API
- **Analytics**: View posting success rates

### `portal_access`
- **Purpose**: Whitelist clients for dashboard
- **Security**: RLS enabled, public can only check existence
- **Default**: `AMD-007-VIP` access already inserted

## Security Checklist
- ✅ RLS (Row Level Security) enabled on all tables
- ✅ Anonymous users can only INSERT (no reads)
- ✅ Service role key never exposed in frontend
- ✅ API keys stored in `.env.local` (gitignored)
- ✅ HTTPS enforced by default

## Next Steps (Phase 2)
1. Create admin dashboard to view `clients` table
2. Add analytics charts (daily_automation_stats view)
3. Implement real-time notifications (Supabase Realtime)
4. Connect Python automation scripts to log runs
5. Add file uploads (Supabase Storage) for proposals

## Troubleshooting

### Error: "Missing Supabase environment variables"
**Fix**: Ensure `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL and KEY

### Error: "relation 'clients' does not exist"
**Fix**: Run `supabase-schema.sql` in SQL Editor

### Error: "new row violates row-level security policy"
**Fix**: Check RLS policies - anonymous users should be able to INSERT

### Portal login fails with Supabase
**Fix**: 
1. Check `portal_access` table has `AMD-007-VIP` row
2. Verify `access_id` column matches exactly (case-sensitive)

## Support
If issues persist:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify network: `curl https://your-project.supabase.co/rest/v1/`
3. Test with Postman: Insert test row via REST API

---
**Status**: ✅ Ready for Phase 1 Testing  
**Next**: Connect Python automation scripts (Phase 2)
