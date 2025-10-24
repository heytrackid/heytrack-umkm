import { validateEnvironment, EnvSchema, type EnvConfig } from '@/lib/validations'

import { apiLogger } from '@/lib/logger'
// Validate environment variables at module load
let validatedEnv: EnvConfig

try {
  validatedEnv = validateEnvironment()
} catch (error) {
  apiLogger.error({ error: '❌ Environment validation failed. Please check your .env file.' })
  apiLogger.error({ error: 'Required environment variables:' })
  apiLogger.error({ error: '  - NEXT_PUBLIC_SUPABASE_URL (valid URL)' })
  apiLogger.error({ error: '  - NEXT_PUBLIC_SUPABASE_ANON_KEY (required)' })
  apiLogger.error({ error: '  - SUPABASE_SERVICE_ROLE_KEY (required)' })
  apiLogger.error({ error: '  - At least one AI service: OPENAI_API_KEY or ANTHROPIC_API_KEY' })
  throw error
}

// Export validated environment variables
export const env = validatedEnv

// Re-export types and validation functions
export { EnvSchema, type EnvConfig, validateEnvironment }
