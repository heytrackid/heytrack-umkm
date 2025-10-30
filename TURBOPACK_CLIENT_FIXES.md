# Turbopack Client Component Fixes

## Issue: `process.env` Not Available in Client Components

### Problem
When using Turbopack (Next.js 16), `process.env` is not available in client components, causing runtime errors:

```
Module [project]/node_modules/next/dist/build/polyfills/process.js was instantiated 
because it was required from module [...], but the module factory is not available.
```

### Root Cause
Turbopack handles environment variables differently than Webpack. `process.env` is not polyfilled in client components.

## ✅ Solutions Applied

### 1. Remove `process.env.NODE_ENV` Checks in Client Components

**Before (❌ Broken):**
```typescript
'use client'

export function MyComponent() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug info')
  }
}
```

**After (✅ Fixed):**
```typescript
'use client'

export function MyComponent() {
  // Option 1: Always show (simplest)
  console.log('Debug info')
  
  // Option 2: Check hostname
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1')
  
  if (isDev) {
    console.log('Debug info')
  }
}
```

### 2. Use Utility Function for Environment Checks

Created `src/lib/utils/env.ts`:

```typescript
// Check if we're in development mode
export const isDevelopment = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  : false

// Check if we're in production mode
export const isProduction = !isDevelopment

// Check if running in browser
export const isBrowser = typeof window !== 'undefined'

// Check if running on server
export const isServer = typeof window === 'undefined'
```

**Usage:**
```typescript
'use client'

import { isDevelopment } from '@/lib/utils/env'

export function MyComponent() {
  if (isDevelopment) {
    console.log('Debug info')
  }
}
```

### 3. Use `NEXT_PUBLIC_*` for Client-Side Env Vars

**For environment variables needed in client:**

```typescript
// ✅ CORRECT - Use NEXT_PUBLIC_ prefix
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ❌ WRONG - Won't work in client components
const apiKey = process.env.API_KEY
```

**In `.env.local`:**
```bash
# Client-side (available in browser)
NEXT_PUBLIC_API_URL=https://api.example.com

# Server-side only (NOT available in browser)
API_SECRET_KEY=secret123
```

## 📁 Files Fixed

### Error Boundaries
- ✅ `src/components/shared/ErrorBoundary.tsx`
- ✅ `src/components/error-boundaries/GlobalErrorBoundary.tsx`
- ✅ `src/components/error-boundaries/RouteErrorBoundary.tsx`
- ✅ `src/components/ui/ErrorBoundary.tsx`
- ✅ `src/app/error.tsx`

### Performance Monitoring
- ✅ `src/lib/performance/web-vitals.tsx`

### Layout
- ✅ `src/app/layout.tsx` (removed debug flag)

## 🎯 Best Practices

### 1. Server Components (Default)
```typescript
// No 'use client' directive
// Can use process.env directly
export default function ServerComponent() {
  const apiKey = process.env.API_KEY // ✅ Works
  return <div>...</div>
}
```

### 2. Client Components
```typescript
'use client'

// ❌ DON'T use process.env.NODE_ENV
if (process.env.NODE_ENV === 'development') { }

// ✅ DO use hostname check
const isDev = typeof window !== 'undefined' && 
  window.location.hostname === 'localhost'

// ✅ DO use NEXT_PUBLIC_ vars
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### 3. Shared Logic
```typescript
// src/lib/utils/env.ts
export const isDevelopment = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost'
  : false

// Use in components
import { isDevelopment } from '@/lib/utils/env'
```

## 🔍 How to Find Issues

### Search for `process.env` in Client Components
```bash
# Find all process.env usage
grep -r "process.env" src/

# Find in .tsx files only
grep -r "process.env" src/ --include="*.tsx"

# Find with context
grep -r "process.env" src/ -A 2 -B 2
```

### Check if File is Client Component
```typescript
// If file has 'use client' at top, it's a client component
'use client'

// Or if it uses hooks (useState, useEffect, etc.)
import { useState } from 'react'
```

## 🚨 Common Mistakes

### Mistake 1: Using `process.env.NODE_ENV` in Client
```typescript
'use client'

// ❌ WRONG - Will cause error
if (process.env.NODE_ENV === 'development') {
  console.log('Debug')
}

// ✅ CORRECT
const isDev = typeof window !== 'undefined' && 
  window.location.hostname === 'localhost'
if (isDev) {
  console.log('Debug')
}
```

### Mistake 2: Forgetting `NEXT_PUBLIC_` Prefix
```typescript
'use client'

// ❌ WRONG - Not available in client
const apiUrl = process.env.API_URL

// ✅ CORRECT - Use NEXT_PUBLIC_ prefix
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### Mistake 3: Checking Environment in Render
```typescript
'use client'

// ❌ WRONG - Causes hydration mismatch
export function MyComponent() {
  return (
    <div>
      {process.env.NODE_ENV === 'development' && <Debug />}
    </div>
  )
}

// ✅ CORRECT - Use state or effect
export function MyComponent() {
  const [showDebug, setShowDebug] = useState(false)
  
  useEffect(() => {
    setShowDebug(window.location.hostname === 'localhost')
  }, [])
  
  return (
    <div>
      {showDebug && <Debug />}
    </div>
  )
}
```

## 🛠️ Migration Checklist

When migrating to Turbopack:

- [ ] Search for `process.env` in all `.tsx` files
- [ ] Check if file is client component ('use client')
- [ ] Replace `process.env.NODE_ENV` with hostname check
- [ ] Add `NEXT_PUBLIC_` prefix to client-side env vars
- [ ] Test in development mode
- [ ] Test in production build
- [ ] Check browser console for errors

## 📚 References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Turbopack Documentation](https://turbo.build/pack/docs)
- [Client vs Server Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

**Status:** ✅ FIXED  
**Last Updated:** October 30, 2025  
**Next.js Version:** 16.0.0 (Turbopack)
