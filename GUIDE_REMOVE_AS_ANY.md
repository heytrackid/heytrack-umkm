# 🎯 Panduan Menghilangkan `as any` dari Codebase

## Unified Type System

Semua type utilities, type guards, dan type helpers sudah di-merge jadi satu file:

```typescript
import {
  // Type helpers
  WithRelation,
  WithArrayRelation,
  typed,
  
  // Type guards
  isRecord,
  isString,
  isNumber,
  hasKey,
  hasKeys,
  
  // Safe utilities
  safeGet,
  safeMap,
  extractFirst,
  ensureArray,
  
  // Domain guards
  isRecipe,
  isIngredient,
  isOrder,
  
  // Everything else...
} from '@/types/database' // atau '@/types/type-utilities'
```

## Masalah Umum dan Solusinya

### 1. ❌ Supabase Relations/Joins

**SEBELUM:**
```typescript
const recipe = (item as any).recipe
const recipeIngredients = (recipe as any).recipe_ingredients || []
```

**SESUDAH:**
```typescript
import { WithNestedRelation, WithArrayRelation } from '@/types/type-utilities'
import type { Row } from '@/types/database'

// Define type untuk data dengan relasi
type OrderItemWithRecipe = WithNestedRelation<
  Row<'order_items'>,
  'recipe',
  'recipes'
>

type RecipeWithIngredients = WithArrayRelation<
  'recipes',
  { recipe_ingredients: 'recipe_ingredients' }
>

// Gunakan type yang sudah didefinisikan
const item = data as OrderItemWithRecipe
const recipe = item.recipe // ✅ Type-safe!

const recipeWithIngredients = recipeData as RecipeWithIngredients
const ingredients = recipeWithIngredients.recipe_ingredients // ✅ Type-safe!
```

### 2. ❌ Browser APIs (Navigator, Performance, dll)

**SEBELUM:**
```typescript
const connection = (navigator as any).connection
const memory = (performance as any).memory
const { requestIdleCallback } = window as any
```

**SESUDAH:**
```typescript
import { hasConnection, hasMemory, hasRequestIdleCallback } from '@/types/type-utilities'

// Network Information API
if (hasConnection(navigator)) {
  const speed = navigator.connection.effectiveType // ✅ Type-safe
  const rtt = navigator.connection.rtt
}

// Performance Memory API
if (hasMemory(performance)) {
  const used = performance.memory.usedJSHeapSize // ✅ Type-safe
  const total = performance.memory.totalJSHeapSize
}

// requestIdleCallback
if (hasRequestIdleCallback(window)) {
  window.requestIdleCallback(callback, { timeout: 5000 }) // ✅ Type-safe
}
```

### 3. ❌ Supabase Client Casting

**SEBELUM:**
```typescript
await hppService.calculateRecipeHpp(supabase as any, recipeId, userId)
```

**SESUDAH:**
```typescript
import { typed } from '@/types/type-utilities'

// Option 1: Gunakan typed() helper
await hppService.calculateRecipeHpp(typed(supabase), recipeId, userId)

// Option 2: Update service untuk accept generic
class HppCalculatorService {
  async calculateRecipeHpp(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ) {
    // ✅ No casting needed
  }
}
```

### 4. ❌ Array/Object dengan Data Unknown

**SEBELUM:**
```typescript
const ingredients = (data as any[]).map(ing => {
  const stock = ing.current_stock || 0
})

const value = (obj as any)[key]
```

**SESUDAH:**
```typescript
import { safeMap, safeGet, isRecord, hasKey } from '@/types/type-utilities'

// Safe array mapping
const ingredients = safeMap(data, (ing) => {
  if (hasKey(ing, 'current_stock')) {
    return ing.current_stock || 0
  }
  return 0
})

// Safe object access
if (isRecord(obj) && hasKey(obj, 'current_stock')) {
  const stock = obj.current_stock // ✅ Type-safe
}

// Or use helper
const stock = safeGet(obj, 'current_stock')
```

### 5. ❌ Form Values & Event Handlers

**SEBELUM:**
```typescript
onInputChange={handleInputChange as any}
resolver: zodResolver(schema as any) as any
```

**SESUDAH:**
```typescript
// Option 1: Fix handler signature
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Implementation
}

<input onChange={handleInputChange} /> // ✅ No casting

// Option 2: Use proper generic
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormValues } from '@/types/type-utilities'

type MyFormData = FormValues<typeof schema>

const form = useForm<MyFormData>({
  resolver: zodResolver(schema), // ✅ No casting needed
})
```

### 6. ❌ Supabase Insert/Update

**SEBELUM:**
```typescript
.insert(data as any)
.update(patch as any)
.eq('id' as any, id as any)
```

