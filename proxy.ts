import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = `
    default-src 'self' https: data: blob:;
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com https://vercel.live https://*.vercel.app https://*.stack-auth.com;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://*.vercel.app;
    img-src 'self' https: data: blob: https://*.supabase.co https://*.vercel.app https://app.heytrack.id https://*.stack-auth.com;
    font-src 'self' https://fonts.gstatic.com data: https://*.vercel.app;
    connect-src 'self' https://*.supabase.co https://vrrjoswzmlhkmmcfhicw.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com https://vercel.live https://*.vercel.app https://app.heytrack.id https://*.stack-auth.com wss://*.stack-auth.com ${isDev ? "http://localhost:3000 http://127.0.0.1:3000 ws://localhost:3000 ws://127.0.0.1:3000" : ''};
    worker-src 'self' blob: https://*.vercel.app;
    media-src 'self' https://*.supabase.co https://*.vercel.app;
    frame-src 'self' https://vercel.live https://*.vercel.app https://*.stack-auth.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.supabase.co https://*.stack-auth.com;
    frame-ancestors 'none';
    manifest-src 'self' https://*.vercel.app;
    upgrade-insecure-requests;
    block-all-mixed-content;
  `

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - handler/ (Stack Auth handler)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|handler/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}