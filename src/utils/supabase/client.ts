'use client'

import type { Database } from '@/types/database'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

/**
 * Create Supabase client for client-side usage with Stack Auth integration
 * Automatically injects JWT token for RLS authentication
 */
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          // Headers will be set dynamically via auth state changes
        }
      }
    }
  )
}
