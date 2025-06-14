'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../types/database';

/**
 * Browser/Client-side Supabase client
 * 
 * This is the authoritative client for all client-side usage:
 * - React components
 * - Client-side hooks 
 * - Browser-based auth operations
 * 
 * Uses NEXT_PUBLIC_ environment variables and handles session management
 * automatically in the browser.
 */

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  
  return client;
}

// Export a singleton instance for convenience
export const supabase = createClient();