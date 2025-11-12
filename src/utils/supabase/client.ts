import { createBrowserClient } from '@supabase/ssr'


/**
 * Creates Supabase client for browser/client-side use
 * Uses @supabase/ssr for proper cookie handling
 */
export function createClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      debug: false, // Disable verbose auth logs in development
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}
