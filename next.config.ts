import type { NextConfig } from "next";

// Bundle Analyzer Configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env['ANALYZE'] === 'true',
});

const nextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },



  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'], // Keep console.error for critical issues
    } : false,
  },

  // Performance Optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression

  // Output optimizations
  output: 'standalone', // Enable standalone output for better performance
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'react', 'react-dom'],
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:64869'],
    },
    // Improve HMR performance
    webpackBuildWorker: true,
    // Faster refresh
    optimisticClientCache: true,
  },

  // Turbopack configuration (Next.js 16+)
  // Optimized for better HMR performance
  turbopack: {
    // Reduce memory usage
    memoryLimit: 4096,
  },

  // Webpack configuration for better HMR and dynamic imports
  webpack: (config, { dev, isServer }) => {
    // Development optimizations for better HMR
    if (dev) {
      // Ensure module IDs are stable across HMR updates
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named'
      }
    }

    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Sidebar components chunk (for better HMR)
          sidebar: {
            name: 'sidebar',
            test: /[\\/]components[\\/]layout[\\/]sidebar[\\/]/,
            chunks: 'all',
            priority: 35
          }
        }
      }
    }

    return config
  },

  // Image Optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [], // Add your image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://api.openrouter.ai https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://fonts.googleapis.com https://vitals.vercel-insights.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // External packages for server components
  serverExternalPackages: [
    '@supabase/realtime-js',
    '@supabase/ssr',
    'exceljs',
    'jsdom'
  ],

  // Redirects for security
  async redirects() {
    return [
      // Redirect sensitive paths
      {
        source: '/.env',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/.env.local',
        destination: '/404',
        permanent: false,
      },
    ];
  },
} satisfies NextConfig;

export default withBundleAnalyzer(nextConfig);
