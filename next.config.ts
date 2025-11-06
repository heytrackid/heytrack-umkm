import { withSentryConfig } from '@sentry/nextjs';
import { withBotId } from 'botid/next/config';
import type { NextConfig } from 'next';


const isProd = process.env.NODE_ENV === 'production'
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN // contoh: app.heytrack.id

// Add bundle analyzer if ANALYZE env var is set
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config: NextConfig) => config

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // aman untuk prod
    // ⚡ PERFORMANCE: Disable type checking during build for faster builds
    // Type checking is done separately via `npm run type-check`
    // Set to true in CI/CD for faster builds (type-check runs separately)
    // ignoreBuildErrors: process.env.CI === 'true',
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



  // @ts-ignore - formats type issue
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
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",

              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "media-src 'self'",
              "object-src 'none'",
              "child-src 'self'",
              "worker-src 'self'",
              "manifest-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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
          // CORS headers for credentials support
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },

  // Webpack optimization
  webpack: (config: any, { isServer, dev }: { isServer: boolean; dev: boolean }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25, // Allow more parallel requests
        maxAsyncRequests: 30,   // Allow more async chunks
        cacheGroups: {
          // Framework chunk (React, Next.js runtime)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|@next|styled-jsx)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // Vendor libraries chunk
          vendor: {
            test: /[\\/]node_modules[\\/](?!react|react-dom|next|@next|styled-jsx|@radix-ui|lucide-react|@supabase|recharts|zod|react-hook-form|exceljs|date-fns|lodash)[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 30,
            maxSize: 200000, // ~200KB max per chunk
          },
          // Recharts chunk
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'async', // Only load when needed
            priority: 25,
          },
          // UI components chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
          // Supabase chunk
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 22,
          },
          // Form libraries
          forms: {
            test: /[\\/]node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/,
            name: 'forms',
            chunks: 'async',
            priority: 18,
          },
          // Utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|lodash|clsx|tailwind-merge)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
          },
          // Large libraries (async only)
          heavyLibs: {
            test: /[\\/]node_modules[\\/](exceljs|react-table|@tanstack)[\\/]/,
            name: 'heavy-libs',
            chunks: 'async',
            priority: 10,
          },
          // Default async chunks
          default: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      }
    }

    // Add asset optimization for images
    config.module = config.module || {}
    config.module.rules = config.module.rules || []

    // Optimize SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // jangan masukkan jsdom/dompurify di sini
  serverExternalPackages: ['@supabase/realtime-js', '@supabase/ssr', 'exceljs'],

  async redirects() {
    return []
  },
}

export default withSentryConfig(withBundleAnalyzer(withBotId(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "heytrack",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});