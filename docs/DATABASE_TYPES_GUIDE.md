# Database Types Guide

This guide explains how to properly use database types in the HeyTrack codebase.

## Overview

All database types should be imported from `@/types/database` which provides a clean, type-safe interface to your Supabase database schema.

## Type Categories

### 1. Table Row Types (SELECT queries)

Use these for data returned from SELECT queries:

```typescript
import type { 
  RecipesTable, 
  IngredientsTable, 
  OrdersTable 
} from '@/types/database'

// Example usage
const recipe: RecipesTable = await fetchRecipe(id)
const ingredients: IngredientsTable[] = await fetchIngredients()
```

**Available Table Types:**
- `AppSettingsTable`
- `ChatContextCacheTable`
- `ChatMessagesTable`
- `ChatSessionsTable`
- `ConversationHistoryTable`
- `ConversationSessionsTable`
- `CustomersTable`
- `DailySalesSummaryTable`
- `ErrorLogsTable`
- `ExpensesTable`
- `FinancialRecordsTable`
- `HppAlertsTable`
- `HppCalculationsTable`
- `HppHistoryTable`
- `HppRecommendationsTable`
- `IngredientPurchasesTable`
- `IngredientsTable`
- `InventoryAlertsTable`
- `InventoryReorderRulesTable`
- `InventoryStockLogsTable`
- `NotificationPreferencesTable`
- `NotificationsTable`
- `OperationalCostsTable`
- `OrderItemsTable`
- `OrdersTable`
- `PaymentsTable`
- `PerformanceLogsTable`
- `ProductionBatchesTable`
- `ProductionSchedulesTable`
- `ProductionsTable`
- `RecipeIngredientsTable`
- `RecipesTable`
- `StockReservationsTable`
- `StockTransactionsTable`
- `SupplierIngredientsTable`
- `SuppliersTable`
- `UsageAnalyticsTable`
- `UserProfilesTable`
- `WhatsappTemplatesTable`

### 2. Insert Types (INSERT operations)

Use these for creating new records:

```typescript
import type { 
  RecipesInsert, 
  IngredientsInsert, 
  OrdersInsert 
} from '@/types/database'

// Example usage
const newRecipe: RecipesInsert = {
  name: 'Chocolate Cake',
  category: 'Dessert',
  user_id: userId,
  // ... other fields (all optional except required ones)
}

await supabase.from('recipes').insert(newRecipe)
```

**Naming Convention:** `{TableName}Insert`
- `RecipesInsert`
- `IngredientsInsert`
- `OrdersInsert`
- etc.

### 3. Update Types (UPDATE operations)

Use these for updating existing records:

```typescript
import type { 
  RecipesUpdate, 
  IngredientsUpdate, 
  OrdersUpdate 
} from '@/types/database'

// Example usage
const updates: RecipesUpdate = {
  name: 'Updated Recipe Name',
  updated_at: new Date().toISOString()
}

await supabase.from('recipes').update(updates).eq('id', recipeId)
```

**Naming Convention:** `{TableName}Update`
- `RecipesUpdate`
- `IngredientsUpdate`
- `OrdersUpdate`
- etc.

### 4. View Types

Use these for database views:

```typescript
import type { 
  InventoryStatusView, 
  OrderSummaryView, 
  RecipeAvailabilityView 
} from '@/types/database'

// Example usage
const inventoryStatus: InventoryStatusView[] = await supabase
  .from('inventory_status')
  .select('*')
```

### 5. Enum Types

Use these for enum values:

```typescript
import type { 
  BusinessUnit, 
  OrderStatus, 
  PaymentMethod, 
  ProductionStatus, 
  RecordType, 
  TransactionType, 
  UserRole 
} from '@/types/database'

// Example usage
const status: OrderStatus = 'CONFIRMED'
const paymentMethod: PaymentMethod = 'CASH'
```

## Best Practices

### ✅ DO: Use Specific Types

