'use server'

import { getSupabaseJwt } from '@/lib/supabase-jwt'

/**
 * Server Action to get the Supabase JWT for the current user.
 * This allows the client to authenticate with Supabase RLS using the Stack Auth identity.
 */
export async function getSupabaseToken() {
  return await getSupabaseJwt()
}
