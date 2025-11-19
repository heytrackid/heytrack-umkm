'use client'

import { type ReactNode, createContext, useContext, useState, useEffect } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@stackframe/stack'
import { getSupabaseToken } from '@/app/actions/auth'

import type { SupabaseClient } from '@supabase/supabase-js'

interface SupabaseContext {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

/**
 * Provider untuk Supabase client
 * Harus dibungkus di root layout atau parent component
 * @example
 * <SupabaseProvider>
 *   <App />
 * </SupabaseProvider>
 */
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser()
  const [supabase, setSupabase] = useState(() => {
    // Initialize client synchronously on first render only
    const logger = createClientLogger('SupabaseProvider')
    
    try {
      const client = createClient()
      logger.info('Supabase client initialized successfully')
      return client
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Supabase client')
      throw error
    }
  })

  useEffect(() => {
    const logger = createClientLogger('SupabaseProvider')
    
    async function syncAuth() {
      if (user) {
        try {
          // Get the special Supabase JWT (not the Stack access token directly)
          const token = await getSupabaseToken()
          
          if (token) {
            logger.info('Syncing Supabase client with authenticated user')
            const client = createClient(token)
            setSupabase(client)
          }
        } catch (error) {
          logger.error({ error }, 'Failed to sync Supabase auth')
        }
      } else {
        // Reset to anonymous client when not authenticated
        logger.info('Resetting Supabase client to anonymous')
        const client = createClient()
        setSupabase(client)
      }
    }

    syncAuth()
  }, [user])

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

 /**
 * Hook untuk mengakses Supabase client
 * @throws Error jika digunakan di luar SupabaseProvider
 * @example
 * const { supabase } = useSupabase()
 */
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return { supabase: context.supabase }
}
