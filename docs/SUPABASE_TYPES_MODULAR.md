# Supabase Types Modularization

## Problem
The `supabase-generated.ts` file is 70KB and contains all table definitions in one file, making it:
- Hard to navigate
- Slow to load in IDE
- Difficult to understand relationships
- Prone to merge conflicts

## Solution: Modular Structure

```
src/types/supabase/
├── index.ts              # Main export (backward compatible)
├── common.ts             # Json, shared types
├── enums.ts              # All database enums
├── tables/               # Table definitions by domain
│   ├── recipes.ts        # recipes, recipe_ingredients
│   ├── ingredients.ts    # ingredients, ingredient_purchases
│   ├── orders.ts         # orders, order_items, payments
│   ├── customers.ts      # customers
│   ├── inventory.ts      # stock_transactions, inventory_alerts
│   ├── hpp.ts            # hpp_snapshots, hpp_alerts
│   ├── production.ts     # productions, production_schedules
│   ├── financial.ts      # financial_records, expenses, operational_costs
│   ├── suppliers.ts      # suppliers, supplier_ingredients
│   └── system.ts         # app_settings, notifications, etc
├── views/                # Database views
│   ├── inventory.ts      # inventory_status
│   ├── orders.ts         # order_summary
│   └── recipes.ts        # recipe_availability
└── functions.ts          # Database functions
```

## Migration Strategy

### Phase 1: Setup (DONE ✅)
- [x] Create folder structure
- [x] Create common.ts with Json type
- [x] Create enums.ts with all enums
- [x] Create index.ts that re-exports from original file
- [x] Create sample tables/recipes.ts

### Phase 2: Gradual Migration (TODO)
1. Keep `supabase-generated.ts` as source of truth
2. Extract one domain at a time to modular files
3. Update imports gradually
4. Test each migration

### Phase 3: Complete Migration (FUTURE)
1. All tables extracted to modular files
2. Update `index.ts` to export from modular files
3. Mark `supabase-generated.ts` as deprecated
4. Eventually remove monolithic file

## Usage

### Current (Backward Compatible)
```typescript
// Still works - imports from original file
import type { Database } from '@/types/supabase-generated'
```

### New Modular Way
```typescript
// Import everything (same as before)
import type { Database } from '@/types/supabase'

// Or import specific parts
import type { OrderStatus, PaymentMethod } from '@/types/supabase/enums'
import type { RecipesTable } from '@/types/supabase/tables/recipes'
```

## Benefits

1. **Better Organization**: Related tables grouped by domain
2. **Faster IDE**: Smaller files load faster
3. **Easier Navigation**: Find tables by feature
4. **Better Git**: Smaller diffs, fewer conflicts
5. **Type Safety**: Same type safety as before
6. **Backward Compatible**: No breaking changes

## Regenerating Types

When you run `supabase gen types typescript`:

1. It generates the monolithic file
2. You can optionally extract new tables to modular structure
3. Or keep using the monolithic file (both work)

## Example: Extracting a Domain

To extract "orders" domain:

1. Create `src/types/supabase/tables/orders.ts`
2. Copy OrdersTable, OrderItemsTable, PaymentsTable from generated file
3. Add proper imports (Json, enums)
4. Export from `tables/index.ts`
5. Update main `index.ts` to re-export

## Recommendation

**For now**: Keep using `supabase-generated.ts` as-is. The modular structure is ready when you need it.

**Future**: Gradually migrate as you work on each feature. No rush!

## Commands

```bash
# Generate types (creates monolithic file)
pnpm supabase:types

# The modular structure is manual organization
# You can extract tables as needed
```
