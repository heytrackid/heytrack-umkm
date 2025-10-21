# 🔍 Schema Mapping Analysis Report

**Date:** October 21, 2025  
**Database:** HeyTrack Project (Supabase)  
**Status:** ⚠️ Issues Found

---

## 📊 Summary

| Category | Count | Status |
|----------|-------|--------|
| **Total Tables** | 27 | ✅ |
| **Missing in Types** | 2 | ⚠️ |
| **Column Mismatches** | 5 | ⚠️ |
| **Type Mismatches** | 3 | ⚠️ |
| **Missing user_id** | 0 | ✅ |

---

## ⚠️ Issues Found

### 1. Missing Tables in Types

#### ❌ `inventory_reorder_rules` Table
**Database Schema:**
```typescript
{
  id: uuid
  ingredient_id: uuid (unique)
  reorder_point: numeric
  reorder_quantity: numeric
  is_active: boolean
  created_at: timestamptz
  updated_at: timestamptz
  user_id: uuid
}
```

**Status:** ⚠️ **NOT DEFINED** in `src/types/`

**Impact:** Medium - Auto-reorder feature tidak bisa digunakan

---

#### ❌ `ingredient_purchases` Table
**Database Schema:**
```typescript
{
  id: uuid
  ingredient_id: uuid
  quantity: numeric
  unit_price: numeric
  total_price: numeric
  supplier: text
  purchase_date: date
  notes: text
  created_at: timestamptz
  updated_at: timestamptz
  expense_id: uuid (nullable)
  cost_per_unit: numeric (nullable)
  user_id: uuid
}
```

**Status:** ⚠️ **NOT DEFINED** in `src/types/`

**Impact:** High - Purchase tracking tidak bisa digunakan

---

#### ❌ `operational_costs` Table
**Database Schema:**
```typescript
{
  id: uuid
  category: varchar
  amount: numeric
  description: text
  date: date
  reference: varchar (nullable)
  payment_method: varchar (nullable)
  supplier: varchar (nullable)
  recurring: boolean
  frequency: varchar (nullable)
  notes: text (nullable)
  created_by: uuid (nullable)
  updated_by: uuid (nullable)
  created_at: timestamptz
  updated_at: timestamptz
  user_id: uuid
}
```

**Status:** ⚠️ **NOT DEFINED** in `src/types/`

**Impact:** High - Operational costs tracking tidak bisa digunakan

---

### 2. Column Mismatches

#### ⚠️ `stock_transactions` Table

**Database has:**
- `ingredient_name` - ❌ **MISSING** in types
- `unit` - ❌ **MISSING** in types  
- `total_value` - ❌ **MISSING** in types
- `reason` - ❌ **MISSING** in types

**Current Types:**
```typescript
{
  id: string
  ingredient_id: string
  type: TransactionType
  quantity: number
  unit_price: number | null
  total_price: number | null  // Should be total_value
  reference: string | null
  notes: string | null
  created_at: string | null
  created_by: string | null
  user_id: string
}
```

**Should be:**
```typescript
{
  id: string
  ingredient_id: string
  ingredient_name: string  // ✅ ADD
  type: TransactionType
  quantity: number
  unit: string  // ✅ ADD
  unit_price: number | null
  total_value: number | null  // ✅ RENAME from total_price
  reference: string | null
  reason: string | null  // ✅ ADD
  notes: string | null
  created_at: string | null
  created_by: string | null
  user_id: string
}
```

---

#### ⚠️ `expenses` Table

**Database has:**
- `reference_type` - ❌ **MISSING** in types
- `reference_id` - ❌ **MISSING** in types
- `user_id` - ❌ **MISSING** in types

**Current Types:** Missing these fields

**Should add:**
```typescript
{
  // ... existing fields
  reference_type: string | null  // ✅ ADD
  reference_id: string | null    // ✅ ADD
  user_id: string                // ✅ ADD
}
```

---

#### ⚠️ `whatsapp_templates` Table

**Database has:**
- `user_id` - ❌ **MISSING** in types

