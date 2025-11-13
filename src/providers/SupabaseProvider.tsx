'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'

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
  const [supabase] = useState<SupabaseClient<Database>>(() => {
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
