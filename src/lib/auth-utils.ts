import { redirect } from 'next/navigation'

import { handleAuthError } from '@/lib/auth-errors'

/**
 * Auth utilities for handling session management and errors
 */

/**
 * Clear authentication session and redirect to login
 */
export function clearAuthSession(redirectTo = '/auth/login'): void {
  // Clear local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {
      // Failed to clear browser storage
    }
  }

  // Redirect to login
  redirect(redirectTo)
}

/**
 * Handle Supabase auth errors with appropriate actions
 */
export function handleSupabaseAuthError(error: unknown): {
  message: string
  shouldClearSession: boolean
  shouldRedirect: boolean
} {
  return handleAuthError(error)
}

/**
 * Safe auth operation wrapper that handles refresh token errors
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const { shouldClearSession } = handleSupabaseAuthError(error)

    if (shouldClearSession) {
      clearAuthSession()
      return null
    }

    if (onError) {
      onError(error)
    }

    throw error
  }
}