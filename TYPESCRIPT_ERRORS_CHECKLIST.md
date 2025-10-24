# TypeScript Errors - Fix Checklist

## Overview

Based on the latest `npm run type-check`, this checklist prioritizes which files to fix and in what order.

**Total Errors: ~1559** (spanning across API routes, hooks, utilities, and Supabase functions)

---

## Priority 1: CRITICAL (APIs - Must Fix Before Merge)

These are the main API routes that are actively used.

### ✅ Already Fixed:
- [ ] `src/app/api/dashboard/stats/route.ts` - ✅ DONE
  - Fixed date handling with null checks
  - Fixed daily_sales_summary upsert with `as any` workaround
  
- [ ] `src/app/api/expenses/route.ts` - ✅ DONE
  - Fixed insert operation with type casting
  - Fixed notifications insert

- [ ] `src/app/api/customers/[id]/route.ts` - ✅ DONE
  - Fixed update operation with type casting

### 🔄 Need Fixing:

#### 1. **src/app/api/expenses/[id]/route.ts**
```
Error: Argument of type 'any' is not assignable to parameter type 'never'
```
**Fix**: Apply same pattern as expenses/route.ts
**Effort**: 5 min

#### 2. **src/app/api/hpp/alerts/[id]/dismiss/route.ts**
```
Error: Argument of type update object is not assignable to 'never'
```
**Fix**: Cast update operation with `as any`
**Effort**: 5 min

#### 3. **src/app/api/hpp/alerts/[id]/read/route.ts**
```
Error: Same as dismiss/route.ts
```
**Fix**: Same solution
**Effort**: 5 min

#### 4. **src/app/api/hpp/automation/route.ts**
```
Errors: ~15 errors involving unknown types and property access
```
**Fix**: Add proper typing for request body, use type guards
**Effort**: 30 min

#### 5. **src/app/api/hpp/breakdown/route.ts**
```
Errors: ~8 errors - missing properties from 'never' type
```
**Fix**: Define proper response types
**Effort**: 20 min

#### 6. **src/app/api/hpp/comparison/route.ts**
```
Errors: ~3 errors similar to breakdown/route.ts
```
**Fix**: Same pattern as breakdown
**Effort**: 15 min

#### 7. **src/app/api/hpp/export/route.ts**
```
Errors: TimePeriod type mismatch + property access
```
**Fix**: Update TimePeriod union type definition
**Effort**: 20 min

#### 8. **src/app/api/hpp/snapshot/route.ts**
```
Errors: ~3 errors with property access on 'never'
```
**Fix**: Define proper snapshot response type
**Effort**: 15 min

#### 9. **src/app/api/hpp/snapshots/route.ts**
```
Error: Property access on typed object
```
**Fix**: Fix property name (nama vs name)
**Effort**: 5 min

#### 10. **src/app/api/hpp/trends/route.ts**
```
Errors: ~8 errors with property access
```
**Fix**: Define trend data response type
**Effort**: 20 min

#### 11. **src/app/api/ingredients/[id]/route.ts**
```
Error: Insert operation type mismatch
```
**Fix**: Cast insert with `as any`
**Effort**: 5 min

#### 12. **src/app/api/operational-costs/route.ts**
```
Errors: ~6 errors with reduce/filter on typed arrays
```
**Fix**: Fix generic types for CostSummary
**Effort**: 25 min

#### 13. **src/app/api/orders/** routes
```
Similar pattern errors to above
```
**Fix**: Apply same patterns
**Effort**: 45 min total

#### 14. **src/app/api/recipes/** routes
```
Similar pattern errors
```
**Fix**: Apply same patterns
**Effort**: 30 min total

#### 15. **src/app/api/sales/** routes
```
Similar pattern errors
```
**Fix**: Apply same patterns
**Effort**: 20 min total

#### 16. **src/app/api/suppliers/** routes
```
Similar pattern errors
```
**Fix**: Apply same patterns
**Effort**: 15 min total

#### 17. **src/app/api/production-batches/** routes
```
Similar pattern errors
```
**Fix**: Apply same patterns
**Effort**: 20 min total

#### 18. **src/app/api/reports/** routes
```
Multiple errors with data transformation
```
**Fix**: Apply type guards and casting patterns
**Effort**: 30 min total

---

## Priority 2: IMPORTANT (Components & Hooks - Should Fix Soon)

### Components (`src/components/`, `src/modules/`, etc.)
```
~80+ errors in components using 'unknown' or 'any'
```

**Key Files to Fix**:
- `src/components/ai-chatbot/DataVisualization.tsx` - 15 errors
- `src/components/automation/smart-production-planner.tsx` - 20 errors
- `src/components/lazy/chart-lazy-loader.tsx` - 10 errors
- `src/components/lazy/table-lazy-loader.tsx` - 10 errors
- `src/components/optimized/OptimizedTable.tsx` - 12 errors

**Fix Pattern**:
- Use `type-guards.ts` for type checking
- Define proper interfaces
- Use `safe-cast.ts` for conversions

**Effort**: 60-90 min total

### Hooks (`src/hooks/`)
```
~30+ errors in custom hooks
```

**Files**:
- `src/hooks/useSupabase.ts` - Unknown type handling
- `src/hooks/useEnhancedCRUD.ts` - Type safety
- `src/hooks/useAIPowered.ts` - AI response typing

