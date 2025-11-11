import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database'

// src/utils/supabase/middleware.ts

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process['env']['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // DEVELOPMENT BYPASS: Only if explicitly enabled for development
  const ENABLE_DEV_BYPASS = process['env']['ENABLE_DEV_BYPASS'] === 'true'
  if (ENABLE_DEV_BYPASS && process.env.NODE_ENV === 'development') {
    return {
      user: {
        id: 'dev-user-123',
        email: 'dev@example.com',
        user_metadata: { name: 'Development User' }
      },
      response: supabaseResponse
    }
  }

  // Safely get user, handle missing session gracefully
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()

    // Only set user if we have valid data and no error
    if (data?.user && !error) {
      const { user: authUser } = data
      user = authUser
    }
  } catch {
    // AuthSessionMissingError is expected for unauthenticated users
    // Don't log as error, just continue with null user
    user = null
  }

  // Return both user and response for use in middleware
  return { user, response: supabaseResponse }
}
