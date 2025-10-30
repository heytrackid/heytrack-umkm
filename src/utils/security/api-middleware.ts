import { NextRequest, NextResponse } from 'next/server'
import { APISecurity } from './index'
import { apiLogger } from '@/lib/logger'

/**
 * API Security Middleware
 * Enhances API routes with additional security validation and sanitization
 */

export interface SecurityConfig {
  // Sanitization options
  sanitizeInputs?: boolean
  sanitizeQueryParams?: boolean
  // Validation options
  validateContentType?: boolean
  allowedContentTypes?: string[]
  // Rate limiting options
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  // Additional security checks
  checkForSQLInjection?: boolean
  checkForXSS?: boolean
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  sanitizeInputs: true,
  sanitizeQueryParams: true,
  validateContentType: true,
  allowedContentTypes: ['application/json'],
  checkForSQLInjection: true,
  checkForXSS: true
}

// Rate limiter class for API routes
class InMemoryRateLimiter {
  private static requests = new Map<string, number[]>()
  private static cleanupInterval: NodeJS.Timeout

  static {
    // Clean up old entries every hour
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const windowMs = 60 * 60 * 1000 // 1 hour
      for (const [key, timestamps] of this.requests.entries()) {
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs)
        if (validTimestamps.length === 0) {
          this.requests.delete(key)
        } else {
          this.requests.set(key, validTimestamps)
        }
      }
    }, 60 * 60 * 1000)
  }

  static checkLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
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

  static cleanup(): void {
    clearInterval(this.cleanupInterval)
  }
}

/**
 * Enhanced security middleware for API routes
 */
export function withSecurity<Params extends {} = {}>(
  handler: (req: NextRequest, params: Params) => Promise<NextResponse>,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
) {
  return async (req: NextRequest, params: Params): Promise<NextResponse> => {
    const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const {url} = req
    
    // 1. Content-Type validation (only for requests with body)
    if (mergedConfig.validateContentType) {
      const contentType = req.headers.get('content-type')?.split(';')[0] || ''
      // Only validate content-type for methods that typically have a body
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (contentType && !mergedConfig.allowedContentTypes?.includes(contentType)) {
          apiLogger.warn({ 
            clientIP, 
            url, 
            contentType,
            method: req.method
          }, 'Invalid content type')
          return NextResponse.json(
            { error: 'Invalid content type. Only application/json is allowed.' },
            { status: 400 }
          )
        }
      }
    }

    // 2. Rate limiting
    if (mergedConfig.rateLimit) {
      const rateLimitKey = `${clientIP}:${url}`
      if (!InMemoryRateLimiter.checkLimit(
        rateLimitKey,
        mergedConfig.rateLimit.maxRequests,
        mergedConfig.rateLimit.windowMs
      )) {
        apiLogger.warn({ 
          clientIP, 
          url 
        }, 'Rate limit exceeded')
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    let processedReq = req

    // 3. Query parameter sanitization
    if (mergedConfig.sanitizeQueryParams) {
      // Create a new URL with sanitized query parameters
      const urlObj = new URL(req.url)
      const sanitizedSearchParams = APISecurity.sanitizeQueryParams(
        Object.fromEntries(urlObj.searchParams.entries())
      )
      
      // Rebuild the URL with sanitized params
      const newUrlObj = new URL(urlObj.origin + urlObj.pathname)
      for (const [key, value] of Object.entries(sanitizedSearchParams)) {
        if (Array.isArray(value)) {
          value.forEach(v => newUrlObj.searchParams.append(key, v))
        } else if (value) {newUrlObj.searchParams.set(key, value)}
      }
      
      // Clone the request with the sanitized URL
      processedReq = new NextRequest(newUrlObj.toString(), req)
    }

    // 4. Request body sanitization
    let sanitizedBody: any = undefined
    
    if (mergedConfig.sanitizeInputs && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
      try {
        // Clone the request to avoid consuming the body
        const clonedReq = req.clone()
        const body = await clonedReq.json()
        sanitizedBody = APISecurity.sanitizeRequestBody(body)
      } catch (e) {
        // If parsing fails, continue without sanitization but log
        apiLogger.warn({ error: 'Failed to parse request body for sanitization' }, 'Body parsing error')
      }
    }

    // 5. Additional security checks
    if (mergedConfig.checkForSQLInjection || mergedConfig.checkForXSS) {
      let checkData = sanitizedBody || {}
      
      // If we don't have a sanitized body and method has body, parse for security checks
      if (!sanitizedBody && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
        try {
          // Clone the request to avoid consuming the body
          const clonedReq = req.clone()
          checkData = await clonedReq.json()
        } catch (e) {
          // If we can't parse the body, use an empty object
          checkData = {}
        }
      }
      
      // Flatten the data for security checks
      const flatData = flattenObject(checkData)
      
      for (const [key, value] of Object.entries(flatData)) {
        if (typeof value === 'string') {
          // Check for SQL injection patterns
          if (mergedConfig.checkForSQLInjection && hasSQLInjectionPattern(value)) {
            apiLogger.warn({ 
              clientIP, 
              url, 
              field: key,
              value: value.substring(0, 100) // Log partial value for security
            }, 'SQL injection pattern detected')
            return NextResponse.json(
              { error: 'Invalid input detected' },
              { status: 400 }
            )
          }
          
          // Check for XSS patterns
          if (mergedConfig.checkForXSS && hasXSSPattern(value)) {
            apiLogger.warn({ 
              clientIP, 
              url, 
              field: key,
              value: value.substring(0, 100) // Log partial value for security
            }, 'XSS pattern detected')
            return NextResponse.json(
              { error: 'Invalid input detected' },
              { status: 400 }
            )
          }
        }
      }
    }

    // 6. Add sanitized body to request if it was modified
    if (sanitizedBody !== undefined) {
      // Create a new request with sanitized body
      processedReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(sanitizedBody)
      })
    }

    // 7. Call the handler and add security headers to response
    try {
      const response = await handler(processedReq, params)
      
      // Add security headers to the response
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      
      return response
    } catch (error) {
      // Log handler errors
      apiLogger.error({ error, url, clientIP }, 'Handler error in security middleware')
      throw error
    }
  }
}

