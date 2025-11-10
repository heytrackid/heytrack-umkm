# Design Document: Build Performance Optimization

## Overview

Dokumen ini menjelaskan strategi komprehensif untuk mengoptimasi build performance Next.js HeyTrack dari ~2-3 menit menjadi ~45-90 detik dengan kombinasi caching, parallelization, dan konfigurasi optimal.

**Target Improvements:**
- Production build: 40-60% faster (dari ~180s ke ~70-90s)
- Development startup: 50-70% faster (dari ~15s ke ~5-7s)
- HMR response: <200ms (dari ~500ms)
- Bundle size: 15-25% reduction
- CI/CD builds: 50% faster dengan proper caching

## Architecture

### Build Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Pre-Build Phase                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Dependency   │  │ Type Check   │  │ Lint Check   │     │
│  │ Installation │  │ (Parallel)   │  │ (Parallel)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Build Phase                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Compiler (SWC)                              │  │
│  │  ├─ Page Compilation (Parallel)                      │  │
│  │  ├─ API Routes Compilation                           │  │
│  │  ├─ Static Generation                                │  │
│  │  └─ Bundle Optimization                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Post-Build Phase                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Bundle       │  │ Asset        │  │ Cache        │     │
│  │ Analysis     │  │ Optimization │  │ Persistence  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Cache Layers                             │
│                                                              │
│  Layer 1: pnpm Store Cache                                  │
│  ├─ node_modules dependencies                               │
│  └─ Shared across projects                                  │
│                                                              │
│  Layer 2: TypeScript Build Info                             │
│  ├─ .tsbuildinfo files                                      │
│  └─ Incremental compilation data                            │
│                                                              │
│  Layer 3: Next.js Build Cache                               │
│  ├─ .next/cache directory                                   │
│  ├─ Compiled pages and components                           │
│  └─ Static generation results                               │
│                                                              │
│  Layer 4: SWC Compilation Cache                             │
│  ├─ Transformed JavaScript/TypeScript                       │
│  └─ Minification results                                    │
│                                                              │
│  Layer 5: CI/CD Remote Cache (Optional)                     │
│  ├─ Vercel Remote Caching                                   │
│  └─ GitHub Actions Cache                                    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. TypeScript Configuration Optimization

**File: `tsconfig.json`**

```typescript
{
  "compilerOptions": {
    // Performance optimizations
    "incremental": true,                    // Enable incremental compilation
    "tsBuildInfoFile": ".tsbuildinfo",     // Cache file location
    "skipLibCheck": true,                   // Skip type checking of .d.ts files
    
    // Module resolution optimization
    "moduleResolution": "bundler",          // Faster than "node"
    "resolveJsonModule": true,
    
    // Strict checks (keep existing)
    "strict": true,
    "noEmit": true,                         // Let Next.js handle emit
    
    // Path mapping (existing)
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  
  // Exclude unnecessary files
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "**/*.test.*",
    "**/__tests__/**"
  ]
}
```

**File: `tsconfig.build.json` (New)**

```typescript
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "incremental": true,
    "tsBuildInfoFile": ".next/cache/tsconfig.tsbuildinfo"
  },
  "exclude": [
    "**/*.test.*",
    "**/__tests__/**",
    "**/*.spec.*"
  ]
}
```

### 2. Next.js Configuration Optimization

**File: `next.config.ts` (Enhanced)**

```typescript
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Compiler optimizations
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  
  // SWC minification (faster than Terser)
  swcMinify: true,
  
  // Output optimization
  output: 'standalone',
  compress: true,
  
  // Experimental optimizations
  experimental: {
    // CSS optimization
    optimizeCss: true,
    
    // Package import optimization (tree shaking)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      '@tanstack/react-table',
      '@tanstack/react-query',
      'zod',
    ],
    
    // Modularize imports for better tree shaking
    modularizeImports: {
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        skipDefaultConversion: true,
      },
      'date-fns': {
        transform: 'date-fns/{{member}}',
      },
    },
    
    // Optimistic client cache
    optimisticClientCache: false,
    
    // Parallel page generation
    workerThreads: true,
    cpus: Math.max(1, require('os').cpus().length - 1),
  },
  
  // Webpack optimization (fallback when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // UI components chunk
            ui: {
              name: 'ui',
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      }
    }
    
    // Persistent caching
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: '.next/cache/webpack',
    }
    
    return config
  },
}

export default nextConfig
```

