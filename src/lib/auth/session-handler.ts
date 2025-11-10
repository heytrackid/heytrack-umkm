import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('SessionHandler')

export async function handleSessionExpired(): Promise<void> {
  logger.warn('Session expired, clearing local data')
  
  // Clear all auth-related data from localStorage
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Redirect to login
    window.location.href = '/auth/login?session_expired=true'
  }
}

export function isSessionExpiredError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  return (
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized')
  )
}
