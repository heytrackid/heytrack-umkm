import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { middlewareLogger } from '@/lib/logger'
import { generateNonce, getStrictCSP } from '@/lib/csp'
import { updateSession } from '@/utils/supabase/middleware'



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

export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const nonce = generateNonce()

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

    // Add CSP headers to response
    response.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
    response.headers.set('x-nonce', nonce)

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
      redirectResponse.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
      redirectResponse.headers.set('x-nonce', nonce)
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
      redirectResponse.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
      redirectResponse.headers.set('x-nonce', nonce)
      return redirectResponse
    }

    // Root redirect
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/dashboard' : '/auth/login'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
      redirectResponse.headers.set('x-nonce', nonce)
      return redirectResponse
    }

    return response
  } catch (error) {
    middlewareLogger.error({ error }, 'Middleware error')
    // Return basic response with CSP on error
    const errorResponse = NextResponse.next()
    errorResponse.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
    errorResponse.headers.set('x-nonce', nonce)
    return errorResponse
  }
}

// Sesuaikan matcher dengan kebutuhanmu
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
