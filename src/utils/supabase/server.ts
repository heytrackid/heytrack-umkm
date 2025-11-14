import 'server-only'

import { getSupabaseJwt } from '@/lib/supabase-jwt'
import type { Database } from '@/types/database'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

/**
 * Create Supabase client for server-side usage with Stack Auth integration
 * Automatically injects JWT token for RLS authentication
 */
export async function createClient() {
  const cookieStore = await cookies()
  const token = await getSupabaseJwt()

   return createServerClient<Database>(
     supabaseUrl,
     supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  )
}
