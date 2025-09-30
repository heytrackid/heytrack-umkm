'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types';

export function useSupabaseClien"": SupabaseClient<Database> {
  // const { session } = useSession() // Disabled for development

  return useMemo(() => {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          // Temporarily disabled Clerk token integration
          headers: {},
        },
        auth: {
          // Use normal Supabase auth during development
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )
  }, [])
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