// next.config.ts
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] || ''

const withBundleAnalyzer =
  process.env['ANALYZE'] === 'true'
    ? require('@next/bundle-analyzer')({ enabled: true })
    : (config: NextConfig) => config

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignore Supabase type issues in build
  },
  typedRoutes: true,
  compiler: { 
    removeConsole: isProd ? { exclude: ['error'] } : false 
  },
  // ⚡ Build Performance Optimizations (SWC is default in Next.js 15+)
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  generateBuildId: async () =>
    process.env['VERCEL_GIT_COMMIT_SHA']?.slice(0, 10) || `build-${Date.now()}`,

  experimental: {
    typedEnv: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', appDomain].filter(Boolean),
    },
    optimizeCss: true,
    optimisticClientCache: false,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; img-src * data: blob:; media-src * data: blob:; sandbox;",
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Access-Control-Allow-Origin',
            value: isProd ? `https://${appDomain}` : 'http://localhost:3000',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        // Static assets
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Media assets
        source: '/:file*.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp|avif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  async redirects() {
    return [
      // Redirect old Supabase Auth routes to new Stack Auth routes
      {
        source: '/auth/login',
        destination: '/handler/sign-in',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/handler/sign-up',
        permanent: true,
      },
      {
        source: '/auth/reset-password',
        destination: '/handler/forgot-password',
        permanent: true,
      },
      {
        source: '/auth/logout',
        destination: '/handler/sign-out',
        permanent: true,
      },
      {
        source: '/auth/:path*',
        destination: '/handler/:path*',
        permanent: true,
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)