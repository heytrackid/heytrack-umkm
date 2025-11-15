import { stackServerApp } from '@/stack/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { generateNonce, getStrictCSP } from '@/lib/csp'
import { middlewareLogger } from '@/lib/logger'

const RequestHeadersSchema = z.object({
  'user-agent': z.string().nullable().optional(),
  accept: z.string().nullable().optional(),
  'accept-language': z.string().nullable().optional(),
  'content-type': z.string().nullable().optional(),
  'x-forwarded-for': z.string().nullable().optional(),
})

const UrlValidationSchema = z.object({
  pathname: z.string().min(1).max(2048),
  search: z.string().max(2048).optional(),
})

/**
 * Handle CORS preflight requests
 */
function handleCorsPreflight(request: NextRequest, isDev: boolean): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'app.heytrack.id'
    const response = new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isDev ? 'http://localhost:3000' : `https://${appDomain}`,
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
    return response;
  }
  return null
}

/**
 * Log environment info in development
 */
function logDevInfo(request: NextRequest, isDev: boolean): void {
  if (isDev) {
    middlewareLogger.debug({
      url: request.url,
      method: request.method,
      appDomain: process.env['NEXT_PUBLIC_APP_DOMAIN'],
      nodeEnv: process.env.NODE_ENV
    }, 'Middleware request')
  }
}

/**
 * Skip middleware for static assets and Next.js internals
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/handler/') || // Stack Auth handler
    pathname.includes('.') // Skip files with extensions
  )
}

/**
 * Validate request headers and URL
 */
function validateRequest(request: NextRequest, isDev: boolean): NextResponse | null {
  const headersValidation = RequestHeadersSchema.safeParse({
    'user-agent': request.headers.get('user-agent'),
    accept: request.headers.get('accept'),
    'accept-language': request.headers.get('accept-language'),
    'content-type': request.headers.get('content-type'),
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
  })
  const urlValidation = UrlValidationSchema.safeParse({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  })
  if (!headersValidation.success && isDev) {
    middlewareLogger.debug(
      { url: request.url, issues: headersValidation.error.issues },
      'Request headers validation failed (non-blocking)'
    )
  }
  if (!urlValidation.success) {
    middlewareLogger.warn(
      { url: request.url, issues: urlValidation.error.issues },
      'Malformed URL detected'
    )
    return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 })
  }
  return null
}

/**
 * Add API headers for CORS
 */
function addApiHeaders(response: NextResponse, isDev: boolean): void {
  const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'app.heytrack.id'
  response.headers.set('Access-Control-Allow-Origin', isDev ? 'http://localhost:3000' : `https://${appDomain}`);
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  // Public routes that don't require auth
  const publicRoutes = ['/handler']
  
  // Check if pathname starts with any public route
  return !publicRoutes.some(route => pathname.startsWith(route))
}

/**
 * Handle root redirect for authenticated users
 */
async function handleRootRedirect(request: NextRequest, nonce: string, isDev: boolean): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    // Check if user is authenticated
    const user = await stackServerApp.getUser()
    
    if (user) {
      // Redirect authenticated users to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const redirectResponse = NextResponse.redirect(url)
      addSecurityHeaders(redirectResponse, nonce, isDev)
      return redirectResponse
    } else {
      // Redirect unauthenticated users to sign-in
      const url = request.nextUrl.clone()
      url.pathname = '/handler/sign-in'
      const redirectResponse = NextResponse.redirect(url)
      addSecurityHeaders(redirectResponse, nonce, isDev)
      return redirectResponse
    }
  }
  return null
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, nonce: string, isDev: boolean): void {
  response.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
  response.headers.set('x-nonce', nonce)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const isDev = process.env.NODE_ENV === 'development'
  const nonce = generateNonce()

  const corsResponse = handleCorsPreflight(request, isDev)
  if (corsResponse) {
    return corsResponse
  }

  logDevInfo(request, isDev)

  const { pathname } = request.nextUrl
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next()
  }

  try {
    const validationError = validateRequest(request, isDev)
    if (validationError) {
      addSecurityHeaders(validationError, nonce, isDev)
      return validationError
    }

    // Handle root redirect first
    const rootRedirect = await handleRootRedirect(request, nonce, isDev)
    if (rootRedirect) {
      return rootRedirect
    }

    // Check authentication for protected routes
    if (isProtectedRoute(pathname)) {
      const user = await stackServerApp.getUser()
      
      if (!user) {
        // Redirect to sign-in page if not authenticated
        const url = request.nextUrl.clone()
        url.pathname = '/handler/sign-in'
        url.searchParams.set('redirect', pathname)
        const redirectResponse = NextResponse.redirect(url)
        addSecurityHeaders(redirectResponse, nonce, isDev)
        return redirectResponse
      }
    }

    // Continue with request
    const response = NextResponse.next()
    addSecurityHeaders(response, nonce, isDev)

    if (request.nextUrl.pathname.startsWith('/api/')) {
      addApiHeaders(response, isDev)
    }

    return response
  } catch (error) {
    middlewareLogger.error({ error }, 'Middleware error')
    const errorResponse = NextResponse.next()
    addSecurityHeaders(errorResponse, nonce, isDev)
    return errorResponse
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
