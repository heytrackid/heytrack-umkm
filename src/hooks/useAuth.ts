'use client'

import { createClient } from '@/utils/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { UserProfilesTable } from '@/types/database'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'



type _UserProfile = UserProfilesTable
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * Hook untuk manage Supabase auth session
 * @returns Current user, session, loading state
 * @example
 * const { user, isAuthenticated, isLoading } = useAuth()
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session with error handling
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          apiLogger.error({ error: sessionError }, 'Session error:')
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
          return
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          apiLogger.error({ error: userError }, 'User error:')
        }

        setAuthState({
          user: user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: !!user,
        })
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        apiLogger.error({ error: message }, 'Auth initialization error:')
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    void getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        apiLogger.info({ event }, 'Auth state changed')

        setAuthState({
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: !!session?.user,
        })

        // Refresh router on auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }

        // Handle session expiry - redirect to login with reason
        if (event === 'SIGNED_OUT' && !session) {
          void router.push('/auth/login?reason=session_expired')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  /**
   * Sign out current user and redirect to login
   */
  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      })
      void router.push('/auth/login')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Sign out error:')
    }
  }

  return {
    ...authState,
    signOut,
  }
}
