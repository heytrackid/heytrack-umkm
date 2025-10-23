# Design Document - Inventory Integration Fix

## Overview

Dokumen ini menjelaskan desain untuk memperbaiki integrasi antara kode aplikasi dan database Supabase untuk fitur inventory (bahan baku). Solusi yang dipilih adalah mengupdate kode aplikasi untuk menggunakan nama kolom Bahasa Indonesia yang sesuai dengan schema database yang sudah ada.

Pendekatan ini dipilih karena:
- Database sudah memiliki data production
- Konsisten dengan naming convention tabel lain (orders, customers menggunakan Bahasa Indonesia)
- Menghindari migration yang berisiko
- Lebih mudah maintain karena satu source of truth (database schema)

## Architecture

### Current State (Broken)

```
Frontend (Inggris) → API (Inggris) → Database (Indonesia)
     ❌ Mismatch         ❌ Mismatch
```

### Target State (Fixed)

```
Frontend (Indonesia) → API (Indonesia) → Database (Indonesia)
     ✅ Match              ✅ Match
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/app/ingredients/page.tsx                        │   │
│  │  - Display inventory list                            │   │
│  │  - Stats cards (total, low stock, value)            │   │
│  │  - Uses Indonesian field names                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/components/crud/ingredients-crud.tsx            │   │
│  │  - CRUD operations UI                                │   │
│  │  - Form with Indonesian labels                       │   │
│  │  - Uses Indonesian field names                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Hooks Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/hooks/useSupabaseCRUD.ts                        │   │
│  │  - useIngredients() → useBahanBaku()                 │   │
│  │  - Uses table name 'bahan_baku'                      │   │
│  │  - Returns Indonesian field structure                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/app/api/ingredients/route.ts                    │   │
│  │  - GET /api/ingredients                              │   │
│  │  - POST /api/ingredients                             │   │
│  │  - Uses 'bahan_baku' table                           │   │
│  │  - Indonesian field names in queries                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/app/api/ingredients/[id]/route.ts               │   │
│  │  - GET /api/ingredients/:id                          │   │
│  │  - PUT /api/ingredients/:id                          │   │
│  │  - DELETE /api/ingredients/:id                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Validation Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/lib/validations.ts                              │   │
│  │  - BahanBakuSchema (Indonesian fields)               │   │
│  │  - Validation rules                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Type Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/types/database.ts                               │   │
│  │  - BahanBaku type (Indonesian fields)                │   │
│  │  - Matches database schema exactly                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Table: bahan_baku                                   │   │
│  │  - id (uuid)                                         │   │
│  │  - account_id (uuid)                                 │   │
│  │  - nama_bahan (text)                                 │   │
│  │  - satuan (text)                                     │   │
│  │  - harga_per_satuan (numeric)                        │   │
│  │  - stok_tersedia (numeric)                           │   │
│  │  - stok_minimum (numeric)                            │   │
│  │  - wac_harga (numeric)                               │   │
│  │  - jenis_kemasan (text)                              │   │
│  │  - created_at (timestamptz)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Type Definitions

**File:** `src/types/database.ts`

```typescript
// Add to existing Database type
export interface BahanBaku {
  id: string;
  account_id: string;
  nama_bahan: string;
  satuan: string;
  harga_per_satuan: number;
  stok_tersedia: number;
  stok_minimum: number;
  wac_harga: number | null;
  jenis_kemasan: string | null;
  created_at: string;
}

// Form data type for create/update
export interface BahanBakuFormData {
  nama_bahan: string;
  satuan: string;
  harga_per_satuan: number;
  stok_tersedia: number;
  stok_minimum: number;
  jenis_kemasan?: string;
}
```

### 2. Validation Schema

**File:** `src/lib/validations.ts`

```typescript
export const BahanBakuSchema = z.object({
  nama_bahan: indonesianName,
  satuan: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'dozen'], {
    message: 'Satuan tidak valid'
  }),
  harga_per_satuan: rupiah,
  stok_tersedia: nonNegativeNumber,
  stok_minimum: nonNegativeNumber,
  jenis_kemasan: optionalString
}).refine(data => {
  return data.stok_minimum <= data.stok_tersedia;
}, {
  message: 'Stok minimum tidak boleh lebih besar dari stok tersedia',
  path: ['stok_minimum']
});
```

### 3. API Endpoints

**File:** `src/app/api/ingredients/route.ts`

```typescript
// GET /api/ingredients
- Query dari tabel 'bahan_baku'
- Filter by account_id (RLS)
- Support search by nama_bahan
- Return array of BahanBaku

// POST /api/ingredients
- Validate dengan BahanBakuSchema
- Insert ke tabel 'bahan_baku'
- Auto-set account_id dari session
- Return created BahanBaku
```

**File:** `src/app/api/ingredients/[id]/route.ts`

```typescript
// GET /api/ingredients/:id
- Query single record dari 'bahan_baku'
- Filter by id and account_id
- Return BahanBaku or 404

// PUT /api/ingredients/:id
- Validate dengan BahanBakuSchema.partial()
- Update record di 'bahan_baku'
- Filter by id and account_id
- Return updated BahanBaku

