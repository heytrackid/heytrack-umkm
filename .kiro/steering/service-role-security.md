---
inclusion: always
---

# Service Role Client Security Guidelines

## Critical Security Rule

**`createServiceRoleClient()` MUST ONLY be used in server-side code.**

Service role client bypasses Row Level Security (RLS) and has full database access. Exposing it to client-side would be a critical security vulnerability.

---

## Required Protection

### 1. Always Add 'server-only' Import

```typescript
// ✅ CORRECT - Protected server-only file
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class MyService {
  static async doAdminTask() {
    const supabase = createServiceRoleClient()
    // ... safe to use here
  }
}
```

```typescript
// ❌ WRONG - Missing 'server-only' protection
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class MyService {
  static async doAdminTask() {
    const supabase = createServiceRoleClient() // ❌ Could be imported client-side!
  }
}
```

### 2. Never Use in Client Components

```typescript
// ❌ CRITICAL ERROR - Never do this!
'use client'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export function MyComponent() {
  const supabase = createServiceRoleClient() // ❌ SECURITY BREACH!
  // ...
}
```

### 3. Never Use in Hooks

```typescript
// ❌ WRONG - Hooks can be used client-side
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export function useMyData() {
  const supabase = createServiceRoleClient() // ❌ DANGEROUS!
  // ...
}
```

---

## When to Use Each Supabase Client

### Use `createClient()` for Regular Operations

```typescript
// Client-side
import { createClient } from '@/utils/supabase/client'

// Server-side (API routes, Server Components)
import { createClient } from '@/utils/supabase/server'
```

**Characteristics:**
- ✅ RLS enforced (user can only access their own data)
- ✅ Safe for client-side use
- ✅ Respects authentication context
- ✅ Use for 99% of operations

**Use cases:**
- User CRUD operations
- Fetching user's own data
- Client components
- Server components
- Most API routes

### Use `createServiceRoleClient()` for Admin Operations

```typescript
import 'server-only' // REQUIRED!
import { createServiceRoleClient } from '@/utils/supabase/service-role'
```

**Characteristics:**
- ⚠️ RLS bypassed (full database access)
- ⚠️ Must be server-only
- ⚠️ Requires 'server-only' import
- ⚠️ Use sparingly (only when necessary)

**Use cases:**
- Cron jobs (cross-user operations)
- Automated tasks (snapshots, alerts)
- Admin operations (bulk updates)
- System-level operations
- Workflow triggers

---

## Approved Use Cases

### ✅ 1. Cron Jobs

```typescript
// src/lib/cron/my-cron.ts
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class MyCronJob {
  static async runDailyTask() {
    const supabase = createServiceRoleClient()
    
    // Process all users' data
    const { data: allRecords } = await supabase
      .from('table')
      .select('*')
    
    // ... automated processing
  }
}
```

**Why service role?** Cron jobs need to access data across all users.

### ✅ 2. Automated Snapshots

```typescript
// src/modules/hpp/services/HppSnapshotService.ts
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class HppSnapshotService {
  async createDailySnapshots() {
    const supabase = createServiceRoleClient()
    
    // Get all active recipes (all users)
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id')
      .eq('is_active', true)
    
    // ... create snapshots
  }
}
```

**Why service role?** Automated snapshots run without user context.

### ✅ 3. System Alerts

```typescript
// src/modules/hpp/services/HppAlertService.ts
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class HppAlertService {
  async detectAlertsForAllRecipes() {
    const supabase = createServiceRoleClient()
    
    // Check all recipes for alerts
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id')
      .eq('is_active', true)
    
    // ... detect and create alerts
  }
}
```

**Why service role?** Alert detection runs across all users.

### ✅ 4. Inventory Updates (Atomic Operations)

```typescript
// src/modules/orders/services/InventoryUpdateService.ts
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class InventoryUpdateService {
  static async updateInventoryForOrder(orderId: string, userId: string, items: Item[]) {
    const supabase = createServiceRoleClient()
    
    // Atomic stock updates
    for (const item of items) {
      await supabase
        .from('ingredients')
        .update({ current_stock: newStock })
        .eq('id', ingredientId)
      
      // Create transaction record
      await supabase
        .from('stock_transactions')
        .insert({ user_id: userId, ... })
    }
  }
}
```

**Why service role?** Ensures atomic operations without RLS interference.

### ✅ 5. API Routes (When Needed)

```typescript
// src/app/api/admin/cleanup/route.ts
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createServiceRoleClient()
  
  // Admin cleanup operation
  await supabase
    .from('old_records')
    .delete()
    .lt('created_at', cutoffDate)
  
  return NextResponse.json({ success: true })
}
```

