# Named Exports Migration Guide

## Overview

This guide documents the migration from mixed default/named exports to a consistent **named exports** strategy across the HeyTrack codebase.

## Why Named Exports?

### Benefits
1. **Better Tree-Shaking**: Bundlers can eliminate unused exports more effectively
2. **Refactoring Safety**: Renaming components updates all imports automatically
3. **IDE Auto-Import**: Consistent naming across imports
4. **Multiple Exports**: Export multiple items from a single file
5. **No Naming Conflicts**: Imports must use the exact exported name
6. **Consistency**: One clear rule for 99% of files

### Comparison

```tsx
// ❌ Default Export (old way)
export default function Button() { }
import Button from '@/components/Button'  // Can rename: import Btn from ...

// ✅ Named Export (new way)
export function Button() { }
import { Button } from '@/components/Button'  // Must use exact name
```

## Migration Strategy

### Automated Conversion

Use the provided script for safe, automated conversion:

```bash
# 1. Preview changes (dry-run)
node scripts/convert-to-named-exports.js --dry-run

# 2. Apply changes
node scripts/convert-to-named-exports.js

# 3. Verify
pnpm run type-check
pnpm run lint
pnpm run dev
```

### What the Script Does

1. **Scans** all files in:
   - `src/components/`
   - `src/modules/`
   - `src/hooks/`
   - `src/lib/`
   - `src/services/`
   - `src/utils/`
   - `src/providers/`

2. **Skips** Next.js special files:
   - `page.tsx` - Must use default export
   - `layout.tsx` - Must use default export
   - `route.ts` - Must use default export
   - `error.tsx` - Must use default export
   - `not-found.tsx` - Must use default export
   - `loading.tsx` - Must use default export
   - `global-error.tsx` - Must use default export
   - `middleware.ts` - Must use default export

3. **Converts** default exports to named exports:
   ```tsx
   // Before
   export default function OrderForm() { }
   
   // After
   export function OrderForm() { }
   ```

4. **Updates** all import statements:
   ```tsx
   // Before
   import OrderForm from '@/components/OrderForm'
   
   // After
   import { OrderForm } from '@/components/OrderForm'
   ```

5. **Creates backups** before modifying files (auto-deleted on success)

## Manual Migration

For files not covered by the script or requiring special handling:

### Step 1: Convert Export

```tsx
// Before
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>
}
export default Button

// After
export const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>
}
```

### Step 2: Update Imports

```tsx
// Before
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'

// After
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### Step 3: Update Re-exports

```tsx
// Before (index.ts)
export { default as Button } from './button'
export { default as Card } from './card'

// After (index.ts)
export { Button } from './button'
export { Card } from './card'

// Or use wildcard
export * from './button'
export * from './card'
```

## Exception: Next.js Special Files

These files **MUST** use default exports (Next.js requirement):

```tsx
// ✅ page.tsx - MUST use default export
export default function OrdersPage() {
  return <div>Orders</div>
}

// ✅ layout.tsx - MUST use default export
export default function OrdersLayout({ children }) {
  return <div>{children}</div>
}

// ✅ route.ts - MUST use default export
export default async function GET(req: NextRequest) {
  return NextResponse.json({ data: [] })
}

// ✅ error.tsx - MUST use default export
export default function Error({ error, reset }) {
  return <div>Error: {error.message}</div>
}
```

## Common Patterns

### Components

```tsx
// ✅ Single component
export function Button({ children }: ButtonProps) {
  return <button>{children}</button>
}

// ✅ Multiple components in one file
export function Card({ children }: CardProps) {
  return <div className="card">{children}</div>
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>
}
```

### Hooks

```tsx
// ✅ Custom hook
export function useAuth() {
  const [user, setUser] = useState(null)
  // ... hook logic
  return { user, setUser }
}

// ✅ Multiple hooks
export function useOrders() { }
export function useOrderPricing() { }
```

### Services

```tsx
// ✅ Service class
export class OrderService {
  async createOrder(data: OrderData) {
    // ... implementation
  }
}

// ✅ Service functions
export async function createOrder(data: OrderData) { }
export async function updateOrder(id: string, data: OrderData) { }
```

### Utils

```tsx
// ✅ Utility functions
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('id-ID')
}
```

### Types

```tsx
// ✅ Type definitions
export type User = {
  id: string
  name: string
  email: string
}

export interface Order {
  id: string
  userId: string
  total: number
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled'
```

## Verification Checklist

After migration, verify:

- [ ] All files compile without errors: `pnpm run type-check`
- [ ] No linting errors: `pnpm run lint`
- [ ] Dev server starts: `pnpm run dev`
- [ ] All pages load correctly
- [ ] No runtime errors in browser console
- [ ] All imports resolve correctly
- [ ] Next.js special files still use default exports

## Troubleshooting

### Issue: "Module has no exported member"

**Cause**: Import statement not updated

**Fix**:
```tsx
// ❌ Old import
import Button from '@/components/ui/button'

// ✅ New import
import { Button } from '@/components/ui/button'
```

### Issue: "Default export not found"

**Cause**: File converted to named export but import still uses default

**Fix**: Update import to use named import (see above)

### Issue: Next.js page not rendering

**Cause**: Page component converted to named export

**Fix**: Revert page.tsx to default export:
```tsx
// ✅ page.tsx MUST use default export
export default function MyPage() {
  return <div>Content</div>
}
```

### Issue: API route not working

**Cause**: Route handler converted to named export

**Fix**: Revert route.ts to default export:
```tsx
// ✅ route.ts MUST use default export
export default async function GET(req: NextRequest) {
  return NextResponse.json({ data: [] })
}
```

## ESLint Configuration

Add ESLint rule to enforce named exports:

```json
{
  "rules": {
    "import/no-default-export": "error",
    "import/prefer-default-export": "off"
  },
  "overrides": [
    {
      "files": [
        "**/page.tsx",
        "**/layout.tsx",
        "**/route.ts",
        "**/error.tsx",
        "**/not-found.tsx",
        "**/loading.tsx",
        "**/global-error.tsx",
        "**/middleware.ts"
      ],
      "rules": {
        "import/no-default-export": "off"
      }
    }
  ]
}
```

## Summary

- **Use named exports** for 99% of files (components, hooks, utils, services, types)
- **Use default exports** ONLY for Next.js special files (page.tsx, layout.tsx, route.ts, error.tsx)
- **Run the script** for automated conversion: `node scripts/convert-to-named-exports.js`
- **Verify** with type-check and lint after migration
- **Update AGENTS.md** to enforce this pattern for future development

## Resources

- Script: `scripts/convert-to-named-exports.js`
- Documentation: `docs/NAMED_EXPORTS_MIGRATION.md`
- Steering rules: `.kiro/steering/AGENTS.md`
