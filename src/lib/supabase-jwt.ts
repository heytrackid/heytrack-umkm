'use server'

/**
 * Supabase JWT Integration with Stack Auth
 * Mints Supabase JWT tokens using Stack Auth user ID for RLS
 */

import { stackServerApp } from '@/stack/server'
import * as jose from 'jose'

/**
 * Generate Supabase JWT token for authenticated Stack Auth user
 * This token is used for Supabase Row Level Security (RLS)
 * 
 * @returns JWT token string or null if user is not authenticated
 */
export async function getSupabaseJwt(): Promise<string | null> {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return null
    }

    const jwtSecret = process.env['SUPABASE_JWT_SECRET']
    if (!jwtSecret) {
      console.error('SUPABASE_JWT_SECRET is not set')
      return null
    }

    // Create JWT with Stack Auth user ID
    const token = await new jose.SignJWT({
      sub: user.id,
      role: 'authenticated',
      email: user.primaryEmail || undefined,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(jwtSecret))

    return token
  } catch (error) {
    console.error('Error generating Supabase JWT:', error)
    return null
  }
}

/**
 * Get user ID from Stack Auth for server-side usage
 * Use this in API routes to get the authenticated user ID
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const user = await stackServerApp.getUser()
    return user?.id || null
  } catch (error) {
    console.error('Error getting authenticated user ID:', error)
    return null
  }
}
