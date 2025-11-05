# Type System Quick Reference

## Import Patterns

### Basic Table Types

```typescript
// Import table row types
import type { IngredientsTable, RecipesTable, OrdersTable } from '@/types/database'

// Or use the convenience aliases
import type { Ingredient, Recipe, Order } from '@/types'

// Insert types (for creating new records)
import type { IngredientsInsert, RecipesInsert, OrdersInsert } from '@/types/database'

// Update types (for updating existing records)
import type { IngredientsUpdate, RecipesUpdate, OrdersUpdate } from '@/types/database'
```

### View Types

```typescript
// Import view types
import type {
  InventoryAvailabilityView,
  InventoryStatusView,
  OrderSummaryView,
  RecipeAvailabilityView,
} from '@/types/database'
```

### Enum Types

```typescript
// Import enum types
import type {
  BusinessUnit,
  OrderStatus,
  PaymentMethod,
  ProductionStatus,
  RecordType,
  TransactionType,
  UserRole,
} from '@/types/database'

// String-based status types (not database enums)
import type {
  PaymentStatus,
  StockReservationStatus,
  BatchStatus,
} from '@/types/database'
```

### Generic Helpers

```typescript
// Import generic type helpers
import type { Row, Insert, Update, TableName, ViewName } from '@/types/database'

// Use with any table
type MyIngredient = Row<'ingredients'>
type MyIngredientInsert = Insert<'ingredients'>
type MyIngredientUpdate = Update<'ingredients'>
```

### Constants

```typescript
// Import table and view name constants
import { TABLE_NAMES, VIEW_NAMES } from '@/types/database'

// Usage
const tableName = TABLE_NAMES.INGREDIENTS // 'ingredients'
const viewName = VIEW_NAMES.INVENTORY_STATUS // 'inventory_status'
```

## Common Patterns

### Query with Relations

```typescript
import type { RecipesTable, RecipeIngredientsTable, IngredientsTable } from '@/types/database'

type RecipeWithIngredients = RecipesTable & {
  recipe_ingredients: Array<
    RecipeIngredientsTable & {
      ingredient: IngredientsTable | null
    }
  >
}
```

### Order with Full Details

```typescript
import type {
  OrdersTable,
  OrderItemsTable,
  RecipesTable,
  CustomersTable,
  PaymentsTable,
} from '@/types/database'

type OrderWithFullDetails = OrdersTable & {
  order_items: Array<
    OrderItemsTable & {
      recipe: RecipesTable | null
    }
  >
  customer: CustomersTable | null
  payments: PaymentsTable[]
}
```

### Form Data Types

```typescript
import type { IngredientsInsert } from '@/types/database'

// Omit auto-generated fields for forms
type IngredientFormData = Omit<
  IngredientsInsert,
  'id' | 'created_at' | 'updated_at' | 'user_id'
>
```

### API Response Types

```typescript
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/database'

// Success response
type IngredientsResponse = ApiSuccessResponse<IngredientsTable[]>

// Error response
type ErrorResponse = ApiErrorResponse
```

## Database Schema Reference

### All Tables (42)

```typescript
TABLE_NAMES.APP_SETTINGS              // 'app_settings'
TABLE_NAMES.CHAT_CONTEXT_CACHE        // 'chat_context_cache'
TABLE_NAMES.CHAT_MESSAGES              // 'chat_messages'
TABLE_NAMES.CHAT_SESSIONS              // 'chat_sessions'
TABLE_NAMES.CONVERSATION_HISTORY       // 'conversation_history'
TABLE_NAMES.CONVERSATION_SESSIONS      // 'conversation_sessions'
TABLE_NAMES.CUSTOMERS                  // 'customers'
TABLE_NAMES.DAILY_SALES_SUMMARY        // 'daily_sales_summary'
TABLE_NAMES.ERROR_LOGS                 // 'error_logs'
TABLE_NAMES.EXPENSES                   // 'expenses'
TABLE_NAMES.FINANCIAL_RECORDS          // 'financial_records'
TABLE_NAMES.HPP_ALERTS                 // 'hpp_alerts'
TABLE_NAMES.HPP_CALCULATIONS           // 'hpp_calculations'
TABLE_NAMES.HPP_HISTORY                // 'hpp_history'
TABLE_NAMES.HPP_RECOMMENDATIONS        // 'hpp_recommendations'
TABLE_NAMES.INGREDIENT_PURCHASES       // 'ingredient_purchases'
TABLE_NAMES.INGREDIENTS                // 'ingredients'
TABLE_NAMES.INVENTORY_ALERTS           // 'inventory_alerts'
TABLE_NAMES.INVENTORY_REORDER_RULES    // 'inventory_reorder_rules'
TABLE_NAMES.INVENTORY_STOCK_LOGS       // 'inventory_stock_logs'
TABLE_NAMES.NOTIFICATION_PREFERENCES   // 'notification_preferences'
TABLE_NAMES.NOTIFICATIONS              // 'notifications'
TABLE_NAMES.OPERATIONAL_COSTS          // 'operational_costs'
TABLE_NAMES.ORDER_ITEMS                // 'order_items'
TABLE_NAMES.ORDERS                     // 'orders'
TABLE_NAMES.PAYMENTS                   // 'payments'
TABLE_NAMES.PERFORMANCE_LOGS           // 'performance_logs'
TABLE_NAMES.PRODUCTION_BATCHES         // 'production_batches'
TABLE_NAMES.PRODUCTION_SCHEDULES       // 'production_schedules'
TABLE_NAMES.PRODUCTIONS                // 'productions'
TABLE_NAMES.RECIPE_INGREDIENTS         // 'recipe_ingredients'
TABLE_NAMES.RECIPES                    // 'recipes'
TABLE_NAMES.STOCK_RESERVATIONS         // 'stock_reservations'
TABLE_NAMES.STOCK_TRANSACTIONS         // 'stock_transactions'
TABLE_NAMES.SUPPLIER_INGREDIENTS       // 'supplier_ingredients'
TABLE_NAMES.SUPPLIERS                  // 'suppliers'
TABLE_NAMES.USAGE_ANALYTICS            // 'usage_analytics'
TABLE_NAMES.USER_PROFILES              // 'user_profiles'
TABLE_NAMES.WHATSAPP_TEMPLATES         // 'whatsapp_templates'
```

