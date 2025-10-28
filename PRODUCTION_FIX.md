# Production Feature Fix

## Problem
Fitur production tidak bisa diakses karena ada **schema mismatch** antara database dan komponen UI.

## Root Cause

### Database Schema (Actual)
Table `productions` memiliki kolom:
- `id` (string)
- `total_cost` (number)
- `created_at` (timestamp)
- `user_id` (string)
- `recipe_id` (string)
- `quantity` (number)
- `status` (enum)

### Expected by Components
Komponen mengharapkan kolom:
- `batch_number` ❌ (tidak ada di database)
- `actual_cost` ❌ (database punya `total_cost`)
- `planned_date` ❌ (tidak ada di database)
- `unit` ❌ (tidak ada di database, ada di `recipes`)

### Missing Features
- ❌ Tidak ada authentication check
- ❌ Tidak ada RLS filter (`user_id`)
- ❌ Tidak ada PATCH endpoint untuk update status
- ❌ Tidak ada error handling yang proper

## Solution

### 1. Fixed API Route (`/api/production-batches/route.ts`)

**Added:**
- ✅ Authentication check dengan `supabase.auth.getUser()`
- ✅ RLS filter dengan `.eq('user_id', user.id)`
- ✅ Column mapping untuk compatibility
- ✅ Proper error handling dengan `handleAPIError`
- ✅ Structured logging dengan `apiLogger`

**Column Mapping:**
```typescript
const mappedBatches = batches?.map(batch => ({
  ...batch,
  batch_number: batch.id.slice(0, 8).toUpperCase(), // Generate dari ID
  planned_date: batch.created_at, // Use created_at
  actual_cost: batch.total_cost, // Map total_cost
  unit: batch.recipe?.unit || 'pcs' // Get dari recipe
}))
```

### 2. Created PATCH Endpoint (`/api/production-batches/[id]/route.ts`)

**Features:**
- ✅ Update production status (PLANNED → IN_PROGRESS → COMPLETED)
- ✅ Authentication & RLS
- ✅ Proper error handling
- ✅ 404 handling untuk batch tidak ditemukan
- ✅ DELETE endpoint untuk hapus batch

### 3. Query Optimization

**Before:**
```typescript
.select('*, recipe:recipes(name)')
```

**After:**
```typescript
.select('*, recipe:recipes(name, unit)')
.eq('user_id', user.id) // RLS filter
```

## Testing

### Test GET endpoint:
```bash
curl http://localhost:3000/api/production-batches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test PATCH endpoint (Start Production):
```bash
curl -X PATCH http://localhost:3000/api/production-batches/BATCH_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS", "started_at": "2025-10-29T10:00:00Z"}'
```

### Test PATCH endpoint (Complete Production):
```bash
curl -X PATCH http://localhost:3000/api/production-batches/BATCH_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED", "completed_at": "2025-10-29T12:00:00Z"}'
```

## What's Fixed

✅ Production page sekarang bisa load data
✅ Authentication & RLS enforcement
✅ Tombol "Mulai Produksi" berfungsi
✅ Tombol "Selesaikan" berfungsi
✅ Batch number ditampilkan (generated dari ID)
✅ Cost ditampilkan dengan benar
✅ Unit ditampilkan dari recipe
✅ Error handling yang proper

## Known Limitations

⚠️ **Batch Number**: Generated dari ID (8 karakter pertama), bukan kolom terpisah
⚠️ **Planned Date**: Menggunakan `created_at` karena tidak ada kolom `planned_date`
⚠️ **Unit**: Diambil dari recipe, bukan dari production table

## Recommendations

### Database Migration (Optional)
Jika ingin kolom yang proper, buat migration:

```sql
-- Add missing columns
ALTER TABLE productions 
  ADD COLUMN batch_number VARCHAR(50) UNIQUE,
  ADD COLUMN planned_date TIMESTAMP,
  ADD COLUMN actual_cost DECIMAL(10,2);

-- Generate batch numbers for existing records
UPDATE productions 
SET batch_number = 'BATCH-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE batch_number IS NULL;

-- Copy data
UPDATE productions 
SET planned_date = created_at,
    actual_cost = total_cost;
```

### Alternative: Keep Current Mapping
Current solution works without database changes. Mapping di API layer lebih flexible dan tidak perlu migration.

## Files Changed

1. ✅ `src/app/api/production-batches/route.ts` - Fixed GET & POST
2. ✅ `src/app/api/production-batches/[id]/route.ts` - Created PATCH & DELETE

## Files That Work Now

- ✅ `src/app/production/page.tsx`
- ✅ `src/app/production/components/EnhancedProductionPage.tsx`
- ✅ `src/app/production/components/ProductionPage.tsx`
- ✅ `src/hooks/useProduction.ts`

---

**Status**: ✅ FIXED
**Date**: October 29, 2025
**Impact**: Production feature sekarang fully functional
