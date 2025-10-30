# Stock Calculation Duplication Fix

**Date:** January 30, 2025  
**Status:** ✅ COMPLETED

## 🚨 Problem Identified

Aplikasi mengalami **duplikasi perhitungan stock** yang menyebabkan:
- Stock bertambah 2x lipat saat purchase
- Stock berkurang 2-3x lipat saat order confirmation
- Data inventory tidak akurat

## 🔍 Root Cause Analysis

### Issue 1: Triple Stock Update pada Ingredient Purchase

**Flow Sebelumnya:**
1. API `ingredient-purchases/[id]` melakukan **manual update** `current_stock`
2. API insert record ke `stock_transactions`
3. Database trigger `update_stock_on_transaction` **auto-update** `current_stock` lagi

**Result:** Stock bertambah 2x lipat! ❌

### Issue 2: Triple Stock Deduction pada Order Confirmation

**Flow Sebelumnya:**
1. Database trigger `consume_ingredients_for_order`:
   - Update `current_stock` langsung
   - Insert ke `stock_transactions`
2. Trigger `update_stock_on_transaction` fire karena ada INSERT:
   - Update `current_stock` lagi!
3. Frontend manual call `InventoryUpdateService`:
   - Bisa update stock lagi

**Result:** Stock berkurang 2-3x lipat! ❌

---

## ✅ Solutions Implemented

### Fix 1: Remove Manual Stock Update dari ingredient-purchases API

**File:** `src/app/api/ingredient-purchases/[id]/route.ts`

**Before:**
```typescript
// ❌ Manual update stock
await supabase
  .from('ingredients')
  .update({ current_stock: newStock })
  .eq('id', ingredient_id)

// Then insert transaction
await supabase
  .from('stock_transactions')
  .insert(...)
```

**After:**
```typescript
// ✅ Only create transaction, trigger handles stock update
await supabase
  .from('stock_transactions')
  .insert({
    type: 'ADJUSTMENT',
    quantity: quantityDiff,
    // ...
  })
// Trigger update_stock_on_transaction will auto-update current_stock
```

---

### Fix 2: Disable Duplicate Trigger

**Migration:** `disable_duplicate_stock_trigger`

```sql
-- Drop problematic trigger
DROP TRIGGER IF EXISTS orders_consume_ingredients_trigger ON orders;
```

**Reason:** Trigger ini melakukan:
- Manual update `current_stock`
- Insert `stock_transactions`
- Yang trigger `update_stock_on_transaction` lagi (double update!)

---

### Fix 3: Update InventoryUpdateService

**File:** `src/modules/orders/services/InventoryUpdateService.ts`

**Before:**
```typescript
// ❌ Manual update stock
await supabase
  .from('ingredients')
  .update({ current_stock: newStock })

// Then create transaction
await supabase
  .from('stock_transactions')
  .insert(...)
```

**After:**
```typescript
// ✅ Only create transaction
await supabase
  .from('stock_transactions')
  .insert({
    type: 'USAGE',
    quantity: usedQuantity,
    // ...
  })
// Trigger handles stock update automatically
```

---

### Fix 4: Remove Manual Inventory Call dari Frontend

**File:** `src/components/orders/useOrders.ts`

**Before:**
```typescript
// ❌ Manual inventory update call
if (newStatus === 'DELIVERED') {
  await fetch('/api/inventory/auto-update', ...)
}
```

**After:**
```typescript
// ✅ Removed - API route handles via automation workflow
// No manual call needed
```

---

### Fix 5: Fix Stock Transaction Trigger Logic

**Migration:** `fix_stock_transaction_trigger`

**Updated Function:** `update_ingredient_stock()`

```sql
CREATE OR REPLACE FUNCTION public.update_ingredient_stock()
RETURNS trigger AS $$
BEGIN
    -- PURCHASE/positive ADJUSTMENT: INCREASE stock
    IF NEW.type = 'PURCHASE' OR (NEW.type = 'ADJUSTMENT' AND NEW.quantity > 0) THEN
        UPDATE ingredients
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.ingredient_id;
    
    -- USAGE/WASTE/negative ADJUSTMENT: DECREASE stock
    ELSIF NEW.type = 'USAGE' OR NEW.type = 'WASTE' OR (NEW.type = 'ADJUSTMENT' AND NEW.quantity < 0) THEN
        UPDATE ingredients
        SET current_stock = GREATEST(0, current_stock - ABS(NEW.quantity))
        WHERE id = NEW.ingredient_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Key Changes:**
- Handle positive/negative ADJUSTMENT correctly
- USAGE type now properly decreases stock
- Ensure stock never goes below 0

---

### Fix 6: Update Automation Workflows

**File:** `src/lib/automation/workflows/order-workflows.ts`

**Before:**
```typescript
// ❌ Manual stock update
await supabase
  .from('ingredients')
  .update({ current_stock: newStock })

await supabase
  .from('stock_transactions')
  .insert(...)
