import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // per window
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// API routes that require authentication
const protectedAPIRoutes = [
  '/api/orders',
  '/api/recipes',
  '/api/ingredients',
  '/api/customers',
  '/api/dashboard',
  '/api/financial',
  '/api/inventory',
  '/api/suppliers'
]

// Admin-only routes
const adminOnlyRoutes = [
  '/api/users',
  '/api/settings',
  '/api/admin'
]

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/recipes(.*)',
  '/ingredients(.*)',
  '/orders(.*)',
  '/customers(.*)',
  '/production(.*)',
  '/inventory(.*)',
  '/finance(.*)',
  '/reports(.*)',
  '/settings(.*)',
  '/admin(.*)'
])

// Create the combined middleware
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIP(request)
  
  // Apply security checks first
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Block suspicious requests
  if (isSuspiciousRequest(request, userAgent)) {
    console.warn(`🚨 Blocked suspicious request from ${ip}: ${pathname}`)
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Rate limiting
  if (isRateLimited(ip)) {
    console.warn(`⚠️ Rate limit exceeded for ${ip}`)
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    })
  }
  
  // Clerk authentication for protected routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
  
  return response
})

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real.trim()
  }
  
  return request.ip || 'unknown'
}

function isSuspiciousRequest(request: NextRequest, userAgent: string): boolean {
  const { pathname } = request.nextUrl
  
  // Block common attack patterns
  const suspiciousPatterns = [
    /\.env/,
    /wp-admin/,
    /phpmyadmin/,
    /admin\.php/,
    /config\.php/,
    /\.git/,
    /\.\./,
    /<script/i,
    /union.*select/i,
    /drop.*table/i
  ]
  
  // Check URL for suspicious patterns
  if (suspiciousPatterns.some(pattern => pattern.test(pathname))) {
    return true
  }
  
  // Block requests with suspicious user agents
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i
  ]
  
  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  return false
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(ip)
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return false
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  
  // Increment count
  clientData.count++
  return false
}

async function handleAPIProtection(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  
  // Skip auth for public endpoints
  const publicEndpoints = [
    '/api/health',
    '/api/ping',
    '/api/auth'
  ]
  
  if (publicEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    return response
  }
  
  // Check if route needs protection
  if (protectedAPIRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    try {
      // Verify JWT token with Supabase
      const token = authHeader.split(' ')[1]
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      
      // Check admin-only routes
      if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
        // You can add role checking logic here
        // For now, just ensure user exists
      }
      
      // Add user info to headers for API routes
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Email', user.email || '')
      
    } catch (error) {
      console.error('Auth verification error:', error)
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  return response
}

async function handlePageProtection(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  // Skip page protection for now since we don't have proper auth setup
  // This allows the settings page to load without authentication
  // In production, you should implement proper session checking
  const { pathname } = request.nextUrl
  
  // Check for Supabase auth token in cookies
  // Supabase uses different cookie names like 'sb-{project-ref}-auth-token'
  const authCookies = request.cookies.getAll().filter(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  )
  
  // For development, allow access to settings without auth
  // Remove this condition for production
  if (process.env.NODE_ENV === 'development') {
    return response
  }
  
  // In production, check for proper auth
  if (authCookies.length === 0) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return response
}

// Input validation helper
export function validateInput(data: any, rules: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // Required check
    if (rule.required && (!value || value === '')) {
      errors.push(`${field} is required`)
      continue
    }
    
    if (value) {
      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`)
      }
      
      // Length check
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`)
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`)
      }
      
      // Pattern check
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }
      
      // Email check
      if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`)
      }
      
      // Sanitization check for XSS
      if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`${field} contains potentially dangerous content`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// SQL injection prevention
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
