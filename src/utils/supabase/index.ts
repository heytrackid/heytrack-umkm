/**
 * Barrel export for Supabase utilities
 *
 * Usage:
 *   import { createClient, createServerClient } from '@/utils/supabase/index'
 */

export { createClient } from './client'
// Server client functionality is only available in server contexts
// export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
