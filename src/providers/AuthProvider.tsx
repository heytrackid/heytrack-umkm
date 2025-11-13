'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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

  useEffect(() => {

    // Get initial session with error handling
    const getSession = async (): Promise<void> => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          authLogger.error({ error: sessionError }, 'Session error')
          
          // Check if it's a refresh token error
          const errorMessage = sessionError.message || ''
          if (errorMessage.includes('Refresh Token Not Found') || errorMessage.includes('Invalid Refresh Token')) {
            authLogger.warn('Refresh token invalid, clearing session')
            // Clear session and redirect to login
            import('@/lib/auth/session-handler').then(m => m.handleSessionExpired())
          }
          
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
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        authLogger.error({ error: message }, 'Auth initialization error')
        
        // Check if it's a refresh token error
        if (typeof message === 'string' && (message.includes('Refresh Token Not Found') || message.includes('Invalid Refresh Token'))) {
          authLogger.warn('Refresh token invalid, clearing session')
          import('@/lib/auth/session-handler').then(m => m.handleSessionExpired())
        }
        
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authLogger.info({ event }, 'Auth state changed')

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: Boolean(session?.user),
        }))

        // Refresh router on auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }

        // Handle session expiry - redirect to login with reason
        if (event === 'SIGNED_OUT' && !session) {
          router.push('/auth/login?reason=session_expired')
        }
      }
    )

    return (): void => {
      subscription?.unsubscribe()
    }
  }, [router, supabase.auth])

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
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
  }, [router, supabase.auth])

  const refreshSession = useCallback(async (retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        authLogger.error({ error }, 'Session refresh error')

        // Check if it's a refresh token error
        const errorMessage = error.message || ''
        if (errorMessage.includes('Refresh Token Not Found') || errorMessage.includes('Invalid Refresh Token')) {
          authLogger.warn('Refresh token invalid, clearing session and redirecting')
          import('@/lib/auth/session-handler').then(m => m.handleSessionExpired())
          return
        }

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
      authLogger.error({ error: message }, 'Session refresh error')

      // Check if it's a refresh token error
      if (typeof message === 'string' && (message.includes('Refresh Token Not Found') || message.includes('Invalid Refresh Token'))) {
        authLogger.warn('Refresh token invalid, clearing session and redirecting')
        import('@/lib/auth/session-handler').then(m => m.handleSessionExpired())
        return
      }

      // For network errors, retry with exponential backoff (max 3 retries)
      if (typeof message === 'string' && (message.includes('network') || message.includes('fetch')) && retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Exponential backoff, max 10s
        authLogger.info(`Network error during refresh, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        setTimeout(() => {
          void refreshSession(retryCount + 1)
        }, delay)
        return
      }

      // For other errors or max retries reached, don't throw - just log
      if (retryCount >= MAX_RETRIES) {
        authLogger.warn('Max retry attempts reached for session refresh')
      }
    }
  }, [supabase.auth])

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
