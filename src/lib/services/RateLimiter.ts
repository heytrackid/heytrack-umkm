import { logger } from '@/lib/logger'


/**
 * Rate Limiter Service - Prevent API abuse
 */


interface RateLimitEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private static limits = new Map<string, RateLimitEntry>()
  private static readonly CLEANUP_INTERVAL = 60 * 1000 // 1 minute

  static {
    // Cleanup expired entries periodically
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.cleanup()
      }, this.CLEANUP_INTERVAL)
    }
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (e.g., userId)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  static check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetAt) {
      // New window or expired
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      })
      return true
    }

    if (entry.count >= maxRequests) {
      logger.warn(
        { key, count: entry.count, maxRequests },
        'Rate limit exceeded'
      )
      return false
    }

    // Increment count
    entry.count++
    return true
  }

  /**
   * Get remaining requests for a key
   */
  static getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetAt) {
      return maxRequests
    }
    return Math.max(0, maxRequests - entry.count)
  }

  /**
   * Get reset time for a key
   */
  static getResetTime(key: string): number | null {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetAt) {
      return null
    }
    return entry.resetAt
  }

  /**
   * Reset rate limit for a key
   */
  static reset(key: string): void {
    this.limits.delete(key)
  }

  /**
   * Cleanup expired entries
   */
  private static cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.debug({ cleaned }, 'Rate limiter cleanup completed')
    }
  }

  /**
   * Get current stats
   */
  static getStats(): {
    totalKeys: number
    activeKeys: number
  } {
    const now = Date.now()
    let activeKeys = 0

    for (const entry of this.limits.values()) {
      if (now <= entry.resetAt) {
        activeKeys++
      }
    }

    return {
      totalKeys: this.limits.size,
      activeKeys,
    }
  }
}

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // AI Chat - 20 messages per minute per user
  AI_CHAT: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  // AI Chat - 100 messages per hour per user
  AI_CHAT_HOURLY: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Session creation - 10 per hour per user
  SESSION_CREATE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const