**Why service role?** Admin operations need full access.

---

## Forbidden Use Cases

### ❌ 1. Client Components

```typescript
// ❌ NEVER DO THIS
'use client'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export function MyComponent() {
  const supabase = createServiceRoleClient() // SECURITY BREACH!
}
```

**Why forbidden?** Client code runs in browser, exposing credentials.

### ❌ 2. React Hooks

```typescript
// ❌ NEVER DO THIS
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export function useMyData() {
  const supabase = createServiceRoleClient() // DANGEROUS!
}
```

**Why forbidden?** Hooks can be used in client components.

### ❌ 3. Regular User Operations

```typescript
// ❌ WRONG - Use regular client instead
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export async function getUserRecipes(userId: string) {
  const supabase = createServiceRoleClient() // Overkill!
  
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
  
  return data
}
```

**Why wrong?** Regular client with RLS is sufficient and safer.

**Correct version:**
```typescript
import { createClient } from '@/utils/supabase/server'

export async function getUserRecipes(userId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId) // RLS enforced
  
  return data
}
```

---

## Security Checklist

Before using `createServiceRoleClient()`, verify:

- [ ] Is this truly a cross-user operation?
- [ ] Can this be done with regular client + RLS?
- [ ] Is this file server-only?
- [ ] Have I added `import 'server-only'`?
- [ ] Is this in an API route, cron job, or server-only service?
- [ ] Am I filtering by user_id where appropriate?
- [ ] Have I documented why service role is needed?

If you answered "no" to any question, **use regular client instead**.

---

## Build-Time Protection

The `'server-only'` import ensures build fails if file is imported client-side:

```typescript
import 'server-only' // This line protects you
```

**What happens:**
1. If you try to import this file in a client component
2. Build will fail with clear error message
3. Prevents accidental security breach

---

## Runtime Protection

The `createServiceRoleClient()` function has runtime check:

```typescript
export function createServiceRoleClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceRoleClient should only be used on the server')
  }
  // ...
}
```

**Double protection:**
1. Build-time: 'server-only' import
2. Runtime: window check

---

## Code Review Guidelines

When reviewing code that uses `createServiceRoleClient()`:

### ✅ Approve if:
- File has `import 'server-only'` at top
- Used in API route, cron job, or server-only service
- Legitimate cross-user operation
- Well documented why service role is needed
- Still filters by user_id where appropriate

### ❌ Reject if:
- Missing `'server-only'` import
- Used in client component or hook
- Could be done with regular client
- No documentation of why needed
- Unnecessarily bypassing RLS

---

## Migration Guide

If you find code using service role client incorrectly:

### Step 1: Assess if service role is needed
```typescript
// Current (potentially wrong)
const supabase = createServiceRoleClient()
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('user_id', userId)
```

**Question:** Is this a cross-user operation?
- **No** → Use regular client
- **Yes** → Keep service role but add protection

### Step 2: Add 'server-only' if keeping service role
```typescript
import 'server-only' // Add this
import { createServiceRoleClient } from '@/utils/supabase/service-role'
```

### Step 3: Or migrate to regular client
```typescript
// Better approach
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient()
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('user_id', userId) // RLS enforced
```

---

## Testing

### Verify server-only protection:
```bash
# Should return empty (no client files using service role)
grep -l "use client" $(grep -l "createServiceRoleClient" src/**/*.ts src/**/*.tsx)
```

### Find all service role usages:
```bash
grep -r "createServiceRoleClient" src/
```

### Check for missing 'server-only':
```bash
# Files using service role without 'server-only' import
grep -L "server-only" $(grep -l "createServiceRoleClient" src/**/*.ts src/**/*.tsx)
```

---

## Summary

### Golden Rules

1. **Always add `'server-only'`** when using `createServiceRoleClient()`
2. **Never use in client components** or hooks
3. **Use regular client** for 99% of operations
4. **Service role only for** cron jobs, automated tasks, admin operations
5. **Document why** service role is needed
6. **Still filter by user_id** where appropriate

### Remember

> Service role client = Full database access = Must be server-only

**When in doubt, use regular client with RLS.**

---

## References

- Service Role Client: `src/utils/supabase/service-role.ts`
- Regular Client: `src/utils/supabase/client.ts` & `src/utils/supabase/server.ts`
- Security Audit: `SERVICE_ROLE_CLIENT_AUDIT.md`
- Code Quality: `.kiro/steering/code-quality.md`

---

**Last Updated**: October 29, 2025  
**Status**: ✅ ENFORCED
