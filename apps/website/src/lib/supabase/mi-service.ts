import { createClient } from '@supabase/supabase-js';
import { getSupabaseAuthConfig } from './mi-auth-config';

/** Server-only service role client for governed workspace operations */
export function createMIServiceClient() {
  const { url, configured } = getSupabaseAuthConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!configured || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
