'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import { useSupabase } from '@/providers/SupabaseProvider'

import type { Session, User } from '@supabase/supabase-js'

const authLogger = createClientLogger('Auth')

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    signOut: async () => {},
    refreshSession: async () => {}
  })

  const router = useRouter()
  const { supabase } = useSupabase()
  const supabaseRef = useRef(supabase)
  const authInitializedRef = useRef(false)

  // Keep supabase ref updated
  useEffect(() => {
    supabaseRef.current = supabase
  }, [supabase])

  useEffect(() => {
    if (authInitializedRef.current) return

    authInitializedRef.current = true
    let mounted = true

    if (!supabase) return

    let subscription: { unsubscribe: () => void } | null = null

    // Get initial session with error handling
    const getSession = async (): Promise<void> => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          authLogger.error({ error: sessionError }, 'Session error:')
          setAuthState(prev => ({
            ...prev,
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          }))
          return
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: Boolean(session?.user),
        }))

        // Only setup listener after initial session is loaded
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return

            // Don't log SIGNED_IN on initial load to avoid spam
            if (event !== 'INITIAL_SESSION') {
              authLogger.info({ event }, 'Auth state changed')
            }

            setAuthState(prev => ({
              ...prev,
              user: session?.user ?? null,
              session: session ?? null,
              isLoading: false,
              isAuthenticated: Boolean(session?.user),
            }))

            // Refresh router on auth changes (but not on initial session)
            if (event === 'SIGNED_OUT') {
              router.push('/auth/login?reason=session_expired')
            } else if (event === 'TOKEN_REFRESHED') {
              router.refresh()
            }
          }
        )

        subscription = data.subscription
      } catch (error: unknown) {
        if (!mounted) return
        const message = getErrorMessage(error)
        authLogger.error({ error: message }, 'Auth initialization error:')
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        }))
      }
    }

    void getSession()

    return (): void => {
      mounted = false
      subscription?.unsubscribe()
    }
    // router is stable from Next.js but included for exhaustive-deps
  }, [supabase, router])

  const signOut = useCallback(async (): Promise<void> => {
    const currentSupabase = supabaseRef.current
    if (!currentSupabase) return
    try {
      await currentSupabase.auth.signOut()
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      }))
      router.push('/auth/login')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      authLogger.error({ error: message }, 'Sign out error:')
    }
  }, [router])

  const refreshSession = useCallback(async (): Promise<void> => {
    const currentSupabase = supabaseRef.current
    if (!currentSupabase) return
    try {
      const { data: { session }, error } = await currentSupabase.auth.refreshSession()

      if (error) {
        throw error
      }

      setAuthState(prev => ({
        ...prev,
        session: session ?? null,
        user: session?.user ?? prev.user,
        isAuthenticated: Boolean(session?.user),
      }))
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      authLogger.error({ error: message }, 'Session refresh error:')
      // If refresh failed, clear session and redirect to login
      import('@/lib/auth/session-handler').then(m => m.handleSessionExpired())
    }
  }, [])

  const value = useMemo(() => ({
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signOut,
    refreshSession
  }), [authState.user, authState.session, authState.isLoading, authState.isAuthenticated, signOut, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
