import type { Database } from '@/types/database'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type DatabaseNoRLS = Database

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!

/**
 * Create Supabase client with service role key (bypasses RLS)
 * Use with caution - only for admin operations
 */
export function createServiceRoleClient() {
  return createSupabaseClient<DatabaseNoRLS>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
