# Type Guards Import Summary

## ✅ Completed: Import Type Guards ke API Routes

Saya telah menambahkan import type guards dari `@/lib/type-guards` ke file-file API yang belum menggunakannya.

## Files Updated

### 1. **Notifications**
- ✅ `src/app/api/notifications/route.ts`
  - Added: `isArrayOf`, `isRecord`, `assertNonNull`
- ✅ `src/app/api/notifications/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/notifications/preferences/route.ts`
  - Added: `isRecord`, `assertNonNull`, `getErrorMessage`

### 2. **Orders**
- ✅ `src/app/api/orders/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/orders/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`, `isRecord`
- ✅ `src/app/api/orders/[id]/status/route.ts`
  - Added: `isOrder`, `isOrderStatus`, `isRecord`, `getErrorMessage`
- ✅ `src/app/api/orders/import/route.ts`
  - Added: `isRecord`, `isArrayOf`, `isCustomer`, `getErrorMessage`, `extractFirst`

### 3. **Ingredients**
- ✅ `src/app/api/ingredients/route.ts`
  - Added: `isIngredient`, `assertIngredient`, `isArrayOf`, `getErrorMessage`
- ✅ `src/app/api/ingredients/[id]/route.ts`
  - Already has: `isValidUUID`
- ✅ `src/app/api/ingredients/import/route.ts`
  - Added: `isIngredient`, `isArrayOf`, `isRecord`, `getErrorMessage`

### 4. **Recipes**
- ✅ `src/app/api/recipes/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/recipes/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/recipes/[id]/pricing/route.ts`
  - Added: `isRecipeWithIngredients`, `extractFirst`, `ensureArray`, `getErrorMessage`
- ✅ `src/app/api/recipes/optimized/route.ts`
  - Already has: `safeNumber`, `getErrorMessage`

### 5. **Reports**
- ✅ `src/app/api/reports/profit/route.ts`
  - Added: `isOrder`, `isRecipe`, `isArrayOf`, `extractFirst`, `ensureArray`, `getErrorMessage`
- ✅ `src/app/api/reports/cash-flow/route.ts`
  - Added: `isArrayOf`, `isRecord`, `safeNumber`, `getErrorMessage`

### 6. **Dashboard**
- ✅ `src/app/api/dashboard/stats/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/dashboard/hpp-summary/route.ts`
  - Added: `isRecipe`, `isHppCalculation`, `isArrayOf`, `safeNumber`, `getErrorMessage`

### 7. **AI**
- ✅ `src/app/api/ai/generate-recipe/route.ts`
  - Added: `isIngredient`, `isRecipe`, `isArrayOf`, `getErrorMessage`, `safeNumber`
- ✅ `src/app/api/ai/sessions/route.ts`
  - Already has: `safeNumber`

### 8. **Other Modules**
- ✅ `src/app/api/customers/route.ts`
  - Already has: `getErrorMessage`, `safeNumber`, `safeString`
- ✅ `src/app/api/customers/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/suppliers/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/suppliers/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/expenses/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/expenses/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`, `isRecord`, `extractFirst`, `safeString`
- ✅ `src/app/api/sales/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/sales/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/operational-costs/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/operational-costs/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`
- ✅ `src/app/api/ingredient-purchases/route.ts`
  - Already has: `getErrorMessage`
- ✅ `src/app/api/ingredient-purchases/[id]/route.ts`
  - Already has: `getErrorMessage`, `isValidUUID`, `isRecord`, `extractFirst`
- ✅ `src/app/api/production-batches/[id]/route.ts`
  - Already has: `isValidUUID`, `isProductionBatch`, `extractFirst`, `isRecord`, `safeString`
- ✅ `src/app/api/financial/records/route.ts`
  - Already has: `safeNumber`, `getErrorMessage`

## Type Guards Available in `@/lib/type-guards`

### Generic Type Guards
- `isRecord(value)` - Check if value is plain object
- `isNumberOrNull(value)` - Check if value is number or null
- `isStringOrNull(value)` - Check if value is string or null
- `isArrayOf(value, guard)` - Check if array elements pass guard
- `hasKeys(value, keys)` - Check if object has required keys
- `isString(value)` - Check if value is string
- `isNumber(value)` - Check if value is number
- `isBoolean(value)` - Check if value is boolean
- `isNonNull(value)` - Check if value is not null/undefined

