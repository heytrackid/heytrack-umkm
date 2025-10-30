# Hydration Error - Quick Fix Reference

## 🚨 Symptoms

```
Uncaught Error: Hydration failed because the server rendered HTML 
didn't match the client.
```

---

## ⚡ Quick Fix (Copy-Paste)

### Step 1: Add to imports
```typescript
import { useState, useEffect } from 'react'
```

### Step 2: Add to component (top of function)
```typescript
const [isMounted, setIsMounted] = useState(false)
useEffect(() => {
  setIsMounted(true)
}, [])
```

### Step 3: Add guard before conditional render
```typescript
// Before any if (loading) or if (!data) checks
if (!isMounted) {
  return <LoadingSkeleton />
}
```

---

## 📋 Complete Example

### Before (❌ Broken)
```typescript
'use client'

export function MyComponent() {
  const { data, loading } = useQuery(...)
  
  if (loading) return <Spinner />  // ❌ Hydration error!
  if (!data) return <Empty />
  
  return <DataView data={data} />
}
```

### After (✅ Fixed)
```typescript
'use client'

import { useState, useEffect } from 'react'

export function MyComponent() {
  const { data, loading } = useQuery(...)
  
  // ✅ Add this
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // ✅ Add this guard
  if (!isMounted) {
    return <LoadingSkeleton />
  }
  
  // Now safe
  if (loading) return <Spinner />
  if (!data) return <Empty />
  
  return <DataView data={data} />
}
```

---

## 🎯 When to Use

Use this fix when your component:
- ✅ Uses `useQuery`, `useSWR`, or `useSupabaseQuery`
- ✅ Has `if (loading)` or `if (isLoading)` checks
- ✅ Conditionally renders based on async data
- ✅ Uses browser APIs (window, document, localStorage)
- ✅ Shows hydration errors in console

---

## ⚠️ Common Mistakes

### ❌ DON'T: Forget the guard
```typescript
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])

// Missing guard!
if (loading) return <Spinner />  // Still breaks!
```

### ❌ DON'T: Put guard after loading check
```typescript
if (loading) return <Spinner />  // Too late!

if (!isMounted) return <Skeleton />  // Wrong order
```

### ❌ DON'T: Use different skeleton in guard
```typescript
if (!isMounted) return <SkeletonA />  // Different skeleton
if (loading) return <SkeletonB />     // Causes flash
```

### ✅ DO: Use same skeleton
```typescript
if (!isMounted || loading) {
  return <LoadingSkeleton />  // Same skeleton for both
}
```

---

## 🔍 Debugging Tips

### 1. Check Console
Look for: `Hydration failed` or `Text content does not match`

### 2. View Page Source
- Right-click → View Page Source
- See what server rendered
- Compare with React DevTools

### 3. Disable JavaScript
- See what server sends
- Should match initial client render

### 4. Add Logging
```typescript
useEffect(() => {
  console.log('Component mounted')
  setIsMounted(true)
}, [])

console.log('Rendering:', { isMounted, loading, data })
```

---

## 📚 Related Patterns

### Pattern 1: Suppress Hydration (Use Sparingly)
```typescript
<div suppressHydrationWarning>
  {new Date().toLocaleString()}  // Different server/client
</div>
```

### Pattern 2: Client-Only Component
```typescript
import dynamic from 'next/dynamic'

const ClientOnly = dynamic(
  () => import('./ClientOnly'),
  { ssr: false }
)
```

### Pattern 3: useEffect for Browser APIs
```typescript
useEffect(() => {
  // Safe - only runs on client
  const data = localStorage.getItem('key')
  setData(data)
}, [])
```

---

## ✅ Checklist

Before committing:
- [ ] Added `isMounted` state
- [ ] Added `useEffect` to set mounted
- [ ] Added guard before conditional renders
- [ ] Tested in browser (no console errors)
- [ ] Tested loading state works
- [ ] Tested on mobile and desktop

---

## 🆘 Still Having Issues?

1. Check `.kiro/steering/hydration-fix-guide.md` for detailed guide
2. Check `.kiro/analysis/hydration-errors-scan.md` for similar examples
3. Search codebase for fixed components: `grep -r "isMounted" src/`

---

**Quick Reference:** Bookmark this file for fast fixes!