**Fix Pattern**: Add proper response type definitions

**Effort**: 45 min total

### Lib Files (`src/lib/`)
```
~25+ errors in utility files
```

**Files**:
- `src/lib/api-validation.ts` - Any usage
- `src/lib/automation-engine.ts` - Type mismatches
- `src/lib/nlp-processor.ts` - AI response typing

**Effort**: 40 min total

---

## Priority 3: LOWER (Edge Cases & Optional)

### Supabase Functions (`supabase/functions/`)
```
~60+ errors - mostly JSR/Deno import issues
These are separate from main app and can be handled later
```

**Note**: These have special Deno environment requirements

### Scripts (`scripts/`)
```
~5 errors in utility scripts
```

---

## Fix Workflow

### Step 1: Setup (Done ✅)
- ESLint rules configured
- TSConfig updated
- Helper utilities created
- Pre-commit hook installed

### Step 2: Fix by Priority (Your Turn)

#### Phase 1: Critical APIs (2-3 hours)
1. List all remaining API route errors: `npm run type-check | grep "src/app/api"`
2. Fix each file using patterns in `TYPE_SAFETY_RULES.md`
3. Test: `npm run type-check`

#### Phase 2: Components & Hooks (1-2 hours)
1. Fix component errors
2. Fix hook errors
3. Test: `npm run type-check`

#### Phase 3: Utilities (1-2 hours)
1. Fix lib files
2. Fix services
3. Test: `npm run type-check`

#### Phase 4: Optional - Supabase Functions (2+ hours)
1. Requires understanding Deno environment
2. Can be deferred if not critical

### Step 3: Verify
```bash
npm run type-check
# Should show: ✓ 0 errors
```

---

## Quick Fix Reference

### Pattern 1: Supabase Insert/Update/Upsert
```typescript
// BEFORE
const { error } = await supabase.from('table').insert([data])

// AFTER
const { error } = await (supabase.from('table').insert as any)([data])
```

### Pattern 2: Unknown Type to Object
```typescript
// BEFORE
const value = (data as any).property

// AFTER
import { isObject, getNestedProperty } from '@/lib/type-guards'
if (isObject(data)) {
  const value = getNestedProperty(data, 'property')
}
```

### Pattern 3: Array Operations
```typescript
// BEFORE
const result = data.map((item: any) => item.id)

// AFTER
import { isArray } from '@/lib/type-guards'
const result = isArray(data) ? data.map((item: Item) => item.id) : []
```

### Pattern 4: Type Casting
```typescript
// BEFORE
const num = parseInt(value as any)

// AFTER
import { castToNumber } from '@/lib/safe-cast'
const num = castToNumber(value)
```

---

## Estimated Total Effort

| Phase | Effort | Files |
|-------|--------|-------|
| Phase 1 (Critical APIs) | 3-4 hours | 15-20 files |
| Phase 2 (Components) | 1.5-2 hours | 8-10 files |
| Phase 3 (Utilities) | 1-1.5 hours | 5-7 files |
| Phase 4 (Supabase Funcs) | 2-3 hours | 6-8 files |
| **Total** | **8-11 hours** | **34-45 files** |

---

## Progress Tracking

### Today's Goal: Fix All Critical APIs
- [ ] APIs in `src/app/api/` all pass type-check
- [ ] No errors when running `npm run type-check`
- [ ] Pre-commit hook allows commits

### Next Steps:
- [ ] Fix components and hooks
- [ ] Fix utility libraries
- [ ] Consider Supabase functions (if needed)

---

## Commit Strategy

### Per File Commits (Recommended)
```bash
# Fix one file at a time
git add src/app/api/expenses/[id]/route.ts
git commit -m "fix: typescript types in expenses detail route"

# Pre-commit hook runs automatically
# If errors remain, commit is blocked
```

### Batch Commits (When Similar Pattern)
```bash
# Fix multiple similar files together
git add src/app/api/hpp/alerts/**/*.ts
git commit -m "fix: typescript types in hpp alerts routes"
```

---

## Debugging Tips

### 1. See Full Error Message
```bash
npm run type-check 2>&1 | grep -A 5 "your-file"
```

### 2. Check Specific File
```bash
npx tsc --noEmit --pretty src/specific/file.ts
```

### 3. Get Error Count
```bash
npm run type-check 2>&1 | grep "error TS" | wc -l
```

### 4. Filter by Error Code
```bash
npm run type-check 2>&1 | grep "TS2345"  # Argument type mismatch
npm run type-check 2>&1 | grep "TS2571"  # Object is unknown
```

---

## Resources

### Helpful Files:
- `TYPE_SAFETY_RULES.md` - Complete reference
- `TYPE_SAFETY_SETUP.md` - Technical details
- `src/lib/type-guards.ts` - 30+ utility functions
- `src/lib/safe-cast.ts` - Safe casting utilities

### When Stuck:
1. Read the error carefully - it tells you what's wrong
2. Check `TYPE_SAFETY_RULES.md` for similar examples
3. Look at already-fixed files for pattern reference
4. Use utilities in `src/lib/` instead of `as any`

---

## Success Criteria

✅ **When you're done:**
- `npm run type-check` shows 0 errors
- All commits pass pre-commit hook
- No files use `as any` without `@ts-expect-error` + description
- All function signatures have explicit types

🎉 **Congratulations!** Your codebase is now type-safe!
