---
inclusion: always
---

# Code Quality Standards

## Critical Rules - MUST FOLLOW

### 1. Supabase Client Usage

**ALWAYS use proper Supabase client imports:**

```typescript
// ✅ CORRECT - For API Routes (Server-side)
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  // ... use supabase
}

// ✅ CORRECT - For Client Components
import { createClient } from '@/utils/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // ... use supabase
}

// ✅ CORRECT - For Service Role (Admin operations - SERVER-ONLY)
import 'server-only' // REQUIRED for service role usage
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export async function adminOperation() {
  const supabase = createServiceRoleClient()
  // ... use supabase
}

// ❌ WRONG - This import does not exist
import supabase from '@/utils/supabase'  // NEVER USE THIS
```

**For Services that need Supabase:**
- ALWAYS pass supabase client as parameter
- NEVER import a default supabase instance

```typescript
// ✅ CORRECT
export class MyService {
  async doSomething(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<Result> {
    const { data } = await supabase.from('table').select()
    // ...
  }
}

// ❌ WRONG
import supabase from '@/utils/supabase'
export class MyService {
  async doSomething(userId: string): Promise<Result> {
    const { data } = await supabase.from('table').select()
    // ...
  }
}
```

### 2. User Context - CRITICAL for RLS

**ALWAYS pass user_id from authenticated context:**

```typescript
// ✅ CORRECT - Pass user_id to services
const result = await MyService.doSomething(
  supabase,
  user.id,  // Always pass authenticated user ID
  otherParams
)

// ✅ CORRECT - Use user_id in database operations
const { data } = await supabase
  .from('table')
  .insert({
    ...data,
    user_id: user.id  // Always set user_id
  })

// ❌ WRONG - Empty or hardcoded user_id
const { data } = await supabase
  .from('table')
  .insert({
    ...data,
    user_id: ''  // NEVER DO THIS - RLS will fail
  })
```

**Service Method Signatures:**
```typescript
// ✅ CORRECT - Include user_id parameter
static async updateInventory(
  orderId: string,
  userId: string,  // Required for RLS
  items: Item[]
): Promise<void>

// ❌ WRONG - Missing user_id
static async updateInventory(
  orderId: string,
  items: Item[]
): Promise<void>
```

### 3. Error Handling - Standardized Pattern

**ALWAYS use consistent error handling:**

```typescript
// ✅ CORRECT - Standard pattern
try {
  // ... code
} catch (error: unknown) {  // Always use 'error' as variable name
  apiLogger.error({ error }, 'Descriptive error message')
  return handleAPIError(error)
}

// ❌ WRONG - Inconsistent naming
try {
  // ... code
} catch (err: unknown) {  // Don't use 'err'
  apiLogger.error({ err }, 'Error')
}

// ❌ WRONG - Inconsistent naming
try {
  // ... code
} catch (e: unknown) {  // Don't use 'e'
  apiLogger.error({ error: e }, 'Error')
}
```

**API Route Error Handling:**
```typescript
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 2. Validate
    const body = await request.json()
    const validation = Schema.safeParse(body)
    
    if (!validation.success) {
      throw new APIError('Invalid request data', 400, 'VALIDATION_ERROR')
    }

    // 3. Business logic
    const result = await doSomething()

    // 4. Return success
    return NextResponse.json(result)

  } catch (error: unknown) {
    return handleAPIError(error)  // Centralized error handling
  }
}
```

### 4. Type Safety - Use Generated Types

**ALWAYS use Supabase generated types:**

```typescript
// ✅ CORRECT - Use generated types
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

// ❌ WRONG - Temporary interfaces
interface Recipe {
  id: string
  name: string
  // ... manual typing
}
```

**Type Guards for Runtime Validation:**
```typescript
// ✅ CORRECT - Add type guards for Supabase query results
function isRecipeWithIngredients(data: unknown): data is RecipeWithIngredients {
  if (!data || typeof data !== 'object') return false
  const recipe = data as RecipeWithIngredients
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    (!recipe.recipe_ingredients || Array.isArray(recipe.recipe_ingredients))
  )
}

// Usage
const { data } = await supabase.from('recipes').select('*, recipe_ingredients(*)').single()
if (!isRecipeWithIngredients(data)) {
  throw new Error('Invalid data structure')
}
// Now data is properly typed
```

### 5. Validation - Single Source of Truth

**ALWAYS use domain schemas as base:**

```typescript
// ✅ CORRECT - Domain schema is source of truth
// File: src/lib/validations/domains/order.ts
export const OrderInsertSchema = z.object({
  order_no: z.string().min(1).max(50),
  customer_name: z.string().min(1).max(255),
  // ... all fields
})

// API schema extends domain schema
// File: src/lib/validations/api/order.ts
export const CreateOrderAPISchema = OrderInsertSchema.extend({
  // API-specific fields only
  client_timestamp: z.string().datetime().optional(),
})

// ❌ WRONG - Duplicate schemas with different rules
// File: src/lib/validations/api-schemas.ts
export const CreateOrderSchema = z.object({
  order_no: z.string().min(1).max(50),
  customer_name: z.string().optional(),  // Different from domain!
  // ...
})
```