### All Views (4)

```typescript
VIEW_NAMES.INVENTORY_AVAILABILITY // 'inventory_availability'
VIEW_NAMES.INVENTORY_STATUS // 'inventory_status'
VIEW_NAMES.ORDER_SUMMARY // 'order_summary'
VIEW_NAMES.RECIPE_AVAILABILITY // 'recipe_availability'
```

### All Enums (7)

```typescript
// BusinessUnit
'kitchen' | 'sales' | 'inventory' | 'finance' | 'all'

// OrderStatus
'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'

// PaymentMethod
'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'

// ProductionStatus
'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// RecordType
'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'

// TransactionType
'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'

// UserRole
'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer'
```

## Best Practices

### ✅ DO

```typescript
// Use generated types from database.ts
import type { IngredientsTable } from '@/types/database'

// Use convenience aliases from types/index.ts
import type { Ingredient } from '@/types'

// Use generic helpers for flexibility
import type { Row } from '@/types/database'
type MyType = Row<'ingredients'>

// Use constants for table names
import { TABLE_NAMES } from '@/types/database'
const table = TABLE_NAMES.INGREDIENTS
```

### ❌ DON'T

```typescript
// Don't use string literals for table names
const table = 'ingredients' // ❌

// Don't create duplicate type definitions
type Ingredient = { ... } // ❌ Already defined

// Don't use 'any' type
const data: any = ... // ❌

// Don't import from supabase-generated directly (use database.ts)
import type { Tables } from './supabase-generated' // ❌
```

## Migration Guide

### Old Pattern → New Pattern

```typescript
// OLD: Direct import from supabase-generated
import type { Tables } from '@/types/supabase-generated'
type Ingredient = Tables<'ingredients'>

// NEW: Use database.ts or convenience aliases
import type { IngredientsTable } from '@/types/database'
// or
import type { Ingredient } from '@/types'
```

```typescript
// OLD: String literal table names
const tableName = 'ingredients'

// NEW: Use constants
import { TABLE_NAMES } from '@/types/database'
const tableName = TABLE_NAMES.INGREDIENTS
```

```typescript
// OLD: Manual type definitions
type PaymentStatus = 'PENDING' | 'PAID' | ...

// NEW: Import from database.ts
import type { PaymentStatus } from '@/types/database'
```

## Troubleshooting

### Type Error: Cannot find name 'Row'

```typescript
// ❌ Missing import
export type MyType = Row<'ingredients'>

// ✅ Add import
import type { Row } from '@/types/database'
export type MyType = Row<'ingredients'>
```

### Type Error: Cannot find name 'TablesUpdate'

```typescript
// ❌ Missing import
import type { Database } from '@/types/database'

// ✅ Add TablesUpdate import
import type { Database, TablesUpdate } from '@/types/database'
```

### Type Error: Type 'string' is not assignable to type 'PaymentStatus'

```typescript
// ❌ Direct assignment
const status: PaymentStatus = order.payment_status

// ✅ Type assertion
const status = order.payment_status as PaymentStatus
```

## Resources

- **Generated Types**: `src/types/supabase-generated.ts` (auto-generated, don't edit)
- **Database Types**: `src/types/database.ts` (main type definitions)
- **Type Index**: `src/types/index.ts` (barrel exports)
- **Documentation**: `DATABASE_TYPES_FIXED.md` (detailed changes)
