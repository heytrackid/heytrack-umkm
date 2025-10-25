import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { middlewareLogger } from '@/lib/logger'

// Define protected routes as a Set for O(1) lookup performance
const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/orders',
  '/ingredients',
  '/hpp',
  '/resep',
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
const RequestHeadersSchema = z.object({
  'user-agent': z.string().optional(),
  'accept': z.string().optional(),
  'accept-language': z.string().optional(),
  'content-type': z.string().optional(),
  'x-forwarded-for': z.string().optional(),
})

const UrlValidationSchema = z.object({
  pathname: z.string().min(1).max(2048), // Reasonable URL length limit
  search: z.string().max(2048).optional(), // Query string length limit
})

export async function middleware(request: NextRequest) {
  try {
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

    // Log suspicious requests but don't block them (only in production)
    if (!headersValidation.success && process.env.NODE_ENV === 'production') {
      middlewareLogger.warn({ 
        url: request.url,
        issues: headersValidation.error.issues,
      }, 'Suspicious request headers detected')
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

    // Get user from the updated session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const pathname = request.nextUrl.pathname

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
      return NextResponse.redirect(url)
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
