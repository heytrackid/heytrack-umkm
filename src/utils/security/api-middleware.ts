// API Security Middleware
// Rate limiting, input sanitization, and security checks for API routes

import { type NextRequest, NextResponse } from 'next/server'
import { RateLimiter, APISecurity } from '@/utils/security'
import { apiLogger } from '@/lib/logger'

export interface SecurityConfig {
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  sanitizeInput?: boolean
  requireAuth?: boolean
  allowedMethods?: string[]
}

export function createSecureApiHandler(
  handler: (_request: NextRequest, _context?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse> | NextResponse,
  config: SecurityConfig = {}
) {
  return async (_request: NextRequest, _context?: { params?: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const request = _request;
    const context = _context;
    try {
      // Rate limiting
      if (config.rateLimit) {
        const clientIP = request.headers.get('x-forwarded-for') ??
                        request.headers.get('x-real-ip') ??
                        'unknown'

        const allowed = RateLimiter.checkLimit(
          `api_${clientIP}`,
          config.rateLimit.maxRequests,
          config.rateLimit.windowMs
        )

        if (!allowed) {
          apiLogger.warn({ ip: clientIP, path: request.nextUrl.pathname }, 'Rate limit exceeded')
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Remaining': RateLimiter.getRemainingRequests(`api_${clientIP}`).toString()
              }
            }
          )
        }
      }

      // Method validation
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      }

      // Input sanitization for POST/PUT/PATCH requests
      if (config.sanitizeInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json()
          const sanitizedBody = APISecurity.sanitizeAPIInput(body)

          // Create new request with sanitized body
          const sanitizedRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody)
          })

          // Replace request with sanitized version
          Object.setPrototypeOf(request, sanitizedRequest)
        } catch (err) {
          apiLogger.warn({ err }, 'Failed to sanitize request body')
        }
      }

      // Execute the actual handler
      const response = await handler(request, context)

      // Add security headers to response
      const secureResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      })

      return secureResponse

    } catch (error) {
      apiLogger.error({ error, path: request.nextUrl.pathname }, 'API Security middleware error')
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Higher-order component for securing API routes
export function withSecurity(
  config: SecurityConfig
) {
  return (
    handler: (_request: NextRequest, _context?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse> | NextResponse
  ) => createSecureApiHandler(handler, config)
}

// Common security configurations
export const SecurityPresets = {
  // Public API with basic rate limiting
  public: {
    rateLimit: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
    sanitizeInput: true
  },

  // Authenticated API
  authenticated: {
    rateLimit: { maxRequests: 1000, windowMs: 60000 }, // 1000 requests per minute
    sanitizeInput: true,
    requireAuth: true
  },

  // Sensitive operations (like payments, deletions)
  sensitive: {
    rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
    sanitizeInput: true,
    requireAuth: true,
    allowedMethods: ['POST', 'PUT', 'DELETE']
  },

  // File uploads
  upload: {
    rateLimit: { maxRequests: 20, windowMs: 60000 }, // 20 uploads per minute
    sanitizeInput: false, // Files need special handling
    requireAuth: true,
    allowedMethods: ['POST']
  }
}
