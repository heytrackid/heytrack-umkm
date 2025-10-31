/**
 * Supabase Realtime Configuration
 * Handles realtime connection with proper error handling
 */

import { dbLogger } from '@/lib/logger'

/**
 * Check if realtime is available and properly configured
 */
export function isRealtimeAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false // Server-side
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    dbLogger.warn('Supabase URL not configured')
    return false
  }

  // Check if URL is valid
  try {
    const url = new URL(supabaseUrl)
    if (!url.protocol.startsWith('http')) {
      dbLogger.warn('Invalid Supabase URL protocol')
      return false
    }
  } catch (_error) {
    dbLogger.error({ error }, 'Invalid Supabase URL format')
    return false
  }

  // Check if WebSocket is supported
  if (typeof WebSocket === 'undefined') {
    dbLogger.warn('WebSocket not supported in this browser')
    return false
  }

  return true
}

/**
 * Get realtime configuration options
 */
export function getRealtimeConfig() {
  return {
    // Disable realtime if not available
    realtime: isRealtimeAvailable() ? {
      timeout: 10000, // 10 seconds
      heartbeatIntervalMs: 30000, // 30 seconds
    } : undefined,
  }
}

/**
 * Safe realtime subscription wrapper
 */
export function safeRealtimeSubscribe<T>(
  subscriptionFn: () => T,
  onError?: (error: unknown) => void
): T | null {
  if (!isRealtimeAvailable()) {
    dbLogger.info('Realtime not available, skipping subscription')
    return null
  }

  try {
    return subscriptionFn()
  } catch (_error) {
    dbLogger.error({ error }, 'Failed to create realtime subscription')
    onError?.(error)
    return null
  }
}
