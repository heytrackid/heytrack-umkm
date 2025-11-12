/**
 * Session debugging utilities
 * Use this to debug authentication and session issues
 */

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('SessionDebug')

export function logSessionState(context: string): void {
  if (typeof window === 'undefined') return
  
  // Get all cookies
  const cookies = document.cookie.split(';').map(c => c.trim())
  const supabaseCookies = cookies.filter(c => 
    c.startsWith('sb-') || 
    c.includes('auth-token') ||
    c.includes('supabase')
  )
  
  logger.info({
    context,
    totalCookies: cookies.length,
    supabaseCookies: supabaseCookies.length,
    cookieNames: supabaseCookies.map(c => c.split('=')[0]),
    timestamp: new Date().toISOString()
  }, 'Session state')
}

export function waitForSession(maxWaitMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const checkInterval = 100
    
    const checkSession = (): void => {
      const cookies = document.cookie
      const hasSupabaseCookie = cookies.includes('sb-') || cookies.includes('supabase')
      
      if (hasSupabaseCookie) {
        logger.info('Session cookies detected')
        resolve(true)
        return
      }
      
      const elapsed = Date.now() - startTime
      if (elapsed >= maxWaitMs) {
        logger.warn('Session cookies not detected after timeout')
        resolve(false)
        return
      }
      
      setTimeout(checkSession, checkInterval)
    }
    
    checkSession()
  })
}