```typescript
// ✅ GOOD - Specific, type-safe
import type { RecipesTable, RecipesInsert } from '@/types/database'

function createRecipe(data: RecipesInsert): Promise<RecipesTable> {
  // ...
}
```

### ❌ DON'T: Use Raw Database Access

```typescript
// ❌ BAD - Verbose and error-prone
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
```

### ✅ DO: Use Generic Types for Utilities

```typescript
// ✅ GOOD - Generic utilities can use Database type
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']

function genericCRUD<T extends keyof TablesMap>(
  table: T,
  data: TablesMap[T]['Insert']
) {
  // Generic implementation
}
```

### ✅ DO: Import Multiple Types Together

```typescript
// ✅ GOOD - Clean imports
import type { 
  RecipesTable, 
  RecipesInsert, 
  RecipesUpdate,
  IngredientsTable,
  OrdersTable 
} from '@/types/database'
```

### ❌ DON'T: Define Inline Types

```typescript
// ❌ BAD - Duplicates database schema
type Recipe = {
  id: string
  name: string
  // ... other fields
}

// ✅ GOOD - Use generated types
import type { RecipesTable } from '@/types/database'
type Recipe = RecipesTable
```

## Common Patterns

### API Routes

```typescript
import type { IngredientsInsert, IngredientsUpdate } from '@/types/database'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const ingredientData: IngredientsInsert = {
    ...body,
    user_id: user.id
  }
  
  const { data } = await supabase
    .from('ingredients')
    .insert(ingredientData)
    .select()
    .single()
    
  return NextResponse.json(data)
}
```

### Services

```typescript
import type { 
  ProductionsInsert, 
  ProductionsUpdate,
  ProductionsTable 
} from '@/types/database'

export class ProductionBatchService {
  static async createBatch(
    data: ProductionsInsert
  ): Promise<ProductionsTable> {
    const { data: batch } = await supabase
      .from('productions')
      .insert(data)
      .select()
      .single()
      
    return batch
  }
  
  static async updateBatch(
    id: string,
    updates: ProductionsUpdate
  ): Promise<ProductionsTable> {
    const { data: batch } = await supabase
      .from('productions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    return batch
  }
}
```

### React Hooks

```typescript
import type { RecipesTable } from '@/types/database'
import { useQuery } from '@tanstack/react-query'

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async (): Promise<RecipesTable[]> => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        
      return data || []
    }
  })
}
```

## Type Checking

Run the type checker to ensure all database types are used correctly:

```bash
npm run check-db-types
```

This will scan your codebase and report any issues with database type usage.

## Regenerating Types

When you make changes to your database schema:

```bash
# Generate new types from Supabase
npm run generate-types

# Or manually
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts
```

The `database.ts` file will automatically re-export the new types.

## Migration Guide

If you have existing code using old patterns, here's how to migrate:

### Before (Old Pattern)

```typescript
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

const recipe: Recipe = await fetchRecipe()
```

### After (New Pattern)

```typescript
import type { RecipesTable, RecipesInsert } from '@/types/database'

const recipe: RecipesTable = await fetchRecipe()
```

## Troubleshooting

### Type Errors with Supabase Client

If you get type errors with Supabase operations, ensure you're using the correct type:

```typescript
// ✅ GOOD
const { data } = await supabase
  .from('recipes')
  .insert(recipeData)
  .select()
  .single()

// Type is automatically inferred as RecipesTable
```

### Missing Types

If a type is missing, check:

1. Is the table in your database?
2. Have you run `npm run generate-types`?
3. Is the type exported in `src/types/database.ts`?

### Generic Type Constraints

For generic functions, use the Database type:

```typescript
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']

function genericFunction<T extends keyof TablesMap>(
  table: T
): TablesMap[T]['Row'] {
  // Implementation
}
```

## Additional Resources

- [Supabase TypeScript Documentation](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Project Type System Guide](./TYPE_SYSTEM_GUIDE.md)
