# Type Mismatch Fix Templates

Quick copy-paste templates for fixing common type mismatch issues.

---

## Template 1: Replace Manual Query Result Interface

### ❌ Before (Wrong)
```typescript
// src/modules/orders/services/SomeService.ts

interface RecipeQueryResult {
  id: string
  name: string
  recipe_ingredients: Array<{
    quantity: number
    ingredient: Array<{
      id: string
      name: string
      current_stock: number
    }>
  }>
}

export class SomeService {
  static async getRecipe(recipeId: string) {
    const { data } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('id', recipeId)
      .single()
    
    return data as RecipeQueryResult
  }
}
```

### ✅ After (Correct)
```typescript
// src/modules/orders/services/SomeService.ts
import type { Database } from '@/types/supabase-generated'
import { dbLogger } from '@/lib/logger'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

// Define query result structure using generated types
type RecipeQueryResult = Recipe & {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: Ingredient[]  // Supabase returns arrays for joins!
  }>
}

// Add type guard for runtime validation
function isRecipeQueryResult(data: unknown): data is RecipeQueryResult {
  if (!data || typeof data !== 'object') return false
  const recipe = data as RecipeQueryResult
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.recipe_ingredients)
  )
}

export class SomeService {
  static async getRecipe(recipeId: string): Promise<RecipeQueryResult> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('id', recipeId)
      .single()
    
    if (error) {
      dbLogger.error({ error, recipeId }, 'Failed to fetch recipe')
      throw error
    }

    if (!isRecipeQueryResult(data)) {
      dbLogger.error({ data }, 'Invalid recipe data structure')
      throw new Error('Invalid recipe data structure')
    }
    
    return data
  }
}
```

---

## Template 2: Move Service Interfaces to Types File

### ❌ Before (Wrong)
```typescript
// src/modules/orders/services/OrderRecipeService.ts

export interface RecipeOption {
  id: string
  name: string
  selling_price: number
  hpp_per_unit: number
}

export interface OrderItemCalculation {
  recipe_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export class OrderRecipeService {
  static async getRecipeOptions(): Promise<RecipeOption[]> {
    // ...
  }
}
```

### ✅ After (Correct)

**Step 1: Add to types file**
```typescript
// src/modules/orders/types.ts
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']

// Business logic types
export interface RecipeOption extends Pick<
  Recipe,
  'id' | 'name' | 'selling_price' | 'category' | 'servings'
> {
  hpp_per_unit: number
  available_stock: boolean
  margin_percentage: number
}

export interface OrderItemCalculation {
  recipe_id: string
  recipe_name: string
  quantity: number
  unit_price: number
  total_price: number
  hpp_per_unit: number
  profit_per_unit: number
  total_profit: number
}

export interface OrderPricing {
  items: OrderItemCalculation[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  delivery_fee: number
  total_amount: number
  total_profit: number
  profit_margin_percentage: number
}
```

**Step 2: Update service file**
```typescript
// src/modules/orders/services/OrderRecipeService.ts
import type { RecipeOption, OrderItemCalculation, OrderPricing } from '../types'
import type { Database } from '@/types/supabase-generated'
import { dbLogger } from '@/lib/logger'

type Recipe = Database['public']['Tables']['recipes']['Row']

export class OrderRecipeService {
  static async getRecipeOptions(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<RecipeOption[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, selling_price, category, servings')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error) {
      dbLogger.error({ error, userId }, 'Failed to fetch recipe options')
      throw error
    }

    // Transform to RecipeOption format
    return data.map(recipe => ({
      ...recipe,
      hpp_per_unit: 0, // Calculate separately
      available_stock: true, // Check separately
      margin_percentage: 0, // Calculate separately
    }))
  }
}
```

---

## Template 3: Fix Extended Type Mismatches

### ❌ Before (Wrong)
```typescript
// src/modules/orders/types.ts

export interface OrderItemWithRecipe extends OrderItem {
  recipe?: {
    id: string
    name: string
    price: number  // ❌ Field name doesn't match generated type
    category: string
  }
}
```

### ✅ After (Correct)

**Option 1: Use Pick with actual field names**
```typescript
// src/modules/orders/types.ts
import type { Database } from '@/types/supabase-generated'

type OrderItem = Database['public']['Tables']['order_items']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']

export interface OrderItemWithRecipe extends OrderItem {
  recipe?: Pick<Recipe, 'id' | 'name' | 'selling_price' | 'category' | 'servings' | 'description'>
}
```

**Option 2: Explicit field mapping for UI**
```typescript
// src/modules/orders/types.ts
import type { Database } from '@/types/supabase-generated'

type OrderItem = Database['public']['Tables']['order_items']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']

// UI-specific type with renamed fields
export interface OrderItemWithRecipeUI extends OrderItem {
  recipe?: {
    id: Recipe['id']
    name: Recipe['name']
    price: Recipe['selling_price']  // Explicit mapping for UI
    category: Recipe['category']
    servings: Recipe['servings']
    description: Recipe['description']
  }
}

// Helper to transform from DB to UI
export function toOrderItemWithRecipeUI(
  item: OrderItem & { recipe?: Recipe }
): OrderItemWithRecipeUI {
  return {
    ...item,
    recipe: item.recipe ? {
      id: item.recipe.id,
      name: item.recipe.name,
      price: item.recipe.selling_price,
      category: item.recipe.category,
      servings: item.recipe.servings,
      description: item.recipe.description,
    } : undefined
  }
}
```

---

## Template 4: Fix Worker Types

