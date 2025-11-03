import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN // contoh: app.heytrack.id

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // aman untuk prod
  },

  compiler: {
    removeConsole: isProd ? { exclude: ['error'] } : false,
  },

  poweredByHeader: false,
  compress: true,

  output: 'standalone',
  generateBuildId: async () =>
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 10) || `build-${Date.now()}`,

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', appDomain || ''].filter(Boolean),
    },
    // Optimize frequently used packages for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lodash',
      'zod'
    ],
    webpackBuildWorker: false,
    optimisticClientCache: false,
  },

  // Turbopack configuration
  turbopack: {
    // Explicitly set workspace root to avoid detection issues
    root: __dirname,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    // CSP global atur di middleware, yang ini hanya utk <img>
    contentSecurityPolicy:
      "default-src 'self'; img-src * data: blob:; media-src * data: blob:; sandbox;",
    domains: [],
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp|avif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },

  // jangan masukkan jsdom/dompurify di sini
  serverExternalPackages: ['@supabase/realtime-js', '@supabase/ssr', 'exceljs'],

  async redirects() {
    return []
  },
}

export default nextConfig
