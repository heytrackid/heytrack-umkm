'use client'

import { useMemo } from 'react'
import { useUser } from '@stackframe/stack'

export interface User {
  id: string
  email: string | null
}

export interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * useAuth Hook - Stack Auth Integration
 * Wraps Stack Auth's useUser hook with our app's interface
 */
export function useAuth(): UseAuthReturn {
  const stackUser = useUser()
  const stackUserId = stackUser?.id ?? null
  const stackUserEmail = stackUser?.primaryEmail ?? null

  const authState = useMemo<UseAuthReturn>(() => {
    if (!stackUserId) {
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false
      }
    }

    return {
      user: {
        id: stackUserId,
        email: stackUserEmail
      },
      isLoading: false,
      isAuthenticated: true
    }
  }, [stackUserId, stackUserEmail])

  return authState
}
