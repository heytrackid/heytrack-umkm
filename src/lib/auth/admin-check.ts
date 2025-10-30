/**
 * Admin Role Check Utilities
 * Helper functions to check if user has admin privileges
 */

import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'

type UserRole = Database['public']['Enums']['user_role']

const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin']
const MANAGER_ROLES: UserRole[] = ['super_admin', 'admin', 'manager']

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return ADMIN_ROLES.includes(data.role as UserRole)
}

/**
 * Check if user has manager role or higher
 */
export async function isManager(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return MANAGER_ROLES.includes(data.role as UserRole)
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data.role as UserRole
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const userRole = await getUserRole(userId)
  return userRole === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
  const userRole = await getUserRole(userId)
  if (!userRole) return false
  return roles.includes(userRole)
}
