# 🎯 Unified Type System

## Quick Start

```typescript
import {
  // 🔗 Supabase Relations
  WithRelation,
  WithArrayRelation,
  WithNestedRelation,
  
  // 🎯 Type Guards
  isRecord,
  isString,
  isNumber,
  hasKey,
  hasKeys,
  isArrayOf,
  
  // 🛡️ Assertions
  assertRecord,
  assertNonNull,
  
  // 🔧 Safe Utilities
  safeGet,
  safeMap,
  safeFilter,
  extractFirst,
  ensureArray,
  safeNumber,
  safeString,
  getErrorMessage,
  
  // 🌐 Browser APIs
  hasConnection,
  hasMemory,
  hasRequestIdleCallback,
  
  // 📋 Domain Guards
  isRecipe,
  isIngredient,
  isOrder,
  isCustomer,
  isOrderStatus,
  isProductionStatus,
  
  // 📊 Supabase Client
  typed,
  TypedSupabaseClient,
} from '@/types/database'
```

## File Structure

```
src/types/
├── database.ts           # Main export (includes type-utilities)
├── type-utilities.ts     # Unified type system (all-in-one)
├── supabase-generated.ts # Auto-generated from Supabase
└── README.md            # This file
```

## Migration dari File Lama

```typescript
// ❌ Old way
import { isRecord } from '@/lib/type-guards'
import { isRecord } from '@/lib/type-guards/index'

// ✅ New way (all exports sama)
import { isRecord } from '@/types/database'
```

Files lama masih ada untuk backward compatibility, tapi sudah deprecated.

## Common Patterns

### 1. Supabase Relations

```typescript
type OrderWithCustomer = WithRelation<'orders', {
  customer: 'customers'
}>

type RecipeWithIngredients = WithArrayRelation<'recipes', {
  recipe_ingredients: 'recipe_ingredients'
}>

// Usage
const order = data as OrderWithCustomer
const customerName = order.customer?.name // ✅ Type-safe
```

### 2. Safe Data Access

```typescript
// Instead of: (obj as any).field
const value = safeGet(obj, 'field')

// Instead of: (arr as any[]).map(...)
const result = safeMap(arr, (item) => item.name)

// Instead of: data[0] or data
const first = extractFirst(data)

// Instead of: Array.isArray(data) ? data : [data]
const array = ensureArray(data)
```

### 3. Type Guards

```typescript
// Instead of: typeof x === 'object' && x !== null && !Array.isArray(x)
if (isRecord(x)) {
  // x is Record<string, unknown>
}

// Instead of: 'key' in obj && obj.key
if (hasKey(obj, 'name')) {
  // obj is Record<'name', unknown>
  const name = obj.name
}

// Domain-specific
if (isRecipe(data)) {
  // data is Row<'recipes'>
  const name = data.name // ✅ Type-safe
}
```

### 4. Browser APIs

```typescript
// Instead of: (navigator as any).connection
if (hasConnection(navigator)) {
  const speed = navigator.connection.effectiveType // ✅ Type-safe
}

// Instead of: (performance as any).memory
if (hasMemory(performance)) {
  const used = performance.memory.usedJSHeapSize // ✅ Type-safe
}

// Instead of: (window as any).requestIdleCallback
if (hasRequestIdleCallback(window)) {
  window.requestIdleCallback(callback, { timeout: 5000 })
}
```

### 5. Supabase Client

```typescript
// Instead of: supabase as any
import { typed } from '@/types/database'

const result = await typed(supabase)
  .from('orders')
  .select('*')
// ✅ Fully typed
```

## Benefits

✅ **No more `as any`** - 100% type-safe  
✅ **Better IntelliSense** - Auto-complete everywhere  
✅ **Catch errors early** - At compile time, not runtime  
✅ **Single source of truth** - All types in one place  
✅ **Backward compatible** - Old imports still work  

## Full Documentation

Lihat [GUIDE_REMOVE_AS_ANY.md](/GUIDE_REMOVE_AS_ANY.md) untuk contoh lengkap dan migrasi guide.
