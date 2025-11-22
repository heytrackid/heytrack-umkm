/**
 * Performance-Optimized Next.js Configuration
 * Additional performance settings to merge with main config
 */

import type { NextConfig } from 'next'

const securityHeaders = [
  {
    source: '/:path*',
    headers: [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      }
    ]
  },
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=60, stale-while-revalidate=300'
      }
    ]
  },
  {
    source: '/_next/static/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }
    ]
  }
]

/**
 * Apply development webpack optimizations
 */
 
 
function applyDevOptimizations(config: Record<string, unknown>): void {
  // Ensure module IDs are stable across HMR updates
  config.optimization = {
    ...(config.optimization as Record<string, unknown>),
    moduleIds: 'named',
    chunkIds: 'named'
  }
}

/**
 * Apply production webpack optimizations
 */
 
 
function applyProdOptimizations(config: Record<string, unknown>): void {
  // Enable tree shaking
  config.optimization = {
    ...(config.optimization as Record<string, unknown>),
    usedExports: true,
    sideEffects: false
  }

  // Enable bundle analyzer if requested
  if (process.env['ANALYZE'] === 'true') {

    ;(config as { plugins?: unknown[] }).plugins = [
      ...((config as { plugins?: unknown[] }).plugins || []),
      // Bundle analyzer plugin would go here
    ]
  }

  // Split chunks for better caching
  ;(config.optimization as { splitChunks?: unknown }).splitChunks = {
    chunks: 'all',
    cacheGroups: {
      default: false,
      vendors: false,
      // Vendor chunk
      vendor: {
        name: 'vendor',
        chunks: 'all',
        test: /node_modules/,
        priority: 20
      },
      // Common chunk
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true,
        enforce: true
      },
      // UI components chunk
      ui: {
        name: 'ui',
        test: /[\\/]components[\\/]ui[\\/]/,
        chunks: 'all',
        priority: 30
      }
      // Charts removed - no longer using recharts
    }
  }
}

export const performanceConfig: Partial<NextConfig> = {
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      '@iconify/react',
      '@radix-ui/react-icons',
      'date-fns'
    ],
    // Enable PPR (Partial Prerendering) when stable
    // ppr: true,
  },

  // Headers for caching
  headers() {
    return securityHeaders
  },

  // Webpack optimizations
  webpack: (config: Record<string, unknown>, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
     
    if (dev) {
      applyDevOptimizations(config)
    } else if (!isServer) {
      applyProdOptimizations(config)
    }

     
    return config
  }
}

/**
 * Merge with main config:
 * 
 * import { performanceConfig } from './next.config.performance'
 * 
 * const config: NextConfig = {
 *   ...baseConfig,
 *   ...performanceConfig
 * }
 */
