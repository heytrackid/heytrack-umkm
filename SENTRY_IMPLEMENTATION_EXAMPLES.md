# Sentry Implementation Examples for HeyTrack

## Real-World Examples from HeyTrack Codebase

### 1. Error Handling in API Routes

#### Before (without Sentry)
```typescript
// src/app/api/orders/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const order = await createOrder(body)
    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
```

#### After (with Sentry)
```typescript
// src/app/api/orders/route.ts
import * as Sentry from "@sentry/nextjs"

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/orders",
    },
    async (span) => {
      try {
        const body = await request.json()
        
        // Add context to span
        span.setAttribute("order_type", body.order_type)
        span.setAttribute("customer_id", body.customer_id)
        span.setAttribute("items_count", body.items?.length || 0)
        
        const order = await createOrder(body)
        
        span.setAttribute("order_id", order.id)
        span.setAttribute("total_amount", order.total_amount)
        
        return NextResponse.json({ data: order })
      } catch (error) {
        // Capture exception with context
        Sentry.captureException(error, {
          tags: {
            endpoint: "/api/orders",
            method: "POST",
          },
          extra: {
            requestBody: body,
          },
        })
        
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        )
      }
    }
  )
}
```

### 2. Component Error Handling

#### Before (without Sentry)
```typescript
// src/components/orders/OrderForm.tsx
export function OrderForm() {
  const { handleError } = useErrorHandler()

  const handleSubmit = async (data: OrderFormData) => {
    try {
      await createOrder(data)
      toast.success('Order created successfully')
    } catch (error) {
      handleError(error, 'OrderForm.handleSubmit')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### After (with Sentry)
```typescript
// src/components/orders/OrderForm.tsx
import * as Sentry from "@sentry/nextjs"