**SESUDAH:**
```typescript
import { Insert, Update } from '@/types/database'

// Define proper types
const data: Insert<'orders'> = {
  user_id: userId,
  total_price: 12000,
  // ... rest
}

await supabase
  .from('orders')
  .insert(data) // ✅ No casting needed

// For generic functions
async function updateRecord<T extends TableName>(
  table: T,
  id: string,
  data: Update<T>
) {
  return await supabase
    .from(table)
    .update(data)
    .eq('id', id) // ✅ Type-safe
}
```

### 7. ❌ Metadata/JSON Fields

**SEBELUM:**
```typescript
metadata: (params.metadata || {}) as any
```

**SESUDAH:**
```typescript
import type { Json } from '@/types/database'

// Define metadata schema
interface NotificationMetadata {
  orderId?: string
  userId?: string
  amount?: number
}

// Type guard untuk metadata
function isNotificationMetadata(json: Json): json is NotificationMetadata {
  return (
    typeof json === 'object' &&
    json !== null &&
    (!('orderId' in json) || typeof json.orderId === 'string')
  )
}

// Usage
const metadata: Json = params.metadata || {}
// Later, when accessing:
if (isNotificationMetadata(metadata)) {
  const orderId = metadata.orderId // ✅ Type-safe
}
```

### 8. ❌ Dynamic Property Access

**SEBELUM:**
```typescript
return (item as any)[key] === value
const aVal = getValue(a, sortBy) as any
```

**SESUDAH:**
```typescript
// Option 1: Use generic with keyof constraint
function filterByKey<T extends Record<string, unknown>>(
  item: T,
  key: keyof T,
  value: unknown
): boolean {
  return item[key] === value // ✅ Type-safe
}

// Option 2: Use safeGet helper
import { safeGet } from '@/types/type-utilities'

const sortedData = [...data].sort((a, b) => {
  const aVal = safeGet(a, sortBy)
  const bVal = safeGet(b, sortBy)
  
  if (aVal === undefined || bVal === undefined) return 0
  
  return sortOrder === 'asc'
    ? String(aVal).localeCompare(String(bVal))
    : String(bVal).localeCompare(String(aVal))
})
```

## Checklist Refactoring

- [ ] Import type utilities: `import { ... } from '@/types/type-utilities'`
- [ ] Define relation types untuk Supabase queries
- [ ] Replace browser API casts dengan type guards
- [ ] Update service signatures untuk accept proper types
- [ ] Add type guards untuk JSON/metadata fields
- [ ] Fix form handler signatures
- [ ] Replace dynamic access dengan keyof constraints
- [ ] Test di TypeScript strict mode

## Tips

1. **Jangan gunakan `as any` untuk "quick fix"** - investasi waktu untuk proper typing akan save waktu debugging
2. **Start dari leaf functions** - fix functions yang paling dalam dulu, lalu propagate types ke atas
3. **Use TypeScript strict mode** - enable `strict: true` di tsconfig untuk catch issues
4. **Add JSDoc comments** - jelaskan why certain casting diperlukan jika memang unavoidable
5. **Create domain-specific type guards** - untuk business logic yang complex

## Contoh Lengkap: Order Service

```typescript
import type {
  Row,
  Insert,
  Update,
  WithRelation,
  WithArrayRelation,
  TypedSupabaseClient,
} from '@/types/type-utilities'
import { safeGet, hasKey, safeMap } from '@/types/type-utilities'

// Define domain types
type OrderWithCustomer = WithRelation<'orders', { customer: 'customers' }>

type OrderItemWithRecipe = WithNestedRelation<
  Row<'order_items'>,
  'recipe',
  'recipes'
>

type RecipeWithIngredients = WithArrayRelation<
  'recipes',
  { recipe_ingredients: 'recipe_ingredients' }
>

// Service implementation - NO `as any`!
class OrderService {
  constructor(private supabase: TypedSupabaseClient) {}

  async getOrderWithDetails(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          recipe:recipes(
            *,
            recipe_ingredients(*)
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    // Cast once to proper type
    const order = data as OrderWithCustomer & {
      order_items: Array<
        OrderItemWithRecipe & {
          recipe: RecipeWithIngredients
        }
      >
    }

    // Now all access is type-safe!
    const customerName = order.customer?.name
    const items = order.order_items.map(item => ({
      recipeName: item.recipe?.name,
      ingredients: item.recipe?.recipe_ingredients.length || 0,
    }))

    return { order, customerName, items }
  }

  async createOrder(data: Insert<'orders'>) {
    // ✅ No casting needed
    return await this.supabase
      .from('orders')
      .insert(data)
      .select()
      .single()
  }
}
```

## Kesimpulan

Dengan menggunakan type helpers dan utilities yang sudah dibuat, kamu bisa **100% menghilangkan `as any`** dari codebase dengan cara yang maintainable dan type-safe. 

**File penting:**
- `/src/types/database.ts` - Base types dari Supabase
- `/src/types/type-utilities.ts` - Helper types & guards
- Panduan ini - Reference untuk common patterns

Happy type-safe coding! 🚀
