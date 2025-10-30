import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { middlewareLogger } from '@/lib/logger'
import { generateNonce, getStrictCSP } from '@/lib/csp'

// Define protected routes as a Set for O(1) lookup performance
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

// Auth pages that should redirect when user is authenticated
const AUTH_PAGES = new Set(['/auth/login', '/auth/register'])

// Request validation schemas
// ✅ Allow null values for headers (some requests don't have all headers)
const RequestHeadersSchema = z.object({
  'user-agent': z.string().nullable().optional(),
  'accept': z.string().nullable().optional(),
  'accept-language': z.string().nullable().optional(),
  'content-type': z.string().nullable().optional(),
  'x-forwarded-for': z.string().nullable().optional(),
})

const UrlValidationSchema = z.object({
  pathname: z.string().min(1).max(2048), // Reasonable URL length limit
  search: z.string().max(2048).optional(), // Query string length limit
})

export async function middleware(request: NextRequest) {
  try {
    // Generate CSP nonce for this request
    const nonce = generateNonce()
    const isDev = process.env.NODE_ENV === 'development'
    
    // Validate request headers (optional, for security monitoring)
    const headersValidation = RequestHeadersSchema.safeParse({
      'user-agent': request.headers.get('user-agent'),
      'accept': request.headers.get('accept'),
      'accept-language': request.headers.get('accept-language'),
      'content-type': request.headers.get('content-type'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
    })

    // Validate URL structure
    const urlValidation = UrlValidationSchema.safeParse({
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
    })

    // Log suspicious requests but don't block them
    // Only log in development for debugging (too noisy in production)
    if (!headersValidation.success && process.env.NODE_ENV === 'development') {
      middlewareLogger.debug({ 
        url: request.url,
        issues: headersValidation.error.issues,
      }, 'Request headers validation failed (non-blocking)')
    }

    if (!urlValidation.success) {
      middlewareLogger.warn({ 
        url: request.url,
        issues: urlValidation.error.issues,
      }, 'Malformed URL detected')
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      )
    }

    // Update session using the new helper
    let response = await updateSession(request)
    
    // Add CSP nonce to request headers for use in components
    request.headers.set('x-nonce', nonce)
    
    // Add strict CSP header to response
    response.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))

    // Get user from the updated session
    const supabase = createServerClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      middlewareLogger.error({ error }, 'Middleware auth error')
    }

    const {pathname} = request.nextUrl

    // Check if the current path is protected (optimized with Set)
    const isProtectedRoute = Array.from(PROTECTED_ROUTES).some((route) =>
      pathname.startsWith(route)
    )

    // Protect authenticated routes
    if (isProtectedRoute && !user && !pathname.startsWith('/auth/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      // Preserve intended destination for redirect after login
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages (optimized with Set)
    const isAuthPage = Array.from(AUTH_PAGES).some((page) => pathname.startsWith(page))
    if (isAuthPage && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Redirect root based on auth status
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/dashboard' : '/auth/login'
      const redirectResponse = NextResponse.redirect(url)
      // Preserve CSP header on redirect
      redirectResponse.headers.set('Content-Security-Policy', getStrictCSP(nonce, isDev))
      return redirectResponse
    }

    return response
  } catch (error) {
    middlewareLogger.error({ error }, 'Middleware error')
    // On error, allow request to proceed to avoid blocking the app
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
