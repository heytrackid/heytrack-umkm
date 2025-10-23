# HMR Quick Checklist ⚡

## Before Creating New File

### Client Component (`.tsx` with `'use client'`)
```
✅ MUST HAVE:
  □ 'use client' at very top
  □ import * as React from 'react'
  □ import { useState, ... } from 'react'
  □ export default FUNCTION_NAME  (NO React.memo!)
  
❌ NEVER DO:
  □ React.memo()
  □ HOC wrappers
  □ Duplicate React imports
```

### Hook (custom hook file)
```
✅ MUST HAVE:
  □ 'use client' at top
  □ import * as React from 'react'
  □ export function useXXX()
  
❌ NEVER DO:
  □ React.memo()
  □ Forget React import
```

### Dynamic Component
```
✅ MUST HAVE:
  □ dynamic(() => import('./X').then(mod => ({ default: mod.default })))
  □ loading: () => <Skeleton />
  □ ssr: false (untuk client-only)
  
❌ NEVER DO:
  □ dynamic(() => import('./X'))  ← Missing .then()!
```

---

## If HMR Error Happens

1. Check console error message
2. Go to file mentioned
3. Verify:
   - [ ] Has `'use client'`?
   - [ ] Has `import * as React`?
   - [ ] Has `React.memo()`? → REMOVE!
   - [ ] Duplicate React imports? → REMOVE!
4. Save file
5. HMR should work instantly

If not:
```bash
# Hard reset
rm -rf .next
Ctrl+C (stop dev server)
pnpm dev
```

---

## Copy-Paste Templates

**New Client Component:**
```bash
# Copy this to create new component
'use client'

import * as React from 'react'
import { useState } from 'react'

function MyComponent() {
  return <div>Hello</div>
}

export default MyComponent
```

**New Hook:**
```bash
# Copy this to create new hook
'use client'

import * as React from 'react'
import { useState } from 'react'

export function useMyHook() {
  const [state, setState] = useState('')
  return { state }
}
```

---

## Command Reference

```bash
# Check for React.memo in codebase
rg "React\.memo" src/

# Check for missing React imports in 'use client' files
rg -l "'use client'" src/ | xargs -I {} sh -c 'grep -L "import \* as React" {} && echo {}'

# Build & test
pnpm build

# Start dev
pnpm dev
```

---

## Rules to Remember

| DO ✅ | DON'T ❌ |
|-------|---------|
| `'use client'` at top | Missing `'use client'` |
| `import * as React from 'react'` | `import { useState } from 'react'` alone |
| `export default MyComponent` | `export default React.memo(MyComponent)` |
| Dynamic: `.then(mod => ({ default: mod.default }))` | Dynamic: `import('./X')` |
| Simple function exports | HOC/wrapper exports |

---

**Ingat:** HMR stable = dev experience smooth = happy coding! 🚀
