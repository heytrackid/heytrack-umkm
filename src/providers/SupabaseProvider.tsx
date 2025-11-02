import { type ReactNode, createContext, useContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'

'use client'




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
const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient()

  return (
    <Context.Provider value={{ supabase: supabase as unknown as SupabaseClient<Database> }}>
      {children}
    </Context.Provider>
  )
}

export default SupabaseProvider

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
