
/**
 * AI Security Module
 * Handles input sanitization, validation, and rate limiting
 */

export class AISecurity {
  /**
   * Sanitize user input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {return ''}

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim()
  }

  /**
   * Validate input for potential security issues
   */
  static validateInput(input: string): boolean {
    if (!input || typeof input !== 'string') {return false}

    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /Function\(/i,
      /setTimeout\(/i,
      /setInterval\(/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Rate limiting for AI requests
   */
  private static requestCounts = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const key = `ai_${identifier}`

    const requestData = this.requestCounts.get(key)

    if (!requestData || now > requestData.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (requestData.count >= maxRequests) {
      return false
    }

    requestData.count++
    return true
  }
}
