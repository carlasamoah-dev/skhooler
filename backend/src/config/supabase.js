/**
 * @fileoverview Supabase client singleton configuration using service key.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Singleton Supabase admin client.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