### 6. Configuration - No Magic Numbers

**ALWAYS use configuration constants:**

```typescript
// ✅ CORRECT - Use configuration
import { HPP_CONFIG } from '@/lib/constants/hpp-config'

if (!productions || productions.length === 0) {
  return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
}

// ❌ WRONG - Magic numbers
if (!productions || productions.length === 0) {
  return 5000  // What is this number? Why 5000?
}
```

**Create configuration files:**
```typescript
// src/lib/constants/hpp-config.ts
export const HPP_CONFIG = {
  DEFAULT_LABOR_COST_PER_SERVING: 5000, // IDR
  DEFAULT_OVERHEAD_PER_SERVING: 2000, // IDR
  FALLBACK_RECIPE_COUNT: 10,
  WAC_LOOKBACK_TRANSACTIONS: 50,
  PRICE_INCREASE_THRESHOLD: 0.10, // 10%
  MARGIN_LOW_THRESHOLD: 0.20, // 20%
  COST_SPIKE_THRESHOLD: 0.15, // 15%
} as const
```

## Best Practices

### Logging

```typescript
// ✅ CORRECT - Structured logging
import { apiLogger, dbLogger } from '@/lib/logger'

apiLogger.info({ userId, orderId }, 'Order created successfully')
apiLogger.error({ error, context: { userId, orderId } }, 'Failed to create order')

// ❌ WRONG - Console logging
console.log('Order created')
console.error('Error:', error)
```

### Database Queries

```typescript
// ✅ CORRECT - Always filter by user_id for RLS
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('user_id', user.id)  // RLS enforcement
  .eq('id', recipeId)

// ✅ CORRECT - Use select with specific fields
const { data } = await supabase
  .from('recipes')
  .select('id, name, selling_price')  // Only what you need

// ❌ WRONG - Missing user_id filter
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('id', recipeId)  // Missing user_id check
```

### Transaction Management

```typescript
// ✅ CORRECT - Use transaction manager for complex operations
import { TransactionManager } from '@/lib/database/transaction-manager'

const transaction = new TransactionManager(supabase)

transaction.add({
  name: 'create_order',
  execute: async () => {
    const { data, error } = await supabase.from('orders').insert(orderData)
    if (error) throw error
    orderId = data.id
  },
  rollback: async () => {
    await supabase.from('orders').delete().eq('id', orderId)
  }
})

const result = await transaction.execute()
if (!result.success) {
  throw new Error('Transaction failed')
}
```

### Cache Invalidation

```typescript
// ✅ CORRECT - Invalidate cache after mutations
import { cacheInvalidation } from '@/lib/cache'

// After creating/updating/deleting
await supabase.from('recipes').insert(data)
cacheInvalidation.recipes()  // Invalidate cache

// ❌ WRONG - Forget to invalidate cache
await supabase.from('recipes').insert(data)
// Cache still has old data
```

## Common Pitfalls to Avoid

### 1. Supabase Query Result Structure

```typescript
// ⚠️ IMPORTANT - Supabase joins return arrays
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// The structure is:
// data.recipe_ingredients[0].ingredient[0]  // Array of arrays!

// ✅ Handle properly
const ingredient = ri.ingredient?.[0]  // Get first element
if (ingredient) {
  // Use ingredient
}
```

### 2. Async Operations in Loops

```typescript
// ✅ CORRECT - Use Promise.all for parallel operations
const results = await Promise.all(
  items.map(item => processItem(item))
)

// ❌ WRONG - Sequential processing (slow)
for (const item of items) {
  await processItem(item)
}
```

### 3. Error Recovery

```typescript
// ✅ CORRECT - Handle partial failures gracefully
for (const item of items) {
  try {
    await processItem(item)
    successCount++
  } catch (error) {
    logger.error({ error, item }, 'Failed to process item')
    failedCount++
    // Continue processing other items
  }
}

return { success: successCount, failed: failedCount }

// ❌ WRONG - One failure stops everything
for (const item of items) {
  await processItem(item)  // If this fails, loop stops
}
```

## Quick Reference Checklist

Before committing code, verify:

- [ ] Using correct Supabase client import
- [ ] Passing user_id to all services
- [ ] Using 'error' as catch parameter name
- [ ] Using generated types from supabase-generated.ts
- [ ] Using domain schemas for validation
- [ ] No magic numbers (use config constants)
- [ ] Structured logging (no console.log)
- [ ] RLS filters (user_id) in all queries
- [ ] Cache invalidation after mutations
- [ ] Proper error handling with APIError
- [ ] Type guards for runtime validation
- [ ] Transaction management for complex operations

## References

- Deep Scan Analysis: `DEEP_SCAN_ANALYSIS.md`
- Fix Examples: `FIX_EXAMPLES.md`
- Critical Fixes: `CRITICAL_FIXES_CHECKLIST.md`