export function OrderForm() {
  const { handleError } = useErrorHandler()

  const handleSubmit = async (data: OrderFormData) => {
    return Sentry.startSpan(
      {
        op: "ui.action",
        name: "OrderForm.submit",
      },
      async (span) => {
        try {
          span.setAttribute("customer_id", data.customer_id)
          span.setAttribute("items_count", data.items.length)
          span.setAttribute("total_amount", data.total_amount)
          
          await createOrder(data)
          
          toast.success("Order created successfully")
        } catch (error) {
          // Capture in Sentry with context
          Sentry.captureException(error, {
            tags: {
              component: "OrderForm",
              action: "submit",
            },
            extra: {
              formData: data,
            },
          })
          
          // Also handle with existing error handler for UI feedback
          handleError(error, "OrderForm.handleSubmit")
        }
      }
    )
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 3. HPP Calculation with Performance Tracking

```typescript
// src/services/hpp/HppCalculatorService.ts
import * as Sentry from "@sentry/nextjs"

export class HppCalculatorService {
  async calculateHpp(recipeId: string): Promise<HppCalculation> {
    return Sentry.startSpan(
      {
        op: "calculation",
        name: "HPP Calculation",
      },
      async (span) => {
        const { logger } = Sentry
        
        try {
          span.setAttribute("recipe_id", recipeId)
          
          logger.info("Starting HPP calculation", { recipeId })
          
          // Fetch recipe with ingredients
          const recipe = await Sentry.startSpan(
            { op: "db.query", name: "Fetch Recipe" },
            () => this.fetchRecipeWithIngredients(recipeId)
          )
          
          span.setAttribute("ingredients_count", recipe.ingredients.length)
          
          // Calculate material cost
          const materialCost = await Sentry.startSpan(
            { op: "calculation", name: "Calculate Material Cost" },
            () => this.calculateMaterialCost(recipe.ingredients)
          )
          
          // Calculate operational cost
          const operationalCost = await Sentry.startSpan(
            { op: "calculation", name: "Calculate Operational Cost" },
            () => this.calculateOperationalCost(recipe)
          )
          
          const totalHpp = materialCost + operationalCost
          
          span.setAttribute("material_cost", materialCost)
          span.setAttribute("operational_cost", operationalCost)
          span.setAttribute("total_hpp", totalHpp)
          
          logger.info("HPP calculation completed", {
            recipeId,
            materialCost,
            operationalCost,
            totalHpp,
          })
          
          return {
            recipeId,
            materialCost,
            operationalCost,
            totalHpp,
          }
        } catch (error) {
          logger.error("HPP calculation failed", {
            recipeId,
            error: error.message,
          })
          
          Sentry.captureException(error, {
            tags: {
              service: "HppCalculatorService",
              operation: "calculateHpp",
            },
            extra: {
              recipeId,
            },
          })
          
          throw error
        }
      }
    )
  }
}
```

### 4. Inventory Management with Logging

```typescript
// src/lib/business-services/inventory.ts
import * as Sentry from "@sentry/nextjs"

const { logger } = Sentry

export async function updateIngredientStock(
  ingredientId: string,
  quantity: number,
  reason: string
) {
  return Sentry.startSpan(
    {
      op: "inventory.update",
      name: "Update Ingredient Stock",
    },
    async (span) => {
      try {
        span.setAttribute("ingredient_id", ingredientId)
        span.setAttribute("quantity", quantity)
        span.setAttribute("reason", reason)
        
        logger.info("Updating ingredient stock", {
          ingredientId,
          quantity,
          reason,
        })
        
        const ingredient = await getIngredient(ingredientId)
        const previousStock = ingredient.current_stock
        const newStock = previousStock + quantity
        
        // Check for low stock
        if (newStock < ingredient.min_stock) {
          logger.warn("Low stock detected after update", {
            ingredientId,
            ingredientName: ingredient.name,
            currentStock: newStock,
            minStock: ingredient.min_stock,
          })
        }
        
        await updateStock(ingredientId, newStock)
        
        logger.info("Stock updated successfully", {
          ingredientId,
          previousStock,
          newStock,
          difference: quantity,
        })
        
        span.setAttribute("previous_stock", previousStock)
        span.setAttribute("new_stock", newStock)
        
        return { previousStock, newStock }
      } catch (error) {
        logger.error("Failed to update stock", {
          ingredientId,
          quantity,
          reason,
          error: error.message,
        })
        
        Sentry.captureException(error, {
          tags: {
            operation: "updateIngredientStock",
          },
          extra: {
            ingredientId,
            quantity,
            reason,
          },
        })
        
        throw error
      }
    }
  )
}
```

### 5. Production Batch Execution

```typescript
// src/components/production/ProductionBatchExecution.tsx
import * as Sentry from "@sentry/nextjs"

export function ProductionBatchExecution({ batchId }: Props) {
  const { logger } = Sentry
  
  const handleStartProduction = async () => {
    return Sentry.startSpan(
      {
        op: "production.start",
        name: "Start Production Batch",
      },
      async (span) => {
        try {
          span.setAttribute("batch_id", batchId)
          
          logger.info("Starting production batch", { batchId })
          
          // Reserve ingredients
          await Sentry.startSpan(
            { op: "inventory.reserve", name: "Reserve Ingredients" },
            async () => {
              const reserved = await reserveIngredients(batchId)
              span.setAttribute("ingredients_reserved", reserved.length)
              
              logger.debug("Ingredients reserved", {
                batchId,
                count: reserved.length,
              })
            }
          )
          
          // Update batch status
          await updateBatchStatus(batchId, "IN_PROGRESS")
          
          logger.info("Production batch started successfully", { batchId })
          
          toast.success("Production started")
        } catch (error) {
          logger.error("Failed to start production", {
            batchId,
            error: error.message,
          })
          
          Sentry.captureException(error, {
            tags: {
              component: "ProductionBatchExecution",
              action: "start",
            },
            extra: {
              batchId,
            },
          })
          
          toast.error("Failed to start production")
        }
      }
    )
  }

  return <button onClick={handleStartProduction}>Start Production</button>
}
```

### 6. AI Recipe Generator with Tracing

```typescript
// src/app/api/ai/generate-recipe/route.ts
import * as Sentry from "@sentry/nextjs"

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "ai.generation",
      name: "Generate Recipe with AI",
    },
    async (span) => {
      const { logger } = Sentry
      
      try {
        const body = await request.json()
        const { ingredients, cuisine, difficulty } = body
        
        span.setAttribute("ingredients_count", ingredients.length)
        span.setAttribute("cuisine", cuisine)
        span.setAttribute("difficulty", difficulty)
        
        logger.info("Starting AI recipe generation", {
          ingredientsCount: ingredients.length,
          cuisine,
          difficulty,
        })
        
        // Call AI service
        const recipe = await Sentry.startSpan(
          { op: "ai.api_call", name: "OpenAI API Call" },
          async () => {
            const startTime = Date.now()
            const result = await generateRecipeWithAI(body)
            const duration = Date.now() - startTime
            
            span.setAttribute("ai_response_time_ms", duration)
            
            logger.debug("AI API call completed", {
              duration,
              tokensUsed: result.tokensUsed,
            })
            
            return result
          }
        )
        
        // Calculate HPP
        const hpp = await Sentry.startSpan(
          { op: "calculation", name: "Calculate HPP" },
          () => calculateHppForRecipe(recipe)
        )
        
        span.setAttribute("recipe_hpp", hpp)
        
        logger.info("Recipe generated successfully", {
          recipeName: recipe.name,
          hpp,
          ingredientsUsed: recipe.ingredients.length,
        })
        
        return NextResponse.json({ data: { recipe, hpp } })
      } catch (error) {
        logger.error("AI recipe generation failed", {
          error: error.message,
        })
        
        Sentry.captureException(error, {
          tags: {
            endpoint: "/api/ai/generate-recipe",
            feature: "ai_generation",
          },
        })
        
        return NextResponse.json(
          { error: "Failed to generate recipe" },
          { status: 500 }
        )
      }
    }
  )
}
```

### 7. Database Transaction with Logging

```typescript
// src/lib/database/order-transactions.ts
import * as Sentry from "@sentry/nextjs"

const { logger } = Sentry

export async function createOrderWithTransaction(orderData: OrderData) {
  return Sentry.startSpan(
    {
      op: "db.transaction",
      name: "Create Order Transaction",
    },
    async (span) => {
      const supabase = createClient()
      
      try {
        span.setAttribute("customer_id", orderData.customer_id)
        span.setAttribute("items_count", orderData.items.length)
        
        logger.info("Starting order transaction", {
          customerId: orderData.customer_id,
          itemsCount: orderData.items.length,
        })
        
        // Start transaction
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single()
        
        if (orderError) throw orderError
        
        logger.debug("Order created", { orderId: order.id })
        
        // Insert order items
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(
            orderData.items.map((item) => ({
              ...item,
              order_id: order.id,
            }))
          )
        
        if (itemsError) throw itemsError
        
        logger.debug("Order items created", {
          orderId: order.id,
          itemsCount: orderData.items.length,
        })
        
        // Update inventory
        for (const item of orderData.items) {
          await Sentry.startSpan(
            { op: "inventory.update", name: "Update Ingredient Stock" },
            () => updateIngredientStock(item.ingredient_id, -item.quantity)
          )
        }
        
        logger.info("Order transaction completed successfully", {
          orderId: order.id,
          totalAmount: order.total_amount,
        })
        
        span.setAttribute("order_id", order.id)
        span.setAttribute("total_amount", order.total_amount)
        
        return order
      } catch (error) {
        logger.error("Order transaction failed", {
          customerId: orderData.customer_id,
          error: error.message,
        })
        
        Sentry.captureException(error, {
          tags: {
            operation: "createOrderWithTransaction",
          },
          extra: {
            orderData,
          },
        })
        
        throw error
      }
    }
  )
}
```

## Summary

These examples show how to integrate Sentry into HeyTrack's existing codebase:

1. **API Routes**: Add performance tracing and error capture
2. **Components**: Track user interactions and errors
3. **Services**: Monitor business logic performance
4. **Calculations**: Track complex operations like HPP
5. **Inventory**: Log stock changes and alerts
6. **Production**: Monitor batch execution
7. **AI Features**: Track AI API calls and performance
8. **Transactions**: Monitor database operations

All examples follow the patterns documented in AGENTS.md and maintain compatibility with existing error handling.
