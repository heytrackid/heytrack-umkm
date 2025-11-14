# API Authentication Fix Guide

## Problem

After removing Supabase Auth and integrating Stack Auth, all API routes need to be updated to use the new authentication system. Currently, there are **90+ TypeScript errors** across API routes due to missing `user` references.

## Solution

We've created a helper module `src/lib/api-auth.ts` that provides Stack Auth authentication for API routes.

## Pattern to Fix

### Before (Broken - Supabase Auth)
```typescript
import { createClient } from '@/utils/supabase/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    
    // ❌ This code was removed but user reference still exists
    // Authenticate
    
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id)  // ❌ user is not defined
      .single()
    
    return NextResponse.json(data)
    // ❌ Missing catch block
  }
}
```

### After (Fixed - Stack Auth)
```typescript
import { createClient } from '@/utils/supabase/server'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult // Returns 401 if not authenticated
    }
    const user = authResult // user.id, user.email, user.displayName
    
    const supabase = await createClient()
    
    // ✅ RLS will filter by user_id automatically via JWT
    // No need to add .eq('user_id', user.id) anymore
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    // ✅ Proper error handling
    apiLogger.error({ error }, 'Error in handler')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Key Changes

### 1. Add Import
```typescript
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
```

### 2. Add Authentication Check
```typescript
// At the start of each handler function
const authResult = await requireAuth()
if (isErrorResponse(authResult)) {
  return authResult
}
const user = authResult
```

### 3. Remove Explicit user_id Filters
Since RLS is enabled and JWT contains user_id, Supabase automatically filters by user_id:

```typescript
// ❌ Before (manual filter)
.eq('user_id', user.id)

// ✅ After (RLS handles it automatically)
// Just remove the .eq('user_id', user.id) line
```

### 4. Fix Try-Catch Blocks
Many files have broken try-catch blocks. Ensure proper structure:

```typescript
try {
  // ... handler logic
  return NextResponse.json(data)
} catch (error) {
  apiLogger.error({ error }, 'Error message')
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Internal server error' },
    { status: 500 }
  )
}
```

## Files to Fix

Run this command to see all files with errors:
```bash
pnpm type-check 2>&1 | grep "error TS"
```

### Priority Files (Most Used)

1. **Financial Records**
   - ✅ `src/app/api/financial/records/[id]/route.ts` - FIXED
   - `src/app/api/financial/records/route.ts`

2. **Ingredients**
   - `src/app/api/ingredients/route.ts`
   - `src/app/api/ingredient-purchases/route.ts`
   - `src/app/api/ingredient-purchases/[id]/route.ts`

3. **Recipes**
   - `src/app/api/recipes/route.ts`
   - `src/app/api/recipes/[id]/route.ts`

4. **Orders**
   - `src/app/api/orders/route.ts`
   - `src/app/api/orders/[id]/route.ts`

5. **HPP**
   - `src/app/api/hpp/recommendations/route.ts`
   - `src/app/api/hpp/calculate/route.ts`
   - `src/app/api/hpp/calculations/route.ts`

6. **Customers**
   - `src/app/api/customers/route.ts`
   - `src/app/api/customers/[id]/route.ts`

7. **Dashboard**
   - `src/app/api/dashboard/stats/route.ts`
   - `src/app/api/dashboard/hpp-summary/route.ts`

8. **Charts**
   - `src/app/api/charts/financial-trends/route.ts`
   - `src/app/api/charts/inventory-trends/route.ts`

## Automated Fix Script

We've created a helper script, but **manual review is recommended**:

```bash
chmod +x scripts/fix-api-auth.sh
./scripts/fix-api-auth.sh
```

This script will:
- Add `requireAuth` and `isErrorResponse` imports to all API routes
- But you still need to manually:
  - Add authentication checks in each handler
  - Remove explicit `user_id` filters
  - Fix try-catch blocks

## Testing After Fix

1. **Type Check**
   ```bash
   pnpm type-check
   ```

2. **Test API Endpoints**
   - Sign in with Stack Auth
   - Test CRUD operations for each resource
   - Verify RLS is working (users only see their own data)

3. **Check Logs**
   - Look for authentication errors
   - Verify JWT is being injected correctly

## Example: Complete Fixed File

See `src/app/api/financial/records/[id]/route.ts` for a complete example of a properly fixed API route.

## Common Errors and Fixes

### Error: `Cannot find name 'user'`
**Fix**: Add authentication check at the start of the handler

### Error: `'catch' or 'finally' expected`
**Fix**: Ensure try-catch block is properly closed

### Error: `Unreachable code detected`
**Fix**: Remove duplicate return statements or error handling code

### Error: `'error' is possibly 'null'`
**Fix**: Add proper null checks or use non-null assertion if appropriate

## Notes

- RLS policies automatically filter data by `user_id` from JWT
- No need to manually add `.eq('user_id', user.id)` anymore
- Stack Auth user object has: `id`, `email`, `displayName`
- All API routes should return 401 for unauthenticated requests

## Progress Tracking

- [x] Created `src/lib/api-auth.ts` helper
- [x] Fixed `src/app/api/financial/records/[id]/route.ts`
- [ ] Fix remaining 90+ API route files
- [ ] Run full type-check
- [ ] Test all API endpoints
- [ ] Update API documentation

---

**Estimated Time**: 2-3 hours for manual fixes
**Recommended Approach**: Fix high-priority files first, then batch-fix similar patterns
