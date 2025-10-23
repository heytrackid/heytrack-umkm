# HMR Error Root Cause Analysis & Prevention

## 🔍 Root Cause

Error HMR di Next.js 16 dengan Turbopack terjadi karena:

### 1. **Module Factory Deletion**
```
Module was instantiated because it was required from module, 
but the module factory is not available. 
It might have been deleted in an HMR update.
```

**Penyebab:**
- Turbopack menghapus module factory saat Hot Module Replacement
- Komponen yang masih memiliki referensi ke module lama mencoba mengaksesnya
- Terjadi race condition antara module update dan component re-render

### 2. **React Import Pattern Issue**
```typescript
// ❌ PROBLEMATIC - Dapat menyebabkan HMR error
import { useState, useEffect } from 'react'

// ✅ CORRECT - Stabil saat HMR
import * as React from 'react'
import { useState, useEffect } from 'react'
```

**Mengapa?**
- Named imports langsung dari 'react' bisa kehilangan referensi saat HMR
- React namespace import (`import * as React`) lebih stabil
- Turbopack dapat track dependencies lebih baik dengan namespace import

### 3. **Dynamic Import tanpa Explicit Resolution**
```typescript
// ❌ PROBLEMATIC
const Component = dynamic(() => import('./Component'))

// ✅ CORRECT
const Component = dynamic(() => 
  import('./Component').then(mod => ({ default: mod.default }))
)
```

**Mengapa?**
- Turbopack butuh explicit module resolution
- Tanpa `.then()`, module factory bisa hilang saat HMR
- Explicit resolution memastikan default export selalu tersedia

### 4. **Component tanpa Memoization**
```typescript
// ❌ PROBLEMATIC - Re-render berlebihan
export default function Component() { ... }

// ✅ CORRECT - Stabil saat HMR
function Component() { ... }
Component.displayName = 'Component'
export default React.memo(Component)
```

**Mengapa?**
- Re-render berlebihan memicu HMR issues
- React.memo mencegah unnecessary re-renders
- displayName membantu debugging HMR issues

## 🛠️ Solutions Applied

### 1. Next.js Configuration
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Remove webpack config (not compatible with Turbopack)
  // webpack: (config) => { ... } // ❌ REMOVE THIS
  
  // Add empty turbopack config to silence warning
  turbopack: {}, // ✅ ADD THIS
}
```

### 2. Component Pattern
```typescript
'use client'

import * as React from 'react' // ✅ Always add this
import { useState, useEffect } from 'react'

function MyComponent() {
  // Component logic
}

MyComponent.displayName = 'MyComponent' // ✅ Add displayName
export default React.memo(MyComponent) // ✅ Use React.memo
```

### 3. Dynamic Import Pattern
```typescript
const LazyComponent = dynamic(
  () => import('./Component').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <Skeleton />
  }
)
```

### 4. Hook Pattern
```typescript
'use client'

import * as React from 'react' // ✅ Always add this
import { useState, useEffect } from 'react'

export function useMyHook() {
  // Hook logic
}
```

## 📋 Checklist untuk Prevent HMR Errors

### Client Components (`'use client'`)
- [ ] Add `import * as React from 'react'` at the top
- [ ] Use `React.memo()` for export
- [ ] Add `displayName` property
- [ ] Use explicit module resolution in dynamic imports

### Hooks
- [ ] Add `import * as React from 'react'` at the top
- [ ] Avoid circular dependencies
- [ ] Use stable references (useCallback, useMemo)

### Dynamic Imports
- [ ] Use `.then(mod => ({ default: mod.default }))`
- [ ] Provide loading fallback
- [ ] Set `ssr: false` for client-only components

### Configuration
- [ ] Remove webpack config if using Turbopack
- [ ] Add `turbopack: {}` to silence warnings
- [ ] Use Turbopack-specific configs if needed

## 🔄 Migration Steps

### Step 1: Identify Problematic Files
```bash
# Find all client components without React namespace import
grep -r "'use client'" src --include="*.tsx" --include="*.ts" | \
  cut -d: -f1 | \
  xargs grep -L "import \* as React"
```

### Step 2: Auto-fix with Script
```bash
chmod +x scripts/fix-hmr-imports.sh
./scripts/fix-hmr-imports.sh
```

### Step 3: Manual Review
- Check dynamic imports
- Add React.memo where needed
- Add displayName to components
- Test HMR behavior

### Step 4: Verify
```bash
# Start dev server
pnpm dev

# Make changes to components
# Verify no HMR errors in console
```

## 🎯 Best Practices

### 1. Always Use React Namespace Import
```typescript
// In every 'use client' file
import * as React from 'react'
```

### 2. Avoid React.memo in Development (Turbopack Issue)
```typescript
// ❌ Causes HMR errors with Turbopack
export default React.memo(Component)

// ✅ Use simple export
export default Component
```

### 3. Explicit Dynamic Imports
```typescript
// Always use explicit resolution
dynamic(() => import('./X').then(mod => ({ default: mod.default })))
```

### 4. Stable References
```typescript
// Use useCallback and useMemo
const handleClick = useCallback(() => { ... }, [deps])
const value = useMemo(() => ({ ... }), [deps])
```

### 5. Avoid Circular Dependencies
```typescript
// ❌ BAD
// A imports B, B imports A

// ✅ GOOD
// Extract shared logic to separate file
```

## 📊 Impact

### Before Fix
- ❌ Frequent HMR errors
- ❌ Need to refresh page manually
- ❌ Slow development experience
- ❌ Module factory errors

### After Fix
- ✅ Stable HMR
- ✅ Automatic updates work
- ✅ Fast development experience
- ✅ No module factory errors
- ✅ Better performance with React.memo

## 🔗 References

- [Next.js 16 Turbopack Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [React HMR Best Practices](https://react.dev/learn/preserving-and-resetting-state)
- [Turbopack Module Resolution](https://turbo.build/pack/docs/features/module-resolution)

## 💡 Tips

1. **Always restart dev server** after major changes
2. **Clear .next folder** if HMR still problematic: `rm -rf .next`
3. **Use React DevTools** to identify unnecessary re-renders
4. **Monitor console** for HMR warnings
5. **Test in production build** to ensure no issues: `pnpm build`

## 🚨 Common Pitfalls

### 1. Forgetting React Namespace Import
```typescript
// ❌ Will cause HMR errors
'use client'
import { useState } from 'react'

// ✅ Correct
'use client'
import * as React from 'react'
import { useState } from 'react'
```

### 2. Using Webpack Config with Turbopack
```typescript
// ❌ Will cause build error
webpack: (config) => { ... }

// ✅ Use turbopack config instead
turbopack: {}
```

### 3. Not Using Explicit Module Resolution
```typescript
// ❌ May lose module factory
dynamic(() => import('./Component'))

// ✅ Explicit resolution
dynamic(() => import('./Component').then(mod => ({ default: mod.default })))
```

## 📝 Summary

HMR errors di Next.js 16 Turbopack disebabkan oleh:
1. Module factory deletion saat HMR update
2. React import pattern yang tidak stabil
3. Dynamic imports tanpa explicit resolution
4. Component re-renders yang berlebihan

Solusinya:
1. Selalu gunakan `import * as React from 'react'`
2. Gunakan `React.memo()` dan `displayName`
3. Explicit module resolution di dynamic imports
4. Remove webpack config, gunakan turbopack config
5. Stable references dengan useCallback/useMemo

Dengan mengikuti pattern ini, HMR akan berjalan stabil dan development experience akan jauh lebih baik! 🚀
