import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/types/supabase-generated'

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const

function validateServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase server client should only be created on the server')
  }

  const runtime = process.env['NEXT_RUNTIME']
  if (runtime && runtime !== 'nodejs') {
    throw new Error(`Supabase server client requires NEXT_RUNTIME to be "nodejs", received "${runtime}"`)
  }

  const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missingEnv.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missingEnv.join(', ')}`)
  }
}

export async function createClient() {
  validateServerEnvironment()

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
