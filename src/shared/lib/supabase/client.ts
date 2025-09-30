import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/config';
import type { Database } from '../database/types';

/**
 * Supabase client instance
 * Use this for all database operations
 */
export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'm2f-crm-web',
    },
  },
  db: {
    schema: 'public',
  },
});
