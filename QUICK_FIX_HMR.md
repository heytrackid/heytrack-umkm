# 🚨 Quick Fix: HMR Errors

## Error: "React is not defined"

### Quick Fix:
```bash
./scripts/fix-all-hmr-issues.sh
rm -rf .next
pnpm dev
```

## Error: "Module factory is not available"

### Quick Fix:
```bash
./scripts/fix-all-hmr-issues.sh
rm -rf .next
pnpm dev
```

## Error: "React is defined multiple times"

### Quick Fix:
```bash
./scripts/fix-all-react-imports.sh
rm -rf .next
pnpm dev
```

## Prevention for New Files

### Client Components:
```typescript
'use client'

import * as React from 'react'
import { useState } from 'react'

function MyComponent() {
  // ...
}

// Simple export - React.memo causes HMR issues with Turbopack
export default MyComponent
```

### Hooks:
```typescript
'use client'

import * as React from 'react'
import { useState } from 'react'

export function useMyHook() {
  // ...
}
```

### Dynamic Imports:
```typescript
const LazyComponent = dynamic(
  () => import('./Component').then(mod => ({ default: mod.default })),
  { ssr: false, loading: () => <Skeleton /> }
)
```

## Common Issues & Solutions

| Error | Solution | Script |
|-------|----------|--------|
| React is not defined | Add React import | `fix-react-references.sh` |
| Module factory not available | Add namespace import | `fix-hmr-imports.sh` |
| React defined multiple times | Remove duplicates | `fix-all-react-imports.sh` |
| HMR not working | Run all fixes | `fix-all-hmr-issues.sh` |

## Emergency Reset

If nothing works:
```bash
# 1. Clean everything
rm -rf .next node_modules

# 2. Reinstall
pnpm install

# 3. Fix all HMR issues
./scripts/fix-all-hmr-issues.sh

# 4. Start fresh
pnpm dev
```

## Documentation

- **Full Analysis:** `docs/HMR_ERROR_ROOT_CAUSE.md`
- **Complete Guide:** `HMR_FIX_COMPLETE.md`
- **Summary:** `HMR_FIX_SUMMARY.md`

## Support

Still having issues? Check:
1. Console for specific error messages
2. File that's causing the error
3. Run diagnostics: `./scripts/fix-all-hmr-issues.sh`
4. Clear cache: `rm -rf .next`
5. Restart dev server

---

**Last Updated:** $(date)  
**Next.js Version:** 16.0.0 (Turbopack)