// DELETE /api/ingredients/:id
- Check if used in resep_item
- If used, return 409 Conflict
- If not used, delete from 'bahan_baku'
- Return success message
```

### 4. Custom Hook

**File:** `src/hooks/useSupabaseCRUD.ts`

```typescript
export const useBahanBaku = (options?: { 
  initial?: BahanBaku[]; 
  refetchOnMount?: boolean 
}) => {
  const data = useSupabaseData('bahan_baku', { 
    ...options, 
    initial: options?.initial || [] 
  });
  const mutations = useSupabaseMutation('bahan_baku', data.refetch);
  return { ...data, ...mutations };
};
```

### 5. Frontend Components

**File:** `src/app/ingredients/page.tsx`

Updates:
- Change `useIngredients()` to `useBahanBaku()`
- Update field references: `name` → `nama_bahan`, `current_stock` → `stok_tersedia`, etc.
- Update stats calculations to use Indonesian field names
- Keep UI labels in Indonesian (already correct)

**File:** `src/components/crud/ingredients-crud.tsx`

Updates:
- Change type from `Ingredient` to `BahanBaku`
- Update form field names to Indonesian
- Update validation rules to use BahanBakuSchema
- Update table columns to use Indonesian field names
- Keep display labels in Indonesian (already correct)

## Data Models

### Database Schema (Existing - No Changes)

```sql
CREATE TABLE bahan_baku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  nama_bahan TEXT NOT NULL,
  satuan TEXT DEFAULT 'pcs',
  harga_per_satuan NUMERIC DEFAULT 0 CHECK (harga_per_satuan > 0),
  stok_tersedia NUMERIC DEFAULT 0 CHECK (stok_tersedia >= 0),
  stok_minimum NUMERIC DEFAULT 10 CHECK (stok_minimum >= 0),
  wac_harga NUMERIC DEFAULT 0,
  jenis_kemasan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Field Mapping (Old → New)

| Old (English) | New (Indonesian) | Type | Description |
|--------------|------------------|------|-------------|
| name | nama_bahan | string | Nama bahan baku |
| unit | satuan | string | Satuan (kg, g, l, ml, pcs, dozen) |
| price_per_unit | harga_per_satuan | number | Harga per satuan |
| current_stock | stok_tersedia | number | Stok yang tersedia saat ini |
| minimum_stock / min_stock | stok_minimum | number | Batas minimum stok |
| - | wac_harga | number | Weighted Average Cost |
| - | jenis_kemasan | string | Jenis kemasan bahan |

## Error Handling

### Validation Errors

```typescript
// Client-side validation
- Empty nama_bahan → "Nama bahan harus diisi"
- Invalid satuan → "Satuan tidak valid"
- Negative harga_per_satuan → "Harga harus lebih dari 0"
- Negative stok → "Stok tidak boleh negatif"
- stok_minimum > stok_tersedia → "Stok minimum tidak boleh lebih besar dari stok tersedia"
```

### API Errors

```typescript
// 400 Bad Request
- Invalid input data
- Validation failed
- Missing required fields

// 404 Not Found
- Bahan baku tidak ditemukan
- Invalid ID

// 409 Conflict
- Tidak dapat menghapus bahan yang digunakan di resep
- Duplicate nama_bahan (if unique constraint added)

// 500 Internal Server Error
- Database connection error
- Unexpected server error
```

### Error Display

```typescript
// Toast notifications for user feedback
- Success: "Bahan baku berhasil ditambahkan"
- Error: "Gagal menyimpan data: [error message]"
- Warning: "Stok bahan [nama] sudah mencapai minimum"
```

## Testing Strategy

### Unit Tests

1. **Validation Tests**
   - Test BahanBakuSchema with valid data
   - Test validation errors for invalid data
   - Test edge cases (zero stock, negative values)

2. **Hook Tests**
   - Test useBahanBaku data fetching
   - Test CRUD operations
   - Test error handling

### Integration Tests

1. **API Tests**
   - Test GET /api/ingredients returns correct data
   - Test POST creates record with Indonesian fields
   - Test PUT updates correct fields
   - Test DELETE prevents deletion if used in recipes

2. **Component Tests**
   - Test ingredients page displays data correctly
   - Test CRUD form with Indonesian field names
   - Test search and filter functionality
   - Test low stock alerts

### Manual Testing Checklist

- [ ] Open /ingredients page - data loads correctly
- [ ] Stats cards show correct values
- [ ] Add new bahan baku - saves successfully
- [ ] Edit existing bahan baku - updates correctly
- [ ] Delete unused bahan baku - deletes successfully
- [ ] Try delete used bahan baku - shows error
- [ ] Search by nama_bahan - filters correctly
- [ ] Low stock alert appears when stok_tersedia <= stok_minimum
- [ ] Form validation works for all fields
- [ ] TypeScript autocomplete works for all fields

## Migration Strategy

### Phase 1: Update Types and Validation
1. Add BahanBaku type to database.ts
2. Add BahanBakuSchema to validations.ts
3. Verify TypeScript compilation

### Phase 2: Update API Layer
1. Update /api/ingredients/route.ts to use 'bahan_baku' table
2. Update /api/ingredients/[id]/route.ts
3. Update field names in queries
4. Test API endpoints with Postman/curl

### Phase 3: Update Hooks
1. Update useSupabaseCRUD.ts
2. Add useBahanBaku hook
3. Update table name mapping
4. Test hook with sample data

### Phase 4: Update Frontend
1. Update ingredients/page.tsx
2. Update ingredients-crud.tsx
3. Update field references
4. Test UI functionality

### Phase 5: Testing and Validation
1. Run all tests
2. Manual testing checklist
3. Check for TypeScript errors
4. Verify data integrity

## Rollback Plan

If issues occur:
1. Revert code changes via git
2. No database changes needed (schema unchanged)
3. Clear browser cache if needed
4. Restart dev server

## Performance Considerations

- No performance impact expected (same queries, just different field names)
- Existing indexes on bahan_baku table remain valid
- RLS policies unchanged
- Real-time subscriptions continue to work

## Security Considerations

- RLS policies on bahan_baku table already enforce account_id filtering
- No new security vulnerabilities introduced
- Validation schema prevents SQL injection
- API endpoints require authentication (existing middleware)