### ❌ Before (Wrong)
```typescript
// src/workers/hpp-calculator.worker.ts

interface HppCalculationInput {
  ingredients: Array<{
    quantity: number
    unit_price: number
  }>
  operationalCosts: number
  servings: number
}

interface HppCalculationResult {
  materialCost: number
  operationalCostPerUnit: number
  totalHpp: number
  hppPerUnit: number
}
```

### ✅ After (Correct)
```typescript
// src/workers/hpp-calculator.worker.ts
import type { Database } from '@/types/supabase-generated'

type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

// Worker-specific input type based on generated types
interface HppCalculationInput {
  ingredients: Array<{
    quantity: RecipeIngredient['quantity']
    unit_price: Ingredient['price_per_unit']
    unit: RecipeIngredient['unit']
  }>
  operationalCosts: number
  servings: number
}

// Worker-specific output type
interface HppCalculationResult {
  materialCost: number
  operationalCostPerUnit: number
  totalHpp: number
  hppPerUnit: number
  breakdown: {
    ingredientCosts: Array<{
      quantity: number
      unit_price: number
      total: number
    }>
    operationalCost: number
  }
}

// Worker message handler
self.onmessage = (event: MessageEvent<HppCalculationInput>) => {
  const input = event.data
  
  // Validate input
  if (!input || !Array.isArray(input.ingredients)) {
    self.postMessage({ error: 'Invalid input' })
    return
  }

  // Calculate HPP
  const materialCost = input.ingredients.reduce(
    (sum, ing) => sum + (ing.quantity * ing.unit_price),
    0
  )
  
  const operationalCostPerUnit = input.servings > 0 
    ? input.operationalCosts / input.servings 
    : 0
  
  const totalHpp = materialCost + input.operationalCosts
  const hppPerUnit = input.servings > 0 ? totalHpp / input.servings : 0

  const result: HppCalculationResult = {
    materialCost,
    operationalCostPerUnit,
    totalHpp,
    hppPerUnit,
    breakdown: {
      ingredientCosts: input.ingredients.map(ing => ({
        quantity: ing.quantity,
        unit_price: ing.unit_price,
        total: ing.quantity * ing.unit_price
      })),
      operationalCost: input.operationalCosts
    }
  }

  self.postMessage(result)
}
```

---

## Template 5: Add Type Guards for Query Results

### Pattern for Any Query Result

```typescript
import type { Database } from '@/types/supabase-generated'

type YourTable = Database['public']['Tables']['your_table']['Row']

// Define query result structure
type YourQueryResult = YourTable & {
  // Add joined tables here
  related_table?: Array<RelatedTable>
}

// Type guard function
function isYourQueryResult(data: unknown): data is YourQueryResult {
  if (!data || typeof data !== 'object') return false
  
  const result = data as YourQueryResult
  
  // Check required fields
  if (typeof result.id !== 'string') return false
  if (typeof result.name !== 'string') return false
  
  // Check optional fields
  if (result.related_table !== undefined && !Array.isArray(result.related_table)) {
    return false
  }
  
  return true
}

// Usage in service
export class YourService {
  static async getWithRelations(id: string): Promise<YourQueryResult> {
    const { data, error } = await supabase
      .from('your_table')
      .select('*, related_table(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    if (!isYourQueryResult(data)) {
      throw new Error('Invalid data structure')
    }
    
    return data
  }
}
```

---

## Template 6: Handle Nullable Fields Correctly

### Check Generated Type First

```typescript
// 1. Check the generated type
type Recipe = Database['public']['Tables']['recipes']['Row']

// Look at the field definition:
// selling_price: number | null  ← nullable
// servings: number              ← not nullable
```

### ✅ Correct Nullable Handling

```typescript
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']

export class RecipeService {
  static calculateMargin(recipe: Recipe): number {
    // ✅ CORRECT - Check if field is nullable in generated type
    const sellingPrice = recipe.selling_price ?? 0  // Use ?? for null/undefined
    const hpp = recipe.hpp_per_unit ?? 0
    
    if (sellingPrice === 0) return 0
    
    return ((sellingPrice - hpp) / sellingPrice) * 100
  }

  static getServings(recipe: Recipe): number {
    // ✅ CORRECT - servings is not nullable, no need for fallback
    return recipe.servings
  }

  static getDescription(recipe: Recipe): string {
    // ✅ CORRECT - description is nullable, provide fallback
    return recipe.description ?? 'No description'
  }
}
```

---

## Quick Reference Checklist

When fixing type mismatches:

- [ ] Import from `@/types/supabase-generated`
- [ ] Use `Database['public']['Tables']['...']['Row']` for base types
- [ ] Add type guards for query results with joins
- [ ] Move service interfaces to types files
- [ ] Use `Pick<>` or `Omit<>` for extended types
- [ ] Check nullable fields in generated types
- [ ] Use `??` instead of `||` for null coalescing
- [ ] Add proper error handling
- [ ] Add logging for debugging
- [ ] Run `pnpm type-check` after changes

---

## Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Manual interface
interface Recipe {
  id: string
  name: string
}

// Type assertion without validation
const recipe = data as Recipe

// Wrong null handling
const price = recipe.price || 0  // Use ?? instead

// Interfaces in service files
export interface SomeType { }  // Move to types.ts
```

### ✅ Do This Instead
```typescript
// Use generated types
type Recipe = Database['public']['Tables']['recipes']['Row']

// Type guard + validation
if (!isRecipe(data)) throw new Error('Invalid data')
const recipe: Recipe = data

// Correct null handling
const price = recipe.selling_price ?? 0

// Types in types files
// src/modules/feature/types.ts
export interface SomeType { }
```

---

**Remember:** Always check the generated types first before making assumptions about field names or nullability!
