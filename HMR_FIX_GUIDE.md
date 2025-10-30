# 🔥 HMR (Hot Module Replacement) Fix Guide

Panduan lengkap untuk mengatasi HMR issues di Next.js 16 + Turbopack.

## 🎯 Quick Fixes (Try These First)

### 1. Clear Cache & Restart
```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Clear Turbopack cache
rm -rf .turbo

# Clear node_modules cache (optional, if issue persists)
rm -rf node_modules/.cache

# Restart dev server
pnpm dev
```

### 2. Hard Refresh Browser
```
Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
Safari: Cmd+Option+R
Firefox: Cmd+Shift+R
```

### 3. Disable Browser Cache
**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while developing

### 4. Increase File Watching Limits (macOS)
```bash
# Run the fix script
./scripts/fix-hmr.sh

# Or manually:
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
```

### 5. Restart Dev Server Properly
```bash
# Kill all node processes
pkill -9 node

# Clear port 3000 if stuck
lsof -ti:3000 | xargs kill -9

# Start fresh
pnpm dev
```

## 🔍 Common HMR Issues & Solutions

### Issue 1: Changes Not Reflecting

**Symptoms:**
- Edit file, save, but no update in browser
- Need to manually refresh

**Solutions:**
1. Check if file is in `.gitignore` or `.watchmanconfig` ignore list
2. Ensure file extension is correct (`.tsx` not `.ts` for components)
3. Check for syntax errors (HMR stops on errors)
4. Verify file is imported correctly

**Quick Fix:**
```bash
# Clear everything and restart
rm -rf .next .turbo && pnpm dev
```

### Issue 2: Full Page Reload Instead of HMR

**Symptoms:**
- Page reloads completely instead of hot updating
- Lose component state on every change

**Causes:**
- Syntax error in file
- Export default missing
- Circular dependencies
- Server component importing client component incorrectly

**Solutions:**
```typescript
// ✅ CORRECT - Client component
'use client'

export default function MyComponent() {
  return <div>Hello</div>
}

// ❌ WRONG - Missing 'use client'
export default function MyComponent() {
  const [state, setState] = useState(0) // Error!
  return <div>Hello</div>
}
```

### Issue 3: HMR Stops Working After Some Time

**Symptoms:**
- HMR works initially
- Stops working after 10-20 minutes
- Need to restart dev server

**Causes:**
- Memory leak
- Too many file watchers
- Browser cache full

**Solutions:**
```bash
# 1. Increase memory limit
NODE_OPTIONS='--max-old-space-size=4096' pnpm dev

# 2. Use the optimized dev script
pnpm dev:turbo

# 3. Restart periodically (add to package.json)
"dev:watch": "nodemon --watch 'src/**/*' --exec 'pnpm dev'"
```

### Issue 4: Slow HMR (Takes 5+ Seconds)

**Symptoms:**
- HMR works but very slow
- Long delay between save and update

**Causes:**
- Large bundle size
- Too many dependencies
- Unoptimized imports

**Solutions:**

1. **Use Dynamic Imports:**
```typescript
// ✅ GOOD - Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/charts/Heavy'), {
  loading: () => <Skeleton />,
  ssr: false
})

// ❌ BAD - Import everything upfront
import { HeavyChart } from '@/components/charts/Heavy'
```

2. **Optimize Package Imports:**
```typescript
// ✅ GOOD - Tree-shakeable
import { Button } from '@/components/ui/button'

// ❌ BAD - Imports entire library
import * as UI from '@/components/ui'
```

3. **Check Bundle Size:**
```bash
# Analyze bundle
ANALYZE=true pnpm build

# Check what's causing slow HMR
pnpm build:analyze
```

### Issue 5: HMR Works in Some Files, Not Others

**Symptoms:**
- HMR works in most files
- Specific files don't trigger HMR

**Causes:**
- File in wrong directory
- Circular dependency
- Import path issue

**Solutions:**

1. **Check Import Paths:**
```typescript
// ✅ GOOD - Use path aliases
import { Button } from '@/components/ui/button'

// ❌ BAD - Relative paths can cause issues
import { Button } from '../../../components/ui/button'
```

2. **Check for Circular Dependencies:**
```bash
# Install madge
pnpm add -D madge

# Check for circular deps
npx madge --circular --extensions ts,tsx src/
```

3. **Verify File Location:**
```
✅ src/components/MyComponent.tsx  (HMR works)
❌ components/MyComponent.tsx      (Outside src, HMR may not work)
```

## ⚙️ Configuration Optimizations

### 1. Next.js Config (Already Applied)

```typescript
// next.config.ts
export default {
  turbopack: {
    memoryLimit: 4096, // Increase memory
  },
  experimental: {
    webpackBuildWorker: true, // Faster builds
    optimisticClientCache: true, // Faster refresh
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named', // Stable module IDs
        chunkIds: 'named'
      }
    }
    return config
  }
}
```

### 2. Watchman Config (Already Applied)

```json
// .watchmanconfig
{
  "ignore_dirs": [
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".turbo"
  ]
}
```

### 3. TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true, // Faster rebuilds
    "skipLibCheck": true // Skip type checking node_modules
  }
}
```

## 🚀 Performance Tips

### 1. Use Turbopack (Default in Next.js 16)
```bash
# Already using Turbopack by default
pnpm dev
```

### 2. Reduce Bundle Size
```typescript
// Use barrel exports carefully
// ❌ BAD - Imports everything
export * from './component1'
export * from './component2'
export * from './component3'

