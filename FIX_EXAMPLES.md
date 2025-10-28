# Fix Examples - Code Snippets

Contoh konkret untuk memperbaiki setiap issue yang ditemukan.

---

## 🔴 CRITICAL FIX #1: HPP Services Supabase Client

### Current Code (BROKEN)

```typescript
// src/modules/hpp/services/HppCalculatorService.ts
import { dbLogger } from '@/lib/logger'
import supabase from '@/utils/supabase'  // ❌ TIDAK ADA EXPORT INI
import type { Database } from '@/types/supabase-generated'

export class HppCalculatorService {
  private logger = dbLogger

  async calculateRecipeHpp(recipeId: string): Promise<HppCalculationResult> {
    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase  // ❌ UNDEFINED
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single()
    // ...
  }
}
```

### Fixed Code

```typescript
// src/modules/hpp/services/HppCalculatorService.ts
import { dbLogger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'

export class HppCalculatorService {
  private logger = dbLogger

  // ✅ Accept supabase client as parameter
  async calculateRecipeHpp(
    supabase: SupabaseClient<Database>,
    recipeId: string
  ): Promise<HppCalculationResult> {
    try {
      this.logger.info(`Calculating HPP for recipe ${recipeId}`)

      // Get recipe details
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }

      // ... rest of the code
    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to calculate HPP for recipe ${recipeId}`)
      throw err
    }
  }

  // ✅ Update all other methods similarly
  async getLatestHpp(
    supabase: SupabaseClient<Database>,
    recipeId: string
  ): Promise<HppCalculation | null> {
    // ...
  }

  // ✅ Private methods also need supabase
  private async calculateLaborCost(
    supabase: SupabaseClient<Database>,
    recipeId: string
  ): Promise<number> {
    // ...
  }
}
```

### Update API Route Caller

```typescript
// src/app/api/hpp/calculate/route.ts
import { createClient } from '@/utils/supabase/server'
import { HppCalculatorService } from '@/modules/hpp/services/HppCalculatorService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()  // ✅ Create client
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipe_id } = await request.json()

    const hppService = new HppCalculatorService()
    const result = await hppService.calculateRecipeHpp(
      supabase,  // ✅ Pass supabase client
      recipe_id
    )

    return NextResponse.json(result)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error calculating HPP')
    return NextResponse.json(
      { error: 'Failed to calculate HPP' },
      { status: 500 }
    )
  }
}
```

---

## 🔴 CRITICAL FIX #2: user_id in InventoryUpdateService

### Current Code (BROKEN)

```typescript
// src/modules/orders/services/InventoryUpdateService.ts
export class InventoryUpdateService {
  static async updateInventoryForOrder(
    order_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      for (const item of items) {
        // ... get recipe ingredients ...
        
        for (const ri of typedRecipe.recipe_ingredients || []) {
          const ingredient = ri.ingredient?.[0]
          if (ingredient) {
            // ... update stock ...
            
            // ❌ CRITICAL: user_id is empty string
            const stockTransaction: TablesInsert<'stock_transactions'> = {
              ingredient_id: ingredient.id,
              type: 'USAGE',
              quantity: -usedQuantity,
              reference: order_id,
              notes: `Used for order production`,
              user_id: ''  // ❌ RLS WILL FAIL
            }

            await supabase
              .from('stock_transactions')
              .insert(stockTransaction)
          }
        }
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error updating inventory for order')
      throw new Error('Failed to update inventory')
    }
  }
}
```

### Fixed Code

```typescript
// src/modules/orders/services/InventoryUpdateService.ts
export class InventoryUpdateService {
  // ✅ Add user_id parameter
  static async updateInventoryForOrder(
    order_id: string,
    user_id: string,  // ✅ NEW PARAMETER
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      for (const item of items) {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            recipe_ingredients (
              quantity,
              ingredient:ingredients (
                id,
                current_stock
              )
            )
          `)
          .eq('id', item.recipe_id)
          .eq('user_id', user_id)  // ✅ Filter by user_id
          .single()

        if (error || !recipe) {continue}

        const typedRecipe = recipe as unknown as RecipeIngredientsQueryResult

        for (const ri of typedRecipe.recipe_ingredients || []) {
          const ingredient = ri.ingredient?.[0]
          if (ingredient) {
            const usedQuantity = ri.quantity * item.quantity
            const currentStock = ingredient.current_stock ?? 0
            const newStock = Math.max(0, currentStock - usedQuantity)

            // Update ingredient stock
            const ingredientUpdate: TablesUpdate<'ingredients'> = {
              current_stock: newStock,
              updated_at: new Date().toISOString()
            }

            const { error: updateError } = await supabase
              .from('ingredients')
              .update(ingredientUpdate)
              .eq('id', ingredient.id)
              .eq('user_id', user_id)  // ✅ Filter by user_id

            if (updateError) {
              dbLogger.error({ error: updateError }, 'Error updating ingredient stock')
              continue
            }

            // ✅ Create stock transaction with proper user_id
            const stockTransaction: TablesInsert<'stock_transactions'> = {
              ingredient_id: ingredient.id,
              type: 'USAGE',
              quantity: -usedQuantity,
              reference: order_id,
              notes: `Used for order production`,
              user_id: user_id  // ✅ USE PARAMETER
            }

            const { error: transactionError } = await supabase
              .from('stock_transactions')
              .insert(stockTransaction)

            if (transactionError) {
              dbLogger.error({ error: transactionError }, 'Error creating stock transaction')
            }

            // Check and create inventory alert if needed
            const alertService = new InventoryAlertService()
            alertService.checkIngredientAlert(ingredient.id, user_id)
              .catch(err => {
                dbLogger.error({ error: err }, 'Failed to check inventory alert')
              })
          }
        }
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error updating inventory for order')
      throw new Error('Failed to update inventory')
    }
  }
}
```

### Update Caller in Orders API

```typescript
// src/app/api/orders/route.ts
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ... create order ...

    // Update inventory if order is in production or delivered
    if (orderStatus === 'IN_PROGRESS' || orderStatus === 'DELIVERED') {
      try {
        await InventoryUpdateService.updateInventoryForOrder(
          orderData.id,
          user.id,  // ✅ PASS user.id
          validatedData.items.map(item => ({
            recipe_id: (item as any).recipe_id,
            quantity: item.quantity
          }))
        )
        apiLogger.info({ orderId: orderData.id }, 'Inventory updated for order')
      } catch (inventoryError) {
        apiLogger.error({ error: inventoryError }, 'Failed to update inventory')
        // ⚠️ Consider if this should rollback the order
      }
    }

    return NextResponse.json({
      ...orderData,
      income_recorded: !!incomeRecordId,
      inventory_updated: orderStatus === 'IN_PROGRESS' || orderStatus === 'DELIVERED'
    }, { status: 201 })
  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error in POST /api/orders')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🟡 HIGH PRIORITY FIX: Standardize Error Handling

### Create Error Handling Utility

```typescript
// src/lib/errors/api-error-handler.ts
import { NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { PostgrestError } from '@supabase/supabase-js'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown): NextResponse {
  // Log the error
  apiLogger.error({ error }, 'API Error occurred')

  // Handle different error types
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  if (isPostgrestError(error)) {
    return NextResponse.json(
      {
        error: 'Database error',
        details: error.message,
        code: error.code
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message
      },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'An unexpected error occurred'
    },
    { status: 500 }
  )
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}
```

### Standardized API Route Pattern

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // 1. Create client
    const supabase = await createClient()

    // 2. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 3. Validate input
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      throw new APIError('Missing required parameter: id', 400, 'MISSING_PARAM')
    }

    // 4. Business logic
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new APIError('Resource not found', 404, 'NOT_FOUND')
    }

    // 5. Return success
    return NextResponse.json(data)

  } catch (error: unknown) {  // ✅ ALWAYS USE 'error'
    return handleAPIError(error)  // ✅ CENTRALIZED ERROR HANDLING
  }
}
```

---

## 🟡 HIGH PRIORITY FIX: Consolidate Validation Schemas

### Domain Schema (Source of Truth)

```typescript
// src/lib/validations/domains/order.ts
import { z } from 'zod'
import { UUIDSchema, PositiveNumberSchema, NonNegativeNumberSchema, DateStringSchema } from '../base-validations'

// Base order item schema
export const OrderItemBaseSchema = z.object({
  recipe_id: UUIDSchema,
  product_name: z.string().max(255).optional().nullable(),
  quantity: PositiveNumberSchema,
  unit_price: NonNegativeNumberSchema,
  total_price: NonNegativeNumberSchema,
  special_requests: z.string().max(500).optional().nullable(),
})

// Base order schema
export const OrderBaseSchema = z.object({
  order_no: z.string().min(1, 'Order number is required').max(50),
  customer_id: UUIDSchema.optional().nullable(),
  customer_name: z.string().min(1, 'Customer name is required').max(255),
  customer_phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  order_date: DateStringSchema.optional().nullable(),
  delivery_date: DateStringSchema.optional().nullable(),
  delivery_time: z.string().max(50).optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  payment_status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']).default('UNPAID'),
  payment_method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'CREDIT_CARD']).optional().nullable(),
  subtotal: NonNegativeNumberSchema,
  tax_amount: NonNegativeNumberSchema.default(0),
  discount_amount: NonNegativeNumberSchema.default(0),
  delivery_fee: NonNegativeNumberSchema.default(0),
  total_amount: NonNegativeNumberSchema,
  notes: z.string().max(1000).optional().nullable(),
  special_instructions: z.string().max(1000).optional().nullable(),
})

// Insert schema (for database)
export const OrderInsertSchema = OrderBaseSchema.extend({
  items: z.array(OrderItemBaseSchema).min(1, 'Order must have at least one item'),
})

// Update schema (all fields optional except id)
export const OrderUpdateSchema = OrderBaseSchema.partial()

// Form schema (for UI)
export const OrderFormSchema = OrderBaseSchema.extend({
  items: z.array(OrderItemBaseSchema).min(1, 'Order must have at least one item'),
}).refine(
  (data) => {
    // Custom validation: total_amount should match sum of items
    const itemsTotal = data.items.reduce((sum, item) => sum + item.total_price, 0)
    const calculatedTotal = itemsTotal + data.tax_amount + data.delivery_fee - data.discount_amount
    return Math.abs(calculatedTotal - data.total_amount) < 0.01 // Allow for rounding
  },
  {
    message: 'Total amount does not match items total',
    path: ['total_amount']
  }
)

export type OrderItemBase = z.infer<typeof OrderItemBaseSchema>
export type OrderBase = z.infer<typeof OrderBaseSchema>
export type OrderInsert = z.infer<typeof OrderInsertSchema>
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>
export type OrderForm = z.infer<typeof OrderFormSchema>
```

### API Schema (Extends Domain)

```typescript
// src/lib/validations/api/order.ts
import { z } from 'zod'
import { OrderInsertSchema, OrderUpdateSchema } from '../domains/order'

// API-specific extensions
export const CreateOrderAPISchema = OrderInsertSchema.extend({
  // Add API-specific fields if needed
  client_timestamp: z.string().datetime().optional(),
  request_id: z.string().uuid().optional(),
})

export const UpdateOrderAPISchema = OrderUpdateSchema.extend({
  // Add API-specific fields if needed
  reason: z.string().max(500).optional(),
})

// Query parameters schema
export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
  search: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export type CreateOrderAPI = z.infer<typeof CreateOrderAPISchema>
export type UpdateOrderAPI = z.infer<typeof UpdateOrderAPISchema>
export type OrderQuery = z.infer<typeof OrderQuerySchema>
```

### Usage in API Route

```typescript
// src/app/api/orders/route.ts
import { CreateOrderAPISchema, OrderQuerySchema } from '@/lib/validations/api/order'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // ✅ Validate query parameters
    const queryValidation = OrderQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryValidation.error.issues
        },
        { status: 400 }
      )
    }

    const query = queryValidation.data
    // ... use validated query
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ✅ Validate request body
    const validation = CreateOrderAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    // ... use validated data
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

---

## 🟢 MEDIUM PRIORITY: Transaction Management

### Transaction Wrapper Implementation

```typescript
// src/lib/database/transaction-manager.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'
import { dbLogger } from '@/lib/logger'

interface TransactionOperation {
  name: string
  execute: () => Promise<unknown>
  rollback: () => Promise<void>
}

export class TransactionManager {
  private operations: TransactionOperation[] = []
  private executedOperations: string[] = []

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Add an operation to the transaction
   */
  add(operation: TransactionOperation): void {
    this.operations.push(operation)
  }

  /**
   * Execute all operations in sequence
   * If any fails, rollback all executed operations
   */
  async execute(): Promise<{
    success: boolean
    error?: Error
    failedOperation?: string
  }> {
    try {
      dbLogger.info(
        { operationCount: this.operations.length },
        'Starting transaction'
      )

      // Execute operations in order
      for (const operation of this.operations) {
        try {
          dbLogger.debug({ operation: operation.name }, 'Executing operation')
          await operation.execute()
          this.executedOperations.push(operation.name)
        } catch (error) {
          dbLogger.error(
            { error, operation: operation.name },
            'Operation failed'
          )
          throw error
        }
      }

      dbLogger.info('Transaction completed successfully')
      return { success: true }

    } catch (error) {
      dbLogger.error({ error }, 'Transaction failed, initiating rollback')

      // Rollback in reverse order
      const rollbackErrors: Array<{ operation: string; error: unknown }> = []

      for (let i = this.executedOperations.length - 1; i >= 0; i--) {
        const operationName = this.executedOperations[i]
        const operation = this.operations.find(op => op.name === operationName)

        if (operation) {
          try {
            dbLogger.debug(
              { operation: operationName },
              'Rolling back operation'
            )
            await operation.rollback()
          } catch (rollbackError) {
            dbLogger.error(
              { error: rollbackError, operation: operationName },
              'Rollback failed'
            )
            rollbackErrors.push({
              operation: operationName,
              error: rollbackError
            })
          }
        }
      }

      if (rollbackErrors.length > 0) {
        dbLogger.error(
          { rollbackErrors },
          'Some rollback operations failed'
        )
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        failedOperation: this.executedOperations[this.executedOperations.length - 1]
      }
    }
  }
}
```

### Usage Example: Order Creation with Transaction

```typescript
// src/app/api/orders/route.ts
import { TransactionManager } from '@/lib/database/transaction-manager'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new APIError('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = CreateOrderAPISchema.safeParse(body)
    
    if (!validation.success) {
      throw new APIError('Invalid request data', 400)
    }

    const validatedData = validation.data

    // ✅ Create transaction manager
    const transaction = new TransactionManager(supabase)

    // Variables to store created IDs
    let orderId: string
    let incomeRecordId: string | null = null
    let orderItemIds: string[] = []

    // ✅ Operation 1: Create income record (if delivered)
    if (validatedData.status === 'DELIVERED') {
      transaction.add({
        name: 'create_income_record',
        execute: async () => {
          const { data, error } = await supabase
            .from('financial_records')
            .insert({
              user_id: user.id,
              type: 'INCOME',
              category: 'Revenue',
              amount: validatedData.total_amount,
              date: validatedData.delivery_date || new Date().toISOString().split('T')[0],
              reference: `Order #${validatedData.order_no}`,
              description: `Income from order ${validatedData.order_no}`
            })
            .select()
            .single()

          if (error) throw error
          incomeRecordId = data.id
        },
        rollback: async () => {
          if (incomeRecordId) {
            await supabase
              .from('financial_records')
              .delete()
              .eq('id', incomeRecordId)
              .eq('user_id', user.id)
          }
        }
      })
    }

    // ✅ Operation 2: Create order
    transaction.add({
      name: 'create_order',
      execute: async () => {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_no: validatedData.order_no,
            customer_name: validatedData.customer_name,
            // ... other fields
            financial_record_id: incomeRecordId,
            status: validatedData.status || 'PENDING',
            total_amount: validatedData.total_amount,
          })
          .select()
          .single()

        if (error) throw error
        orderId = data.id
      },
      rollback: async () => {
        if (orderId) {
          await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)
            .eq('user_id', user.id)
        }
      }
    })