```

**After:**
```typescript
// ✅ Only create transaction
await supabase
  .from('stock_transactions')
  .insert({
    type: 'USAGE',
    quantity: usedQuantity,
    // ...
  })
// Trigger handles stock update
```

---

## 🎯 New Architecture

### Single Source of Truth: Database Trigger

```
┌─────────────────────────────────────────────────┐
│         Application Layer (API/Service)         │
│                                                  │
│  ✅ Only creates stock_transactions records     │
│  ❌ Never updates current_stock directly        │
└─────────────────┬───────────────────────────────┘
                  │
                  │ INSERT stock_transaction
                  ▼
┌─────────────────────────────────────────────────┐
│           Database Trigger Layer                │
│                                                  │
│  Trigger: update_stock_on_transaction           │
│  ✅ Automatically updates current_stock         │
│  ✅ Handles PURCHASE, USAGE, ADJUSTMENT         │
│  ✅ Ensures stock >= 0                          │
└─────────────────────────────────────────────────┘
```

### Stock Transaction Types

| Type | Quantity Sign | Effect on Stock |
|------|---------------|-----------------|
| `PURCHASE` | Positive | Increases stock |
| `USAGE` | Positive | Decreases stock |
| `WASTE` | Positive | Decreases stock |
| `ADJUSTMENT` (positive) | Positive | Increases stock |
| `ADJUSTMENT` (negative) | Negative | Decreases stock |

---

## 📊 Impact Analysis

### Before Fix

| Operation | Expected | Actual | Issue |
|-----------|----------|--------|-------|
| Purchase 10 units | +10 | +20 | 2x increase |
| Order uses 5 units | -5 | -10 to -15 | 2-3x decrease |
| Cancel order | +5 | +10 | 2x increase |

### After Fix

| Operation | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Purchase 10 units | +10 | +10 | ✅ Correct |
| Order uses 5 units | -5 | -5 | ✅ Correct |
| Cancel order | +5 | +5 | ✅ Correct |

---

## 🧪 Testing Checklist

- [x] Purchase ingredient - stock increases correctly
- [x] Update purchase quantity - stock adjusts correctly
- [x] Delete purchase - stock reverts correctly
- [x] Order confirmation - stock decreases correctly
- [x] Order cancellation - stock restores correctly
- [x] Multiple orders - no duplicate deductions
- [x] Concurrent operations - no race conditions

---

## 📝 Migration Steps Applied

1. ✅ `disable_duplicate_stock_trigger` - Removed problematic trigger
2. ✅ `fix_stock_transaction_trigger` - Fixed trigger logic
3. ✅ Updated API routes - Removed manual stock updates
4. ✅ Updated services - Use transaction-only approach
5. ✅ Updated workflows - Consistent with new architecture
6. ✅ Updated frontend - Removed manual calls

---

## 🔒 Prevention Guidelines

### DO ✅

1. **Always create stock_transactions** for any stock change
2. **Let trigger handle** `current_stock` updates
3. **Use correct transaction type**:
   - PURCHASE for buying ingredients
   - USAGE for order consumption
   - ADJUSTMENT for manual corrections
   - WASTE for spoilage/damage

### DON'T ❌

1. **Never manually update** `current_stock` in application code
2. **Never create multiple transactions** for same operation
3. **Never bypass** the trigger system
4. **Never assume** stock update happened without transaction

---

## 🎓 Key Learnings

1. **Single Responsibility**: Database triggers should be the ONLY place that updates stock
2. **Audit Trail**: Every stock change MUST have a transaction record
3. **Idempotency**: Operations should be safe to retry without duplication
4. **Testing**: Always test with real data flow, not just unit tests

---

## 📚 Related Files

### Modified Files
- `src/app/api/ingredient-purchases/[id]/route.ts`
- `src/modules/orders/services/InventoryUpdateService.ts`
- `src/components/orders/useOrders.ts`
- `src/lib/automation/workflows/order-workflows.ts`

### Database Migrations
- `supabase/migrations/*_disable_duplicate_stock_trigger.sql`
- `supabase/migrations/*_fix_stock_transaction_trigger.sql`

### Documentation
- This file: `STOCK_CALCULATION_FIX.md`

---

## ✅ Verification

To verify the fix is working:

```sql
-- Check stock transaction trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'update_stock_on_transaction';

-- Check problematic trigger is removed
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'orders_consume_ingredients_trigger';
-- Should return 0 rows

-- Test stock calculation
SELECT 
  i.name,
  i.current_stock,
  COUNT(st.id) as transaction_count,
  SUM(CASE WHEN st.type = 'PURCHASE' THEN st.quantity ELSE 0 END) as total_purchased,
  SUM(CASE WHEN st.type = 'USAGE' THEN st.quantity ELSE 0 END) as total_used
FROM ingredients i
LEFT JOIN stock_transactions st ON st.ingredient_id = i.id
GROUP BY i.id, i.name, i.current_stock;
```

---

**Status:** ✅ All fixes implemented and tested  
**Next Steps:** Monitor production for 24-48 hours to ensure stability
