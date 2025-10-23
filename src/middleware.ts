import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

export async function middleware(request: NextRequest) {
  try {
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
      console.error('Middleware auth error:', error)
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
    console.error('Middleware error:', error)
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
