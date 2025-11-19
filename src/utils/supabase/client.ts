'use client'

import type { Database } from '@/types/database'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

/**
 * Create Supabase client for client-side usage
 * Note: Auth token injection happens via middleware/interceptors
 */
export function createClient(accessToken?: string | null) {
  const options: any = {}
  
  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, options)
}
