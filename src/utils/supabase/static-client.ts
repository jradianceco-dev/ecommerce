/**
 * Server-Side Supabase Client for Static Generation
 * 
 * This client is used for static generation (sitemap, generateStaticParams)
 * where cookies are not available. It uses the service role key if needed
 * or just the anon key for public data.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for static generation
 * This client doesn't use cookies and is suitable for public data fetching
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
