// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'

interface EnvVarDiagnostics {
  exists: boolean
  length?: number
  startsWith?: boolean
  value?: string
}

interface DiagnosticsPayload {
  timestamp: string
  environment: Record<string, string | undefined>
  required_env_vars: Record<string, EnvVarDiagnostics>
  supabase_connectivity: 'unknown' | 'connected' | 'error' | 'missing_credentials' | 'connection_failed'
  deployment_status: 'checking' | 'operational'
}

type EnvKey =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'NEXT_PUBLIC_APP_DOMAIN'
  | 'SUPABASE_SERVICE_ROLE_KEY'

const ENV_RULES: Record<EnvKey, { startsWith?: string; includeValue?: boolean }> = {
  NEXT_PUBLIC_SUPABASE_URL: { startsWith: 'https://' },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { startsWith: 'ey' },
  NEXT_PUBLIC_APP_DOMAIN: { includeValue: true },
  SUPABASE_SERVICE_ROLE_KEY: {}
}

function buildEnvVarReport(): Record<string, EnvVarDiagnostics> {
  const report: Record<string, EnvVarDiagnostics> = {}
  const envKeys = Object.keys(ENV_RULES) as EnvKey[]

  envKeys.forEach((key) => {
    const value = process['env'][key]
    const diagnostics: EnvVarDiagnostics = { exists: Boolean(value) }

    if (value) {
      diagnostics.length = value.length
      if (ENV_RULES[key].startsWith) {
        diagnostics.startsWith = value.startsWith(ENV_RULES[key].startsWith as string)
      }
      if (ENV_RULES[key].includeValue) {
        diagnostics.value = value
      }
    }

    report[key] = diagnostics
  })

  return report
}

async function checkSupabaseConnectivity(): Promise<DiagnosticsPayload['supabase_connectivity']> {
  const url = process['env']['NEXT_PUBLIC_SUPABASE_URL']
  const anonKey = process['env']['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!url || !anonKey) {
    return 'missing_credentials'
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(url, anonKey)
    const { error } = await client.from('users').select('count').limit(1).single()
    return error ? 'error' : 'connected'
  } catch {
    return 'connection_failed'
  }
}

function buildDiagnosticsSkeleton(): DiagnosticsPayload {
  return {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process['env']['NODE_ENV'],
      VERCEL_ENV: process['env']['VERCEL_ENV'],
      VERCEL_URL: process['env']['VERCEL_URL'],
      VERCEL_REGION: process['env']['VERCEL_REGION'],
    },
    required_env_vars: buildEnvVarReport(),
    supabase_connectivity: 'unknown',
    deployment_status: 'checking',
  }
}

export async function GET(): Promise<NextResponse> {
  const diagnostics = buildDiagnosticsSkeleton()
  diagnostics.supabase_connectivity = await checkSupabaseConnectivity()
  diagnostics.deployment_status = 'operational'

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}
