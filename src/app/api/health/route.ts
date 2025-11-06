import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_DOMAIN: !!process.env.NEXT_PUBLIC_APP_DOMAIN,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    // Check if Supabase is accessible (basic connectivity test)
    let supabaseStatus = 'unknown'
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Try to create a client (this will fail if env vars are invalid)
        const { createClient } = await import('@supabase/supabase-js')
        const _client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        supabaseStatus = 'configured'
      } else {
        supabaseStatus = 'missing_env_vars'
      }
    } catch (_error) {
      supabaseStatus = 'error'
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      services: {
        supabase: supabaseStatus
      },
      version: '1.0.0'
    })
  } catch (_error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}