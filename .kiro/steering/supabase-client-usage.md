---
inclusion: manual
---

# Supabase Client Usage Guide

## Quick Reference

### Client-Side (Hooks, Components)

```typescript
// ✅ CORRECT - No await
import { createClient } from '@/utils/supabase/client'

function MyComponent() {
  const supabase = createClient() // Synchronous, returns singleton
  // ... use supabase
}
```

```typescript
// ❌ WRONG - Don't await client-side
import { createClient } from '@/utils/supabase/client'

function MyComponent() {
  const supabase = await createClient() // ERROR: Will cause render loops
}
```

### Server-Side (API Routes, Server Components)

```typescript
// ✅ CORRECT - With await
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient() // Async, needs to await cookies()
  // ... use supabase
}
```

```typescript
// ❌ WRONG - Must await server-side
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient() // ERROR: Returns Promise, not client
}
```

## Using with useSupabase Hook

```typescript
// ✅ PREFERRED - Use context hook
import { useSupabase } from '@/providers/SupabaseProvider'

function MyComponent() {
  const { supabase } = useSupabase()
  // ... use supabase
}
```

## Common Patterns

### In React Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const supabase = createClient() // Get singleton
      const { data } = await supabase.from('orders').select('*')
      return data
    }
  })
}
```

### In Services (Client-Side)

```typescript
import { createClient } from '@/utils/supabase/client'

export class OrderService {
  static async getOrders() {
    const supabase = createClient() // No await
    const { data } = await supabase.from('orders').select('*')
    return data
  }
}
```

### In API Routes

```typescript
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient() // With await
  const { data } = await supabase.from('orders').select('*')
  return Response.json(data)
}
```

## Why This Matters

### Client-Side (Synchronous)
- **Singleton pattern**: One instance shared across all components
- **No render loops**: Synchronous calls don't trigger re-renders
- **Fast**: Returns cached instance immediately

### Server-Side (Asynchronous)
- **Cookie access**: Must await Next.js `cookies()` function
- **Per-request**: Each request gets its own client with proper cookies
- **Secure**: Server-only, never exposed to client

## Troubleshooting

### "Property 'from' does not exist on type 'Promise'"
- **Cause**: Using `createClient()` without `await` on server-side
- **Fix**: Add `await` before `createClient()`

### Infinite render loop / Browser freezes
- **Cause**: Using `await createClient()` on client-side
- **Fix**: Remove `await` from client-side calls

### "Cannot read properties of null"
- **Cause**: Using client before SupabaseProvider is mounted
- **Fix**: Ensure component is wrapped in `<SupabaseProvider>`

## Related Files

- `src/utils/supabase/client.ts` - Client-side singleton
- `src/utils/supabase/server.ts` - Server-side per-request client
- `src/providers/SupabaseProvider.tsx` - React context provider
- `src/providers/AuthProvider.tsx` - Auth state management
