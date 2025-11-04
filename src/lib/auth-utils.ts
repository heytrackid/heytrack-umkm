import { redirect } from 'next/navigation'
import { handleAuthError } from '@/lib/auth-errors'

/**
 * Auth utilities for handling session management and errors
 */

/**
 * Clear authentication session and redirect to login
 */
export function clearAuthSession(redirectTo: string = '/auth/login'): void {
  // Clear local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.warn('Failed to clear browser storage:', error)
    }
  }

  // Redirect to login
  redirect(redirectTo)
}

/**
 * Handle Supabase auth errors with appropriate actions
 */
export function handleSupabaseAuthError(error: any): {
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
  onError?: (error: any) => void
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const { shouldClearSession, message } = handleSupabaseAuthError(error)

    if (shouldClearSession) {
      console.warn('Auth session expired, clearing session:', message)
      clearAuthSession()
      return null
    }

    if (onError) {
      onError(error)
    } else {
      console.error('Auth operation failed:', error)
    }

    throw error
  }
}