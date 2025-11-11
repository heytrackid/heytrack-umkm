import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

import { createClientLogger } from '@/lib/client-logger'
import type { Database } from '@/types/database'

let browserClient: SupabaseClient<Database> | null = null

/**
 * Creates or returns existing Supabase client (singleton pattern)
 * MUST be synchronous to prevent render loops
 */
export function createClient(): SupabaseClient<Database> {
  // Return existing client immediately if already created
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process['env']['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    const logger = createClientLogger('SupabaseClient')
    logger.error({
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseAnonKey)
    }, 'Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Please check your deployment configuration.')
  }

  // Create singleton instance
  browserClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })

  return browserClient
}
