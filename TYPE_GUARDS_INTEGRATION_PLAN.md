# Type Guards Integration Plan

## Overview
Integrate comprehensive type guards from `src/lib/type-guards.ts` into components and hooks for better runtime safety.

## Current Status
✅ Type guards file is comprehensive with 30+ functions
✅ Codebase is already very clean
⚠️ Some areas can benefit from explicit type guards usage

## Areas for Improvement

### 1. Error Handling in Hooks ⭐ HIGH PRIORITY
**Files:**
- `src/hooks/useRecipes.ts`
- `src/hooks/useIngredients.ts`
- All mutation hooks

**Current:**
```typescript
onError: (error: Error) => {
  apiLogger.error({ error }, 'Failed to create recipe')
  toast({
    description: error.message || 'Gagal membuat resep',
  })
}
```

**Improved with Type Guards:**
```typescript
import { getErrorMessage } from '@/lib/type-guards'

onError: (error: unknown) => {
  const message = getErrorMessage(error)
  apiLogger.error({ error: message }, 'Failed to create recipe')
  toast({
    description: message || 'Gagal membuat resep',
  })
}
```

**Benefits:**
- Handles all error types safely (Error, string, objects, unknown)
- No runtime crashes from unexpected error formats
- Consistent error extraction across codebase

---

### 2. Form Data Validation ⭐ MEDIUM PRIORITY
**Files:**
- `src/modules/orders/components/OrderForm.tsx`
- `src/modules/recipes/components/RecipeEditor.tsx`
- `src/components/forms/RecipeForm.tsx`

**Current:**
```typescript
const parseNumberInput = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}
```

**Improved with Type Guards:**
```typescript
import { safeNumber } from '@/lib/type-guards'

// Replace all parseNumberInput with safeNumber
const amount = safeNumber(e.target.value, 0)
```

**Benefits:**
- Handles null, undefined, strings, invalid numbers
- Consistent fallback behavior
- Less code duplication

---

### 3. API Response Validation ⭐ MEDIUM PRIORITY
**Files:**
- `src/hooks/useRecipes.ts`
- `src/hooks/useIngredients.ts`
- Components fetching data

**Current:**
```typescript
queryFn: async () => {
  const response = await fetch('/api/recipes')
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return response.json() // No validation!
}
```

**Improved with Type Guards:**
```typescript
import { isArrayOf, isRecipe } from '@/lib/type-guards'

queryFn: async () => {
  const response = await fetch('/api/recipes')
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  const data = await response.json()
  
  // Runtime validation
  if (!isArrayOf(data, isRecipe)) {
    throw new Error('Invalid recipe data structure')
  }
  
  return data
}
```

**Benefits:**
- Catch API contract violations early
- Type-safe data throughout component tree
- Better error messages for debugging

---

### 4. Supabase Join Data Extraction 🔵 LOW PRIORITY
**Files:**
- Components working with joined data
- Services handling recipe_ingredients, order_items

**Current:**
```typescript
// Manual array access
const ingredient = ri.ingredient?.[0]
```

**Improved with Type Guards:**
```typescript
import { extractFirst, ensureArray } from '@/lib/type-guards'

// Cleaner and safer
const ingredient = extractFirst(ri.ingredient)
const ingredients = ensureArray(data.recipe_ingredients)
```

**Benefits:**
- Consistent handling of Supabase join arrays
- Self-documenting code
- Null-safe by default

---

## Implementation Priority

### Phase 1: Error Handling (1-2 hours)
1. Update all hooks to use `getErrorMessage()`
2. Update all catch blocks in components
3. Test error scenarios

### Phase 2: Form Validation (1 hour)
1. Replace `parseNumberInput` with `safeNumber`
2. Add `safeString` where needed
3. Test form submissions

### Phase 3: API Validation (2-3 hours)
1. Add runtime validation to critical queries
2. Add type guards to mutation responses
3. Test with invalid data

### Phase 4: Supabase Helpers (1 hour)
1. Replace manual array access with `extractFirst`
2. Use `ensureArray` for collections
3. Test join queries

---

## Files to Update

### High Priority (Phase 1)
- [ ] `src/hooks/useRecipes.ts` - 4 mutations
- [ ] `src/hooks/useIngredients.ts` - 4 mutations
- [ ] `src/hooks/useProduction.ts` - mutations
- [ ] `src/hooks/useExpenses.ts` - mutations
- [ ] All other mutation hooks in `src/hooks/`

### Medium Priority (Phase 2)
- [ ] `src/modules/orders/components/OrderForm.tsx`
- [ ] `src/modules/recipes/components/RecipeEditor.tsx`
- [ ] `src/components/forms/RecipeForm.tsx`
- [ ] `src/components/forms/CustomerForm.tsx`

### Medium Priority (Phase 3)
- [ ] `src/hooks/useRecipes.ts` - queries
- [ ] `src/hooks/useIngredients.ts` - queries
- [ ] `src/modules/recipes/hooks/useRecipesWithIngredients.ts`
- [ ] `src/modules/hpp/hooks/useUnifiedHpp.ts`

### Low Priority (Phase 4)
- [ ] Services handling joins
- [ ] Components with nested data access

---

## Testing Strategy

### 1. Error Handling Tests
- Throw Error objects
- Throw strings
- Throw objects with message
- Throw unknown types

### 2. Form Validation Tests
- Valid numbers
- Invalid strings
- Null/undefined
- Edge cases (Infinity, NaN)

### 3. API Validation Tests
- Valid responses
- Invalid structure
- Missing fields
- Wrong types

---

## Success Metrics

- ✅ Zero runtime type errors in production
- ✅ Consistent error messages across app
- ✅ Reduced code duplication
- ✅ Better developer experience
- ✅ Easier debugging

---

## Notes

- Type guards are already comprehensive
- Codebase is already very clean
- This is about **consistency** and **safety**, not fixing bugs
- Focus on high-value areas first
- Can be done incrementally

---

**Status:** Ready to implement
**Estimated Time:** 5-7 hours total
**Risk:** Low (non-breaking changes)
