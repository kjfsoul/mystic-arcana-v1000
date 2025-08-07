import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
/**
 * Server-side Supabase client with service role key
 *
 * IMPORTANT: This client has FULL database access and should ONLY be used:
 * - In API routes (app/api/*)
 * - In server components
 * - For administrative operations
 *
 * NEVER expose this client to the browser/client-side code!
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase server environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
}
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
