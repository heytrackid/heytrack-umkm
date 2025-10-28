---
inclusion: always
---

# Known Issues & Workarounds

This file documents known issues in the codebase that are being fixed or need attention.

## 🔴 CRITICAL ISSUES (In Progress)

### 1. HPP Services - Invalid Supabase Import

**Status:** 🔴 NEEDS FIX  
**Priority:** CRITICAL  
**Impact:** Runtime errors, HPP calculations fail

**Affected Files:**
- `src/modules/hpp/services/HppCalculatorService.ts`
- `src/modules/hpp/services/HppSnapshotService.ts`
- `src/modules/hpp/services/HppAlertService.ts`

**Problem:**
```typescript
// ❌ CURRENT CODE (BROKEN)
import supabase from '@/utils/supabase'  // This export doesn't exist
```

**Workaround Until Fixed:**
If you need to work with HPP services:
1. Pass supabase client as parameter to all methods
2. Call from API routes where you have proper client

**Permanent Fix:**
See `FIX_EXAMPLES.md` section "CRITICAL FIX #1"

---

### 2. InventoryUpdateService - Missing user_id

**Status:** 🔴 NEEDS FIX  
**Priority:** CRITICAL  
**Impact:** RLS violations, data isolation broken

**Affected Files:**
- `src/modules/orders/services/InventoryUpdateService.ts`

**Problem:**
```typescript
// ❌ CURRENT CODE (BROKEN)
user_id: ''  // Empty string breaks RLS
```

**Workaround Until Fixed:**
When calling InventoryUpdateService:
1. Ensure you have authenticated user context
2. Be aware stock transactions may not be created properly
3. Monitor logs for RLS errors

**Permanent Fix:**
See `FIX_EXAMPLES.md` section "CRITICAL FIX #2"

---

### 3. Temporary Type Interfaces in HPP

**Status:** 🔴 NEEDS FIX  
**Priority:** CRITICAL  
**Impact:** Type safety compromised

**Affected Files:**
- `src/modules/hpp/services/HppCalculatorService.ts` (lines 8-15)

**Problem:**
```typescript
// ❌ TEMPORARY INTERFACE (should use generated types)
interface HppCalculation {
  id: string
  recipe_id: string
  // ...
}
```

**Workaround Until Fixed:**
1. Regenerate Supabase types: `npx supabase gen types typescript`
2. Use generated types from `@/types/supabase-generated`

**Permanent Fix:**
```typescript
import type { Database } from '@/types/supabase-generated'
type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
```

---

## 🟡 HIGH PRIORITY ISSUES

### 4. Inconsistent Error Handling

**Status:** 🟡 KNOWN ISSUE  
**Priority:** HIGH  
**Impact:** Debugging difficulties, inconsistent logs

**Affected Files:**
- 45+ API route files

**Problem:**
Three different error variable names used:
- `catch (err: unknown)`
- `catch (error: unknown)`
- `catch (e: unknown)`

**Workaround:**
When writing new code, always use `error`:
```typescript
try {
  // code
} catch (error: unknown) {
  apiLogger.error({ error }, 'Message')
}
```

**Permanent Fix:**
Gradual migration to standardized pattern. See `CRITICAL_FIXES_CHECKLIST.md` #4

---

### 5. Duplicate Validation Schemas

**Status:** 🟡 KNOWN ISSUE  
**Priority:** HIGH  
**Impact:** Validation inconsistencies

**Affected Files:**
- `src/lib/validations/api-schemas.ts`
- `src/lib/validations/domains/order.ts`
- `src/lib/validations/domains/ingredient.ts`

**Problem:**
Two schemas for same entity with different requirements:
- `CreateOrderSchema` in api-schemas.ts
- `OrderInsertSchema` in domains/order.ts

**Workaround:**
Always use domain schemas as source of truth:
```typescript
import { OrderInsertSchema } from '@/lib/validations/domains/order'
```

**Permanent Fix:**
Consolidate schemas. See `FIX_EXAMPLES.md` section "Consolidate Validation Schemas"

---

### 6. Magic Numbers in HPP Calculations

**Status:** 🟡 KNOWN ISSUE  
**Priority:** HIGH  
**Impact:** Unclear business logic

