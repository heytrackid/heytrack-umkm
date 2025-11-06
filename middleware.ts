import { generateNonce, getStrictCSP } from '@/lib/csp'
import { middlewareLogger } from '@/lib/logger'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'



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

export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const nonce = generateNonce()

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.heytrack.id'
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

  try {
    // Validasi ringan (log saja saat dev)
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

    // Update session and get user (this handles cookie refresh)
    let user = null
    let response: NextResponse
    
    try {
      const { user: authUser, response: authResponse } = await updateSession(request)
      user = authUser
      response = authResponse
    } catch (error) {
      // If auth fails, continue without user (they'll be redirected to login if needed)
      middlewareLogger.debug({ error }, 'Middleware auth error')
      user = null
      response = NextResponse.next()
    }

    // Add security headers
    addSecurityHeaders(response, nonce, isDev)

    // API routes (relying on Supabase rate limits)
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.heytrack.id'
      response.headers.set('Access-Control-Allow-Origin', isDev ? 'http://localhost:3000' : `https://${appDomain}`);
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }



    const { pathname } = request.nextUrl

    // Protected route check
    let isProtected = false
    for (const base of PROTECTED_ROUTES) {
      if (pathname.startsWith(base)) {
        isProtected = true
        break
      }
    }

    if (isProtected && !user && !pathname.startsWith('/auth/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', pathname)
      const redirectResponse = NextResponse.redirect(url)
      addSecurityHeaders(redirectResponse, nonce, isDev)
      return redirectResponse
    }

    // Auth page check
    let isAuth = false
    for (const base of AUTH_PAGES) {
      if (pathname.startsWith(base)) {
        isAuth = true
        break
      }
    }

    if (isAuth && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const redirectResponse = NextResponse.redirect(url)
      addSecurityHeaders(redirectResponse, nonce, isDev)
      return redirectResponse
    }

    // Root redirect
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/dashboard' : '/auth/login'
      const redirectResponse = NextResponse.redirect(url)
      addSecurityHeaders(redirectResponse, nonce, isDev)
      return redirectResponse
    }

    return response
  } catch (error) {
    middlewareLogger.error({ error }, 'Middleware error')
    // Return basic response with security headers on error
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
