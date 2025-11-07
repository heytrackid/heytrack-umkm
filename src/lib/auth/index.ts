/**
 * Authentication utilities and Supabase client management
 *
 * Usage:
 *   import { createClient, updateSession } from '@/lib/auth'
 */

/**
 * Barrel export for Supabase utilities
 *
 * Usage:
 *   import { createClient, createServerClient } from '@/lib/auth'
 */

export { createClient } from '@/utils/supabase/client'
// Server client functionality is only available in server contexts
// export { createClient as createServerClient } from '@/utils/supabase/server'
export { updateSession } from '@/utils/supabase/middleware'