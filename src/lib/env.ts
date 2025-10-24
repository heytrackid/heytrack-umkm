import { validateEnvironment, EnvSchema, type EnvConfig } from '@/lib/validations'

// Validate environment variables at module load
let validatedEnv: EnvConfig

try {
  validatedEnv = validateEnvironment()
} catch (error) {
  console.error('❌ Environment validation failed. Please check your .env file.')
  console.error('Required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL (valid URL)')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY (required)')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (required)')
  console.error('  - At least one AI service: OPENAI_API_KEY or ANTHROPIC_API_KEY')
  throw error
}

// Export validated environment variables
export const env = validatedEnv

// Re-export types and validation functions
export { EnvSchema, type EnvConfig, validateEnvironment }
