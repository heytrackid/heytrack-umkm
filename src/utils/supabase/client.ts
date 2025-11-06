import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClientLogger } from '@/lib/client-logger'

let browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return existing client if already created to prevent multiple instances
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const logger = createClientLogger('SupabaseClient')
    logger.error({
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    }, 'Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Please check your deployment configuration.')
  }

  browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}
