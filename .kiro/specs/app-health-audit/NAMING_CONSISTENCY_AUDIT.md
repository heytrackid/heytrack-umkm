# Audit Konsistensi Naming dengan Supabase Database

**Tanggal:** 23 Oktober 2025  
**Status:** Ditemukan 5 inkonsistensi naming

---

## 🔴 Critical Naming Issues

### 1. Table `recipes` vs `resep` ❌

**Database:** Menggunakan `resep` (Bahasa Indonesia)
**Code:** Beberapa file menggunakan `recipes` (Bahasa Inggris)

**Lokasi Masalah:**
```typescript
// ❌ SALAH - src/app/api/recipes/[id]/route.ts
.from('recipes')  // Table tidak ada!

// ❌ SALAH - src/app/api/reports/profit/route.ts
.from('recipes')  // Table tidak ada!

// ✅ BENAR - Seharusnya
.from('resep')
```

**Impact:** 
- API `/api/recipes` akan error
- Profit report akan error
- Data tidak bisa diambil

**Tables yang Benar di Database:**
- `resep` (recipes table)
- `resep_item` (recipe ingredients table)

---

### 2. Table `recipe_ingredients` vs `resep_item` ❌

**Database:** Menggunakan `resep_item`
**Code:** Menggunakan `recipe_ingredients`

**Lokasi Masalah:**
```typescript
// ❌ SALAH - src/app/api/recipes/[id]/route.ts
.from('recipe_ingredients')  // Table tidak ada!

// ✅ BENAR - Seharusnya
.from('resep_item')
```

---

### 3. Table `expenses` vs `financial_transactions` ❌

**Database:** Menggunakan `financial_transactions`
**Code:** Menggunakan `expenses`

**Lokasi Masalah:**
```typescript
// ❌ SALAH - Multiple files
.from('expenses')  // Table tidak ada!

// Files affected:
// - src/app/api/reports/cash-flow/route.ts
// - src/app/api/orders/route.ts
// - src/app/api/orders/[id]/status/route.ts
// - src/app/api/reports/profit/route.ts

// ✅ BENAR - Seharusnya
.from('financial_transactions')
```

**Impact:**
- Cash flow report error
- Order creation dengan income record error
- Profit report error

---

### 4. Table `production_batches` vs `production_log` ❌

**Database:** Menggunakan `production_log`
**Code:** Menggunakan `production_batches`

**Lokasi Masalah:**
```typescript
// ❌ SALAH - src/app/api/production-batches/[id]/route.ts
.from('production_batches')  // Table tidak ada!

// ✅ BENAR - Seharusnya
.from('production_log')
```

---

### 5. Tables yang Tidak Ada di Database ❌

**Code menggunakan tables yang tidak exist:**

```typescript
// ❌ Table tidak ada di database
.from('notifications')        // Tidak ada di schema
.from('whatsapp_templates')   // Tidak ada di schema
```

**Files affected:**
- `src/app/api/notifications/route.ts`
- `src/app/api/whatsapp-templates/route.ts`
- `src/app/api/whatsapp-templates/[id]/route.ts`

---

## 📊 Mapping Table Names

### Correct Mapping (Database → Code)

| Database Table | Code Should Use | Currently Using (WRONG) |
|----------------|-----------------|-------------------------|
| `resep` | `resep` | ❌ `recipes` |
| `resep_item` | `resep_item` | ❌ `recipe_ingredients` |
| `financial_transactions` | `financial_transactions` | ❌ `expenses` |
| `production_log` | `production_log` | ❌ `production_batches` |
| `bahan_baku` | `bahan_baku` | ✅ Correct |
| `orders` | `orders` | ✅ Correct |
| `order_items` | `order_items` | ✅ Correct |
| `customers` | `customers` | ✅ Correct |
| `biaya_operasional` | `biaya_operasional` | ✅ Correct |

---

## 🔧 Required Fixes

### Fix 1: Update Recipes API

**File:** `src/app/api/recipes/[id]/route.ts`

```typescript
// BEFORE (WRONG)
.from('recipes')
.from('recipe_ingredients')

// AFTER (CORRECT)
.from('resep')
.from('resep_item')
```

**Also update:**
- `src/app/api/recipes/route.ts`
- Any other files referencing recipes

---

### Fix 2: Update Financial Transactions

**Files to fix:**
- `src/app/api/reports/cash-flow/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/status/route.ts`
- `src/app/api/reports/profit/route.ts`

```typescript
// BEFORE (WRONG)
.from('expenses')

// AFTER (CORRECT)
.from('financial_transactions')
```

**Also update column names:**
```typescript
// BEFORE
expense_date, expense_type, expense_category

// AFTER (check database schema)
tanggal, jenis, kategori
```

---

### Fix 3: Update Production API

**File:** `src/app/api/production-batches/[id]/route.ts`

```typescript
// BEFORE (WRONG)
.from('production_batches')

// AFTER (CORRECT)
.from('production_log')
```

**Also update:**
- Rename folder from `production-batches` to `production-log`
- Update all references

---

### Fix 4: Remove or Create Missing Tables

