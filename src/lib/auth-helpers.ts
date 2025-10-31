import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Require authenticated user
 * Returns user or error response
 */
export async function requireAuth(): Promise<{
  error: NextResponse | null
  user: User | null
}> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null 
    }
  }
  
  return { error: null, user }
}

/**
 * Require admin role
 * Returns user or error response
 */
export async function requireAdmin(): Promise<{
  error: NextResponse | null
  user: User | null
}> {
  const supabase = await createClient()
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null 
    }
  }
  
  // Check admin role in user_profiles table
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  if (profileError || !profile) {
    // If profile doesn't exist or error, deny access
    return { 
      error: NextResponse.json({ error: 'Forbidden - Profile not found' }, { status: 403 }),
      user: null 
    }
  }
  
  if (profile.role !== 'admin') {
    return { 
      error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }),
      user: null 
    }
  }
  
  return { error: null, user }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<{
  error: NextResponse | null
  user: User | null
  hasRole: boolean
}> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
      hasRole: false
    }
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  const hasRequiredRole = profile?.role === requiredRole
  
  if (!hasRequiredRole) {
    return {
      error: NextResponse.json({ error: `Forbidden - ${requiredRole} access required` }, { status: 403 }),
      user: null,
      hasRole: false
    }
  }
  
  return { error: null, user, hasRole: true }
}
