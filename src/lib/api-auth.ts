/**
 * API Authentication Helpers
 * 
 * Helper functions for authenticating API requests using Stack Auth
 */

import { apiLogger } from '@/lib/logger'
import { stackServerApp } from '@/stack/server'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email: string | null
  displayName: string | null
}

/**
 * Get authenticated user from Stack Auth
 * Returns user object or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.primaryEmail ?? null,
      displayName: user.displayName ?? null
    }
  } catch (error) {
    apiLogger.error({ error }, 'Failed to get authenticated user')
    return null
  }
}

/**
 * Require authentication for API route
 * Returns user object or 401 response
 */
export async function requireAuth(): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    )
  }
  
  return user
}

/**
 * Check if response is an error response (for type narrowing)
 */
export function isErrorResponse(value: AuthenticatedUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}
