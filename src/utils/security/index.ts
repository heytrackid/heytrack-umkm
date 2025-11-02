

// Security Utilities
// Input sanitization, validation, and security helpers

// Input Sanitization (Basic client-safe version)
export class InputSanitizer {
  // Sanitize HTML input to prevent XSS (basic strip tags version)
  static sanitizeHtml(input: string): string {
    // Basic HTML sanitization without DOMPurify (client-safe)
    // For server-side with full DOMPurify, use @/utils/security/server
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .trim()
  }

  // Sanitize for rich text (limited HTML)
  static sanitizeRichText(input: string): string {
    // Basic rich text sanitization (client-safe)
    return InputSanitizer.sanitizeHtml(input)
  }

  // Sanitize SQL-like inputs (remove dangerous characters)
  static sanitizeSQLInput(input: string): string {
    return input
      .replace(/['"`;\\]/g, '') // Remove quotes and semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\b(OR|AND)\s+.*(?:=|>|<|LIKE)\s*['"][^'"]*['"]/gi, '') // Remove potential SQL injection patterns
      .replace(/DROP\s+|DELETE\s+|INSERT\s+|UPDATE\s+/gi, '') // Remove potential SQL commands
      .trim()
  }

  // Sanitize filename (prevent directory traversal)
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow safe characters
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.{2,}/g, '.') // Replace multiple dots
      .substring(0, 255) // Limit length
  }

  // Sanitize URL
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
      return parsed.toString()
    } catch {
      throw new Error('Invalid URL')
    }
  }

  // Sanitize email (basic validation)
  static sanitizeEmail(email: string): string {
    const clean = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clean)) {
      throw new Error('Invalid email format')
    }
    return clean
  }

  // Sanitize phone number (Indonesian format)
  static sanitizePhone(phone: string): string {
    const clean = phone.replace(/\D/g, '')
    // Indonesian phone number validation
    if (!/^(\+62|62|0)[8-9][0-9]{7,11}$/.test(clean)) {
      throw new Error('Invalid Indonesian phone number')
    }
    return clean
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, number[]>()

  static checkLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) ?? []

    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart)

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  static getRemainingRequests(identifier: string, maxRequests = 100): number {
    const requests = this.requests.get(identifier) ?? []
    return Math.max(0, maxRequests - requests.length)
  }

  // Clean up old entries (call this periodically)
  static cleanup(maxAge = 3600000): void { // 1 hour default
    const cutoff = Date.now() - maxAge
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > cutoff)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// Security Headers Helper
export class SecurityHeaders {
  static getDefaultHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  }

  // Deprecated: Use getStrictCSP from @/lib/csp instead
  // Kept for backward compatibility
  static getCSPHeader(isDev = false): string {
    // Deprecation warning shown in development only (console allowed for deprecation notices)
     
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('SecurityHeaders.getCSPHeader is deprecated. Use getStrictCSP from @/lib/csp instead.')
    }
    const policies = [
      "default-src 'self'",
      isDev 
        ? "script-src 'self' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com"
        : "script-src 'self' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com",
      "style-src 'self' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob: https://*.supabase.co",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://vitals.vercel-insights.com",
      "worker-src 'self' blob:",
      "media-src 'self' https://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "manifest-src 'self'",
      "prefetch-src 'self' https://*.supabase.co",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ]

    return policies.join('; ')
  }
}

// Password Security
export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// API Security
export class APISecurity {
  static validateAPIKey(apiKey: string): boolean {
    // Basic API key validation (you should implement proper validation)
    return !!(apiKey && apiKey.length > 20 && /^[a-zA-Z0-9_-]+$/.test(apiKey))
  }

  static sanitizeAPIInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // Apply multiple sanitization layers
      let sanitized = InputSanitizer.sanitizeHtml(input)
      sanitized = InputSanitizer.sanitizeSQLInput(sanitized)
      return sanitized
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeAPIInput(item))
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(input)) {
        // Sanitize both keys and values
        const sanitizedKey = typeof key === 'string' ? InputSanitizer.sanitizeSQLInput(key) : key
        sanitized[sanitizedKey] = this.sanitizeAPIInput(value)
      }
      return sanitized
    }

    return input
  }
  
  // Additional sanitization that can be applied to entire request bodies
  static sanitizeRequestBody<T>(body: T): T {
    return this.sanitizeAPIInput(body) as T
  }
  
  // Sanitize query parameters
  static sanitizeQueryParams(params: Record<string, string | string[]>): Record<string, string | string[]> {
    const sanitized: Record<string, string | string[]> = {}
    for (const [key, value] of Object.entries(params)) {
      const sanitizedKey = InputSanitizer.sanitizeSQLInput(key)
      if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(v => InputSanitizer.sanitizeHtml(v))
      } else {
        sanitized[sanitizedKey] = InputSanitizer.sanitizeHtml(value)
      }
    }
    return sanitized
  }
}

// Export the middleware functions
export { withSecurity, SecurityPresets } from './api-middleware'
