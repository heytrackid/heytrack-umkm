# Developer Quick Guide - Post Deep Scan Fixes

**Last Updated:** October 28, 2025

---

## 🚀 Quick Start

### New Patterns to Follow

#### 1. Always Pass user_id to Services

```typescript
// ✅ CORRECT
await InventoryUpdateService.updateInventoryForOrder(orderId, user.id, items)
await hppService.calculateRecipeHpp(recipeId, user.id)

// ❌ WRONG
await InventoryUpdateService.updateInventoryForOrder(orderId, items)
```

#### 2. Use Type Guards for Supabase Joins

```typescript
import { extractFirst, ensureArray } from '@/lib/type-guards'

// ✅ CORRECT - Safe extraction
const ingredient = extractFirst(ri.ingredient)
const ingredients = ensureArray(recipe.ingredients)

// ❌ WRONG - Unsafe array access
const ingredient = ri.ingredient?.[0]
```

#### 3. Consistent Error Handling

```typescript
// ✅ CORRECT
try {
  // code
} catch (error) {
  logger.error({ error }, 'Message')
}

// ❌ WRONG
try {
  // code
} catch (err) {  // or 'e'
  console.log(err)
}
```

#### 4. Use Configuration Constants

```typescript
import { HPP_CONFIG } from '@/lib/constants/hpp-config'

// ✅ CORRECT
const laborCost = HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING

// ❌ WRONG
const laborCost = 5000  // Magic number
```

#### 5. Invalidate Cache After Mutations

```typescript
import { cacheInvalidation } from '@/lib/cache/cache-manager'

// ✅ CORRECT
await supabase.from('recipes').update(data).eq('id', id)
await cacheInvalidation.recipes(id)

// ❌ WRONG
await supabase.from('recipes').update(data).eq('id', id)
// No cache invalidation
```

#### 6. Use Transactions for Complex Operations

```typescript
import { createOrderWithTransaction } from '@/lib/database/order-transactions'

// ✅ CORRECT - Atomic with rollback
const result = await createOrderWithTransaction(supabase, {
  order: orderData,
  items: orderItems,
  createFinancialRecord: true
}, userId)

// ❌ WRONG - Manual operations without rollback
await supabase.from('orders').insert(orderData)
await supabase.from('order_items').insert(orderItems)
// If second fails, first is not rolled back
```

---

## 📚 Common Patterns

### Pattern 1: Creating an Order

```typescript
import { createOrderWithTransaction } from '@/lib/database/order-transactions'
import { cacheInvalidation } from '@/lib/cache/cache-manager'
import { InventoryUpdateService } from '@/modules/orders/services/InventoryUpdateService'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Validate
  const validation = OrderInsertSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    // Create order with transaction
    const result = await createOrderWithTransaction(
      supabase,
      {
        order: validation.data,
        items: validation.data.items,
        createFinancialRecord: true
      },
      user.id
    )

    // Update inventory if needed
    if (validation.data.status === 'IN_PROGRESS') {
      await InventoryUpdateService.updateInventoryForOrder(
        result.orderId,
        user.id,
        validation.data.items
      )
    }

    // Invalidate caches
    await cacheInvalidation.orders(result.orderId)

    return NextResponse.json({ data: result })
  } catch (error) {
    apiLogger.error({ error }, 'Failed to create order')
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
```

### Pattern 2: Calculating HPP

```typescript
import { HppCalculatorService } from '@/modules/hpp/services/HppCalculatorService'
import { cacheInvalidation } from '@/lib/cache/cache-manager'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { recipeId } = await request.json()

  try {
    const hppService = new HppCalculatorService()
    const result = await hppService.calculateRecipeHpp(recipeId, user.id)

    // Invalidate HPP cache
    await cacheInvalidation.hpp(recipeId)

    return NextResponse.json({ data: result })
  } catch (error) {
    apiLogger.error({ error, recipeId }, 'Failed to calculate HPP')
    return NextResponse.json({ error: 'Failed to calculate HPP' }, { status: 500 })
  }
}
```

### Pattern 3: Updating with Type Guards

```typescript
import { extractFirst, isRecipeWithIngredients } from '@/lib/type-guards'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        quantity,
        unit,
        ingredient:ingredients (
          id,
          name,
          price_per_unit
        )
      )
    `)
    .single()

  if (error) throw error

  // Validate structure
  if (!isRecipeWithIngredients(data)) {
    throw new Error('Invalid recipe structure')
  }

  // Safe extraction
  const ingredients = data.recipe_ingredients.map(ri => ({
    ...ri,
    ingredient: extractFirst(ri.ingredient)
  }))

  return NextResponse.json({ data: { ...data, ingredients } })
}
```

### Pattern 4: Custom Transaction

```typescript
import { executeTransaction, createOperation } from '@/lib/database/transactions'

