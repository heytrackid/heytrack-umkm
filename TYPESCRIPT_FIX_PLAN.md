# TypeScript Error Fix Plan - Systematic Cleanup

**Total Errors:** 2268  
**Target:** 0 errors (remove all `any` usage)

---

## Error Breakdown by Type

| Error Code | Count | Severity | Fix Difficulty |
|-----------|-------|----------|-----------------|
| TS6133 | 436 | LOW | EASY (prefix with `_`) |
| TS18046/18048 | 469 | HIGH | MEDIUM (type narrowing) |
| TS2339 | 323 | HIGH | MEDIUM (add type defs) |
| TS2304 | 210 | MEDIUM | EASY (fix imports) |
| TS2305 | 112 | MEDIUM | MEDIUM (missing exports) |
| TS7006 | 111 | HIGH | EASY (add param types) |
| TS2345 | 98 | HIGH | MEDIUM (type casting) |
| TS2769 | 77 | HIGH | MEDIUM (overload issues) |
| TS2322 | 76 | MEDIUM | MEDIUM (type assignment) |
| TS2532 | 68 | MEDIUM | MEDIUM (array type issues) |
| Others | 288 | VARIED | VARIED |

---

## Top Files with Most Errors

1. **src/app/resep/hooks/use-production.ts** - 76 errors
2. **src/lib/index.ts** - 75 errors
3. **src/lib/services/AutoSyncFinancialService.ts** - 65 errors
4. **src/components/ai-chatbot/DataVisualization.tsx** - 62 errors
5. **src/app/api/reports/profit/route.ts** - 59 errors
6. **src/components/automation/smart-production-planner.tsx** - 54 errors
7. **src/lib/automation-engine.ts** - 49 errors
8. **src/lib/automation/hpp-automation.ts** - 48 errors
9. **src/lib/ai-chatbot-service.ts** - 42 errors
10. **src/app/orders/hooks/use-orders.ts** - 38 errors

---

## Fix Strategy

### Phase 1: Quick Wins (1-2 hours)
- Fix TS6133 (unused variables) - use `_` prefix
- Fix TS7006 (implicit any params) - add type annotations
- Fix simple imports/exports issues

### Phase 2: Type Narrowing (2-3 hours)
- Fix TS18046/TS18048 (unknown types) - use type guards
- Use utilities from `src/lib/type-guards.ts`
- Add proper type checking before usage

### Phase 3: Type Definitions (2-4 hours)
- Fix TS2339 (missing properties) - define interfaces
- Fix TS2345 (type mismatches) - proper type casting
- Use `src/lib/safe-cast.ts` utilities

### Phase 4: Complex Fixes (2-3 hours)
- Fix TS2769 (overload issues)
- Fix TS2322 (type assignments)
- Handle special cases

### Phase 5: Final Cleanup (1 hour)
- Run full type-check
- Verify 0 errors
- Commit all changes

---

## Files to Fix (Priority Order)

### HIGH PRIORITY (>50 errors each)
- [ ] src/app/resep/hooks/use-production.ts (76)
- [ ] src/lib/index.ts (75)
- [ ] src/lib/services/AutoSyncFinancialService.ts (65)
- [ ] src/components/ai-chatbot/DataVisualization.tsx (62)
- [ ] src/app/api/reports/profit/route.ts (59)
- [ ] src/components/automation/smart-production-planner.tsx (54)
- [ ] src/lib/automation-engine.ts (49)
- [ ] src/lib/automation/hpp-automation.ts (48)
- [ ] src/lib/ai-chatbot-service.ts (42)

### MEDIUM PRIORITY (20-50 errors each)
- [ ] src/app/orders/hooks/use-orders.ts (38)
- [ ] src/app/api/recipes/[id]/hpp/route.ts (37)
- [ ] src/hooks/useSupabase.ts (33)
- [ ] src/services/inventory/AutoReorderService.ts (30)
- [ ] src/lib/production-automation.ts (30)
- [ ] src/lib/performance.ts (30)
- [ ] src/lib/hpp-alert-detector.ts (29)
- [ ] src/app/reports/page.tsx (29)
- [ ] src/modules/orders/components/OrderForm.tsx (26)
- [ ] src/app/resep/services/production-orders-integration.ts (26)

### LOW PRIORITY (<20 errors each)
- [ ] Remaining files - process in batches

---

## Key Utilities to Use

### Type Guards (`src/lib/type-guards.ts`)
```typescript
isString(value)        // Check if string
isArray(value)         // Check if array
isObject(value)        // Check if object
assertType(value, check)  // Assert or throw
isDefined(value)       // Not null/undefined
getErrorMessage(error) // Safe error extraction
```

### Safe Casting (`src/lib/safe-cast.ts`)
```typescript
castToString(value, fallback)       // Convert to string
castToNumber(value, fallback)       // Convert to number
castToArray(value, fallback)        // Convert to array
getNestedProperty(obj, 'path')      // Safe nested access
safeParseJSON(json)                 // Safe JSON parsing
```

---

## Common Fix Patterns

### Pattern 1: Unused Variables
```typescript
// ❌ BEFORE
const response = await fetch(url)

// ✅ AFTER
const _response = await fetch(url)  // Or use value if needed
```

### Pattern 2: Implicit Any Parameters
```typescript
// ❌ BEFORE
const processItem = (item) => { ... }

// ✅ AFTER
const processItem = (item: Item) => { ... }
```

### Pattern 3: Unknown Type Handling
```typescript
// ❌ BEFORE
const data = response as any
return data.value

// ✅ AFTER
import { isObject, getNestedProperty } from '@/lib/type-guards'
if (isObject(response)) {
  return getNestedProperty(response, 'value')
}
```

### Pattern 4: Type Narrowing
```typescript
// ❌ BEFORE
function process(data: unknown) {
  return data.length  // Error: object is unknown
}

// ✅ AFTER
function process(data: unknown) {
  if (isArray(data)) {
    return data.length  // Now safe
  }
  return 0
}
```

---

## Estimated Timeline

| Phase | Errors | Time | Files |
|-------|--------|------|-------|
| Phase 1 (Quick Wins) | ~550 | 1.5h | Many small |
| Phase 2 (Type Narrowing) | ~469 | 2.5h | 5-10 large |
| Phase 3 (Type Defs) | ~500 | 3h | 10-15 files |
| Phase 4 (Complex) | ~150 | 2h | 5-10 files |
| Phase 5 (Cleanup) | ~50 | 1h | Remaining |
| **TOTAL** | **2268** | **~10h** | **50+ files** |

---

## Start Command

```bash
npm run type-check 2>&1 | tee typescript-errors.log
```

This logs all errors for reference while fixing.

---

## Progress Tracking

Check progress with:
```bash
npm run type-check 2>&1 | grep "error TS" | wc -l
```

Target: Should decrease from 2268 → 0

---

## Success Criteria

- ✅ 0 TypeScript errors (`npm run type-check` shows no errors)
- ✅ No `any` usage (except with `@ts-expect-error` + description)
- ✅ All type guards and safe-cast utilities properly used
- ✅ Proper type definitions for all functions and variables
- ✅ Pre-commit hook allows commits (type-check passes)

---

## Notes

- Work file by file for clarity
- Commit after each large file is fixed
- Use type-guards utilities instead of `as any`
- Refer to TYPE_SAFETY_RULES.md for patterns
- Don't rush - quality over speed
