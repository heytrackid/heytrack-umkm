# Analisis File Duplicate di Codebase

**Tanggal Scan:** 29 Oktober 2025  
**Status:** ✅ Selesai

## 🔴 File Duplicate yang Ditemukan

### 1. Supabase Client Files (DUPLICATE)

**File:**
- `src/lib/supabase-client.ts` (1,234 lines)
- `src/lib/supabase-client-typed.ts` (45 lines)

**Masalah:**
- Kedua file memiliki fungsi yang overlap
- `supabase-client-typed.ts` hanya berisi type helpers yang sudah ada di `supabase-client.ts`
- Menyebabkan confusion tentang file mana yang harus digunakan

**Rekomendasi:**
```typescript
// ❌ HAPUS: src/lib/supabase-client-typed.ts
// Semua type helpers sudah ada di supabase-client.ts

// ✅ GUNAKAN: src/lib/supabase-client.ts
import { typedInsert, typedUpdate, TableRow } from '@/lib/supabase-client'
```

**Action:**
- [ ] Hapus `src/lib/supabase-client-typed.ts`
- [ ] Update semua import yang menggunakan file tersebut
- [ ] Gunakan hanya `src/lib/supabase-client.ts`

---

### 2. Validation Schemas (MULTIPLE DUPLICATES)

#### A. Pagination Schema (3x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `PaginationQuerySchema`
2. `src/lib/validations/api-validations.ts` - `PaginationSchema` (line 119)
3. `src/lib/validations/api-validations.ts` - `PaginationParamsSchema` (line 207)
4. `src/lib/validations/domains/common.ts` - `PaginationQuerySchema`

**Masalah:**
- 4 schema berbeda untuk hal yang sama
- Menyebabkan inconsistency di API routes

**Rekomendasi:**
```typescript
// ✅ GUNAKAN HANYA INI (dari domains/common.ts)
import { PaginationQuerySchema } from '@/lib/validations/domains/common'

// ❌ HAPUS yang lain dari api-validations.ts
```

#### B. Date Range Schema (2x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `DateRangeQuerySchema`
2. `src/lib/validations/api-validations.ts` - `DateRangeSchema` (line 202)

**Rekomendasi:**
- Gunakan `DateRangeQuerySchema` untuk API query params
- Hapus `DateRangeSchema`

#### C. Customer Schema (2x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `CustomerFormSchema`
2. `src/lib/validations/form-validations.ts` - `CustomerSchema`
3. `src/lib/validations/domains/customer.ts` - `CustomerInsertSchema`

**Rekomendasi:**
```typescript
// ✅ GUNAKAN domain schema sebagai source of truth
import { CustomerInsertSchema } from '@/lib/validations/domains/customer'

// API schema extend domain schema
export const CreateCustomerAPISchema = CustomerInsertSchema.extend({
  // API-specific fields only
})
```

#### D. Order Schema (2x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `OrderFormSchema`
2. `src/lib/validations/form-validations.ts` - `OrderSchema`
3. `src/lib/validations/domains/order.ts` - `OrderInsertSchema`

**Rekomendasi:**
- Sama seperti Customer schema
- Gunakan domain schema sebagai base

#### E. Ingredient Schema (2x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `IngredientFormSchema`
2. `src/lib/validations/form-validations.ts` - `IngredientSchema`
3. `src/lib/validations/domains/ingredient.ts` - `IngredientInsertSchema`

**Rekomendasi:**
- Sama seperti di atas
- Gunakan domain schema

#### F. Recipe Schema (2x duplicate)

**Lokasi:**
1. `src/lib/validations/api-validations.ts` - `RecipeFormSchema`
2. `src/lib/validations/form-validations.ts` - `RecipeSchema`
3. `src/lib/validations/domains/recipe.ts` - `RecipeInsertSchema`

**Rekomendasi:**
- Sama seperti di atas

---

### 3. Type Helper Files (OVERLAP)

**File:**
- `src/lib/supabase/typed-insert.ts`
- `src/lib/supabase/insert-helpers.ts`
- `src/lib/supabase/type-helpers.ts`

**Masalah:**
- Semua file memiliki fungsi helper untuk insert/update
- Tidak jelas mana yang harus digunakan