async function complexOperation(supabase: SupabaseClient, userId: string) {
  let resourceId: string | undefined

  const operations = [
    createOperation(
      'create_resource',
      async () => {
        const { data, error } = await supabase
          .from('resources')
          .insert({ user_id: userId })
          .select('id')
          .single()
        
        if (error) throw error
        resourceId = data.id
        return data
      },
      async () => {
        if (resourceId) {
          await supabase.from('resources').delete().eq('id', resourceId)
        }
      }
    ),
    
    createOperation(
      'update_related',
      async () => {
        if (!resourceId) throw new Error('Resource ID not set')
        
        const { error } = await supabase
          .from('related')
          .update({ resource_id: resourceId })
          .eq('user_id', userId)
        
        if (error) throw error
      }
    )
  ]

  return executeTransaction(operations)
}
```

---

## 🔧 Configuration

### HPP Configuration

Edit `src/lib/constants/hpp-config.ts`:

```typescript
export const HPP_CONFIG = {
  DEFAULT_LABOR_COST_PER_SERVING: 5000,  // Adjust based on your costs
  DEFAULT_OVERHEAD_PER_SERVING: 2000,
  FALLBACK_RECIPE_COUNT: 10,
  WAC_LOOKBACK_TRANSACTIONS: 50,
  
  ALERTS: {
    PRICE_INCREASE_THRESHOLD: 0.10,  // 10% increase triggers alert
    MARGIN_LOW_THRESHOLD: 0.20,      // 20% margin warning
  }
}
```

### Cache TTL

Edit `src/lib/cache/cache-manager.ts`:

```typescript
export const CACHE_TTL = {
  RECIPES: 3600,      // 1 hour
  INGREDIENTS: 1800,  // 30 minutes
  ORDERS: 300,        // 5 minutes
  HPP: 3600,          // 1 hour
}
```

---

## 🐛 Debugging

### Check Type Safety

```bash
pnpm type-check
```

### Check Linting

```bash
pnpm lint
```

### Auto-fix Linting Issues

```bash
pnpm lint --fix
```

### Check for Magic Numbers

```bash
grep -r "5000\|2000" src/modules/hpp/services/
```

### Check for Inconsistent Error Handling

```bash
grep -r "catch (err" src/
grep -r "catch (e:" src/
```

### Check for Missing user_id

```bash
grep -r "user_id: ''" src/
```

---

## 📖 Reference

### Type Guards

```typescript
import {
  extractFirst,        // Extract first element from Supabase join
  ensureArray,         // Ensure array from Supabase join
  safeNumber,          // Safe number parsing
  safeString,          // Safe string parsing
  isValidUUID,         // Validate UUID format
  isRecipeWithIngredients,
  isIngredientWithStock,
  isOrderWithItems,
  isProductionBatch,
  isHppCalculation,
} from '@/lib/type-guards'
```

### Cache Invalidation

```typescript
import { cacheInvalidation } from '@/lib/cache/cache-manager'

await cacheInvalidation.recipes(recipeId)
await cacheInvalidation.ingredients(ingredientId)
await cacheInvalidation.orders(orderId)
await cacheInvalidation.hpp(recipeId)
await cacheInvalidation.operationalCosts()
await cacheInvalidation.production(productionId)
await cacheInvalidation.all()  // Use sparingly
```

### Transactions

```typescript
import {
  executeTransaction,
  createOperation,
  retryWithBackoff,
  executeParallel,
} from '@/lib/database/transactions'

import {
  createOrderWithTransaction,
} from '@/lib/database/order-transactions'
```

### Configuration

```typescript
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import { ORDER_CONFIG } from '@/lib/constants'
```

---

## ⚠️ Common Mistakes

### 1. Forgetting user_id

```typescript
// ❌ WRONG
await service.updateInventoryForOrder(orderId, items)

// ✅ CORRECT
await service.updateInventoryForOrder(orderId, user.id, items)
```

### 2. Not Using Type Guards

```typescript
// ❌ WRONG
const ingredient = data.ingredient[0]  // Can crash

// ✅ CORRECT
const ingredient = extractFirst(data.ingredient)
```

### 3. Not Invalidating Cache

```typescript
// ❌ WRONG
await supabase.from('recipes').update(data).eq('id', id)
return NextResponse.json({ success: true })

// ✅ CORRECT
await supabase.from('recipes').update(data).eq('id', id)
await cacheInvalidation.recipes(id)
return NextResponse.json({ success: true })
```

### 4. Using console.log

```typescript
// ❌ WRONG
console.log('Error:', error)

// ✅ CORRECT
import { apiLogger } from '@/lib/logger'
apiLogger.error({ error }, 'Error message')
```

### 5. Magic Numbers

```typescript
// ❌ WRONG
const cost = 5000

// ✅ CORRECT
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
const cost = HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
```

---

## 🎯 Checklist for New Features

- [ ] Pass `user_id` to all service methods
- [ ] Use type guards for Supabase joins
- [ ] Use consistent error handling (`error` variable)
- [ ] Use configuration constants (no magic numbers)
- [ ] Invalidate cache after mutations
- [ ] Use transactions for complex operations
- [ ] Add proper logging (no console.log)
- [ ] Validate inputs with Zod schemas
- [ ] Add type guards for external data
- [ ] Test rollback scenarios

---

## 📞 Need Help?

1. Check this guide first
2. Review `ALL_FIXES_COMPLETE.md` for detailed explanations
3. Check type definitions in `src/lib/type-guards.ts`
4. Review transaction examples in `src/lib/database/`
5. Check cache patterns in `src/lib/cache/cache-manager.ts`

---

**Happy Coding! 🚀**
