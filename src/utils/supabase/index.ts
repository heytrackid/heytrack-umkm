import { createClient } from './client'


/**
 * Barrel export for Supabase utilities
 *
 * Usage:
 *   import { createClient, createServerClient } from '@/utils/supabase'
 *   import supabase from '@/utils/supabase' // Default client instance
 */

export { createClient } from './client'
// Server client functionality is only available in server contexts
// export { createClient as createServerClient } from './server' 
export { updateSession } from './middleware'

// Default export for backward compatibility - creates a client instance
export default createClient()
