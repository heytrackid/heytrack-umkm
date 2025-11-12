# Build Optimization Guide

## 🚀 Cara Mempercepat `pnpm build`

### 1. **Build Commands** (Dari Tercepat ke Terlambat)

```bash
# ⚡ TERCEPAT - Skip validations (development only)
pnpm build:fast

# 🏃 CEPAT - Normal build dengan memory optimization
pnpm build

# 🔍 LENGKAP - Dengan type-check dan lint
pnpm build:validate

# 📊 ANALISIS - Dengan bundle analyzer
pnpm build:analyze
```

### 2. **Environment Variables untuk Build Cepat**

Buat file `.env.local` atau gunakan `.env.build`:

```bash
# Skip validations (hati-hati di production!)
SKIP_ENV_VALIDATION=1

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### 3. **Incremental Builds**

Next.js sudah menggunakan cache secara otomatis. Untuk memaksimalkan:

```bash
# Jangan hapus .next folder kecuali perlu
# Cache ada di .next/cache/

# Kalau build error, baru clean:
pnpm clean && pnpm build
```

### 4. **Parallel Processing**

Tingkatkan memory allocation:

```bash
# Sudah diset di package.json
NODE_OPTIONS='--max-old-space-size=8192' pnpm build
```

### 5. **Optimasi Kode**

#### a. Dynamic Imports untuk Heavy Components

```tsx
// ❌ Slow - loads everything upfront
import HeavyChart from '@/components/HeavyChart'

// ✅ Fast - lazy load
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // if not needed on server
})
```

#### b. Optimize Package Imports

```tsx
// ❌ Slow - imports entire library
import { Button } from '@radix-ui/react-button'

// ✅ Fast - tree-shakeable
import { Button } from '@/components/ui/button'
```

#### c. Reduce Bundle Size

```bash
# Analyze bundle
pnpm build:analyze

# Check what's taking space
# Opens browser with bundle visualization
```

### 6. **CI/CD Optimizations**

Untuk Vercel/deployment platforms:

```bash
# .vercelignore atau .gitignore
.next/cache
node_modules/.cache
.turbo
*.log
```

### 7. **Hardware Optimizations**

- **RAM**: Minimal 8GB, recommended 16GB+
- **CPU**: Multi-core processor (build uses parallel processing)
- **SSD**: Faster disk I/O = faster builds

### 8. **Monitoring Build Time**

```bash
# Track build time
time pnpm build

# Or use built-in
pnpm build 2>&1 | tee build.log
```

### 9. **Common Issues & Solutions**

#### Build Terlalu Lama (>5 menit)

```bash
# 1. Clear cache
pnpm clean

# 2. Update dependencies
pnpm update

# 3. Check for circular dependencies
pnpm list --depth=0

# 4. Increase memory
NODE_OPTIONS='--max-old-space-size=16384' pnpm build
```

#### Out of Memory Error

```bash
# Increase heap size
NODE_OPTIONS='--max-old-space-size=16384' pnpm build

# Or use build:fast
pnpm build:fast
```

#### Type Check Slow

```bash
# Skip type check during build (check separately)
pnpm type-check  # Run this first
pnpm build:fast  # Then build without type check
```

### 10. **Benchmark Results**

Typical build times on M1 Mac (16GB RAM):

- **First build**: 3-5 minutes
- **Incremental build**: 30-90 seconds
- **build:fast**: 20-60 seconds
- **With cache hit**: 10-30 seconds

### 11. **Production Best Practices**

```bash
# Always validate before production deploy
pnpm build:validate

# Or run checks separately
pnpm type-check
pnpm lint
pnpm build
```

### 12. **Local Development Tips**

```bash
# Use dev mode instead of build for development
pnpm dev  # Fast refresh, no build needed

# Only build when:
# - Testing production build
# - Before deployment
# - Checking bundle size
```

## 📊 Build Performance Checklist

- [ ] Using `pnpm` (faster than npm/yarn)
- [ ] SWC minifier enabled (in next.config.ts)
- [ ] Incremental TypeScript enabled (tsconfig.build.json)
- [ ] Memory allocation increased (8GB+)
- [ ] Cache not cleared unnecessarily
- [ ] Heavy components lazy-loaded
- [ ] Bundle analyzed and optimized
- [ ] No circular dependencies
- [ ] Dependencies up to date

## 🎯 Quick Reference

| Command | Speed | Use Case |
|---------|-------|----------|
| `pnpm build:fast` | ⚡⚡⚡ | Development testing |
| `pnpm build` | ⚡⚡ | Normal production build |
| `pnpm build:validate` | ⚡ | Pre-deployment check |
| `pnpm build:analyze` | 🐌 | Bundle optimization |

## 💡 Pro Tips

1. **Don't clean cache** unless you have issues
2. **Use build:fast** for quick iterations
3. **Run type-check separately** during development
4. **Monitor bundle size** regularly with analyze
5. **Keep dependencies updated** for performance improvements
