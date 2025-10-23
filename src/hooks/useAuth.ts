'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

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

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      setAuthState({
        user: user || null,
        session: session || null,
        isLoading: false,
        isAuthenticated: !!user,
      })
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChanged(
      (event, session) => {
        setAuthState({
          user: session?.user || null,
          session: session || null,
          isLoading: false,
          isAuthenticated: !!session?.user,
        })
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  /**
   * Sign out current user
   */
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  return {
    ...authState,
    signOut,
  }
}
