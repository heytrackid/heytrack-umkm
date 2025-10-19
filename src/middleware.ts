import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes
  const { pathname } = request.nextUrl

  // Skip for static assets, API routes, and auth routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next()
  }

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      // Allow request to continue without auth check
      return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            } catch (error) {
              console.error('Cookie setting error:', error)
              // Continue without setting cookies
            }
          },
        },
      }
    )

    // Get user with error handling
    let user = null
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Auth error in middleware:', error.message)
      } else {
        user = data?.user
      }
    } catch (error) {
      console.error('Failed to get user in middleware:', error)
      // Continue without user check
    }

    // Check if user needs to be redirected to login
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
    const isPublicRoute = pathname === '/' || pathname.startsWith('/_not-found')

    if (!user && !isAuthRoute && !isPublicRoute) {
      try {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      } catch (error) {
        console.error('Redirect error:', error)
        // Continue to login page via client-side redirect
      }
    }

    return supabaseResponse

  } catch (error) {
    console.error('Middleware error:', error)
    // On middleware error, allow request to continue
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