### 3. Package.json Scripts Optimization

**File: `package.json` (Enhanced)**

```json
{
  "scripts": {
    // Development (with Turbopack)
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo",
    "dev:clean": "pnpm clean:cache && pnpm dev",
    
    // Build scripts
    "build": "pnpm run build:check && next build",
    "build:fast": "next build",
    "build:check": "pnpm run type-check:fast && pnpm run lint:fast",
    "build:analyze": "ANALYZE=true next build",
    
    // Parallel validation
    "type-check": "tsc --noEmit --incremental",
    "type-check:fast": "tsc --noEmit --incremental --skipLibCheck",
    "lint:fast": "TIMING=1 eslint . --cache --cache-location .next/cache/eslint",
    
    // Validation (parallel)
    "validate": "run-p type-check:fast lint:fast",
    "validate:full": "run-p type-check lint",
    
    // Cache management
    "clean": "rimraf .next .turbo",
    "clean:cache": "rimraf .next/cache .turbo node_modules/.cache",
    "clean:all": "rimraf .next .turbo node_modules pnpm-lock.yaml",
    
    // CI/CD optimized
    "ci:install": "pnpm install --frozen-lockfile --prefer-offline",
    "ci:build": "pnpm run validate && pnpm run build:fast",
    
    // Performance monitoring
    "build:profile": "NODE_OPTIONS='--prof' next build",
    "build:trace": "NEXT_TRACE=1 next build"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5",  // For parallel script execution
    "rimraf": "^5.0.5"         // Cross-platform rm -rf
  }
}
```

### 4. pnpm Configuration

**File: `.npmrc` (New)**

```ini
# Performance optimizations
prefer-offline=true
fetch-retries=3
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# Store configuration
store-dir=~/.pnpm-store
modules-cache-max-age=604800

# Hoisting (faster installs)
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*

# Strict peer dependencies
strict-peer-dependencies=false
auto-install-peers=true

# Lockfile
lockfile=true
prefer-frozen-lockfile=true
```

### 5. CI/CD Cache Configuration

**File: `.github/workflows/build.yml` (Example)**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Setup Node.js with caching
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      # Setup pnpm
      - uses: pnpm/action-setup@v2
        with:
          version: 9
          run_install: false
      
      # Get pnpm store directory
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      # Cache pnpm store
      - uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      # Cache Next.js build
      - uses: actions/cache@v4
        with:
          path: |
            .next/cache
            .next/standalone
            .turbo
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-
            ${{ runner.os }}-nextjs-
      
      # Install dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile --prefer-offline
      
      # Run validation in parallel
      - name: Validate code
        run: pnpm run validate
      
      # Build
      - name: Build application
        run: pnpm run build:fast
        env:
          NODE_OPTIONS: '--max-old-space-size=4096'
```

### 6. Build Performance Monitor

**File: `scripts/build-monitor.ts` (New)**

```typescript
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'

interface BuildMetrics {
  timestamp: string
  duration: number
  phases: {
    dependencies: number
    typeCheck: number
    lint: number
    compilation: number
    optimization: number
  }
  bundleSize: {
    total: number
    pages: number
    chunks: number
  }
  cacheHitRate: number
}

export class BuildMonitor {
  private startTime: number
  private metrics: Partial<BuildMetrics> = {}
  
  constructor() {
    this.startTime = performance.now()
  }
  
  markPhase(phase: keyof BuildMetrics['phases']): void {
    const duration = performance.now() - this.startTime
    this.metrics.phases = {
      ...this.metrics.phases,
      [phase]: duration,
    }
  }
  
  async analyzeBundleSize(): Promise<void> {
    const buildDir = path.join(process.cwd(), '.next')
    const stats = await this.calculateDirectorySize(buildDir)
    
    this.metrics.bundleSize = {
      total: stats.total,
      pages: stats.pages,
      chunks: stats.chunks,
    }
  }
  
  private async calculateDirectorySize(dir: string): Promise<any> {
    // Implementation for calculating directory sizes
    return { total: 0, pages: 0, chunks: 0 }
  }
  
  generateReport(): void {
    const report = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      duration: performance.now() - this.startTime,
    }
    
