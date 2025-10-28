---
inclusion: always
---

# Using Generated Supabase Types - Best Practices

## Overview

This project uses **generated Supabase types** as the single source of truth for all database-related types. Never create manual type definitions for database tables.

## Core Principle

```typescript
// ✅ ALWAYS use generated types
import type { Database } from '@/types/supabase-generated'

// ❌ NEVER create manual interfaces for DB tables
interface Recipe { ... } // WRONG!
```

## How to Use Generated Types

### 1. Basic Table Types

```typescript
import type { Database } from '@/types/supabase-generated'

// Row type (for SELECT queries)
type Recipe = Database['public']['Tables']['recipes']['Row']

// Insert type (for INSERT operations)
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

// Update type (for UPDATE operations)
type RecipeUpdate = Database['public']['Tables']['recipes']['Update']
```

### 2. Using Domain Type Re-exports

For convenience, domain types re-export commonly used types:

```typescript
// ✅ Preferred - use domain re-exports
import type { Recipe, RecipeInsert, RecipeUpdate } from '@/types/domain/recipes'
import type { Order, OrderInsert } from '@/types/domain/orders'
import type { Ingredient } from '@/types/domain/inventory'
import type { Customer } from '@/types/domain/customers'

// ✅ Also valid - direct import
import type { Database } from '@/types/supabase-generated'
type Recipe = Database['public']['Tables']['recipes']['Row']
```

### 3. Enums

```typescript
import type { Database } from '@/types/supabase-generated'

// Use database enums
type OrderStatus = Database['public']['Enums']['order_status']
type PaymentMethod = Database['public']['Enums']['payment_method']
type ProductionStatus = Database['public']['Enums']['production_status']

// Or from domain types
import type { OrderStatus, PaymentMethod } from '@/types/domain/orders'
```

### 4. Extended Types for UI

When you need additional fields for UI (like relations), extend the base type:

```typescript
import type { Recipe, RecipeIngredient } from '@/types/domain/recipes'
import type { Ingredient } from '@/types/domain/inventory'

// ✅ Extend base type for UI needs
interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}

// ✅ Use in components
function RecipeCard({ recipe }: { recipe: RecipeWithIngredients }) {
  // ...
}
```

### 5. Service Method Signatures

Services should accept Supabase client and use generated types:

```typescript
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

export class RecipeService {
  // ✅ Accept supabase client and use generated types
  static async createRecipe(
    supabase: SupabaseClient<Database>,
    userId: string,
    data: RecipeInsert
  ): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    
    if (error) throw error
    return recipe
  }
}
```

### 6. API Route Patterns

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { RecipeInsert } from '@/types/domain/recipes'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const body: RecipeInsert = await request.json()
  
  const { data, error } = await supabase
    .from('recipes')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()
  
  return NextResponse.json(data)
}
```

## Common Patterns

### Pattern 1: Query with Relations

```typescript
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

// Query result structure
interface RecipeQueryResult extends Recipe {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: Ingredient[]  // Supabase returns arrays for joins!
  }>
}

// Usage
const { data } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
  .single()

// Type assertion
const recipe = data as RecipeQueryResult

// Access joined data (note the array!)
const ingredient = recipe.recipe_ingredients[0]?.ingredient?.[0]
```

### Pattern 2: Insert with Validation

```typescript
import { z } from 'zod'
import type { RecipeInsert } from '@/types/domain/recipes'

// Create Zod schema matching Insert type
const RecipeInsertSchema = z.object({
  name: z.string().min(1),
  servings: z.number().positive(),
  user_id: z.string().uuid(),
  // ... other fields
}) satisfies z.ZodType<RecipeInsert>

// Use in API route
const validation = RecipeInsertSchema.safeParse(body)
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 })
}

const recipe: RecipeInsert = validation.data
```

### Pattern 3: Update Operations

```typescript
import type { RecipeUpdate } from '@/types/domain/recipes'

// Partial updates
const updates: RecipeUpdate = {
  name: 'New Name',
  updated_at: new Date().toISOString()
}

await supabase
  .from('recipes')
  .update(updates)
  .eq('id', recipeId)
  .eq('user_id', userId)  // Always filter by user_id for RLS
```

### Pattern 4: Type Guards for Runtime Safety

```typescript
import type { Recipe } from '@/types/domain/recipes'

