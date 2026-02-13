import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

let supabase: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase server client (service role key — bypasses RLS).
 * Used for server-side operations where we verify the user ourselves.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Database features are disabled. Set them in .env to enable persistence.'
    );
  }

  supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabase;
}

/**
 * Check if Supabase is configured (env vars present).
 * Use this to gracefully fall back to localStorage when DB isn't set up.
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
