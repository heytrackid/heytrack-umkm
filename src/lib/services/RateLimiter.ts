import { logger } from '@/lib/logger'


/**
 * Rate Limiter Service - Prevent API abuse
 */


interface RateLimitEntry {
  count: number
  resetAt: number
  violations: number // Track consecutive violations for progressive backoff
  lastViolation: number
}

export class RateLimiter {
  private static readonly limits = new Map<string, RateLimitEntry>()
  private static readonly CLEANUP_INTERVAL = 60 * 1000 // 1 minute
  private static cleanupTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Check if request is allowed with progressive backoff
   * @param key - Unique identifier (e.g., userId)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  static check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetAt) {
      // New window or expired - reset violations if it's been a while
      const resetViolations = entry && (now - entry.lastViolation) > windowMs * 2
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
        violations: resetViolations ? 0 : (entry?.violations ?? 0),
        lastViolation: entry?.lastViolation ?? 0,
      })
      this.scheduleCleanup()
      return true
    }

    if (entry.count >= maxRequests) {
      // Progressive backoff: increase violation count
      entry.violations = (entry.violations ?? 0) + 1
      entry.lastViolation = now

      logger.warn(
        { key, count: entry.count, maxRequests, violations: entry.violations },
        'Rate limit exceeded with progressive backoff'
      )
      return false
    }

    // Increment count
    entry.count++
    this.scheduleCleanup()
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
   * Get reset time for a key with progressive backoff
   */
  static getResetTime(key: string): number | null {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetAt) {
      return null
    }

    // Apply progressive backoff based on violation count
    const violations = entry.violations ?? 0
    const baseResetTime = entry.resetAt
    const backoffMultiplier = Math.min(violations + 1, 5) // Max 5x backoff

    return baseResetTime + (violations * 30 * 1000 * backoffMultiplier) // Additional seconds
  }

  /**
   * Get retry-after seconds for rate limited requests
   */
  static getRetryAfter(key: string): number {
    const resetTime = this.getResetTime(key)
    if (!resetTime) return 60 // Default 1 minute

    const now = Date.now()
    const secondsUntilReset = Math.ceil((resetTime - now) / 1000)
    return Math.max(1, secondsUntilReset)
  }

  /**
   * Reset rate limit for a key
   */
  static reset(key: string): void {
    this.limits.delete(key)
    if (this.limits.size === 0) {
      this.clearCleanupTimer()
    }
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

    if (this.limits.size === 0) {
      this.clearCleanupTimer()
    } else {
      this.scheduleCleanup()
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

  private static scheduleCleanup() {
    if (this.cleanupTimer || this.limits.size === 0 || typeof setTimeout === 'undefined') {
      return
    }

    this.cleanupTimer = setTimeout(() => {
      this.cleanupTimer = null
      this.cleanup()
    }, this.CLEANUP_INTERVAL)
  }

  private static clearCleanupTimer() {
    if (!this.cleanupTimer) {
      return
    }
    clearTimeout(this.cleanupTimer)
    this.cleanupTimer = null
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
  // Recipe Generation - 10 per minute per user
  RECIPE_GENERATION: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
} as const
