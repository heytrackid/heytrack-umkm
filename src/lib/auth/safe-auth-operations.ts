import { requiresSessionClear } from '@/lib/auth-errors'
import { handleSessionExpired } from '@/lib/auth/session-handler'
import { createClientLogger } from '@/lib/client-logger'

import type { Session, SupabaseClient, User } from '@supabase/supabase-js'

const logger = createClientLogger('SafeAuthOperations')

/**
 * Safely get the current user with automatic error handling
 * Handles refresh token errors gracefully
 */
export async function safeGetUser(
  supabase: SupabaseClient
): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // Check if it's a refresh token error
      if (requiresSessionClear(error)) {
        logger.warn('Refresh token error detected in getUser', { error })
        
        // Only handle session expiry on client side
        if (typeof window !== 'undefined') {
          void handleSessionExpired()
        }
        
        return { user: null, error }
      }

      logger.error('Error getting user', { error })
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    
    // Check if it's a refresh token error
    if (requiresSessionClear(error)) {
      logger.warn('Refresh token error detected in getUser (catch)', { error })
      
      // Only handle session expiry on client side
      if (typeof window !== 'undefined') {
        void handleSessionExpired()
      }
    } else {
      logger.error('Unexpected error getting user', { error })
    }
    
    return { user: null, error: err }
  }
}

/**
 * Safely get the current session with automatic error handling
 * Handles refresh token errors gracefully
 */
export async function safeGetSession(
  supabase: SupabaseClient
): Promise<{ session: Session | null; error: Error | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      // Check if it's a refresh token error
      if (requiresSessionClear(error)) {
        logger.warn('Refresh token error detected in getSession', { error })
        
        // Only handle session expiry on client side
        if (typeof window !== 'undefined') {
          void handleSessionExpired()
        }
        
        return { session: null, error }
      }

      logger.error('Error getting session', { error })
      return { session: null, error }
    }

    return { session, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    
    // Check if it's a refresh token error
    if (requiresSessionClear(error)) {
      logger.warn('Refresh token error detected in getSession (catch)', { error })
      
      // Only handle session expiry on client side
      if (typeof window !== 'undefined') {
        void handleSessionExpired()
      }
    } else {
      logger.error('Unexpected error getting session', { error })
    }
    
    return { session: null, error: err }
  }
}

/**
 * Safely refresh the session with automatic error handling
 * Handles refresh token errors gracefully
 */
export async function safeRefreshSession(
  supabase: SupabaseClient
): Promise<{ session: Session | null; error: Error | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()

    if (error) {
      // Check if it's a refresh token error
      if (requiresSessionClear(error)) {
        logger.warn('Refresh token error detected in refreshSession', { error })
        
        // Only handle session expiry on client side
        if (typeof window !== 'undefined') {
          void handleSessionExpired()
        }
        
        return { session: null, error }
      }

      logger.error('Error refreshing session', { error })
      return { session: null, error }
    }

    return { session, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    
    // Check if it's a refresh token error
    if (requiresSessionClear(error)) {
      logger.warn('Refresh token error detected in refreshSession (catch)', { error })
      
      // Only handle session expiry on client side
      if (typeof window !== 'undefined') {
        void handleSessionExpired()
      }
    } else {
      logger.error('Unexpected error refreshing session', { error })
    }
    
    return { session: null, error: err }
  }
}
