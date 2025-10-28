# Critical Fixes Checklist

## 🔴 CRITICAL - Must Fix Before Production

### 1. Fix Supabase Client Imports in HPP Services

**Files to Update:**
- [ ] `src/modules/hpp/services/HppCalculatorService.ts`
- [ ] `src/modules/hpp/services/HppSnapshotService.ts`
- [ ] `src/modules/hpp/services/HppAlertService.ts`

**Changes Required:**
```typescript
// ❌ REMOVE THIS
import supabase from '@/utils/supabase'

// ✅ ADD THIS
import { createClient } from '@/utils/supabase/server'

// ✅ UPDATE ALL METHODS TO ACCEPT SUPABASE CLIENT
async calculateRecipeHpp(
  supabase: SupabaseClient<Database>,
  recipeId: string
): Promise<HppCalculationResult>
```

**Testing:**
- [ ] Test HPP calculation from API route
- [ ] Test HPP snapshot creation
- [ ] Test HPP alert detection
- [ ] Verify RLS policies work correctly

---

### 2. Fix user_id in InventoryUpdateService

**File:** `src/modules/orders/services/InventoryUpdateService.ts`

**Changes Required:**
```typescript
// ✅ UPDATE METHOD SIGNATURE
static async updateInventoryForOrder(
  order_id: string,
  user_id: string,  // ADD THIS
  items: Array<{
    recipe_id: string
    quantity: number
  }>
): Promise<void>

// ✅ UPDATE STOCK TRANSACTION
const stockTransaction: TablesInsert<'stock_transactions'> = {
  ingredient_id: ingredient.id,
  type: 'USAGE',
  quantity: -usedQuantity,
  reference: order_id,
  notes: `Used for order production`,
  user_id: user_id  // USE PARAMETER
}
```

**Update Callers:**
- [ ] `src/app/api/orders/route.ts` - Pass user.id
- [ ] `src/app/api/orders/[id]/status/route.ts` - Pass user.id

**Testing:**
- [ ] Create order and verify stock transaction has correct user_id
- [ ] Verify RLS policies allow access
- [ ] Test with different users to ensure isolation

---

### 3. Regenerate Supabase Types

**Command:**
```bash
npx supabase gen types typescript \
  --project-id <your-project-id> \
  > src/types/supabase-generated.ts
```

**Verification:**
- [ ] Check `hpp_calculations` table exists in types
- [ ] Check `hpp_snapshots` table exists in types
- [ ] Check `hpp_alerts` table exists in types
- [ ] Remove temporary interfaces from HPP services

**Update HPP Services:**
```typescript
// ✅ USE GENERATED TYPES
import type { Database } from '@/types/supabase-generated'

type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']
type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']
```

---

## 🟡 HIGH PRIORITY - Fix Within Week

### 4. Standardize Error Handling

**Create ESLint Rule:**
```javascript
// .eslintrc.js or eslint.config.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'CatchClause > Identifier[name!="error"]',
      message: 'Use "error" as catch parameter name for consistency'
    }
  ]
}
```

**Files to Update (45+ files):**
- [ ] All files in `src/app/api/`
- [ ] All service files
- [ ] All hook files

**Pattern to Use:**
```typescript
try {
  // code
} catch (error: unknown) {
  apiLogger.error({ error }, 'Error message')
  return handleAPIError(error)
}
```

---

### 5. Consolidate Validation Schemas

**Action Plan:**

1. **Keep Domain Schemas as Source of Truth:**
   - `src/lib/validations/domains/order.ts`
   - `src/lib/validations/domains/ingredient.ts`
   - etc.

2. **Remove Duplicates from:**
   - [ ] `src/lib/validations/api-schemas.ts`

3. **Create Composition Pattern:**
```typescript
// src/lib/validations/api-schemas.ts
import { OrderInsertSchema } from './domains/order'

// Extend for API-specific needs
export const CreateOrderAPISchema = OrderInsertSchema.extend({
  // API-specific fields
})
```

4. **Update API Routes:**
   - [ ] Update all routes to use domain schemas
   - [ ] Remove references to old API schemas

---

### 6. Add HPP Configuration File

**Create:** `src/lib/constants/hpp-config.ts`

```typescript
/**
 * HPP Calculation Configuration
 * 
 * Centralized configuration for HPP calculations
 * to avoid magic numbers and make assumptions explicit
 */

export const HPP_CONFIG = {
  // Labor Cost Defaults
  DEFAULT_LABOR_COST_PER_SERVING: 5000, // IDR
  LABOR_COST_LOOKBACK_BATCHES: 10,
  
  // Overhead Cost Defaults
  DEFAULT_OVERHEAD_PER_SERVING: 2000, // IDR
  FALLBACK_RECIPE_COUNT: 10,
  
  // WAC Calculation
  WAC_LOOKBACK_TRANSACTIONS: 50,
  WAC_LOOKBACK_DAYS: 90,
  
  // Alert Thresholds
  PRICE_INCREASE_THRESHOLD: 0.10, // 10%
  MARGIN_LOW_THRESHOLD: 0.20, // 20%
  COST_SPIKE_THRESHOLD: 0.15, // 15%
  
  // Snapshot Settings
  SNAPSHOT_RETENTION_DAYS: 90,
  SNAPSHOT_ARCHIVE_BATCH_SIZE: 1000,
} as const

export type HppConfig = typeof HPP_CONFIG
```

**Update HPP Services:**
- [ ] Replace all magic numbers with config values
- [ ] Add comments explaining each configuration
- [ ] Document assumptions in README

---

