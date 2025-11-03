# Type System Guide

## 📚 Overview

Codebase ini menggunakan type system yang konsisten dan terstruktur berdasarkan Supabase generated types. Semua type definitions mengikuti pola yang sama untuk memastikan type safety dan maintainability.

## 🏗️ Structure

```
src/types/
├── supabase-generated.ts    # Auto-generated dari Supabase CLI
├── database.ts               # Type exports & aliases
├── index.ts                  # Main barrel export
├── features/                 # Feature-specific types
│   ├── auth.ts
│   ├── notifications.ts
│   └── ...
├── domain/                   # Domain types
│   ├── notifications.ts
│   └── ...
└── shared/                   # Shared utility types
    ├── common.ts
    ├── api.ts
    └── ...
```

## ✅ Correct Patterns

### 1. Import Types from `@/types/database`

```typescript
// ✅ CORRECT - Import table types
import type { 
  RecipesTable,           // Row type (SELECT)
  RecipesInsert,          // Insert type (INSERT)
  RecipesUpdate,          // Update type (UPDATE)
  OrderStatus,            // Enum type
  Database,               // Full database type
  Tables,                 // Tables helper
  TablesInsert,           // TablesInsert helper
  TablesUpdate            // TablesUpdate helper
} from '@/types/database'

// ✅ CORRECT - Use as type alias
type Recipe = RecipesTable
type RecipeInsert = RecipesInsert
```

### 2. Type Mapping for Generic Functions

```typescript
// ✅ CORRECT - For hooks and helpers that need table mapping
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']
type TableName = keyof TablesMap

function genericFunction<T extends TableName>(
  table: T,
  data: TablesMap[T]['Insert']
) {
  // ...
}
```

### 3. Using Helper Types

```typescript
// ✅ CORRECT - Using Tables helper
import type { Tables } from '@/types/database'

type Recipe = Tables<'recipes'>
type Ingredient = Tables<'ingredients'>

// ✅ CORRECT - Using TablesInsert helper
import type { TablesInsert } from '@/types/database'

type RecipeInsert = TablesInsert<'recipes'>
```

## ❌ Incorrect Patterns (DO NOT USE)

```typescript
// ❌ WRONG - Direct access with string literals
type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

// ❌ WRONG - Direct enum access with string literals
type OrderStatus = Database['public']['Enums']['order_status']

// ❌ WRONG - Not importing the type
type Recipe = RecipesTable  // RecipesTable not imported!
```

## ⚠️ Important: Generic vs Specific Types

### ✅ Generic Functions (Dynamic - Using Type Parameters)

When using **type parameters** (generics), bracket notation is **CORRECT**:

```typescript
// ✅ CORRECT - Generic function with type parameter
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']

function genericCRUD<T extends keyof TablesMap>(
  table: T,
  data: TablesMap[T]['Insert']  // ✅ OK - T is a variable
): TablesMap[T]['Row'] {
  // T is dynamic, so bracket notation is required
}

// ✅ CORRECT - Using Tables helper with generics
import type { Tables } from '@/types/database'

function useQuery<T extends keyof Database['public']['Tables']>(
  table: T
): Tables<T> {  // ✅ OK - T is a variable
  // ...
}
```

### ✅ Specific Types (Static - Using String Literals)

When using **string literals**, use type aliases:

```typescript
// ✅ CORRECT - Import and use type alias
import type { RecipesTable, RecipesInsert } from '@/types/database'

type Recipe = RecipesTable
type RecipeInsert = RecipesInsert

// ❌ WRONG - Don't use string literals directly
type Recipe = Database['public']['Tables']['recipes']['Row']
```

### 📝 Summary

- **Generic/Dynamic** (`T extends keyof Tables`): Use `TablesMap[T]['Row']` ✅
- **Specific/Static** (`'recipes'` literal): Use `RecipesTable` ✅
- **Never** use `Database['public']['Tables']['recipes']['Row']` ❌

## 📋 Available Types

### Table Row Types (SELECT)
- `AppSettingsTable`
- `ChatMessagesTable`
- `CustomersTable`
- `IngredientsTable`
- `OrdersTable`
- `OrderItemsTable`
- `RecipesTable`
- `RecipeIngredientsTable`
- ... (see `src/types/database.ts` for complete list)

