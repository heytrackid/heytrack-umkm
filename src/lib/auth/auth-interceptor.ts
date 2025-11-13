import { requiresSessionClear } from '@/lib/auth-errors'
import { handleSessionExpired } from '@/lib/auth/session-handler'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('AuthInterceptor')

/**
 * Global error interceptor for authentication errors
 * Catches refresh token errors and handles them appropriately
 */
export function setupAuthInterceptor(): void {
  if (typeof window === 'undefined') return

  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason

    // Check if it's an auth error that requires session clearing
    if (requiresSessionClear(error)) {
      logger.warn('Unhandled auth error detected, clearing session', { error })
      event.preventDefault() // Prevent default error handling
      void handleSessionExpired()
    }
  })

  // Intercept global errors
  window.addEventListener('error', (event) => {
    const error = event.error

    // Check if it's an auth error that requires session clearing
    if (requiresSessionClear(error)) {
      logger.warn('Global auth error detected, clearing session', { error })
      event.preventDefault() // Prevent default error handling
      void handleSessionExpired()
    }
  })
}

/**
 * Wrap async operations with auth error handling
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    onError?: (error: unknown) => void
    suppressRedirect?: boolean
  }
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    logger.error('Operation failed with error', { error })

    // Check if it's an auth error that requires session clearing
    if (requiresSessionClear(error)) {
      logger.warn('Auth error requires session clear', { error })
      
      if (!options?.suppressRedirect) {
        void handleSessionExpired()
      }
      
      if (options?.onError) {
        options.onError(error)
      }
      
      return null
    }

    // Re-throw non-auth errors
    throw error
  }
}
