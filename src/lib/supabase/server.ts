import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../../types/database";
/**
 * Server-side Supabase client with Next.js cookie integration
 *
 * This is the authoritative client for all server-side usage:
 * - API routes (app/api/*)
 * - Server components
 * - Server actions
 *
 * Properly handles session management through Next.js cookies
 * and respects Row Level Security (RLS) policies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, environment variables might not be available
    // Return a mock client that will fail gracefully
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE === "phase-production-build"
    ) {
      console.warn(
        "Supabase environment variables not available during build. Using mock client.",
      );
      return null as unknown as ReturnType<typeof createServerClient<Database>>;
    }
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
    );
  }
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
/**
 * Administrative server client with service role key
 *
 * DANGER: This client bypasses Row Level Security (RLS)!
 * Only use for:
 * - Administrative operations
 * - Data seeding
 * - Operations that need to bypass RLS
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    // During build time, environment variables might not be available
    // Return a mock client that will fail gracefully
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE === "phase-production-build"
    ) {
      console.warn(
        "Supabase admin environment variables not available during build. Using mock client.",
      );
      return null as unknown as ReturnType<typeof createServerClient<Database>>;
    }
    throw new Error(
      "Missing Supabase admin environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.",
    );
  }
  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