    // ✅ Operation 3: Create order items
    transaction.add({
      name: 'create_order_items',
      execute: async () => {
        const orderItems = validatedData.items.map(item => ({
          order_id: orderId,
          recipe_id: item.recipe_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_requests: item.special_requests,
          user_id: user.id
        }))

        const { data, error } = await supabase
          .from('order_items')
          .insert(orderItems)
          .select()

        if (error) throw error
        orderItemIds = data.map(item => item.id)
      },
      rollback: async () => {
        if (orderItemIds.length > 0) {
          await supabase
            .from('order_items')
            .delete()
            .in('id', orderItemIds)
        }
      }
    })

    // ✅ Operation 4: Update inventory (if needed)
    if (validatedData.status === 'IN_PROGRESS' || validatedData.status === 'DELIVERED') {
      transaction.add({
        name: 'update_inventory',
        execute: async () => {
          await InventoryUpdateService.updateInventoryForOrder(
            orderId,
            user.id,
            validatedData.items.map(item => ({
              recipe_id: item.recipe_id,
              quantity: item.quantity
            }))
          )
        },
        rollback: async () => {
          // Note: Inventory rollback is complex
          // May need to reverse stock transactions
          dbLogger.warn('Inventory rollback not fully implemented')
        }
      })
    }

    // ✅ Execute transaction
    const result = await transaction.execute()

    if (!result.success) {
      throw new APIError(
        `Failed to create order: ${result.failedOperation}`,
        500
      )
    }

    // Fetch complete order data
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single()

    return NextResponse.json(completeOrder, { status: 201 })

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

---

## 📝 SUMMARY

Semua fix examples di atas sudah siap diimplementasikan. Key points:

1. **HPP Services**: Pass supabase client as parameter
2. **user_id**: Always pass from authenticated context
3. **Error Handling**: Use centralized handler with consistent naming
4. **Validation**: Single source of truth in domain schemas
5. **Transactions**: Use TransactionManager for complex operations

Setiap fix sudah include:
- ✅ Before/After code comparison
- ✅ Complete implementation
- ✅ Usage examples
- ✅ Error handling
- ✅ Type safety

---

**Next Step:** Pilih critical fix mana yang mau diimplementasikan dulu, dan saya bisa bantu apply changes ke codebase.
