// Test endpoint to verify auth status
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient<Database>(
      process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for test endpoint
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    const supabaseCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))

    return NextResponse.json({
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null,
      session: session ? {
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing',
        expires_at: session.expires_at
      } : null,
      error: error?.message,
      cookies: supabaseCookies.map(c => ({
        name: c.name,
        value: c.value.substring(0, 20) + '...',
        hasValue: !!c.value
      })),
      allCookiesCount: request.cookies.getAll().length
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Auth test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}