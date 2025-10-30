# Type Guards Migration Examples

Quick copy-paste examples for migrating existing code to use type guards.

## 🔄 Error Handling Migration

### Pattern 1: Basic Error Handling

```typescript
// ❌ Before
catch (err: unknown) {
  apiLogger.error({ err }, 'Operation failed')
}

// ✅ After
import { getErrorMessage } from '@/lib/type-guards'

catch (error: unknown) {
  apiLogger.error({ error: getErrorMessage(error) }, 'Operation failed')
}
```

### Pattern 2: Error with Context

```typescript
// ❌ Before
catch (error: unknown) {
  if (error instanceof Error) {
    apiLogger.error({ error: error.message, userId })
  } else {
    apiLogger.error({ error: String(error), userId })
  }
}

// ✅ After
import { getErrorMessage } from '@/lib/type-guards'

catch (error: unknown) {
  apiLogger.error({ error: getErrorMessage(error), userId })
}
```

### Pattern 3: Error Response

```typescript
// ❌ Before
catch (error: unknown) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  )
}

// ✅ After
import { getErrorMessage } from '@/lib/type-guards'

catch (error: unknown) {
  return NextResponse.json(
    { error: getErrorMessage(error) },
    { status: 500 }
  )
}
```

## 🔢 Query Parameter Migration

### Pattern 1: Number Parameters

```typescript
// ❌ Before
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')

// ✅ After
import { safeNumber } from '@/lib/type-guards'

const page = safeNumber(searchParams.get('page'), 1)
const limit = safeNumber(searchParams.get('limit'), 10)
```

### Pattern 2: String Parameters

```typescript
// ❌ Before
const search = searchParams.get('search') || ''
const category = searchParams.get('category') || 'all'

// ✅ After
import { safeString } from '@/lib/type-guards'

const search = safeString(searchParams.get('search'), '')
const category = safeString(searchParams.get('category'), 'all')
```

### Pattern 3: Nullable Database Fields

```typescript
// ❌ Before
const stock = ingredient.current_stock || 0
const price = recipe.selling_price || 0

// ✅ After
import { safeNumber } from '@/lib/type-guards'

const stock = safeNumber(ingredient.current_stock, 0)
const price = safeNumber(recipe.selling_price, 0)
```

## 🆔 UUID Validation Migration

### Pattern 1: Dynamic Route Validation

```typescript
// ❌ Before
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  // No validation - assumes ID is valid
  const { data } = await supabase.from('recipes').select('*').eq('id', id)
}

// ✅ After
import { isValidUUID } from '@/lib/type-guards'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
  }
  
  const { data } = await supabase.from('recipes').select('*').eq('id', id)
}
```

### Pattern 2: Request Body Validation

```typescript
// ❌ Before
const body = await request.json()
// Assumes recipe_id is valid UUID
await supabase.from('orders').insert({ recipe_id: body.recipe_id })

// ✅ After
import { isValidUUID } from '@/lib/type-guards'

const body = await request.json()

if (!isValidUUID(body.recipe_id)) {
  return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 })
}

await supabase.from('orders').insert({ recipe_id: body.recipe_id })
```

## 🔗 Supabase Join Migration

### Pattern 1: Single Join

```typescript
// ❌ Before
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// Unsafe access - might be undefined or array
const ingredient = data.recipe_ingredients[0].ingredient[0]

// ✅ After
import { extractFirst } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

data.recipe_ingredients.forEach(ri => {
  const ingredient = extractFirst(ri.ingredient)
  if (ingredient) {
    console.log(ingredient.name) // Safe!
  }
})
```

### Pattern 2: Ensure Array

```typescript
// ❌ Before
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*)')
  .single()

// Might not be an array
const ingredients = data.recipe_ingredients || []

// ✅ After
import { ensureArray } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*)')
  .single()

const ingredients = ensureArray(data.recipe_ingredients)
```

## ✅ Type Validation Migration

### Pattern 1: Recipe with Ingredients

```typescript
// ❌ Before
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// No validation - assumes structure is correct
return NextResponse.json(data)

// ✅ After
import { isRecipeWithIngredients } from '@/lib/type-guards'

const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

if (!isRecipeWithIngredients(data)) {
  apiLogger.error({ data }, 'Invalid recipe structure')
  return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 })
}

return NextResponse.json(data) // Now type-safe!
```

### Pattern 2: Order with Items

```typescript
// ❌ Before
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .single()

// No validation
return NextResponse.json(data)

// ✅ After
import { isOrderWithItems } from '@/lib/type-guards'

const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .single()

if (!isOrderWithItems(data)) {
  apiLogger.error({ data }, 'Invalid order structure')
  return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 })
}

return NextResponse.json(data)
```

## 🔄 Complete API Route Migration

### Before (Unsafe)

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
    
    return NextResponse.json(data)
  } catch (err: unknown) {
    apiLogger.error({ err })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### After (Safe)

```typescript
import { getErrorMessage, safeNumber } from '@/lib/type-guards'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const page = safeNumber(searchParams.get('page'), 1)
    const limit = safeNumber(searchParams.get('limit'), 10)
    
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

## 📋 Migration Checklist

For each file you migrate:

- [ ] Import type guards: `import { getErrorMessage, safeNumber, safeString, isValidUUID } from '@/lib/type-guards'`
- [ ] Replace error handling: `catch (error: unknown)` + `getErrorMessage(error)`
- [ ] Replace query param parsing: `safeNumber()`, `safeString()`
- [ ] Add UUID validation: `isValidUUID(id)`
- [ ] Add type validation for Supabase joins: `isRecipeWithIngredients()`, etc.
- [ ] Use `extractFirst()` for nested joins
- [ ] Run diagnostics: `getDiagnostics(['path/to/file.ts'])`
- [ ] Test the endpoint/function

## 🎯 Priority Order

1. **Error Handling** (Easiest, highest impact)
   - Replace all `catch (err)` with `catch (error)` + `getErrorMessage()`
   
2. **Query Parameters** (Easy, prevents bugs)
   - Replace `parseInt()` with `safeNumber()`
   - Replace `|| ''` with `safeString()`

3. **UUID Validation** (Medium, security benefit)
   - Add `isValidUUID()` to dynamic routes
   - Validate IDs in request bodies

4. **Type Validation** (Advanced, best type safety)
   - Add type guards after Supabase queries
   - Use `extractFirst()` for joins

## 💡 Tips

1. **Start with error handling** - It's the easiest and has immediate benefits
2. **Use find & replace** - Search for `catch (err` and replace with `catch (error`
3. **Test incrementally** - Migrate one file at a time and test
4. **Check diagnostics** - Run `getDiagnostics()` after each change
5. **Follow patterns** - Use the examples above as templates

---

**Remember**: Type guards are about safety, not perfection. Start with error handling and add more as needed!
