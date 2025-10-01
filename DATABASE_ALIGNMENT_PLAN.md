# Database Schema Alignment Plan

## Summary
I've generated the latest TypeScript types from your Supabase database. This document outlines the schema alignment required to fix all TypeScript errors.

## ✅ Actual Database Tables (from Supabase)

The database contains these tables:
- `ingredients` (NOT "inventory")
- `recipes`
- `recipe_ingredients`
- `customers`
- `orders`
- `order_items`
- `productions`
- `stock_transactions`
- `payments`
- `financial_records`
- `inventory_alerts`
- `usage_analytics`
- `production_schedules`
- `suppliers`
- `supplier_ingredients`
- `sync_events`
- `system_metrics`
- `inventory_stock_logs`
- `expenses`
- `daily_sales_summary`
- `notifications`
- `user_profiles`
- `app_settings`
- `whatsapp_templates`

## ❌ Common Mismatches Found

### 1. **Table Name: `inventory` vs `ingredients`**
**Issue**: Many files reference table name `inventory`, but the actual table is called `ingredients`.

**Files to Fix**:
- Any component or hook querying "inventory" table
- Type definitions referencing Database['public']['Tables']['inventory']

### 2. **Missing Table: `whatsapp_templates`**
**Status**: ✅ **EXISTS** - The table is in the database
**Schema**:
```typescript
{
  id: string
  name: string
  description: string | null
  category: string
  template_content: string
  variables: Json | null
  is_active: boolean | null
  is_default: boolean | null
  created_at: string | null
  updated_at: string | null
}
```

### 3. **Enum Types Available**
```typescript
- business_unit: "kitchen" | "sales" | "inventory" | "finance" | "all"
- order_status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY" | "DELIVERED" | "CANCELLED"
- payment_method: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "DIGITAL_WALLET" | "OTHER"
- production_status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
- record_type: "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL"
- transaction_type: "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"
- user_role: "super_admin" | "admin" | "manager" | "staff" | "viewer"
```

## 🔧 Action Plan

### Phase 1: Update Type Imports (HIGH PRIORITY)
1. ✅ Generated `src/types/database.types.ts` with latest schema
2. Update all imports to use this file instead of any old type definitions
3. Search and replace incorrect table references:
   - `Database['public']['Tables']['inventory']` → `Database['public']['Tables']['ingredients']`

### Phase 2: Fix Codebase References
Search for and update these patterns:

```bash
# Find files referencing "inventory" table
grep -r "from('inventory')" src/
grep -r "\.inventory\." src/

# Find whatsapp_templates references that might have wrong types
grep -r "whatsapp_templates" src/
```

### Phase 3: Consolidate Type Definitions
**Current Issues**:
- Multiple `types/index.ts` files with conflicting definitions
- Some files have inline type definitions
- `DatabaseEnums` type needs to be properly exported

**Solution**:
1. Use `database.types.ts` as single source of truth
2. Create convenience type aliases in `types/index.ts`:

```typescript
// src/types/index.ts
import { Database } from './database.types';

// Table types
export type Ingredient = Database['public']['Tables']['ingredients']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
// ... etc

// Enum types
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
// ... etc

// Re-export Database type
export type { Database };
```

### Phase 4: Update API Hooks
Files likely needing updates:
- `src/hooks/useIngredients.ts` (if referencing inventory)
- `src/hooks/useInventory.ts` (needs to query ingredients table)
- `src/hooks/useWhatsAppTemplates.ts` (confirm types match)
- Any Supabase query hooks

### Phase 5: Update Components
Components querying data need to use correct table names:
- Inventory management components → query `ingredients`
- All `.from('inventory')` → `.from('ingredients')`

## 📊 Database Schema Key Points

### Ingredients Table
**Important columns**:
- `current_stock`, `min_stock`, `max_stock`, `minimum_stock` (both min_stock and minimum_stock exist!)
- `reorder_point`, `lead_time`, `usage_rate`
- `price_per_unit`, `cost_per_batch`
- `supplier`, `supplier_contact`
- `is_active`

### Orders Table
**Important columns**:
- `order_no` (string, unique)
- `status` (enum: order_status)
- `payment_status` (string: UNPAID | PARTIAL | PAID)
- `payment_method` (string check constraint)
- `customer_id` (FK to customers)

### Recipes Table
**Important columns**:
- `cost_per_unit` (calculated HPP)
- `selling_price`
- `margin_percentage`
- `batch_size` (standard batch size)
- `times_made`, `total_revenue`

## 🎯 Next Steps

1. **Run TypeScript check** to see current errors:
   ```bash
   npx tsc --noEmit
   ```

2. **Fix table name references** systematically:
   - Update all `inventory` → `ingredients`
   - Verify `whatsapp_templates` usage

3. **Update type imports** across the codebase

4. **Test build**:
   ```bash
   npm run build
   ```

5. **Verify runtime** behavior in development mode

## ⚠️ Breaking Changes to Watch For

1. Any code assuming `inventory` table will break
2. Components directly accessing Database types may need updates
3. Supabase queries with hardcoded table names need fixes

## ✨ Benefits After Completion

- Full TypeScript type safety with Supabase
- Auto-completion for all database operations
- Compile-time catch of schema mismatches
- Single source of truth for database types
- Easier to maintain as schema evolves
