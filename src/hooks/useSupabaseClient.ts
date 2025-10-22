'use client'

import { useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types';

export function useSupabaseClient(): SupabaseClient<Database> {
  // const { session } = useSession() // Disabled for development

  return useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
    }

    return createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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