# HMR Prevention Guide - Next.js 16 Turbopack

## Root Cause (Reminder)
Turbopack menghapus module factory saat HMR update. Jika components masih reference old factory atau menggunakan HOC seperti `React.memo()`, terjadi error: "module factory not available".

## Golden Rules (Untuk New Files)

### 1. Client Components Pattern ✅

```typescript
'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

interface MyComponentProps {
  // props
}

function MyComponent({ ...props }: MyComponentProps) {
  // Component logic
  return (
    // JSX
  )
}

export default MyComponent
```

**Checklist:**
- ✅ `'use client'` at top
- ✅ `import * as React from 'react'` (ALWAYS)
- ✅ Named function (not arrow function)
- ✅ Simple export (NO React.memo)
- ✅ NO HOC wrappers

### 2. Hooks Pattern ✅

```typescript
'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

export function useMyHook() {
  const [state, setState] = useState('')
  
  useEffect(() => {
    // effect
  }, [])
  
  return { state }
}
```

**Checklist:**
- ✅ `'use client'` at top
- ✅ `import * as React from 'react'`
- ✅ Export function with `use` prefix
- ✅ NO React.memo
- ✅ NO default exports

### 3. Dynamic Imports Pattern ✅

```typescript
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const LazyComponent = dynamic(
  () => import('./Component').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
)

export default function Page() {
  return <LazyComponent />
}
```

**Checklist:**
- ✅ Use `.then(mod => ({ default: mod.default }))`
- ✅ Set `ssr: false` for client-only
- ✅ Provide loading fallback
- ✅ NO missing loading states

### 4. What to AVOID ❌

```typescript
// ❌ WRONG - Akan cause HMR error
export const Component = React.memo(function Component() {
  // ...
})

// ❌ WRONG - Missing React import
'use client'
import { useState } from 'react'
function Component() { ... }

// ❌ WRONG - Dynamic import tanpa explicit resolution
const Lazy = dynamic(() => import('./Component'))

// ❌ WRONG - Server component dengan React hooks
export default function Page() {
  const [state, setState] = useState() // ❌ Error!
}
```

---

## Development Tips

### Before Each Dev Session
```bash
# Clear Next.js cache
rm -rf .next

# Start dev server
pnpm dev
```

### Monitor Console
Watch for these warnings:
- ❌ "Module was instantiated because it was required from module, but the module factory is not available"
- ❌ "React is not defined"
- ✅ Fast refresh indicator showing up

### If HMR Error Occurs
1. Identify the problematic file (check console error)
2. Verify file follows patterns above
3. Check for React.memo() or HOCs
4. Check for duplicate React imports
5. Restart dev server: `Ctrl+C` then `pnpm dev`

---

## ESLint Rules (Optional)

Add to `.eslintrc.json` to prevent future issues:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["react"],
            "importNames": [],
            "message": "Use 'import * as React from \"react\"' with named imports for 'use client' files"
          }
        ]
      }
    ]
  }
}
```

---

## File Templates

### New Client Component
```bash
# Copy this template untuk new client components
cat > src/components/MyComponent.tsx << 'EOF'
'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

interface MyComponentProps {
  // Define props
}

function MyComponent({ }: MyComponentProps) {
  return (
    <div>
      {/* Component UI */}
    </div>
  )
}

export default MyComponent
EOF
```

### New Hook
```bash
# Copy ini untuk new hooks
cat > src/hooks/useMyHook.ts << 'EOF'
'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

export function useMyHook() {
  const [state, setState] = useState('')
  
  useEffect(() => {
    // effect
  }, [])
  
  return { state }
}
EOF
```

---

## Quick Reference Checklist

Sebelum push, pastikan:

- [ ] Semua `'use client'` files punya `import * as React from 'react'`
- [ ] NO `React.memo()` on any component
- [ ] NO HOC wrappers (only simple exports)
- [ ] Dynamic imports use explicit `.then()` resolution
- [ ] NO duplicate React imports
- [ ] Component names match file names
- [ ] NO circular dependencies
- [ ] Build passes: `pnpm build`
- [ ] Dev server works: `pnpm dev`

---

## Common Patterns by Use Case

### Auth Form Component
```typescript
'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Login</Button>
    </form>
  )
}

export default LoginForm
```

### Data Fetching Component
```typescript
'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

function DataDisplay() {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const res = await fetch('/api/data')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading...</div>

  return <div>{JSON.stringify(data)}</div>
}

export default DataDisplay
```

### Modal/Dialog Component
```typescript
'use client'

import * as React from 'react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

function MyModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Modal</DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MyModal
```

---

## Pre-commit Hook (Optional)

Add to `.git/hooks/pre-commit` to auto-check:

```bash
#!/bin/bash

# Check for React.memo in client components
if git diff --cached --name-only | grep -E '\.(tsx|ts)$'; then
  if git diff --cached | grep -l "React\.memo\|@memo" | grep "'use client'"; then
    echo "❌ Error: React.memo found in 'use client' files"
    echo "   Remove React.memo to prevent HMR issues"
    exit 1
  fi
fi

echo "✅ HMR check passed"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Summary

**Jangan pernah:**
- ❌ Gunakan `React.memo()` on client components
- ❌ Forget `import * as React from 'react'`
- ❌ Gunakan HOC wrappers
- ❌ Gunakan dynamic import tanpa `.then()`

**Selalu:**
- ✅ Simple function exports
- ✅ Namespace React import
- ✅ Clear .next folder saat error
- ✅ Restart dev server setelah major changes
- ✅ Test HMR dengan edit & save

---

**Status:** 🟢 Follow guide ini dan HMR errors akan hilang!