**Option A:** Create missing tables in Supabase
```sql
-- If you need notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If you need whatsapp_templates
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  category TEXT,
  template TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Option B:** Remove unused API endpoints
- Delete `src/app/api/notifications/`
- Delete `src/app/api/whatsapp-templates/`

---

## 🎯 Column Name Consistency

### Database Column Names (Indonesian)

Most tables use Indonesian column names:
- `nama` (not `name`)
- `tanggal` (not `date`)
- `harga_per_satuan` (not `price_per_unit`)
- `stok_tersedia` (not `stock_available`)
- `nama_bahan` (not `ingredient_name`)

### Code Should Match Database

Ensure your code uses the exact column names from database:

```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('bahan_baku')
  .select('nama_bahan, satuan, harga_per_satuan, stok_tersedia')

// ❌ WRONG
const { data } = await supabase
  .from('ingredients')
  .select('name, unit, price, stock')
```

---

## 📋 Complete Database Schema Reference

### Main Tables (with user_id for RLS)

1. **bahan_baku** (ingredients)
   - Columns: `id`, `nama_bahan`, `satuan`, `harga_per_satuan`, `stok_tersedia`, `user_id`

2. **resep** (recipes)
   - Columns: `id`, `nama`, `yield_pcs`, `user_id`

3. **resep_item** (recipe ingredients)
   - Columns: `id`, `resep_id`, `bahan_id`, `qty_per_batch`, `user_id`

4. **orders**
   - Columns: `id`, `customer_id`, `customer_name`, `tanggal`, `total`, `metode_bayar`, `status_pembayaran`, `user_id`

5. **order_items**
   - Columns: `id`, `order_id`, `resep_id`, `nama_item`, `qty`, `harga_satuan`, `user_id`

6. **customers**
   - Columns: `id`, `nama`, `phone`, `alamat`, `user_id`

7. **financial_transactions**
   - Columns: `id`, `jenis`, `kategori`, `nominal`, `tanggal`, `referensi`, `user_id`

8. **biaya_operasional** (operational costs)
   - Columns: `id`, `nama_biaya`, `kategori`, `nominal_per_batch`, `user_id`

9. **production_log**
   - Columns: `id`, `resep_id`, `qty_produced`, `batches_produced`, `production_date`, `user_id`

10. **stock_ledger**
    - Columns: `id`, `bahan_id`, `qty`, `tipe`, `ref`, `user_id`

11. **hpp_snapshots**
    - Columns: `id`, `recipe_id`, `snapshot_date`, `hpp_value`, `material_cost`, `operational_cost`, `user_id`

12. **hpp_alerts**
    - Columns: `id`, `recipe_id`, `alert_type`, `severity`, `title`, `message`, `user_id`

---

## 🚨 Breaking Changes

These fixes will cause breaking changes. You need to:

1. **Update all API routes** to use correct table names
2. **Update frontend code** that calls these APIs
3. **Update types/interfaces** to match database schema
4. **Test all affected features** after changes

---

## ✅ Action Plan

### Priority 1 (Critical - Fix Now)
- [ ] Fix `recipes` → `resep` in all files
- [ ] Fix `recipe_ingredients` → `resep_item`
- [ ] Fix `expenses` → `financial_transactions`
- [ ] Fix `production_batches` → `production_log`

### Priority 2 (High - Fix Soon)
- [ ] Verify all column names match database
- [ ] Update TypeScript types to match schema
- [ ] Add type safety with database types

### Priority 3 (Medium - Consider)
- [ ] Decide on notifications table (create or remove)
- [ ] Decide on whatsapp_templates table (create or remove)
- [ ] Standardize naming convention (all Indonesian or all English)

---

## 🛠️ Quick Fix Script

```bash
# Find all incorrect table references
grep -r "\.from('recipes')" src/app/api/
grep -r "\.from('recipe_ingredients')" src/app/api/
grep -r "\.from('expenses')" src/app/api/
grep -r "\.from('production_batches')" src/app/api/

# Replace (use with caution!)
find src/app/api -type f -name "*.ts" -exec sed -i '' "s/\.from('recipes')/\.from('resep')/g" {} +
find src/app/api -type f -name "*.ts" -exec sed -i '' "s/\.from('recipe_ingredients')/\.from('resep_item')/g" {} +
find src/app/api -type f -name "*.ts" -exec sed -i '' "s/\.from('expenses')/\.from('financial_transactions')/g" {} +
find src/app/api -type f -name "*.ts" -exec sed -i '' "s/\.from('production_batches')/\.from('production_log')/g" {} +
```

---

## 📊 Impact Analysis

| Issue | Affected APIs | Severity | Users Impacted |
|-------|---------------|----------|----------------|
| recipes → resep | /api/recipes/* | 🔴 Critical | All recipe features broken |
| recipe_ingredients → resep_item | /api/recipes/* | 🔴 Critical | Recipe creation/edit broken |
| expenses → financial_transactions | /api/orders/*, /api/reports/* | 🔴 Critical | Orders, reports broken |
| production_batches → production_log | /api/production-batches/* | 🟡 High | Production tracking broken |
| Missing tables | /api/notifications/*, /api/whatsapp-templates/* | 🟢 Medium | Features don't work |

**Estimated Fix Time:** 2-3 hours
**Testing Time:** 1-2 hours
**Total Downtime:** Minimal if done carefully

---

## 🎯 Recommendation

**Immediate Action Required:**

1. Fix table name mismatches (Priority 1)
2. Test all affected endpoints
3. Update frontend code if needed
4. Deploy fixes

**Long-term:**

1. Generate TypeScript types from Supabase schema
2. Use type-safe queries
3. Add integration tests
4. Document naming conventions

---

**Status:** ⚠️ CRITICAL - Requires immediate attention
**Next Steps:** Start with Priority 1 fixes