## 🟢 MEDIUM PRIORITY - Fix Within Month

### 7. Add Type Guards for Supabase Queries

**Create:** `src/lib/type-guards/supabase.ts`

```typescript
import type { Database } from '@/types/supabase-generated'

type RecipeWithIngredients = Database['public']['Tables']['recipes']['Row'] & {
  recipe_ingredients?: Array<{
    quantity: number
    unit: string
    ingredient?: Database['public']['Tables']['ingredients']['Row']
  }>
}

export function isRecipeWithIngredients(
  data: unknown
): data is RecipeWithIngredients {
  if (!data || typeof data !== 'object') return false
  
  const recipe = data as RecipeWithIngredients
  
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    (!recipe.recipe_ingredients || Array.isArray(recipe.recipe_ingredients))
  )
}

// Add more type guards as needed
```

**Usage:**
```typescript
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*)')
  .single()

if (!isRecipeWithIngredients(data)) {
  throw new Error('Invalid recipe data structure')
}

// Now data is properly typed
```

---

### 8. Implement Transaction Management

**Create:** `src/lib/database/transactions.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'
import { dbLogger } from '@/lib/logger'

export class DatabaseTransaction {
  private operations: Array<() => Promise<void>> = []
  private rollbacks: Array<() => Promise<void>> = []
  
  add(
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ) {
    this.operations.push(operation)
    this.rollbacks.push(rollback)
  }
  
  async execute(): Promise<{ success: boolean; error?: Error }> {
    try {
      // Execute all operations
      for (const op of this.operations) {
        await op()
      }
      return { success: true }
    } catch (error) {
      // Rollback in reverse order
      dbLogger.error({ error }, 'Transaction failed, rolling back')
      
      for (let i = this.rollbacks.length - 1; i >= 0; i--) {
        try {
          await this.rollbacks[i]()
        } catch (rollbackError) {
          dbLogger.error(
            { error: rollbackError, index: i },
            'Rollback operation failed'
          )
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }
}
```

**Usage in Order Creation:**
```typescript
const transaction = new DatabaseTransaction()

// Add order creation
transaction.add(
  async () => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
    if (error) throw error
    orderId = data.id
  },
  async () => {
    await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
  }
)

// Add income record
transaction.add(
  async () => {
    const { data, error } = await supabase
      .from('financial_records')
      .insert(incomeData)
    if (error) throw error
    incomeId = data.id
  },
  async () => {
    await supabase
      .from('financial_records')
      .delete()
      .eq('id', incomeId)
  }
)

// Execute transaction
const result = await transaction.execute()
if (!result.success) {
  return NextResponse.json(
    { error: 'Failed to create order' },
    { status: 500 }
  )
}
```

---

### 9. Improve Cache Strategy

**Create:** `src/lib/cache/strategy.ts`

```typescript
export const CACHE_CONFIG = {
  // Cache versions for invalidation
  versions: {
    recipes: 'v1',
    ingredients: 'v1',
    orders: 'v1',
    hpp: 'v1',
  },
  
  // TTL in seconds
  ttl: {
    recipes: 600, // 10 minutes
    ingredients: 300, // 5 minutes
    orders: 60, // 1 minute
    hpp: 1800, // 30 minutes
  },
  
  // Cache key patterns
  keys: {
    recipes: {
      all: (userId: string, version: string) =>
        `recipes:${version}:${userId}:all`,
      detail: (userId: string, recipeId: string, version: string) =>
        `recipes:${version}:${userId}:${recipeId}`,
    },
    // Add more patterns
  },
} as const

// Cache invalidation hooks
export const cacheInvalidation = {
  recipes: () => {
    // Increment version to invalidate all recipe caches
    CACHE_CONFIG.versions.recipes = `v${Date.now()}`
  },
  // Add more invalidation methods
}
```

---

## 📋 TESTING CHECKLIST

### Unit Tests to Add

- [ ] HPP calculation with various scenarios
- [ ] Order creation with inventory updates
- [ ] Transaction rollback scenarios
- [ ] Type guard validations
- [ ] Cache invalidation logic

### Integration Tests to Add

- [ ] Complete order flow (create → update → deliver)
- [ ] HPP calculation triggered by ingredient price change
- [ ] Inventory alerts triggered by stock changes
- [ ] Multi-user isolation (RLS)

### E2E Tests to Add

- [ ] User creates order → inventory updated → financial record created
- [ ] User updates ingredient price → HPP recalculated → alerts generated
- [ ] User views dashboard → all data loads correctly

---

## 🎯 SUCCESS CRITERIA

### Critical Fixes Complete When:
- [ ] All HPP services use proper Supabase client
- [ ] All stock transactions have valid user_id
- [ ] Supabase types regenerated and used
- [ ] No TypeScript errors in build
- [ ] All tests pass

### High Priority Complete When:
- [ ] Error handling standardized across codebase
- [ ] Validation schemas consolidated
- [ ] HPP configuration file in use
- [ ] ESLint passes without warnings

### Medium Priority Complete When:
- [ ] Type guards implemented for critical paths
- [ ] Transaction management in place
- [ ] Cache strategy documented and implemented
- [ ] Integration tests added

---

## 📊 PROGRESS TRACKING

| Category | Total | Completed | Progress |
|----------|-------|-----------|----------|
| Critical | 3 | 0 | 0% |
| High Priority | 3 | 0 | 0% |
| Medium Priority | 3 | 0 | 0% |
| **Overall** | **9** | **0** | **0%** |

---

**Last Updated:** October 28, 2025  
**Next Review:** After Critical Fixes Complete
