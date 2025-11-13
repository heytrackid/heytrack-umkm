export const runtime = 'nodejs'

import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!user,
      session: session ? {
        access_token: session.access_token.substring(0, 20) + '...',
        refresh_token: session.refresh_token?.substring(0, 20) + '...',
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
      } : null,
      errors: {
        sessionError: sessionError?.message,
        userError: userError?.message,
      },
      cookies: {
        hasCookies: request.cookies.getAll().length > 0,
        cookieNames: request.cookies.getAll().map(c => c.name),
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
