/**
 * Supabase Realtime Error Handler
 *
 * Suppresses noisy WebSocket connection errors in the browser console
 * while still allowing Supabase to handle reconnection automatically.
 */

/* eslint-disable no-console */
import { logger } from '@/lib/logger'

// Store original console.error
const originalConsoleError = console.error

/**
 * Initialize WebSocket error suppression
 * Call this once in your app initialization
 */
export function initRealtimeErrorSuppression() {
  if (typeof window === 'undefined') {
    return // Only run in browser
  }

  // Override console.error to filter out WebSocket errors
  console.error = (...args: unknown[]) => {
    // Check if this is a WebSocket error from Supabase
    const errorString = args.join(' ')
    
    // Suppress these specific errors:
    // 1. WebSocket connection failed
    // 2. WebSocket closed unexpectedly
    // 3. Realtime connection errors
    const shouldSuppress = 
      errorString.includes('WebSocket connection to') ||
      errorString.includes('websocket') ||
      errorString.includes('realtime') ||
      errorString.includes('supabase.co/realtime')

    if (!shouldSuppress) {
      // Pass through other errors normally
      logger.error({}, args.join(' '))
    }
    // Silently ignore WebSocket errors - Supabase handles reconnection
  }
}

/**
 * Restore original console.error
 * Useful for testing or debugging
 */
export function restoreConsoleError() {
  console.error = originalConsoleError
}
