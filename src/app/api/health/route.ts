// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'


export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process['env']['NEXT_PUBLIC_SUPABASE_URL']),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']),
      NEXT_PUBLIC_APP_DOMAIN: Boolean(process['env']['NEXT_PUBLIC_APP_DOMAIN']),
      NODE_ENV: process['env']['NODE_ENV'],
      VERCEL_ENV: process['env']['VERCEL_ENV'],
    }

    // Check if Supabase is accessible (basic connectivity test)
    let supabaseStatus = 'unknown'
    try {
      if (process['env']['NEXT_PUBLIC_SUPABASE_URL'] && process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
        // Try to create a client (this will fail if env vars are invalid)
        const { createClient } = await import('@supabase/supabase-js')
        createClient(
          process['env']['NEXT_PUBLIC_SUPABASE_URL'],
          process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']
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