// Helper function to flatten nested objects for security checks
function flattenObject(obj: any, prefix = '', result: Record<string, any> = {}): Record<string, any> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, newKey, result)
      } else {
        result[newKey] = value
      }
    }
  }
  return result
}

// Helper function to detect potential SQL injection patterns
function hasSQLInjectionPattern(input: string): boolean {
  const sqlPatterns = [
    /(\b(OR|AND)\b\s+.*(?:=|>|<|LIKE)\s*['"][^'"]*['"])/gi,
    /(\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|EXEC|EXECUTE)\b)/gi,
    /(;|--|\/\*|\*\/|xp_|sp_|0x)/gi,
    /('%.*%'|\".*\")/g // Potential wildcard SQL injection
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// Helper function to detect potential XSS patterns
function hasXSSPattern(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
    /<\s*img[^>]+on\w+\s*=/gi // Image tags with event handlers
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

// Common security configurations presets
export const SecurityPresets = {
  // Development mode - minimal security for faster development
  development: (): SecurityConfig => ({
    sanitizeInputs: true,
    sanitizeQueryParams: true,
    validateContentType: false, // Allow any content type in dev
    rateLimit: { maxRequests: 1000, windowMs: 15 * 60 * 1000 }, // Very high limit for dev
    checkForSQLInjection: false,
    checkForXSS: false
  }),
  
  // Basic security for most API routes
  basic: (): SecurityConfig => ({
    sanitizeInputs: true,
    sanitizeQueryParams: true,
    validateContentType: true,
    allowedContentTypes: ['application/json'],
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
  }),
  
  // Enhanced security for sensitive routes
  enhanced: (): SecurityConfig => ({
    sanitizeInputs: true,
    sanitizeQueryParams: true,
    validateContentType: true,
    allowedContentTypes: ['application/json'],
    rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 }, // 50 requests per 15 minutes
    checkForSQLInjection: true,
    checkForXSS: true
  }),
  
  // Maximum security for critical routes
  maximum: (): SecurityConfig => ({
    sanitizeInputs: true,
    sanitizeQueryParams: true,
    validateContentType: true,
    allowedContentTypes: ['application/json'],
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 requests per 15 minutes
    checkForSQLInjection: true,
    checkForXSS: true
  })
}