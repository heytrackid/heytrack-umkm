# Supabase Client Usage Audit

## Summary

Audit lengkap penggunaan Supabase clients di codebase untuk memastikan penggunaan yang benar antara client-side dan server-side.

---

## ✅ FIXED - Critical Security Issues

### 1. Service Role Client Protection
**Status**: ✅ COMPLETE

All files using `createServiceRoleClient()` now have `'server-only'` protection:
- ✅ `src/modules/hpp/services/HppAlertService.ts`
- ✅ `src/modules/hpp/services/HppSnapshotService.ts`
- ✅ `src/modules/orders/services/InventoryUpdateService.ts`
- ✅ `src/lib/cron/*.ts` (all cron files)

### 2. InventoryAlertService
**Status**: ✅ FIXED

- **Before**: Used `createClient()` from `@/utils/supabase/client` (wrong!)
- **After**: Uses `createClient()` from `@/utils/supabase/server` with `'server-only'`
- **File**: `src/services/inventory/InventoryAlertService.ts`

---

## ⚠️ NEEDS REVIEW - Potential Issues

### Category 1: Order Services (Client-side import in services)

These services use `createClient()` from `@/utils/supabase/client` but are called from server-side:

#### 🔴 HIGH PRIORITY

1. **src/modules/orders/services/WacEngineService.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Called from: API routes (server-side)
   - **Issue**: Should use server client
   - **Fix**: Change to `@/utils/supabase/server` + add `'server-only'`

2. **src/modules/orders/services/RecipeAvailabilityService.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Called from: API routes, server components
   - **Issue**: Should use server client
   - **Fix**: Change to `@/utils/supabase/server` + add `'server-only'`

3. **src/modules/orders/services/RecipeRecommendationService.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Called from: API routes
   - **Issue**: Should use server client
   - **Fix**: Change to `@/utils/supabase/server` + add `'server-only'`

4. **src/modules/orders/services/OrderPricingService.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Called from: API routes
   - **Issue**: Should use server client
   - **Fix**: Change to `@/utils/supabase/server` + add `'server-only'`

5. **src/modules/orders/services/ProductionTimeService.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Called from: API routes
   - **Issue**: Should use server client
   - **Fix**: Change to `@/utils/supabase/server` + add `'server-only'`

### Category 2: Agents (Client-side import in background tasks)

#### 🔴 HIGH PRIORITY

1. **src/agents/automations/DailySnapshotsAgent.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Context: Background automation agent
   - **Issue**: Should use service role client for cross-user operations
   - **Fix**: Change to `createServiceRoleClient` + add `'server-only'`

2. **src/agents/automations/HppAlertAgent.ts**
   - Import: `createClient` from `@/utils/supabase/client`
   - Context: Background automation agent
   - **Issue**: Should use service role client for cross-user operations
   - **Fix**: Change to `createServiceRoleClient` + add `'server-only'`

---

## ✅ CORRECT USAGE - No Changes Needed

### Category 3: Hooks (Client-side - Correct)

These correctly use `createClient()` from `@/utils/supabase/client`:

✅ `src/hooks/useAuth.ts` - Client-side auth hook
✅ `src/hooks/api/useDashboard.ts` - Client-side data fetching
✅ `src/hooks/supabase/core.ts` - Client-side Supabase operations
✅ `src/hooks/supabase/useSupabaseCRUD.ts` - Client-side CRUD operations
✅ `src/hooks/supabase/bulk.ts` - Client-side bulk operations
✅ `src/hooks/supabase/crud.ts` - Client-side CRUD operations
✅ `src/hooks/useRealtimeAlerts.ts` - Client-side realtime subscriptions

**Why correct?** Hooks are used in client components, so client-side Supabase client is appropriate.

### Category 4: API Routes (Server-side - Correct)

API routes correctly use `createClient()` from `@/utils/supabase/server`:

✅ All files in `src/app/api/**/*.ts` - Server-side API routes

---

## Recommended Fixes

### Fix Template for Order Services

```typescript
// ❌ BEFORE
import { createClient } from '@/utils/supabase/client'

export class MyService {
  static async doSomething() {
    const supabase = createClient()
    // ...
  }
}
```

