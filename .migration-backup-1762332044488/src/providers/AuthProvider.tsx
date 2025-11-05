'use client'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import { createClient } from '@/utils/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    signOut: async () => {},
    refreshSession: async () => {}
  })
  
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session with error handling
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

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

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          authLogger.error({ error: userError }, 'User error:')
        }

        setAuthState(prev => ({
          ...prev,
          user: user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: !!user,
        }))
      } catch (error: unknown) {
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authLogger.info({ event }, 'Auth state changed')

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: !!session?.user,
        }))

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

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      }))
      void router.push('/auth/login')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      authLogger.error({ error: message }, 'Sign out error:')
    }
  }

  const refreshSession = async () => {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }
      
      setAuthState(prev => ({
        ...prev,
        session: session ?? null,
        user: session?.user ?? prev.user,
        isAuthenticated: !!session?.user,
      }))
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      authLogger.error({ error: message }, 'Session refresh error:')
    }
  }

  const value = {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signOut,
    refreshSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}