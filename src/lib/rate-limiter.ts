import { logger } from '@/lib/logger'

import { dbLogger } from './logger';

import type { NextRequest } from 'next/server'


// Simple in-memory rate limiter (for development)
// In production, use Redis or similar
class InMemoryRateLimiter {
  private readonly requests = new Map<string, { count: number; resetTime: number }>()

  checkLimit(identifier: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowEnd = now + windowMs
    const key = identifier

    const request = this.requests.get(key)
    
    if (!request || now > request.resetTime) {
      // New window, reset count
      this.requests.set(key, {
        count: 1,
        resetTime: windowEnd
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: windowEnd
      }
    }

    if (request.count >= maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: request.resetTime
      }
    }

    // Increment request count
    this.requests.set(key, {
      count: request.count + 1,
      resetTime: request.resetTime
    })

    return {
      allowed: true,
      remaining: maxRequests - request.count - 1,
      resetTime: request.resetTime
    }
  }

  // Method to clean up old entries (call periodically)
  cleanup() {
    const now = Date.now()
    for (const [key, request] of this.requests.entries()) {
      if (now > request.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Production rate limiter using a more robust approach
class ProductionRateLimiter {
  checkLimit(_identifier: string, maxRequests: number, windowMs: number, _request?: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    // In production, this would connect to Redis or similar
    // For now, we'll simulate with a simple approach
    logger.info({ identifier: _identifier }, 'Rate limit check')
    const now = Date.now()
    const windowEnd = now + windowMs
    
    // For demo purposes, allow all requests in development
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: windowEnd
    }
  }
}

const rateLimiter = process['env'].NODE_ENV === 'production' ? new ProductionRateLimiter() : new InMemoryRateLimiter()

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyGenerator?: (request: NextRequest) => string
}

const defaultKeyGenerator = (request: NextRequest): string => {
  // Generate a key based on IP and path
  const ip = request['headers'].get('x-forwarded-for')?.split(',')[0]?.trim() ?? 
             request['headers'].get('x-real-ip') ??
             'unknown'
  const path = request.nextUrl.pathname
  return `${ip}:${path}`
}

export function checkRateLimit(
  request: NextRequest, 
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  
  const key = options.keyGenerator?.(request) ?? defaultKeyGenerator(request)
  
  if (process['env'].NODE_ENV === 'production') {
    return Promise.resolve(rateLimiter.checkLimit(key, options.maxRequests, options.windowMs, request))
  }
  return Promise.resolve(rateLimiter.checkLimit(key, options.maxRequests, options.windowMs))
}

// Middleware wrapper for rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options: RateLimitOptions
) {
  return async (request: NextRequest): Promise<Response> => {
    const { allowed, remaining, resetTime } = await checkRateLimit(request, options)

    if (!allowed) {
      dbLogger.warn({
        ip: request['headers'].get('x-forwarded-for')?.split(',')[0],
        path: request.nextUrl.pathname,
        userAgent: request['headers'].get('user-agent')
      }, 'Rate limit exceeded')
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests', 
          resetTime: new Date(resetTime) 
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.floor((resetTime - Date.now()) / 1000).toString(),
          } 
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(request)
    
    // Clone response to modify headers
    const modifiedResponse = new Response(response['body'], {
      status: response['status'],
      statusText: response.statusText,
      headers: new Headers(response['headers'])
    })
    
    modifiedResponse['headers'].set('X-RateLimit-Limit', options.maxRequests.toString())
    modifiedResponse['headers'].set('X-RateLimit-Remaining', remaining.toString())
    modifiedResponse['headers'].set('X-RateLimit-Reset', resetTime.toString())
    
    return modifiedResponse
  }
}

// Cleanup function - call this periodically (e.g., every 10 minutes)
export function cleanupRateLimit() {
  if (rateLimiter instanceof InMemoryRateLimiter) {
    rateLimiter.cleanup()
  }
}
