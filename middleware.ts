import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'


import { generateNonce, getStrictCSP } from '@/lib/csp'
import { middlewareLogger } from '@/lib/logger'
import { updateSession } from '@/utils/supabase/middleware'

import type { User } from '@supabase/supabase-js'



const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/orders',
  '/ingredients',
  '/recipes',
  '/customers',
  '/cash-flow',
  '/profit',
  '/settings',
  '/ai-chatbot',
  '/categories',
  '/operational-costs',
  '/reports',
])

const AUTH_PAGES = new Set(['/auth/login', '/auth/register'])

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
 * Update session and get user
 */
async function getUser(request: NextRequest): Promise<{ user: User | null; response: NextResponse }> {
  try {
    const { user, response } = await updateSession(request)
    return { user, response }
  } catch (error) {
    middlewareLogger.debug({ error }, 'Middleware auth error (non-blocking)')
    return { user: null, response: NextResponse.next() }
  }
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
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  for (const base of PROTECTED_ROUTES) {
    if (pathname.startsWith(base)) {
      return true
    }
  }
  return false
}

/**
 * Handle protected route redirect
 */
function handleProtectedRouteRedirect(request: NextRequest, user: User | null, nonce: string, isDev: boolean): NextResponse | null {
  const { pathname } = request.nextUrl
  if (isProtectedRoute(pathname) && user === null && !pathname.startsWith('/auth/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    const redirectResponse = NextResponse.redirect(url)
    addSecurityHeaders(redirectResponse, nonce, isDev)
    return redirectResponse
  }
  return null
}

/**
 * Check if route is auth page
 */
function isAuthPage(pathname: string): boolean {
  for (const base of AUTH_PAGES) {
    if (pathname.startsWith(base)) {
      return true
    }
  }
  return false
}

/**
 * Handle auth page redirect
 */
function handleAuthPageRedirect(request: NextRequest, user: User | null, nonce: string, isDev: boolean): NextResponse | null {
  const { pathname } = request.nextUrl
  if (isAuthPage(pathname) && user !== null) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    addSecurityHeaders(redirectResponse, nonce, isDev)
    return redirectResponse
  }
  return null
}

/**
 * Handle root redirect
 */
function handleRootRedirect(request: NextRequest, user: User | null, nonce: string, isDev: boolean): NextResponse | null {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user !== null ? '/dashboard' : '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    addSecurityHeaders(redirectResponse, nonce, isDev)
    return redirectResponse
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

    const { user, response } = await getUser(request)
    addSecurityHeaders(response, nonce, isDev)

    if (request.nextUrl.pathname.startsWith('/api/')) {
      addApiHeaders(response, isDev)
    }

    const protectedRedirect = handleProtectedRouteRedirect(request, user, nonce, isDev)
    if (protectedRedirect) {
      return protectedRedirect
    }

    const authRedirect = handleAuthPageRedirect(request, user, nonce, isDev)
    if (authRedirect) {
      return authRedirect
    }

    const rootRedirect = handleRootRedirect(request, user, nonce, isDev)
    if (rootRedirect) {
      return rootRedirect
    }

    return response
  } catch (error) {
    middlewareLogger.error({ error }, 'Middleware error')
    const errorResponse = NextResponse.next()
    addSecurityHeaders(errorResponse, nonce, isDev)
    return errorResponse
  }
}

// Sesuaikan matcher dengan kebutuhanmu
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
