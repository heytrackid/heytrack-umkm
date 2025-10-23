/**
 * Barrel export for Supabase utilities
 * 
 * Usage:
 *   import { createClient, createServerClient } from '@/utils/supabase'
 */

export { createClient } from './client'
export { createServerClient } from './server'
export { updateSession } from './middleware'
