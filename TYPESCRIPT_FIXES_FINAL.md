# 🎯 TypeScript Fixes - Match Supabase Generated Types

## 📋 Database Schema Reference (from supabase-generated.ts)

### ✅ Orders Table (Actual Fields):
```typescript
{
  id: string
  order_no: string
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  customer_id: string | null
  order_date: string | null
  delivery_date: string | null
  delivery_time: string | null
  delivery_fee: number | null
  status: order_status | null
  payment_status: string | null
  payment_method: string | null
  priority: string | null
  discount: number | null
  tax_amount: number | null
  total_amount: number | null
  paid_amount: number | null
  notes: string | null
  special_instructions: string | null
  financial_record_id: string | null
  user_id: string
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}
```

**❌ TIDAK ADA:**
- `order_items` (harus pakai join atau `OrderWithRelations`)
- `subtotal`
- `currency`
- `tax_rate`
- `payment_terms_days`

### ✅ Order Items Table (Actual Fields):
```typescript
{
  id: string
  order_id: string
  recipe_id: string
  product_name: string | null
  quantity: number
  unit_price: number          // ✅ BUKAN 'price'
  total_price: number
  special_requests: string | null  // ✅ BUKAN 'notes'
  user_id: string
  updated_at: string | null
}
```

**❌ TIDAK ADA:**
- `price` (harus pakai `unit_price`)
- `notes` (harus pakai `special_requests`)

### ✅ Productions Table (Actual Fields):
```typescript
{
  id: string
  recipe_id: string
  quantity: number
  actual_quantity: number | null
  cost_per_unit: number
  total_cost: number
  labor_cost: number
  status: production_status | null
  started_at: string | null
  completed_at: string | null
  actual_end_time: string | null
  notes: string | null
  user_id: string
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}
```

**❌ TIDAK ADA:**
- `recipe_name` (harus pakai join dengan recipes table)
- `priority` (tidak ada di productions, ada di production_schedules)
- `estimated_duration` (tidak ada di productions, ada di production_schedules)
- `batch_number` (tidak ada di productions, ada di production_batches)
- `unit` (tidak ada di productions, ada di production_batches)

### ✅ Recipes Table (Actual Fields):
```typescript
{
  id: string
  name: string
  description: string | null
  servings: number | null
  prep_time: number | null      // ✅ DI DB
  cook_time: number | null      // ✅ DI DB
  instructions: string | null
  difficulty: string | null
  category: string | null
  image_url: string | null
  selling_price: number | null
  cost_per_unit: number | null
  margin_percentage: number | null
  batch_size: number | null
  is_active: boolean | null
  rating: number | null
  times_made: number | null
  total_revenue: number | null
  seasonal: boolean | null
  last_made_at: string | null
  previous_cost: number | null
  user_id: string
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}
```

**Note:** DB punya `prep_time` dan `cook_time`, tapi validation schema pakai `preparation_time` dan `cooking_time`

## 🔧 Files That Need Fixing:

### Priority 1 - Critical (Breaking Errors):

1. **components/orders/useOrders.ts**
   - ❌ Using `item.price` → ✅ Should be `item.unit_price`
   - ❌ Using `order.order_items` → ✅ Should use `OrderWithRelations` type

2. **components/orders/OrderSummaryCard.tsx**
   - ❌ Using `order.order_items` → ✅ Should use `OrderWithRelations` type

3. **components/production/components/BatchDetails.tsx**
   - ❌ Using `batch.recipe_name` → ✅ Should join with recipes table
   - ❌ Using `batch.priority` → ✅ Field doesn't exist
   - ❌ Using `batch.estimated_duration` → ✅ Field doesn't exist

4. **components/production/components/CompletedBatches.tsx**
   - ❌ Using `batch.recipe_name` → ✅ Should join with recipes table

5. **components/operational-costs/EnhancedOperationalCostsPage.tsx**
   - ❌ Using `delete` method → ✅ Should use `remove` method

### Priority 2 - Type Mismatches:

6. **components/orders/orders-table.tsx**
   - ❌ Using `payment_status` enum → ✅ It's a string, not enum

7. **components/orders/OrderStatusBadge.tsx**
   - ❌ Accessing `status.animate` → ✅ Property doesn't exist

## 📝 Fix Strategy:

### For Orders with Items:
```typescript
// ❌ Wrong
const items = order.order_items

// ✅ Correct - Use OrderWithRelations type
import type { OrderWithRelations } from '@/app/orders/types/orders.types'
const items = (order as OrderWithRelations).items
```

### For Order Item Price:
```typescript
// ❌ Wrong
const price = item.price

// ✅ Correct
const price = item.unit_price
```

### For Production with Recipe Name:
```typescript
// ❌ Wrong
const name = batch.recipe_name

// ✅ Correct - Need to join or fetch separately
const { data } = await supabase
  .from('productions')
  .select('*, recipe:recipes(name)')
  .eq('id', batchId)
  .single()

const name = data.recipe?.name
```

### For Operational Costs Delete:
```typescript
// ❌ Wrong
const { delete: deleteCost } = useSupabaseCRUD('operational_costs')

// ✅ Correct
const { remove: deleteCost } = useSupabaseCRUD('operational_costs')
```

## ✅ Already Fixed:

1. ✅ **orders/hooks/use-orders.ts** - Fixed `payment_terms_days`, `subtotal`, `discount_amount`
2. ✅ **components/forms/RecipeForm.tsx** - Fixed `prep_time` → `preparation_time`, `cook_time` → `cooking_time`
3. ✅ **components/orders/EnhancedOrderForm.tsx** - Fixed `order_items` → `items`, `price` → `unit_price`, `notes` → `special_requests`
4. ✅ **components/orders/OrderForm.tsx** - Fixed same as above
5. ✅ **components/orders/OrderDetailView.tsx** - Fixed `order_items` → `items`, `notes` → `special_requests`
6. ✅ **components/orders/OrdersList.tsx** - Fixed `order_items` → `items`
7. ✅ **hooks/supabase/useSupabaseCRUD.ts** - Added `read()` and `clearError()` methods

## 🎯 Next Steps:

1. Fix `useOrders.ts` - Change `price` to `unit_price`
2. Fix `OrderSummaryCard.tsx` - Use `OrderWithRelations`
3. Fix production components - Remove non-existent fields or add joins
4. Fix operational costs - Use `remove` instead of `delete`

## 📊 Error Count:
- **Current**: ~434 errors
- **Target**: <100 errors (only warnings)