**Affected Files:**
- `src/modules/hpp/services/HppCalculatorService.ts`

**Problem:**
Hardcoded fallback values:
```typescript
return 5000  // What is this?
return totalOverhead / 10  // Why 10?
```

**Workaround:**
Document assumptions in comments when using these values.

**Permanent Fix:**
Create `src/lib/constants/hpp-config.ts`. See `CRITICAL_FIXES_CHECKLIST.md` #6

---

## 🟢 MEDIUM PRIORITY ISSUES

### 7. Incomplete Rollback Logic

**Status:** 🟢 KNOWN ISSUE  
**Priority:** MEDIUM  
**Impact:** Potential orphaned records on failures

**Affected Files:**
- `src/app/api/orders/route.ts`
- Other complex mutation endpoints

**Problem:**
Rollback operations don't handle their own failures:
```typescript
if (error) {
  await supabase.from('orders').delete().eq('id', orderId)
  // What if this delete fails?
}
```

**Workaround:**
Monitor logs for failed rollbacks and clean up manually if needed.

**Permanent Fix:**
Implement TransactionManager. See `FIX_EXAMPLES.md` section "Transaction Management"

---

### 8. Cache Invalidation Gaps

**Status:** 🟢 KNOWN ISSUE  
**Priority:** MEDIUM  
**Impact:** Stale data in UI

**Affected Files:**
- Various API routes

**Problem:**
Not all mutations invalidate cache:
- POST /api/recipes - ✅ Invalidates
- PUT /api/recipes/[id] - ❌ Doesn't invalidate

**Workaround:**
Force refresh in UI after mutations:
```typescript
await mutate()
router.refresh()
```

**Permanent Fix:**
Add cache invalidation hooks. See `CRITICAL_FIXES_CHECKLIST.md` #9

---

### 9. Supabase Join Result Structure

**Status:** 🟢 KNOWN BEHAVIOR  
**Priority:** MEDIUM  
**Impact:** Type mismatches, runtime errors

**Problem:**
Supabase returns arrays for joined data:
```typescript
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// Structure is:
// data.recipe_ingredients[0].ingredient[0]  // Arrays!
```

**Workaround:**
Always access first element and check existence:
```typescript
const ingredient = ri.ingredient?.[0]
if (ingredient) {
  // Use ingredient
}
```

**Best Practice:**
Add type guards to validate structure at runtime.

---

## 📋 Tracking Progress

| Issue | Priority | Status | ETA |
|-------|----------|--------|-----|
| HPP Supabase Import | 🔴 Critical | Not Started | Week 1 |
| Missing user_id | 🔴 Critical | Not Started | Week 1 |
| Temporary Types | 🔴 Critical | Not Started | Week 1 |
| Error Handling | 🟡 High | Not Started | Week 2 |
| Duplicate Schemas | 🟡 High | Not Started | Week 2 |
| Magic Numbers | 🟡 High | Not Started | Week 2 |
| Rollback Logic | 🟢 Medium | Not Started | Week 3-4 |
| Cache Invalidation | 🟢 Medium | Not Started | Week 3-4 |

---

## 🚨 When You Encounter These Issues

### If you're working on HPP features:
1. Be aware HPP services have broken imports
2. Pass supabase client as parameter
3. Check `FIX_EXAMPLES.md` for correct patterns

### If you're working on Orders:
1. Always pass user_id to InventoryUpdateService
2. Be aware of potential RLS issues
3. Monitor logs for stock transaction errors

### If you're adding new API routes:
1. Use standardized error handling pattern
2. Use domain validation schemas
3. Add cache invalidation after mutations
4. Always filter by user_id for RLS

### If you're working on Services:
1. Accept supabase client as parameter
2. Accept user_id as parameter
3. Don't use hardcoded values
4. Use configuration constants

---

## 📚 Additional Resources

- **Full Analysis:** `DEEP_SCAN_ANALYSIS.md`
- **Fix Checklist:** `CRITICAL_FIXES_CHECKLIST.md`
- **Code Examples:** `FIX_EXAMPLES.md`
- **Code Quality Standards:** `.kiro/steering/code-quality.md`

---

**Last Updated:** October 28, 2025  
**Next Review:** After Critical Fixes Complete