**Rekomendasi:**
```typescript
// ✅ KONSOLIDASI ke satu file
// src/lib/supabase/helpers.ts

export { typedInsert, typedUpdate } from '@/lib/supabase-client'
export { safeInsert, safeUpdate } from '@/lib/supabase/type-helpers'
```

---

## 📊 Summary Duplicate Files

| Category | Files | Status | Priority |
|----------|-------|--------|----------|
| Supabase Client | 2 files | 🔴 Duplicate | HIGH |
| Validation Schemas | 15+ duplicates | 🔴 Duplicate | HIGH |
| Type Helpers | 3 files | 🟡 Overlap | MEDIUM |

---

## 🎯 Action Plan

### Phase 1: Hapus File Duplicate (HIGH PRIORITY)

1. **Hapus `supabase-client-typed.ts`**
   ```bash
   rm src/lib/supabase-client-typed.ts
   ```

2. **Update imports yang menggunakan file tersebut**
   ```bash
   # Find all imports
   grep -r "supabase-client-typed" src/
   
   # Replace with supabase-client
   ```

### Phase 2: Konsolidasi Validation Schemas (HIGH PRIORITY)

1. **Hapus duplicate schemas dari `api-validations.ts`**
   - Hapus: `PaginationSchema`, `PaginationParamsSchema`
   - Hapus: `DateRangeSchema`
   - Hapus: Form schemas (Customer, Order, Ingredient, Recipe)

2. **Update semua imports**
   ```typescript
   // ❌ Before
   import { CustomerFormSchema } from '@/lib/validations/api-validations'
   
   // ✅ After
   import { CustomerInsertSchema } from '@/lib/validations/domains/customer'
   ```

3. **Buat API schemas yang extend domain schemas**
   ```typescript
   // src/lib/validations/api/customer.ts
   import { CustomerInsertSchema } from '@/lib/validations/domains/customer'
   
   export const CreateCustomerAPISchema = CustomerInsertSchema.extend({
     client_timestamp: z.string().datetime().optional(),
   })
   ```

### Phase 3: Konsolidasi Type Helpers (MEDIUM PRIORITY)

1. **Buat file konsolidasi**
   ```typescript
   // src/lib/supabase/helpers.ts
   export * from '@/lib/supabase-client'
   export * from '@/lib/supabase/type-helpers'
   ```

2. **Deprecate old files**
   - Add deprecation notice
   - Gradually migrate imports

---

## 🚀 Realtime Status

### ✅ Realtime Enabled untuk Tabel:

1. **Core Tables:**
   - ✅ `ingredients` - Real-time stock updates
   - ✅ `recipes` - Recipe changes
   - ✅ `recipe_ingredients` - Ingredient composition changes
   - ✅ `customers` - Customer data updates

2. **Order Management:**
   - ✅ `orders` - Order status changes
   - ✅ `order_items` - Order item updates
   - ✅ `stock_transactions` - Inventory movements

3. **Production:**
   - ✅ `productions` - Production tracking
   - ✅ `production_batches` - Batch production updates

4. **HPP & Analytics:**
   - ✅ `hpp_snapshots` - HPP calculations
   - ✅ `hpp_alerts` - Cost alerts

5. **Notifications:**
   - ✅ `inventory_alerts` - Low stock alerts
   - ✅ `notifications` - System notifications

### 📡 Cara Menggunakan Realtime:

```typescript
// Example: Subscribe to order updates
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}` // RLS filter
    },
    (payload) => {
      console.log('Order changed:', payload)
      // Update UI
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

---

## 📝 Notes

1. **Validation Schema Strategy:**
   - Domain schemas = Source of truth (database structure)
   - API schemas = Extend domain schemas with API-specific fields
   - Form schemas = Extend domain schemas with UI-specific validation

2. **File Organization:**
   - Keep domain logic in `src/lib/validations/domains/`
   - API-specific logic in `src/lib/validations/api/`
   - Form-specific logic in `src/lib/validations/forms/`

3. **Migration Strategy:**
   - Don't break existing code
   - Add deprecation warnings
   - Gradually migrate imports
   - Remove old files after migration complete

---

**Last Updated:** 29 Oktober 2025  
**Next Review:** After Phase 1 & 2 complete
