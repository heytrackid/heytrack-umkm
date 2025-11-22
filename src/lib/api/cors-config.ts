// lib/api/cors-config.ts
// Centralized CORS configuration and security headers management

export interface CorsConfig {
  development: {
    origins: string[]
    credentials: boolean
    methods: string[]
    headers: string[]
  }
  production: {
    origins: string[]
    credentials: boolean
    methods: string[]
    headers: string[]
  }
  staging?: {
    origins: string[]
    credentials: boolean
    methods: string[]
    headers: string[]
  }
}

/**
 * Centralized CORS configuration
 */
export const corsConfig: CorsConfig = {
  development: {
    origins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
    credentials: true,
    methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
    headers: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
      'Authorization',
      'X-Request-ID',
      'X-Response-Time',
      'X-Timestamp',
      'X-User-ID',
      'X-API-Version',
      'X-API-Current-Version',
      'X-API-Version-Deprecated',
      'X-Trace-ID',
      'X-Span-ID',
      'X-Parent-Span-ID',
    ],
  },
  production: {
    origins: [
      'https://app.heytrack.id',
      'https://ndelok.heytrack.id',
      process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.heytrack.id',
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
    headers: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
      'Authorization',
      'X-Request-ID',
      'X-Response-Time',
      'X-Timestamp',
      'X-User-ID',
      'X-API-Version',
      'X-API-Current-Version',
      'X-API-Version-Deprecated',
      'X-Trace-ID',
      'X-Span-ID',
      'X-Parent-Span-ID',
    ],
  },
}

/**
 * Get CORS configuration for current environment
 */
export function getCorsConfig(): CorsConfig['development'] | CorsConfig['production'] {
  const env = process.env.NODE_ENV || 'development'

  if (env === 'production') {
    return corsConfig.production
  }

  return corsConfig.development
}

/**
 * Create CORS headers for a response
 */
export function createCorsHeaders(): Record<string, string> {
  const config = getCorsConfig()

  return {
    'Access-Control-Allow-Origin': config.origins[0]!, // Primary origin
    'Access-Control-Allow-Methods': config.methods.join(', '),
    'Access-Control-Allow-Headers': config.headers.join(', '),
    'Access-Control-Allow-Credentials': config.credentials.toString(),
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

/**
 * Create preflight response for CORS
 */
export function createCorsPreflightResponse(): Response {
  const config = getCorsConfig()

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': config.methods.join(', '),
    'Access-Control-Allow-Headers': config.headers.join(', '),
    'Access-Control-Allow-Credentials': config.credentials.toString(),
    'Access-Control-Max-Age': '86400',
    ...(config.origins[0] && { 'Access-Control-Allow-Origin': config.origins[0] })
  }
  return new Response(null, {
    status: 200,
    headers,
  })
}

/**
 * Validate CORS origin
 */
export function isValidCorsOrigin(origin: string | null): boolean {
  if (!origin) return false

  const config = getCorsConfig()
  return config.origins.includes(origin)
}

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Other security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HTTPS Strict Transport Security (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }),
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response)

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      newResponse.headers.set(key, value)
    }
  })

  return newResponse
}

/**
 * Create API response with CORS and security headers
 */
export function createApiResponse(
  body: unknown,
  options: {
    status?: number
    cors?: boolean
    security?: boolean
    metadata?: Record<string, unknown>
  } = {}
): Response {
  const { status = 200, cors = true, security = true, metadata } = options

  const responseBody = metadata
    ? JSON.stringify({ ...(body as Record<string, unknown>), _metadata: metadata })
    : JSON.stringify(body)

  const response = new Response(responseBody, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  let enhancedResponse = response

  if (cors) {
    const corsHeaders = createCorsHeaders()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      enhancedResponse.headers.set(key, value)
    })
  }

  if (security) {
    enhancedResponse = addSecurityHeaders(enhancedResponse)
  }

  return enhancedResponse
}