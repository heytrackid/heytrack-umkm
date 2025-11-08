import { apiLogger } from '@/lib/logger'

/**
 * Environment Variables Validation
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_DOMAIN',
  'NODE_ENV'
] as const

const optionalEnvVars = [
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
  'VERCEL_ENV',
  'DATABASE_URL'
] as const

function validateEnv() {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  // Log optional vars status
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      apiLogger.warn(`Optional environment variable not set: ${envVar}`)
    }
  }

  apiLogger.info('✅ Environment variables validated successfully')
}

// Validate on module load
validateEnv()

export { validateEnv }