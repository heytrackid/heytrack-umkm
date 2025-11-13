import { useCallback } from 'react'

import { getAuthErrorMessage, requiresSessionClear } from '@/lib/auth-errors'
import { handleSessionExpired } from '@/lib/auth/session-handler'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('useAuthErrorHandler')

/**
 * Hook for handling authentication errors consistently across the app
 */
export function useAuthErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    logger.error('Auth error occurred', { error, context })

    // Check if it's a refresh token error that requires session clearing
    if (requiresSessionClear(error)) {
      logger.warn('Session requires clearing due to auth error', { error, context })
      void handleSessionExpired()
      return {
        handled: true,
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        requiresLogin: true
      }
    }

    // Get user-friendly error message
    const message = getAuthErrorMessage(error as Error)

    return {
      handled: false,
      message,
      requiresLogin: false
    }
  }, [])

  return { handleError }
}
