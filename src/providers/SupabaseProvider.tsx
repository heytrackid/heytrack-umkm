'use client'

import { type ReactNode, createContext, useContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

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
export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

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
  return context
}
