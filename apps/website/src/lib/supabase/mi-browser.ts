import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseAuthConfig } from './mi-auth-config';

export function createMIAuthClient() {
  const { url, anonKey, configured } = getSupabaseAuthConfig();
  if (!configured) return null;
  return createBrowserClient(url, anonKey);
}
