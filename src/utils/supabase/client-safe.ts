import { createClient } from '@/utils/supabase/client'


/**
 * Client-safe Supabase utilities that can be imported anywhere
 * Server-specific functionality is isolated and only executed server-side
 */


export { createClient }

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const

function validateServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient should only be called server-side')
  }

  const runtime = process['env']['NEXT_RUNTIME']
  if (runtime && runtime !== 'nodejs') {
    throw new Error(`createServerClient requires NEXT_RUNTIME to be "nodejs", received "${runtime}"`)
  }

  const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process['env'][key])
  if (missingEnv.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missingEnv.join(', ')}`)
  }
}

/**
 * Creates a server-side Supabase client
 * This function should only be called in server contexts
 */
export async function createServerClient() {
  validateServerEnvironment()

  // In server-side environments, use dynamic import with a trick to avoid bundler detection
  // Using a dynamic import function to make it harder for static analysis tools
  const serverModule = await ((() => {
    // Import path as a variable to avoid static analysis
    const serverPath = './server'
    return import(serverPath)
  })())
  
  return serverModule.createClient()
}

// Export server client only for server-side use