### Safe Parsers
- `safeNumber(value, fallback)` - Parse number with fallback
- `safeString(value, fallback)` - Parse string with fallback
- `isValidUUID(value)` / `isUUID(value)` - Validate UUID format
- `isDateString(value)` - Validate date string
- `isPositiveNumber(value)` - Check positive number
- `isNonNegativeNumber(value)` - Check non-negative number
- `getErrorMessage(error)` - Extract error message safely

### Type Assertions
- `assertRecord(value, message)` - Assert value is record
- `assertNonNull(value, message)` - Assert value is non-null
- `assertArrayOf(value, guard, message)` - Assert array elements

### Validation Functions
- `validateIngredient(value)` - Validate ingredient with errors
- `validateRecipe(value)` - Validate recipe with errors
- `validateOrder(value)` - Validate order with errors

### Supabase Join Helpers
- `extractFirst(data)` - Extract first element from Supabase join array
- `ensureArray(data)` - Ensure data is array

### Supabase-Specific Type Guards
- `isRecipe(data)` - Validate recipe
- `assertRecipe(value, message)` - Assert recipe
- `isRecipeWithIngredients(data)` - Validate recipe with ingredients
- `assertRecipeWithIngredients(value, message)` - Assert recipe with ingredients
- `isIngredient(data)` - Validate ingredient
- `assertIngredient(value, message)` - Assert ingredient
- `isOrder(data)` - Validate order
- `assertOrder(value, message)` - Assert order
- `isOrderStatus(value)` - Validate order status enum
- `isOrderWithItems(data)` - Validate order with items
- `assertOrderItem(value, message)` - Assert order item
- `isProductionStatus(value)` - Validate production status enum
- `isProductionBatch(data)` - Validate production batch
- `isHppCalculation(data)` - Validate HPP calculation
- `isCustomer(data)` - Validate customer

## Usage Examples

### 1. Validate Supabase Query Result
```typescript
import { isRecipe, assertRecipe } from '@/lib/type-guards'

const { data } = await supabase.from('recipes').select('*').single()

// Option 1: Type guard
if (!isRecipe(data)) {
  return NextResponse.json({ error: 'Invalid recipe data' }, { status: 500 })
}
// Now data is typed as Recipe

// Option 2: Assertion (throws error)
assertRecipe(data) // Throws TypeError if invalid
// Now data is typed as Recipe
```

### 2. Handle Supabase Joins
```typescript
import { extractFirst, ensureArray } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// Supabase returns joins as arrays
const ingredients = ensureArray(data.recipe_ingredients)
for (const ri of ingredients) {
  const ingredient = extractFirst(ri.ingredient) // T | null
  if (ingredient) {
    console.log(ingredient.name)
  }
}
```

### 3. Safe Error Handling
```typescript
import { getErrorMessage } from '@/lib/type-guards'

try {
  // ... operation
} catch (error: unknown) {
  apiLogger.error({ error: getErrorMessage(error) }, 'Operation failed')
  return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
}
```

### 4. Validate Array Results
```typescript
import { isArrayOf, isIngredient } from '@/lib/type-guards'

const { data } = await supabase.from('ingredients').select('*')

if (!isArrayOf(data, isIngredient)) {
  return NextResponse.json({ error: 'Invalid ingredients data' }, { status: 500 })
}
// Now data is typed as Ingredient[]
```

### 5. Safe Number Parsing
```typescript
import { safeNumber } from '@/lib/type-guards'

const page = safeNumber(searchParams.get('page'), 1)
const limit = safeNumber(searchParams.get('limit'), 10)
```

## Benefits

1. **Runtime Type Safety** - Validate data from external sources (Supabase, API requests)
2. **Better Error Messages** - Detailed validation errors for debugging
3. **Type Narrowing** - TypeScript knows the type after guard passes
4. **Consistent Patterns** - Same validation logic across all API routes
5. **Supabase Join Handling** - Safely extract nested join data
6. **Error Handling** - Safely extract error messages from unknown types

## Next Steps

1. ✅ All major API routes now have type guards imported
2. ✅ Use type guards for runtime validation of Supabase queries
3. ✅ Use `extractFirst` and `ensureArray` for Supabase joins
4. ✅ Use `getErrorMessage` for consistent error handling
5. ✅ Use `safeNumber` and `safeString` for query parameter parsing

## Related Files

- **Type Guards**: `src/lib/type-guards.ts`
- **Shared Guards**: `src/types/shared/guards.ts` (legacy, prefer `@/lib/type-guards`)
- **Generated Types**: `src/types/supabase-generated.ts`
- **Steering Rules**: `.kiro/steering/using-generated-types.md`

---

**Status**: ✅ COMPLETED  
**Date**: October 30, 2025
