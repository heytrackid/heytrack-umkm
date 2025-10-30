# Hydration Error Fix Guide

## Problem

Hydration errors terjadi ketika HTML yang di-render di server berbeda dengan yang di-render di client. Error ini muncul sebagai:

```
Uncaught Error: Hydration failed because the server rendered HTML didn't match the client.
```

## Common Causes

1. **Conditional rendering based on client-only state** (loading, mounted, etc)
2. **Using browser APIs** (window, document, localStorage) during render
3. **Date/time rendering** (server time ≠ client time)
4. **Random values** (Math.random(), uuid) during render
5. **Third-party libraries** that use browser APIs

## Solution Pattern

### Use `isMounted` State

```typescript
'use client'

import { useState, useEffect } from 'react'

export function MyComponent() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Prevent hydration mismatch
  if (!isMounted) {
    return <LoadingSkeleton />
  }
  
  // Safe to render client-specific content
  return <div>...</div>
}
```

### Why This Works

1. **Server render**: `isMounted = false` → renders skeleton
2. **Client hydration**: `isMounted = false` → matches server (no error!)
3. **After mount**: `useEffect` runs → `isMounted = true` → re-renders with full content

## When to Use

Use this pattern when:
- Component uses `useQuery` or data fetching hooks
- Component has loading states
- Component uses browser APIs
- Component renders differently based on client state

## Example: Fixed Operational Costs Page

```typescript
export const EnhancedOperationalCostsPage = () => {
  const { data: costs, loading } = useSupabaseQuery('operational_costs')
  
  // ✅ Hydration fix
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Prevent SSR/client mismatch
  if (!isMounted) {
    return <LoadingSkeleton />
  }
  
  // Now safe to render based on loading/data state
  if (loading) return <LoadingSpinner />
  if (!costs) return <EmptyState />
  
  return <DataView data={costs} />
}
```

## Alternative Solutions

### 1. Suppress Hydration Warning (Use Sparingly!)

```typescript
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>
```

Only use for:
- Timestamps that will be different server/client
- Third-party widgets you can't control

### 2. Client-Only Rendering

```typescript
import dynamic from 'next/dynamic'

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)
```

Use for:
- Heavy client-side libraries
- Components that MUST use browser APIs
- Third-party widgets

### 3. useEffect for Browser APIs

```typescript
export function MyComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Safe - only runs on client
    const stored = localStorage.getItem('key')
    setData(stored)
  }, [])
  
  return <div>{data}</div>
}
```

## Testing for Hydration Errors

1. **Development**: Errors show in console with stack trace
2. **Check server HTML**: View page source to see server-rendered HTML
3. **Compare with client**: Use React DevTools to see client-rendered HTML
4. **Look for differences**: Any mismatch will cause hydration error

## Prevention Checklist

Before deploying client components:

- [ ] No browser APIs (window, document) in render
- [ ] No Date/time rendering without suppressHydrationWarning
- [ ] No random values during render
- [ ] Loading states handled with isMounted pattern
- [ ] Third-party libraries wrapped with dynamic import if needed

## Common Mistakes

### ❌ DON'T:

```typescript
// Conditional render based on loading (SSR vs client mismatch)
if (loading) return <Spinner />
if (!data) return <Empty />
return <Data />

// Browser API in render
const width = window.innerWidth // Error!

// Date in render
<div>{new Date().toLocaleString()}</div> // Different server/client
```

### ✅ DO:

```typescript
// Use isMounted guard
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
if (!isMounted) return <Skeleton />

// Browser API in useEffect
useEffect(() => {
  const width = window.innerWidth
  setWidth(width)
}, [])

// Suppress hydration for dates
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>
```

## Resources

- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Docs](https://react.dev/reference/react-dom/client/hydrateRoot)

---

**Last Updated:** October 30, 2025  
**Status:** ✅ IMPLEMENTED
