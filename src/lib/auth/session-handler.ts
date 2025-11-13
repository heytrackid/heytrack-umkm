import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('SessionHandler')

export async function handleSessionExpired(): Promise<void> {
  logger.warn('Session expired, clearing local data and redirecting')

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

    // Clear session cookies by setting them to expire
    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Small delay to ensure cleanup is complete before redirect
    setTimeout(() => {
      window.location.href = '/auth/login?session_expired=true'
    }, 100)
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
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Refresh Token Not Found') ||
    errorMessage.includes('Invalid Refresh Token')
  )
}

export function isRefreshTokenError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  return (
    errorMessage.includes('Refresh Token Not Found') ||
    errorMessage.includes('Invalid Refresh Token') ||
    errorMessage.includes('refresh_token_not_found')
  )
}
