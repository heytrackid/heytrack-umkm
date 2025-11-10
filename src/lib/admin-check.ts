import { createClient } from '@/utils/supabase/server'

import { apiLogger } from '@/lib/logger'

import type { User } from '@supabase/supabase-js'

export interface AdminCheckResult {
  isAdmin: boolean
  hasPermission: boolean
  userRole?: string
  error?: string
}

/**
 * Check if user is an admin by checking their role in the database
 */
export async function isAdminUser(userId: string): Promise<AdminCheckResult> {
  try {
    const supabase = await createClient()
    
    // Query the user profiles table to get user role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      apiLogger.error({ 
        error: error.message, 
        userId 
      }, 'Error fetching user profile for admin check')
      
      return {
        isAdmin: false,
        hasPermission: false,
        error: error.message
      }
    }

    const userRole = profile?.role?.toLowerCase()
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    
    return {
      isAdmin,
      hasPermission: isAdmin,
      userRole
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ 
      error: message, 
      userId 
    }, 'Exception in admin check')
    
    return {
      isAdmin: false,
      hasPermission: false,
      error: message
    }
  }
}

/**
 * Check if user has admin privileges, with fallback for development
 */
export function checkAdminPrivileges(user: User): Promise<AdminCheckResult> {
  // In development, allow all users to have admin privileges for testing
  if (process['env']?.NODE_ENV === 'development' && 
      process['env']?.['ADMIN_ALL_USERS'] === 'true') {
    return Promise.resolve({
      isAdmin: true,
      hasPermission: true,
      userRole: 'admin'
    })
  }

  return isAdminUser(user['id'])
}

/**
 * Higher-order function to create admin-only API handlers
 */
export function withAdminAuth(
  handler: (user: User) => Promise<Response>,
  errorMessage = 'Admin access required'
) {
  return async (): Promise<Response> => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const adminCheck = await checkAdminPrivileges(user)
      
      if (!adminCheck.hasPermission) {
        apiLogger.warn({ 
          userId: user['id'], 
          email: user.email 
        }, 'Unauthorized admin access attempt')
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return await handler(user)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      apiLogger.error({ error: message }, 'Error in admin auth wrapper')
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('user_id', userId)
      .single()
    
    if (profileError) {
      apiLogger.error({ 
        error: profileError.message, 
        userId,
        permission
      }, 'Error fetching user permissions')
      return false
    }

    // Check if user has the specific permission
    if (profile.permissions && Array.isArray(profile.permissions)) {
      return profile.permissions.includes(permission)
    }
    
    // Fallback: check if user is admin (admins have all permissions)
    return profile.role === 'admin' || profile.role === 'super_admin'
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error: message, userId, permission }, 'Exception checking permission')
    return false
  }
}