    // Save to file
    const reportPath = path.join(process.cwd(), '.next/build-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Console output
    console.log('\n📊 Build Performance Report')
    console.log('─'.repeat(50))
    console.log(`Total Duration: ${(report.duration / 1000).toFixed(2)}s`)
    console.log(`Bundle Size: ${(report.bundleSize?.total / 1024 / 1024).toFixed(2)}MB`)
    console.log('─'.repeat(50))
  }
}
```

## Data Models

### Build Configuration Schema

```typescript
interface BuildConfig {
  typescript: {
    incremental: boolean
    skipLibCheck: boolean
    tsBuildInfoFile: string
  }
  
  nextjs: {
    swcMinify: boolean
    optimizeCss: boolean
    optimizePackageImports: string[]
    workerThreads: boolean
    cpus: number
  }
  
  caching: {
    enabled: boolean
    layers: CacheLayer[]
    ttl: number
  }
  
  performance: {
    maxMemory: number
    parallelJobs: number
    compressionLevel: number
  }
}

interface CacheLayer {
  name: string
  path: string
  enabled: boolean
  strategy: 'filesystem' | 'memory' | 'remote'
}
```

## Error Handling

### Build Failure Recovery

```typescript
// scripts/build-with-retry.ts
async function buildWithRetry(maxRetries = 2): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Build attempt ${attempt}/${maxRetries}`)
      
      // Clear cache if retry
      if (attempt > 1) {
        await clearBuildCache()
      }
      
      // Run build
      await runBuild()
      
      console.log('✅ Build successful')
      return
      
    } catch (error) {
      console.error(`❌ Build attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error('Build failed after maximum retries')
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

async function clearBuildCache(): Promise<void> {
  const cacheDirs = [
    '.next/cache',
    '.turbo',
    'node_modules/.cache',
  ]
  
  for (const dir of cacheDirs) {
    await fs.rm(dir, { recursive: true, force: true })
  }
}
```

## Testing Strategy

### Build Performance Tests

```typescript
// tests/build-performance.test.ts
import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('Build Performance', () => {
  it('should complete build within time limit', async () => {
    const startTime = Date.now()
    
    execSync('pnpm run build:fast', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    })
    
    const duration = Date.now() - startTime
    const maxDuration = 120000 // 2 minutes
    
    expect(duration).toBeLessThan(maxDuration)
  }, 180000)
  
  it('should generate optimized bundles', () => {
    const buildManifest = require('../.next/build-manifest.json')
    const totalSize = Object.values(buildManifest.pages)
      .flat()
      .reduce((sum, file) => sum + getFileSize(file), 0)
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    expect(totalSize).toBeLessThan(maxSize)
  })
  
  it('should utilize build cache effectively', async () => {
    // First build
    execSync('pnpm run build:fast')
    
    // Second build (should be faster)
    const startTime = Date.now()
    execSync('pnpm run build:fast')
    const duration = Date.now() - startTime
    
    // Should be at least 30% faster
    const maxCachedDuration = 60000 // 1 minute
    expect(duration).toBeLessThan(maxCachedDuration)
  }, 240000)
})
```

## Performance Benchmarks

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Production Build | 180s | 70-90s | 50-60% |
| Dev Server Start | 15s | 5-7s | 53-67% |
| HMR Response | 500ms | <200ms | 60% |
| Bundle Size | 3.5MB | 2.5-2.8MB | 20-28% |
| CI/CD Build | 240s | 120s | 50% |
| Type Check | 45s | 20-25s | 44-55% |
| Lint Check | 30s | 15-18s | 40-50% |

### Resource Utilization

- **CPU**: Utilize 75-90% of available cores during build
- **Memory**: Peak at 4-6GB (down from 8GB)
- **Disk I/O**: Reduce by 40% with effective caching
- **Network**: Minimize with offline-first dependency resolution

## Implementation Phases

### Phase 1: Quick Wins (Day 1)
- Enable TypeScript incremental compilation
- Configure SWC minification
- Setup build cache persistence
- Optimize package.json scripts

### Phase 2: Advanced Optimizations (Day 2-3)
- Implement modularizeImports
- Configure webpack caching
- Setup parallel validation
- Add build monitoring

### Phase 3: CI/CD Integration (Day 4-5)
- Configure GitHub Actions caching
- Setup remote build cache
- Implement build retry logic
- Add performance regression tests

### Phase 4: Monitoring & Tuning (Ongoing)
- Track build metrics over time
- Identify and fix bottlenecks
- Optimize based on real data
- Document best practices
