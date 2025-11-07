// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'


export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process['env']['NODE_ENV'],
      VERCEL_ENV: process['env']['VERCEL_ENV'],
      VERCEL_URL: process['env']['VERCEL_URL'],
      VERCEL_REGION: process['env']['VERCEL_REGION'],
    },
    required_env_vars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: Boolean(process['env']['NEXT_PUBLIC_SUPABASE_URL']),
        length: process['env']['NEXT_PUBLIC_SUPABASE_URL']?.length ?? 0,
        startsWith: process['env']['NEXT_PUBLIC_SUPABASE_URL']?.startsWith('https://') ?? false,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: Boolean(process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']),
        length: process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.length ?? 0,
        startsWith: process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? false,
      },
      NEXT_PUBLIC_APP_DOMAIN: {
        exists: Boolean(process['env']['NEXT_PUBLIC_APP_DOMAIN']),
        value: process['env']['NEXT_PUBLIC_APP_DOMAIN'],
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: Boolean(process['env']['SUPABASE_SERVICE_ROLE_KEY']),
        length: process['env']['SUPABASE_SERVICE_ROLE_KEY']?.length ?? 0,
      },
    },
    supabase_connectivity: 'unknown',
    deployment_status: 'checking',
  }

  // Test Supabase connectivity
  try {
    if (process['env']['NEXT_PUBLIC_SUPABASE_URL'] && process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(
        process['env']['NEXT_PUBLIC_SUPABASE_URL'],
        process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']
      )

      // Try a simple query to test connectivity
      const { error } = await client.from('users').select('count').limit(1).single()
      diagnostics.supabase_connectivity = error ? 'error' : 'connected'
    } else {
      diagnostics.supabase_connectivity = 'missing_credentials'
    }
  } catch (_error) {
    diagnostics.supabase_connectivity = 'connection_failed'
  }

  diagnostics.deployment_status = 'operational'

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}