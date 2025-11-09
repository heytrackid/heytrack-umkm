import { createBrowserClient } from '@supabase/ssr'

import { createClientLogger } from '@/lib/client-logger'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export async function createClient() {
  // Return existing client if already created to prevent multiple instances
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process['env']['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    const logger = createClientLogger('SupabaseClient')
    logger.error({
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseAnonKey)
    }, 'Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Please check your deployment configuration.')
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined' || !document.cookie) {
          return []
        }
        return document.cookie
          .split(';')
          .map(cookie => {
            const trimmed = cookie.trim()
            const [rawName = '', ...rest] = trimmed.split('=')
            const name = rawName.trim()
            return { name, value: rest.join('=') }
          })
          .filter(({ name }) => name.length > 0)
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; ${options?.domain ? `domain=${options.domain}; ` : ''}${options?.path ? `path=${options.path}; ` : ''}${options?.expires ? `expires=${options.expires.toUTCString()}; ` : ''}${options?.httpOnly ? 'httpOnly; ' : ''}${options?.secure ? 'secure; ' : ''}${options?.sameSite ? `sameSite=${options.sameSite}; ` : ''}`
        })
      }
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })

  // Handle auth state changes
  browserClient.auth.onAuthStateChange((event) => {
    const logger = createClientLogger('SupabaseAuth')
    
    if (event === 'SIGNED_OUT') {
      logger.info({ event }, 'User signed out')
    } else if (event === 'TOKEN_REFRESHED') {
      logger.debug({ event }, 'Token refreshed successfully')
    } else if (event === 'SIGNED_IN') {
      logger.info({ event }, 'User signed in')
    }
  })

  return browserClient
}