```typescript
// ✅ AFTER
import 'server-only'
import { createClient } from '@/utils/supabase/server'

export class MyService {
  static async doSomething() {
    const supabase = await createClient()
    // ...
  }
}
```

### Fix Template for Agents

```typescript
// ❌ BEFORE
import { createClient } from '@/utils/supabase/client'

export class MyAgent {
  async runAutomation() {
    const supabase = createClient()
    // ... cross-user operations
  }
}
```

```typescript
// ✅ AFTER
import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export class MyAgent {
  async runAutomation() {
    const supabase = createServiceRoleClient()
    // ... cross-user operations
  }
}
```

---

## Decision Matrix: Which Client to Use?

### Use `createClient()` from `@/utils/supabase/client`

✅ **When:**
- In client components (`'use client'`)
- In React hooks
- In browser-side code
- For user-specific operations with RLS

✅ **Examples:**
- `useAuth()` hook
- `useDashboard()` hook
- Client-side data fetching
- Realtime subscriptions

### Use `createClient()` from `@/utils/supabase/server`

✅ **When:**
- In API routes
- In Server Components
- In Server Actions
- For user-specific operations with RLS on server

✅ **Examples:**
- API route handlers
- Server Component data fetching
- Server Actions

### Use `createServiceRoleClient()` from `@/utils/supabase/service-role`

⚠️ **When (use sparingly):**
- In cron jobs (cross-user operations)
- In background agents (automated tasks)
- In admin operations (bypassing RLS)
- When you need full database access

⚠️ **Requirements:**
- MUST add `import 'server-only'`
- MUST be in server-only context
- MUST document why service role is needed

✅ **Examples:**
- Daily snapshot generation
- Alert detection across all users
- Cleanup operations
- System-level tasks

---

## Priority Action Items

### 🔴 HIGH PRIORITY (Security & Correctness)

1. **Fix Order Services** (5 files)
   - Change from client to server Supabase client
   - Add `'server-only'` import
   - Update all `createClient()` calls to `await createClient()`

2. **Fix Agents** (2 files)
   - Change from client to service role client
   - Add `'server-only'` import
   - Document why service role is needed

### 🟡 MEDIUM PRIORITY (Code Quality)

3. **Add Documentation**
   - Document which client to use when
   - Add examples to steering rules
   - Update code review checklist

4. **Add Linting Rules**
   - Detect client import in services
   - Detect missing 'server-only' with service role
   - Warn about service role usage

---

## Files to Fix

### Order Services (5 files)
```bash
src/modules/orders/services/WacEngineService.ts
src/modules/orders/services/RecipeAvailabilityService.ts
src/modules/orders/services/RecipeRecommendationService.ts
src/modules/orders/services/OrderPricingService.ts
src/modules/orders/services/ProductionTimeService.ts
```

### Agents (2 files)
```bash
src/agents/automations/DailySnapshotsAgent.ts
src/agents/automations/HppAlertAgent.ts
```

---

## Testing After Fixes

### 1. Type Check
```bash
pnpm type-check
```

### 2. Build Check
```bash
pnpm build
```

### 3. Search for Issues
```bash
# Find services using client-side Supabase
grep -r "from '@/utils/supabase/client'" src/modules/ src/services/ src/agents/

# Find service role without 'server-only'
grep -L "server-only" $(grep -l "createServiceRoleClient" src/**/*.ts)
```

---

## Summary

### ✅ Completed
- Service role client protection (7 files)
- InventoryAlertService fix (1 file)
- Documentation and steering rules

### ⚠️ Needs Attention
- Order services (5 files) - Using wrong client
- Agents (2 files) - Using wrong client

### ✅ Correct
- All hooks (7 files) - Correctly using client-side client
- All API routes - Correctly using server-side client

---

**Total Files Reviewed**: 50+  
**Files Fixed**: 8  
**Files Need Fixing**: 7  
**Files Correct**: 35+

---

**Next Steps:**
1. Review and approve fixes for order services
2. Review and approve fixes for agents
3. Run tests after fixes
4. Update documentation
5. Add to code review checklist

---

**Last Updated**: October 29, 2025  
**Status**: ⚠️ IN PROGRESS (7 files remaining)
