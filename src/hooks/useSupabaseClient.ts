'use client'

import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'
import { useMemo } from 'react'
import type { Database } from '@/types/database'

export function useSupabaseClient() {
  const { session } = useSession()

  return useMemo(() => {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          // Pass Clerk session token to Supabase
          headers: async () => {
            const token = await session?.getToken()
            return token ? { Authorization: `Bearer ${token}` } : {}
          },
        },
        auth: {
          // Disable Supabase auth since we're using Clerk
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }, [session])
}

// For server-side usage
export function createSupabaseClientWithClerkToken(token?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token 
          ? { Authorization: `Bearer ${token}` }
          : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}