// ✅ GOOD - Explicit exports
export { Component1 } from './component1'
export { Component2 } from './component2'
```

### 3. Optimize Images
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
  priority // For above-the-fold images
/>
```

### 4. Code Splitting
```typescript
// Split large pages
const HeavySection = dynamic(() => import('./HeavySection'))

export default function Page() {
  return (
    <div>
      <LightSection />
      <HeavySection />
    </div>
  )
}
```

## 🛠️ Debugging HMR Issues

### 1. Check Console for Errors
```
Browser Console (F12):
- Look for [HMR] messages
- Check for syntax errors
- Look for failed module updates
```

### 2. Check Terminal Output
```
Terminal:
- Look for compilation errors
- Check for file watching issues
- Look for memory warnings
```

### 3. Enable Verbose Logging
```bash
# Add to package.json
"dev:verbose": "NODE_OPTIONS='--trace-warnings' next dev"
```

### 4. Check File Watchers
```bash
# macOS - Check current limits
sysctl kern.maxfiles
sysctl kern.maxfilesperproc

# Linux - Check inotify limits
cat /proc/sys/fs/inotify/max_user_watches
```

## 📋 HMR Checklist

Before reporting HMR issues, verify:

- [ ] Cleared `.next` and `.turbo` folders
- [ ] Restarted dev server
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Disabled browser cache in DevTools
- [ ] No syntax errors in files
- [ ] File is in `src/` directory
- [ ] Using correct import paths
- [ ] No circular dependencies
- [ ] File watching limits increased (macOS)
- [ ] Enough memory available (4GB+)
- [ ] Latest Next.js version

## 🔧 Advanced Fixes

### Fix 1: Reset Everything
```bash
# Nuclear option - reset everything
rm -rf node_modules .next .turbo pnpm-lock.yaml
pnpm install
pnpm dev
```

### Fix 2: Use Different Port
```bash
# Sometimes port 3000 has issues
PORT=3001 pnpm dev
```

### Fix 3: Disable Turbopack (Fallback)
```bash
# Use webpack instead (slower but more stable)
pnpm dev --no-turbopack
```

### Fix 4: Check for Conflicting Processes
```bash
# Kill all node processes
pkill -9 node

# Check what's using port 3000
lsof -i :3000

# Kill specific process
kill -9 <PID>
```

## 📊 Monitoring HMR Performance

### 1. Check HMR Speed
```
Browser Console:
[HMR] Updated modules: 1
[HMR] App is up to date.
Time: ~500ms (Good)
Time: >2000ms (Slow - needs optimization)
```

### 2. Monitor Memory Usage
```bash
# Check Node.js memory
node --max-old-space-size=4096 node_modules/.bin/next dev

# Monitor in Activity Monitor (macOS)
# Look for "node" processes
```

### 3. Profile Build Time
```bash
# Analyze what's slow
NEXT_TELEMETRY_DEBUG=1 pnpm dev
```

## 🎯 Best Practices

### 1. File Organization
```
✅ GOOD:
src/
  components/
    ui/
      button.tsx
    features/
      MyFeature.tsx

❌ BAD:
components/ (outside src)
  everything-in-one-folder/
```

### 2. Import Strategy
```typescript
// ✅ GOOD - Specific imports
import { Button } from '@/components/ui/button'
import { useState } from 'react'

// ❌ BAD - Barrel imports
import * as UI from '@/components/ui'
import * as React from 'react'
```

### 3. Component Structure
```typescript
// ✅ GOOD - Small, focused components
export function Button({ children }: Props) {
  return <button>{children}</button>
}

// ❌ BAD - Large, complex components
export function MegaComponent() {
  // 500 lines of code
  // Multiple responsibilities
  // Hard to HMR
}
```

## 🆘 Still Having Issues?

If HMR still doesn't work after trying everything:

1. **Check Next.js GitHub Issues:**
   - https://github.com/vercel/next.js/issues
   - Search for "HMR" or "Turbopack"

2. **Verify System Requirements:**
   - Node.js 18.17+
   - 4GB+ RAM available
   - macOS 10.15+ / Windows 10+ / Linux

3. **Try Different Browser:**
   - Chrome (best HMR support)
   - Edge
   - Firefox

4. **Check for Conflicting Extensions:**
   - Disable browser extensions
   - Try incognito mode

5. **Report Issue:**
   - Include Next.js version
   - Include error messages
   - Include reproduction steps

## 📚 Resources

- [Next.js HMR Docs](https://nextjs.org/docs/architecture/fast-refresh)
- [Turbopack Docs](https://turbo.build/pack/docs)
- [Webpack HMR Guide](https://webpack.js.org/concepts/hot-module-replacement/)

---

**Quick Command Reference:**

```bash
# Clear cache
rm -rf .next .turbo

# Fix file watchers (macOS)
./scripts/fix-hmr.sh

# Restart dev server
pkill -9 node && pnpm dev

# Check bundle size
ANALYZE=true pnpm build

# Verbose logging
NODE_OPTIONS='--trace-warnings' pnpm dev
```

---

**Status:** ✅ OPTIMIZED  
**Last Updated:** October 30, 2025
