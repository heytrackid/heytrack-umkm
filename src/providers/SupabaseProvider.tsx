'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

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
const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const logger = createClientLogger('SupabaseProvider')

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    const initializeClient = async () => {
      try {
        const client = await createClient()
        setSupabase(client as unknown as SupabaseClient<Database>)

        // Listen for auth state changes
        const { data } = client.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_OUT') {
            logger.info('User signed out, redirecting to login')
            router.push('/auth/login')
          } else if (event === 'TOKEN_REFRESHED') {
            logger.debug('Token refreshed successfully')
          }
        })

        subscription = data.subscription
      } catch (error) {
        logger.error({ error }, 'Failed to initialize Supabase client')
        setSupabase(null as any)
      } finally {
        setIsLoading(false)
      }
    }

    void initializeClient()

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router, logger])

  // Show loading state while client initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    )
  }

  // If client failed to initialize, provide null (components should handle this)
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500">Failed to initialize Supabase client</p>
        </div>
      </div>
    )
  }

  return (
    <Context.Provider value={{ supabase }}>
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