### Insert Types (INSERT)
- `AppSettingsInsert`
- `CustomersInsert`
- `IngredientsInsert`
- `OrdersInsert`
- `RecipesInsert`
- ... (see `src/types/database.ts` for complete list)

### Update Types (UPDATE)
- `AppSettingsUpdate`
- `CustomersUpdate`
- `IngredientsUpdate`
- `OrdersUpdate`
- `RecipesUpdate`
- ... (see `src/types/database.ts` for complete list)

### Enum Types
- `BusinessUnit`
- `OrderStatus`
- `PaymentMethod`
- `ProductionStatus`
- `RecordType`
- `TransactionType`
- `UserRole`

### View Types
- `InventoryStatusView`
- `OrderSummaryView`
- `RecipeAvailabilityView`

## 🔄 Type Generation Workflow

1. **Update Database Schema** in Supabase
2. **Generate Types**:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts
   ```
3. **Types are automatically available** through `src/types/database.ts`

## 📝 Examples

### Example 1: API Route

```typescript
import type { OrdersInsert, OrderItemsInsert } from '@/types/database'

async function POST(request: NextRequest) {
  const orderData: OrdersInsert = {
    customer_name: 'John Doe',
    total_amount: 100000,
    user_id: userId,
    // ... other fields
  }
  
  const items: OrderItemsInsert[] = [
    {
      recipe_id: 'recipe-1',
      quantity: 2,
      unit_price: 50000,
      total_price: 100000,
      user_id: userId,
      order_id: orderId,
    }
  ]
}
```

### Example 2: Component

```typescript
import type { RecipesTable, IngredientsTable } from '@/types/database'

type Recipe = RecipesTable
type Ingredient = IngredientsTable

interface RecipeCardProps {
  recipe: Recipe
  ingredients: Ingredient[]
}

export function RecipeCard({ recipe, ingredients }: RecipeCardProps) {
  // ...
}
```

### Example 3: Service

```typescript
import type { Database, RecipesTable, IngredientsTable } from '@/types/database'

type Recipe = RecipesTable
type Ingredient = IngredientsTable

export class RecipeService {
  async getRecipeWithIngredients(recipeId: string): Promise<Recipe & {
    ingredients: Ingredient[]
  }> {
    // ...
  }
}
```

### Example 4: Generic Hook

```typescript
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']

export function useSupabaseCRUD<T extends keyof TablesMap>(
  table: T
) {
  const create = async (data: TablesMap[T]['Insert']) => {
    // ...
  }
  
  const update = async (id: string, data: TablesMap[T]['Update']) => {
    // ...
  }
  
  return { create, update }
}
```

## 🎯 Best Practices

1. **Always import types from `@/types/database`** - Never access nested types directly
2. **Use type aliases** for better readability: `type Recipe = RecipesTable`
3. **Keep imports organized** - Group by category (Row, Insert, Update, Enums)
4. **Use helper types** (`Tables<>`, `TablesInsert<>`, `TablesUpdate<>`) when appropriate
5. **Document complex types** - Add JSDoc comments for custom types
6. **Avoid circular dependencies** - Don't re-export types that create circular refs

## 🔍 Type Checking

Run type checking:
```bash
npm run type-check
# or
tsc --noEmit
```

## 📚 Related Files

- `src/types/database.ts` - Main type exports
- `src/types/supabase-generated.ts` - Auto-generated types
- `src/types/index.ts` - Barrel exports
- `TYPE_SYSTEM_GUIDE.md` - This guide

## 🆘 Troubleshooting

### Issue: "Cannot find name 'XTable'"
**Solution**: Import the type from `@/types/database`
```typescript
import type { RecipesTable } from '@/types/database'
```

### Issue: "Type 'X' is not assignable to type 'Y'"
**Solution**: Check if you're using the correct type (Row vs Insert vs Update)

### Issue: "Circular reference"
**Solution**: Use type aliases instead of direct re-exports

---

**Last Updated**: 2024
**Maintained By**: Development Team
