'use client'

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

  if (!stackUser) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false
    }
  }

  return {
    user: {
      id: stackUser.id,
      email: stackUser.primaryEmail || null
    },
    isLoading: false,
    isAuthenticated: true
  }
}