function isRecipe(data: unknown): data is Recipe {
  if (!data || typeof data !== 'object') return false
  const recipe = data as Recipe
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    typeof recipe.user_id === 'string'
  )
}

// Usage
const { data } = await supabase.from('recipes').select().single()
if (!isRecipe(data)) {
  throw new Error('Invalid recipe data')
}
// Now data is properly typed as Recipe
```

## Regenerating Types

When you make database schema changes:

```bash
# Using Supabase CLI with project ID
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts

# Or using local Supabase
npx supabase gen types typescript --local > src/types/supabase-generated.ts

# Or using connection string
npx supabase gen types typescript --db-url "postgresql://..." > src/types/supabase-generated.ts
```

After regenerating:
1. Check for breaking changes in the generated types
2. Update domain type re-exports if needed
3. Run `pnpm type-check` to catch any issues
4. Update extended types if schema changed

## Migration Checklist

When adding new features:

- [ ] Use generated types from `@/types/supabase-generated`
- [ ] Or use domain re-exports from `@/types/domain/*`
- [ ] Never create manual interfaces for DB tables
- [ ] Extend base types for UI needs (don't modify base types)
- [ ] Use `Insert` types for create operations
- [ ] Use `Update` types for update operations
- [ ] Use `Row` types for query results
- [ ] Add type guards for runtime validation if needed

## Common Mistakes to Avoid

### ❌ Mistake 1: Manual Type Definitions
```typescript
// ❌ WRONG
interface Recipe {
  id: string
  name: string
  // ... manual fields
}
```

### ✅ Correct Approach
```typescript
// ✅ RIGHT
import type { Recipe } from '@/types/domain/recipes'
```

### ❌ Mistake 2: Modifying Generated Types
```typescript
// ❌ WRONG - Don't edit supabase-generated.ts
export type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  custom_field: string  // Don't add fields here!
}
```

### ✅ Correct Approach
```typescript
// ✅ RIGHT - Extend in a separate file
import type { Recipe } from '@/types/domain/recipes'

interface RecipeWithCustomField extends Recipe {
  custom_field: string
}
```

### ❌ Mistake 3: Ignoring Nullable Fields
```typescript
// ❌ WRONG - Assuming fields are always present
function getRecipeName(recipe: Recipe): string {
  return recipe.description.toUpperCase()  // description might be null!
}
```

### ✅ Correct Approach
```typescript
// ✅ RIGHT - Handle nullable fields
function getRecipeDescription(recipe: Recipe): string {
  return recipe.description ?? 'No description'
}
```

### ❌ Mistake 4: Wrong Type for Mutations
```typescript
// ❌ WRONG - Using Row type for insert
const newRecipe: Recipe = {
  id: 'some-id',  // id is auto-generated!
  name: 'New Recipe',
  user_id: userId,
  created_at: new Date().toISOString()  // auto-generated!
}
```

### ✅ Correct Approach
```typescript
// ✅ RIGHT - Use Insert type
const newRecipe: RecipeInsert = {
  name: 'New Recipe',
  user_id: userId
  // id and created_at are optional/auto-generated
}
```

## Quick Reference

| Use Case | Type to Use | Example |
|----------|-------------|---------|
| SELECT query result | `Row` | `Database['public']['Tables']['recipes']['Row']` |
| INSERT operation | `Insert` | `Database['public']['Tables']['recipes']['Insert']` |
| UPDATE operation | `Update` | `Database['public']['Tables']['recipes']['Update']` |
| Enum values | `Enums` | `Database['public']['Enums']['order_status']` |
| UI with relations | Extend `Row` | `interface RecipeWithIngredients extends Recipe { ... }` |
| Service parameters | `Row` or `Insert` | Depends on operation |
| API request body | `Insert` or custom | Usually `Insert` with validation |
| API response | `Row` or extended | Usually `Row` or extended type |

## Resources

- **Generated Types**: `src/types/supabase-generated.ts`
- **Domain Re-exports**: `src/types/domain/*.ts`
- **Module Types**: `src/modules/*/types/*.ts`
- **Supabase Docs**: https://supabase.com/docs/guides/api/generating-types

---

**Remember**: The generated types are your source of truth. Trust them, use them, and regenerate them when your schema changes!
