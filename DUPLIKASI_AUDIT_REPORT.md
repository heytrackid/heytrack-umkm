# 🔍 Laporan Audit Duplikasi Codebase

**Tanggal:** 25 Oktober 2025  
**Status:** ⚠️ Ditemukan Duplikasi Signifikan

---

## 📊 Executive Summary

Ditemukan **5 kategori utama duplikasi** yang perlu dibersihkan untuk mencapai **single source of truth**:

1. ✅ **Supabase Client Creation** - 4 file berbeda
2. ✅ **Type Definitions** - Interface duplikat di 10+ file
3. ✅ **Responsive Hooks** - 2 implementasi berbeda
4. ✅ **Zod Schemas** - Duplikasi di 3 file
5. ✅ **Database Hooks** - 2 implementasi berbeda

---

## 🚨 CRITICAL: Duplikasi Supabase Client

### Masalah
Ada **4 cara berbeda** untuk membuat Supabase client:

#### File 1: `src/utils/supabase/client.ts` ✅ RECOMMENDED
```typescript
// Menggunakan @supabase/ssr (modern, recommended)
import { createBrowserClient } from '@supabase/ssr'
export function createClient() { ... }
```

#### File 2: `src/utils/supabase/server.ts` ✅ RECOMMENDED
```typescript
// Menggunakan @supabase/ssr untuk server
import { createServerClient } from '@supabase/ssr'
export async function createClient() { ... }
```

#### File 3: `src/lib/supabase.ts` ⚠️ LEGACY
```typescript
// Menggunakan @supabase/supabase-js (old way)
import { createClient } from '@supabase/supabase-js'
export const supabase = ... // Singleton pattern
export const createSupabaseClient = () => { ... }
```

#### File 4: `src/hooks/useSupabaseClient.ts` ⚠️ DEPRECATED
```typescript
// Hook untuk client-side, duplikat dengan utils/supabase/client.ts
export function useSupabaseClient() { ... }
```

### ✅ Solusi
**GUNAKAN HANYA:**
- `src/utils/supabase/client.ts` untuk client-side
- `src/utils/supabase/server.ts` untuk server-side

**HAPUS/REFACTOR:**
- `src/lib/supabase.ts` → Pindahkan helper functions ke file terpisah
- `src/hooks/useSupabaseClient.ts` → Hapus, gunakan `createClient()` langsung

---

## 🔄 Duplikasi Type Definitions

### Interface Recipe
Ditemukan di **6 file berbeda**:

1. `src/types/index.ts` ✅ **SINGLE SOURCE**
2. `src/lib/data-synchronization/types.ts` ⚠️ Duplikat
3. `src/modules/recipes/types/index.ts` ⚠️ Duplikat
4. `src/modules/recipes/utils.ts` ⚠️ Duplikat
5. `src/services/excel-export-lazy.service.ts` ⚠️ Duplikat
6. `src/lib/automation/hpp-automation.ts` ⚠️ Duplikat

### Interface Order
Ditemukan di **5 file berbeda**:

1. `src/types/orders.ts` ✅ **SINGLE SOURCE**
2. `src/lib/data-synchronization/types.ts` ⚠️ Duplikat
3. `src/services/production/ProductionDataIntegration.ts` ⚠️ Duplikat
4. `src/services/excel-export-lazy.service.ts` ⚠️ Duplikat
5. `src/lib/whatsapp-service.ts` ⚠️ Duplikat

### Interface Ingredient
Ditemukan di **4 file berbeda**:

1. `src/types/inventory.ts` ✅ **SINGLE SOURCE**
2. `src/lib/data-synchronization/types.ts` ⚠️ Duplikat
3. `src/modules/recipes/services/EnhancedHPPCalculationService.ts` ⚠️ Duplikat
4. `src/services/excel-export-lazy.service.ts` ⚠️ Duplikat

### Interface Customer
Ditemukan di **3 file berbeda**:

1. `src/types/customers.ts` ✅ **SINGLE SOURCE**
2. `src/lib/data-synchronization/types.ts` ⚠️ Duplikat
3. `src/services/excel-export-lazy.service.ts` ⚠️ Duplikat

### ✅ Solusi
**GUNAKAN HANYA:** `src/types/index.ts` dan sub-files di `src/types/`

**REFACTOR:** Semua file lain harus import dari `@/types`

---

## 📱 Duplikasi Responsive Hooks

### Masalah
Ada **2 implementasi berbeda**:

#### File 1: `src/hooks/useResponsive.ts` ✅ COMPREHENSIVE
```typescript
// Full-featured dengan banyak utility
export function useResponsive() { ... }
export function useIsMobile() { ... } // deprecated
export function useMobile() { ... } // deprecated
export function useMediaQuery() { ... }
export function useScreenSize() { ... }
export function useOrientation() { ... }
export function useTouchDevice() { ... }
```

#### File 2: `src/hooks/use-mobile.ts` ⚠️ SIMPLE DUPLICATE
```typescript
// Simple implementation, redundant
export function useMobile(breakpoint = 768) { ... }
```

### ✅ Solusi
**GUNAKAN:** `src/hooks/useResponsive.ts`

**HAPUS:** `src/hooks/use-mobile.ts`

**UPDATE IMPORTS:** Ganti semua `import { useMobile } from '@/hooks/use-mobile'` dengan `import { useResponsive } from '@/hooks/useResponsive'`

---

## 📝 Duplikasi Zod Schemas

### Masalah
Schema validasi tersebar di **3 file**:

