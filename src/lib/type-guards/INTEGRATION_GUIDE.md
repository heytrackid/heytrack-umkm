# Type Guards Integration Guide

Quick reference for integrating type guards from `src/lib/type-guards.ts` into your codebase.

## 📦 Available Type Guards & Helpers

### Type Guards
- `isRecipeWithIngredients(data)` - Recipe with joined ingredients
- `isIngredientWithStock(data)` - Ingredient with stock info
- `isOrderWithItems(data)` - Order with order items
- `isProductionBatch(data)` - Production batch data
- `isHppCalculation(data)` - HPP calculation results
- `isValidUUID(value)` - UUID format validation

### Helper Functions
- `extractFirst<T>(data)` - Extract first element from Supabase join arrays
- `ensureArray<T>(data)` - Ensure data is an array
- `safeNumber(value, fallback)` - Safe number parsing
- `safeString(value, fallback)` - Safe string parsing
- `getErrorMessage(error)` - Extract error message from unknown errors

## 🎯 Common Integration Patterns

### Pattern 1: API Route with Supabase Joins

```typescript
import { isRecipeWithIngredients, getErrorMessage } from '@/lib/type-guards'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('id', recipeId)
      .single()
    
    if (error) throw error
    
    // ✅ Validate structure
    if (!isRecipeWithIngredients(data)) {
      apiLogger.error({ data }, 'Invalid recipe structure')
      return NextResponse.json({ error: 'Invalid data' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Pattern 2: Handling Supabase Join Arrays

```typescript
import { extractFirst, ensureArray } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// Supabase returns joins as arrays
data.recipe_ingredients.forEach(ri => {
  const ingredient = extractFirst(ri.ingredient) // Get first element safely
  if (ingredient) {
    console.log(ingredient.name)
  }
})
```

### Pattern 3: Safe Query Parameter Parsing

```typescript
import { safeNumber, safeString } from '@/lib/type-guards'

const { searchParams } = new URL(request.url)

const page = safeNumber(searchParams.get('page'), 1)
const limit = safeNumber(searchParams.get('limit'), 10)
const search = safeString(searchParams.get('search'), '')
```

### Pattern 4: UUID Validation in Dynamic Routes

```typescript
import { isValidUUID } from '@/lib/type-guards'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  
  // Safe to use id
}
```

### Pattern 5: Error Handling

```typescript
import { getErrorMessage } from '@/lib/type-guards'

try {
  await operation()
} catch (error: unknown) {
  const message = getErrorMessage(error)
  apiLogger.error({ error: message })
  return NextResponse.json({ error: message }, { status: 500 })
}
```

## 📝 Integration Checklist

When adding type guards to a file:

- [ ] Import needed guards from `@/lib/type-guards`
- [ ] Add validation after Supabase queries with joins
- [ ] Replace `error.message` with `getErrorMessage(error)`
- [ ] Use `safeNumber()` for query params
- [ ] Use `isValidUUID()` for ID validation
- [ ] Use `extractFirst()` for Supabase joins
- [ ] Log validation failures

## 🔧 Quick Replacements

### Replace unsafe error handling:
```typescript
// ❌ Before
catch (error: unknown) {
  apiLogger.error({ error })
}

// ✅ After
import { getErrorMessage } from '@/lib/type-guards'
catch (error: unknown) {
  apiLogger.error({ error: getErrorMessage(error) })
}
```

### Replace unsafe number parsing:
```typescript
// ❌ Before
const page = parseInt(searchParams.get('page') || '1')

// ✅ After
import { safeNumber } from '@/lib/type-guards'
const page = safeNumber(searchParams.get('page'), 1)
```

### Replace unsafe Supabase join access:
```typescript
// ❌ Before
const ingredient = ri.ingredient[0]

// ✅ After
import { extractFirst } from '@/lib/type-guards'
const ingredient = extractFirst(ri.ingredient)
```

## 🚀 Priority Files to Update

1. **API Routes** - All routes with Supabase queries
2. **Hooks** - `useEnhancedCRUD`, `useSupabaseCRUD`
3. **Services** - HPP services, order services
4. **Components** - Forms with user input

## 📚 Examples by File Type

### API Route Example
See: `src/app/api/recipes/route.ts`

### Hook Example
See: `src/hooks/enhanced-crud/useEnhancedCRUD.ts`

### Service Example
See: `src/lib/cron/hpp.ts`
