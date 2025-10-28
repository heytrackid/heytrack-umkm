# API Routes Audit & Fix Plan

## Total Routes: 48 files

## Issues to Fix

### 🔴 CRITICAL Issues

1. **Inconsistent Error Variable Naming**
   - Files using `err` instead of `error`: recipes, ingredient-purchases, and others
   - Fix: Standardize to `catch (error: unknown)`

2. **Wrong Supabase Import**
   - `src/app/api/ingredient-purchases/route.ts` line 2
   - Current: `import { createServiceRoleClient } from '@/utils/supabase'`
   - Fix: `import { createServiceRoleClient } from '@/utils/supabase/service-role'`

3. **Missing APIError Usage**
   - Many routes don't use APIError class
   - Fix: Import and use `APIError` from `@/lib/errors/api-error-handler`

4. **Missing handleAPIError**
   - Many routes manually handle errors
   - Fix: Use `handleAPIError(error)` for centralized error handling

### 🟡 HIGH Priority Issues

5. **Missing Cache Invalidation**
   - POST/PUT/DELETE endpoints don't invalidate cache
   - Fix: Add `cacheInvalidation.[resource]()` after mutations

6. **Inconsistent Auth Error Handling**
   - Some use different patterns for auth errors
   - Fix: Standardize to throw `APIError('Unauthorized', 401, 'AUTH_REQUIRED')`

7. **Missing Validation Schemas**
   - Some routes don't validate query parameters
   - Fix: Add Zod validation for all inputs

### 🟠 MEDIUM Priority Issues

8. **Inconsistent Logging**
   - Some routes log with different patterns
   - Fix: Standardize logging format

9. **Missing RLS Filters**
   - Some queries might miss `.eq('user_id', user.id)`
   - Fix: Ensure all queries filter by user_id

10. **Inconsistent Response Format**
    - Some return data directly, some wrap in objects
    - Fix: Standardize response format

## Standard Pattern to Apply

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 2. Validate query params
    const { searchParams } = new URL(request.url)
    const validation = QuerySchema.safeParse({
      // ... params
    })
    
    if (!validation.success) {
      throw new APIError('Invalid query parameters', 400, 'VALIDATION_ERROR')
    }

    // 3. Execute with RLS
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) throw error

    // 4. Return
    return NextResponse.json(data)

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 2. Validate body
    const body = await request.json()
    const validation = Schema.safeParse(body)
    
    if (!validation.success) {
      throw new APIError('Invalid request data', 400, 'VALIDATION_ERROR')
    }

    // 3. Execute with RLS
    const { data, error } = await supabase
      .from('table')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error

    // 4. Invalidate cache
    cacheInvalidation.table()

    // 5. Return
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

## Files to Fix (Priority Order)

### Phase 1: Core Routes (CRITICAL)
1. ✅ src/app/api/recipes/route.ts
2. ✅ src/app/api/orders/route.ts
3. ✅ src/app/api/ingredients/route.ts
4. ✅ src/app/api/ingredient-purchases/route.ts
5. ✅ src/app/api/customers/route.ts

### Phase 2: Feature Routes (HIGH)
6. src/app/api/hpp/calculations/route.ts
7. src/app/api/hpp/alerts/route.ts
8. src/app/api/hpp/snapshots/route.ts
9. src/app/api/operational-costs/route.ts
10. src/app/api/production-batches/route.ts

### Phase 3: Secondary Routes (MEDIUM)
11-48. All remaining routes

## Automated Fixes

Run these commands to apply fixes:

```bash
# Fix error variable naming
pnpm run fix:error-naming

# Add missing imports
pnpm run fix:imports

# Standardize error handling
pnpm run fix:error-handling

# Add cache invalidation
pnpm run fix:cache-invalidation
```
