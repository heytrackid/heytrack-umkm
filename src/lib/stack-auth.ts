/**
 * Stack Auth Server Utilities
 * Helper functions for Stack Auth in API routes and server components
 */

import { stackServerApp } from '@/stack/server'
import { logger } from '@/lib/logger'

export interface StackUser {
  id: string
  email: string | null
}

/**
 * Get current user from Stack Auth (server-side)
 * Use in API routes and server components
 */
export async function getCurrentUser(): Promise<StackUser | null> {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.primaryEmail || null
    }
  } catch (error) {
    logger.error({ error }, 'Error getting current user')
    return null
  }
}

/**
 * Get user ID (server-side)
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Require authentication (server-side)
 * Throws error if user is not authenticated
 */
export async function requireAuth(): Promise<StackUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized - Authentication required')
  }
  
  return user
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
