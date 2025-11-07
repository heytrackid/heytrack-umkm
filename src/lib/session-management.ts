import { createClient } from '@/utils/supabase/server'

import { apiLogger } from '@/lib/logger'

import type { User } from '@supabase/supabase-js'

export interface SessionInfo {
  user: User | null
  isAuthenticated: boolean
  sessionId?: string
  role?: string
  permissions?: string[]
  expiresAt?: Date
}

/**
 * Get current session information
 */
export async function getCurrentSession(): Promise<SessionInfo> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        user: null,
        isAuthenticated: false
      }
    }

    // Get user profile to fetch role and permissions
    let role: string | undefined
    let permissions: string[] | undefined

    if (session.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, permissions')
        .eq('user_id', session.user['id'])
        .single()

      if (profileError) {
        apiLogger.warn({ 
          error: profileError.message, 
          userId: session.user['id'] 
        }, 'Could not fetch user profile')
      } else {
        role = profile?.role ?? undefined
        permissions = profile?.permissions ?? []
      }
    }

    return {
      user: session.user,
      isAuthenticated: true,
      sessionId: session.access_token,
      role,
      permissions,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message }, 'Error getting current session')
    
    return {
      user: null,
      isAuthenticated: false
    }
  }
}

/**
 * Refresh the current session
 */
export async function refreshCurrentSession() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message }, 'Error refreshing session')
    throw new Error(message)
  }
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export async function isSessionExpiringSoon(): Promise<boolean> {
  try {
    const sessionInfo = await getCurrentSession()
    
    if (!sessionInfo.expiresAt) {
      return false
    }

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes in milliseconds
    return sessionInfo.expiresAt < fiveMinutesFromNow
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message }, 'Error checking session expiration')
    return false
  }
}

/**
 * Get user permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      apiLogger.error({ 
        error: error.message, 
        userId 
      }, 'Error fetching user permissions')
      return []
    }
    
    return profile?.permissions ?? []
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message, userId }, 'Exception getting user permissions')
    return []
  }
}

/**
 * Check if user has specific permission
 */
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permission) || permissions.includes('admin')
}

/**
 * Create a custom session cookie
 */
export async function createCustomSession(userId: string, expiresInHours = 24) {
  try {
    const supabase = await createClient()
    
    // This is a simplified approach - in practice, you'd want to use 
    // Supabase's built-in session management
    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data.user) {
      throw new Error('User not authenticated')
    }
    
    if (data.user['id'] !== userId) {
      apiLogger.warn({
        requestedUserId: userId,
        actualUserId: data.user['id']
      }, 'User mismatch detected while creating custom session')
    }

    // Return session info
    return {
      userId: data.user['id'],
      email: data.user.email,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message }, 'Error creating custom session')
    throw new Error(message)
  }
}

/**
 * Validate session and return user info
 */
export async function validateSession(): Promise<{ valid: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data.user) {
      return { valid: false, error: error?.message ?? 'No user session' }
    }
    
    return { valid: true, user: data.user }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { valid: false, error: message }
  }
}