**Current Types:**
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
  // user_id: MISSING!
}
```

**Should add:**
```typescript
{
  // ... existing fields
  user_id: string  // ✅ ADD
}
```

---

### 3. Type Mismatches

#### ⚠️ `customers.average_order_value`

**Database:** `numeric` (nullable) - ❌ **MISSING** in schema  
**Types:** Not defined

**Should add:**
```typescript
{
  // ... existing fields
  average_order_value: number | null  // ✅ ADD
}
```

---

## ✅ Correct Mappings

### Tables with Correct Mapping:
1. ✅ `ingredients` - All columns match
2. ✅ `recipes` - All columns match
3. ✅ `recipe_ingredients` - All columns match
4. ✅ `customers` - Mostly correct (missing average_order_value)
5. ✅ `orders` - All columns match
6. ✅ `order_items` - All columns match
7. ✅ `productions` - All columns match
8. ✅ `payments` - All columns match
9. ✅ `financial_records` - All columns match
10. ✅ `inventory_alerts` - All columns match
11. ✅ `usage_analytics` - All columns match
12. ✅ `production_schedules` - All columns match
13. ✅ `suppliers` - All columns match
14. ✅ `supplier_ingredients` - All columns match
15. ✅ `sync_events` - All columns match
16. ✅ `system_metrics` - All columns match
17. ✅ `inventory_stock_logs` - All columns match
18. ✅ `daily_sales_summary` - All columns match
19. ✅ `notifications` - All columns match
20. ✅ `user_profiles` - All columns match
21. ✅ `app_settings` - All columns match

---

## 🎯 Action Items

### Priority 1: Critical (Add Missing Tables)
1. ⚠️ Add `inventory_reorder_rules` type definition
2. ⚠️ Add `ingredient_purchases` type definition
3. ⚠️ Add `operational_costs` type definition

### Priority 2: High (Fix Column Mismatches)
4. ⚠️ Update `stock_transactions` type
   - Add `ingredient_name: string`
   - Add `unit: string`
   - Rename `total_price` → `total_value`
   - Add `reason: string | null`

5. ⚠️ Update `expenses` type
   - Add `reference_type: string | null`
   - Add `reference_id: string | null`
   - Add `user_id: string`

6. ⚠️ Update `whatsapp_templates` type
   - Add `user_id: string`

### Priority 3: Medium (Add Missing Columns)
7. ⚠️ Update `customers` type
   - Add `average_order_value: number | null`

---

## 📝 Implementation Plan

### Step 1: Create Missing Type Files

**File:** `src/types/inventory-reorder.ts`
```typescript
export type InventoryReorderRulesTable = {
  Row: {
    id: string
    ingredient_id: string
    reorder_point: number
    reorder_quantity: number
    is_active: boolean | null
    created_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id: string
    reorder_point?: number
    reorder_quantity?: number
    is_active?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string
    reorder_point?: number
    reorder_quantity?: number
    is_active?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "inventory_reorder_rules_ingredient_id_fkey"
      columns: ["ingredient_id"]
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "inventory_reorder_rules_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

**File:** `src/types/ingredient-purchases.ts`
```typescript
export type IngredientPurchasesTable = {
  Row: {
    id: string
    ingredient_id: string
    quantity: number
    unit_price: number
    total_price: number
    supplier: string | null
    purchase_date: string
    notes: string | null
    created_at: string
    updated_at: string
    expense_id: string | null
    cost_per_unit: number | null
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id: string
    quantity: number
    unit_price: number
    total_price: number
    supplier?: string | null
    purchase_date?: string
    notes?: string | null
    created_at?: string
    updated_at?: string
    expense_id?: string | null
    cost_per_unit?: number | null
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string
    quantity?: number
    unit_price?: number
    total_price?: number
    supplier?: string | null
    purchase_date?: string
    notes?: string | null
    created_at?: string
    updated_at?: string
    expense_id?: string | null
    cost_per_unit?: number | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
      columns: ["ingredient_id"]
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "ingredient_purchases_expense_id_fkey"
      columns: ["expense_id"]
      referencedRelation: "expenses"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "ingredient_purchases_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

**File:** `src/types/operational-costs.ts`
```typescript
export type OperationalCostsTable = {
  Row: {
    id: string
    category: string
    amount: number
    description: string
    date: string | null
    reference: string | null
    payment_method: string | null
    supplier: string | null
    recurring: boolean | null
    frequency: string | null
    notes: string | null
    created_by: string | null
    updated_by: string | null
    created_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    id?: string
    category: string
    amount: number
    description: string
    date?: string | null
    reference?: string | null
    payment_method?: string | null
    supplier?: string | null
    recurring?: boolean | null
    frequency?: string | null
    notes?: string | null
    created_by?: string | null
    updated_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    id?: string
    category?: string
    amount?: number
    description?: string
    date?: string | null
    reference?: string | null
    payment_method?: string | null
    supplier?: string | null
    recurring?: boolean | null
    frequency?: string | null
    notes?: string | null
    created_by?: string | null
    updated_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "operational_costs_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "operational_costs_created_by_fkey"
      columns: ["created_by"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "operational_costs_updated_by_fkey"
      columns: ["updated_by"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

### Step 2: Update Existing Types

Update files in `src/types/` to match database schema exactly.

### Step 3: Update Database Type

Add new tables to main Database type in `src/types/index.ts`.

---

## 🔧 Testing Checklist

After implementing fixes:

- [ ] TypeScript compilation passes
- [ ] All CRUD operations work for new tables
- [ ] Existing features still work
- [ ] No type errors in IDE
- [ ] Database queries return correct data
- [ ] Realtime subscriptions work

---

## 📊 Impact Assessment

### High Impact (Must Fix):
- ❌ `ingredient_purchases` - Purchase tracking broken
- ❌ `operational_costs` - Cost tracking broken
- ❌ `stock_transactions` columns - Transaction details incomplete

### Medium Impact (Should Fix):
- ⚠️ `inventory_reorder_rules` - Auto-reorder feature unavailable
- ⚠️ `expenses` missing fields - Linking broken
- ⚠️ `whatsapp_templates` missing user_id - Multi-user broken

### Low Impact (Nice to Have):
- ℹ️ `customers.average_order_value` - Analytics incomplete

---

## ✅ Verification

To verify schema matches database:
```bash
# Generate fresh types from Supabase
npx supabase gen types typescript --project-id vrrjoswzmlhkmmcfhicw > schema-fresh.ts

# Compare with current types
diff src/types/index.ts schema-fresh.ts
```

---

**Status:** ⚠️ **ACTION REQUIRED**  
**Priority:** HIGH - Fix before production deployment  
**Estimated Time:** 2-3 hours

---

**Last Updated:** October 21, 2025
