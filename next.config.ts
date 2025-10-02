import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // TypeScript and Linting
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Turbopack for faster development
  turbopack: {
    root: __dirname,
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Performance Optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
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
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.dev",
              "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
              "img-src 'self' data: https: https://*.clerk.accounts.dev https://img.clerk.com",
              "font-src 'self' data: https://*.clerk.accounts.dev",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openrouter.ai https://*.clerk.accounts.dev https://clerk.dev wss://*.clerk.accounts.dev",
              "frame-src 'self' https://*.clerk.accounts.dev",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
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
  
  // Bundle Optimization  
  experimental: {
    // optimizeCss: true, // Temporarily disabled due to critters dependency issue
    optimizeServerReact: true,
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // External packages for server components
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@supabase/realtime-js',
    '@supabase/ssr'
  ],
  
  // Output optimization for production
  output: 'standalone',
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Vendor chunk for common libraries
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|@radix-ui|lucide-react)[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 10,
            },
            // Chart libraries separate chunk
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 8,
            },
            // UI components chunk
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 6,
            },
          },
        },
      };
    }

    // Bundle size optimization (removed problematic aliases)
    // Note: React aliases can cause module resolution issues in Next.js 15+

    return config;
  },

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
};

// Enable bundle analyzer when ANALYZE=true
const configWithAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default configWithAnalyzer;