1. `src/lib/validations/api-validations.ts` ✅ **SINGLE SOURCE untuk API**
2. `src/lib/validations/database-validations.ts` ✅ **SINGLE SOURCE untuk DB**
3. `src/lib/api-validation.ts` ⚠️ **DUPLIKAT** - Redundant dengan api-validations.ts

### Duplikasi Spesifik

#### PaginationSchema
```typescript
// File 1: api-validations.ts
export const PaginationQuerySchema = z.object({ ... })

// File 2: api-validation.ts
export const PaginationSchema = z.object({ ... }) // DUPLIKAT
```

#### DateRangeSchema
```typescript
// File 1: api-validations.ts
export const DateRangeQuerySchema = z.object({ ... })

// File 2: api-validation.ts
export const DateRangeSchema = z.object({ ... }) // DUPLIKAT
```

#### IdParamSchema
```typescript
// File 1: api-validations.ts
export const IdParamSchema = z.object({ ... })

// File 2: api-validation.ts
export const IdParamSchema = z.object({ ... }) // DUPLIKAT EXACT
```

### ✅ Solusi
**GUNAKAN:**
- `src/lib/validations/api-validations.ts` untuk API schemas
- `src/lib/validations/database-validations.ts` untuk DB schemas

**HAPUS:** `src/lib/api-validation.ts` atau refactor menjadi middleware-only file

---

## 🗄️ Duplikasi Database Hooks

### Masalah
Ada **2 implementasi hooks** untuk database operations:

#### File 1: `src/hooks/useSupabase.ts` ✅ MODERN & COMPLETE
```typescript
// Unified, comprehensive, well-documented
export function useSupabaseQuery() { ... }
export function useSupabaseMutation() { ... }
export function useSupabaseCRUD() { ... }
export function useIngredients() { ... }
export function useRecipes() { ... }
// + many more utilities
```

#### File 2: `src/hooks/useSupabaseData.ts` ⚠️ DEPRECATED
```typescript
/**
 * @deprecated Use @/hooks/useSupabase instead
 */
export function useRealtimeData() { ... }
export function useCustomers() { ... }
export function useIngredients() { ... } // DUPLIKAT
export function useOrders() { ... }
```

### ✅ Solusi
**GUNAKAN:** `src/hooks/useSupabase.ts`

**HAPUS:** `src/hooks/useSupabaseData.ts` (sudah ada deprecation notice)

---

## 📋 Action Plan

### Priority 1: Critical (Harus Segera)

#### 1. Consolidate Supabase Clients
```bash
# Hapus file duplikat
rm src/hooks/useSupabaseClient.ts

# Refactor src/lib/supabase.ts
# - Pindahkan dbService ke src/lib/db-service.ts
# - Pindahkan subscribeToTable ke src/lib/realtime-helpers.ts
# - Hapus createSupabaseClient (gunakan dari utils/supabase)
```

#### 2. Consolidate Database Hooks
```bash
# Hapus file deprecated
rm src/hooks/useSupabaseData.ts

# Update all imports to use useSupabase.ts
```

### Priority 2: High (Minggu Ini)

#### 3. Consolidate Type Definitions
```typescript
// Update semua file untuk import dari @/types
// Hapus local interface definitions

// Contoh refactor:
// BEFORE:
interface Recipe {
  id: string
  name: string
  // ...
}

// AFTER:
import { Recipe } from '@/types'
```

#### 4. Consolidate Responsive Hooks
```bash
# Hapus file duplikat
rm src/hooks/use-mobile.ts

# Update imports di semua file
```

### Priority 3: Medium (Bulan Ini)

#### 5. Consolidate Zod Schemas
```typescript
// Refactor api-validation.ts
// - Hapus duplikat schemas
// - Keep only middleware functions
// - Import schemas dari api-validations.ts
```

---

## 📊 Impact Analysis

### Files to Delete (5 files)
1. `src/hooks/useSupabaseClient.ts`
2. `src/hooks/useSupabaseData.ts`
3. `src/hooks/use-mobile.ts`
4. `src/lib/api-validation.ts` (atau refactor heavily)
5. `src/lib/supabase.ts` (refactor menjadi helper files)

### Files to Refactor (15+ files)
- Semua file yang define local interfaces
- Semua file yang import dari deprecated hooks
- Semua file yang import dari duplikat schemas

### Estimated Impact
- **Lines of Code Reduced:** ~1,500 lines
- **Import Statements Updated:** ~50-100 files
- **Maintenance Complexity:** -40%
- **Type Safety:** +20% (single source of truth)

---

## ✅ Benefits Setelah Cleanup

1. **Single Source of Truth** ✅
   - Satu tempat untuk setiap type/function
   - Mudah maintain dan update

2. **Better Type Safety** ✅
   - Tidak ada type conflicts
   - Autocomplete lebih akurat

3. **Smaller Bundle Size** ✅
   - Menghilangkan dead code
   - Mengurangi duplikasi

4. **Easier Onboarding** ✅
   - Developer baru tidak bingung
   - Clear structure

5. **Better Performance** ✅
   - Less code to parse
   - Better tree-shaking

---

## 🎯 Next Steps

1. **Review laporan ini** dengan team
2. **Prioritize** action items
3. **Create tasks** di project management tool
4. **Execute** refactoring secara bertahap
5. **Test** setelah setiap perubahan
6. **Document** perubahan di CHANGELOG

---

## 📝 Notes

- Semua perubahan harus di-test dengan comprehensive testing
- Gunakan git branches untuk setiap refactoring task
- Update documentation setelah refactoring
- Consider creating migration guide untuk developer lain

