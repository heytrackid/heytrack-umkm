import { createClient } from '@/utils/supabase/server'


/**
 * Check if user has admin role
 * @param userId - User ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()
    
    if (error || !profile) {
      return false
    }
    
    return profile.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Check if user has specific role
 * @param userId - User ID to check
 * @param role - Role to check for
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()
    
    if (error || !profile) {
      return false
    }
    
    return profile.role === role
  } catch {
    return false
  }
}
