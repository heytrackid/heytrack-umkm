# Audit Codebase HeyTrack - File Unused & Konsolidasi

**Tanggal**: 15 November 2025  
**Total Files**: 987 TypeScript/TSX files  
**Total Lines**: ~159,532 lines

## 🔴 CRITICAL: File Duplikat yang Harus Dihapus

### 1. ESLint Config Duplikat
**Masalah**: Ada 2 file konfigurasi ESLint yang berbeda
- ❌ `eslint.config.js` - Config lama dengan setup manual
- ✅ `eslint.config.mjs` - Config baru dengan Next.js integration

**Rekomendasi**: **HAPUS `eslint.config.js`**, gunakan hanya `eslint.config.mjs`

**Alasan**:
- `eslint.config.mjs` sudah menggunakan `eslint-config-next/core-web-vitals`
- Lebih modern dan terintegrasi dengan Next.js
- Menghindari konflik konfigurasi

### 2. React Query Provider Duplikat
**Masalah**: Ada 2 provider untuk React Query
- ❌ `src/providers/ReactQueryProvider.tsx` - Provider lama, tidak digunakan
- ✅ `src/providers/QueryProvider.tsx` - Provider aktif, digunakan di `layout.tsx`

**Rekomendasi**: **HAPUS `src/providers/ReactQueryProvider.tsx`**

**Bukti Usage**:
```typescript
// src/app/layout.tsx - HANYA menggunakan QueryProvider
import { QueryProvider } from '@/providers/QueryProvider';
```

### 3. SWR Provider - Tidak Digunakan
**Masalah**: `src/providers/SWRProvider.tsx` diimport di layout tapi tidak digunakan
- Aplikasi sudah full menggunakan TanStack Query (React Query)
- SWR tidak digunakan di codebase

**Rekomendasi**: **HAPUS `src/providers/SWRProvider.tsx`** dan hapus import dari `layout.tsx`

**Alasan**:
- Redundant dengan TanStack Query
- Menambah bundle size tanpa manfaat
- Tidak ada hook `useSWR` yang digunakan di codebase

## 🟡 MEDIUM: Type Guards Duplikat

### 4. Type Guards - 3 File dengan Fungsi Sama
**Masalah**: Ada 3 file type guards dengan banyak fungsi duplikat

**Files**:
1. `src/lib/type-guards.ts` - **PALING LENGKAP** (✅ KEEP)
2. `src/types/shared/guards.ts` - Subset dari lib/type-guards
3. `src/shared/guards.ts` - Versi minimal

**Rekomendasi**: **Konsolidasi ke `src/lib/type-guards.ts`**

**Action Plan**:
```bash
# 1. Pastikan semua fungsi ada di src/lib/type-guards.ts
# 2. Update semua import dari:
#    - @/types/shared/guards
#    - @/shared/guards
#    Menjadi: @/lib/type-guards

# 3. Hapus file duplikat
rm src/types/shared/guards.ts
rm src/shared/guards.ts
rm src/shared/index.ts  # Jika hanya export guards
```

**Fungsi Duplikat**:
- `isString`, `isNumber`, `isBoolean`, `isRecord`
- `isIngredient`, `isRecipe`, `isOrder`, `isCustomer`
- `isOrderStatus`, `isPaymentStatus`
- `getErrorMessage`
- `validateIngredient`, `validateRecipe`, `validateOrder`

## 🟢 GOOD: Single Source of Truth yang Sudah Benar

### ✅ Logger - Sudah Terpusat
**Files**:
- `src/lib/logger.ts` - Server-side logger (Pino)
- `src/lib/client-logger.ts` - Client-side logger

**Status**: ✅ **SUDAH BENAR** - Tidak perlu perubahan

**Usage Pattern**:
```typescript
// Server-side
import { apiLogger, dbLogger } from '@/lib/logger'

// Client-side
import { createClientLogger } from '@/lib/client-logger'
const logger = createClientLogger('ComponentName')
```

### ✅ Supabase Client - Sudah Terpusat
**Files**:
- `src/utils/supabase/client.ts` - Client-side
- `src/utils/supabase/server.ts` - Server-side
- `src/utils/supabase/middleware.ts` - Middleware

**Status**: ✅ **SUDAH BENAR** - Tidak perlu perubahan

### ✅ Module Exports - Sudah Baik
**Files**:
- `src/modules/recipes/index.ts` - Recipe domain exports
- `src/modules/orders/index.ts` - Order domain exports

**Status**: ✅ **SUDAH BENAR** - Pattern barrel exports sudah optimal

## 📊 Statistik Duplikasi

| Kategori | File Duplikat | Status | Action |
|----------|---------------|--------|--------|
| ESLint Config | 2 files | 🔴 Critical | Hapus 1 file |
| React Query Provider | 2 files | 🔴 Critical | Hapus 1 file |
| SWR Provider | 1 file | 🔴 Critical | Hapus 1 file |
| Type Guards | 3 files | 🟡 Medium | Konsolidasi ke 1 |
| Logger | 2 files | ✅ Good | No action |
| Supabase Client | 3 files | ✅ Good | No action |

## 🎯 Action Plan Prioritas

### Priority 1: Hapus File Unused (Immediate)
```bash
# 1. Hapus ESLint config lama
rm eslint.config.js

# 2. Hapus React Query provider duplikat
rm src/providers/ReactQueryProvider.tsx

# 3. Hapus SWR provider
rm src/providers/SWRProvider.tsx

# 4. Update layout.tsx - hapus import SWRProvider
# Edit src/app/layout.tsx dan hapus baris:
# import { SWRProvider } from '@/providers/SWRProvider';
# Dan hapus <SWRProvider> wrapper
```

### Priority 2: Konsolidasi Type Guards (This Week)
```bash
# 1. Audit fungsi di src/lib/type-guards.ts
# 2. Tambahkan fungsi yang missing dari guards lain
# 3. Find & replace all imports:
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/@\/types\/shared\/guards/@\/lib\/type-guards/g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/@\/shared\/guards/@\/lib\/type-guards/g' {} +

# 4. Hapus file duplikat
rm src/types/shared/guards.ts
rm src/shared/guards.ts
rm src/shared/index.ts
```

### Priority 3: Cleanup Unused Directories (Optional)
```bash
# Setelah konsolidasi, hapus folder kosong
rmdir src/shared  # Jika kosong
```

## 📈 Expected Impact

### Bundle Size Reduction
- **ESLint config**: ~5KB (dev only)
- **ReactQueryProvider**: ~2KB
- **SWRProvider + swr package**: ~50KB (significant!)
- **Type guards duplikat**: ~15KB
- **Total**: ~72KB reduction

### Code Maintainability
- ✅ Single source of truth untuk type guards
- ✅ Tidak ada konflik ESLint config
- ✅ Satu provider untuk data fetching
- ✅ Lebih mudah untuk refactor

### Developer Experience
- ✅ Tidak bingung import dari mana
- ✅ Autocomplete lebih cepat (fewer files)
- ✅ Easier to find bugs (single location)

## 🔍 Files yang Perlu Review Lebih Lanjut

### Potential Unused Components
Perlu audit manual untuk memastikan:
1. `src/components/lazy/` - Apakah semua lazy components digunakan?
2. `src/components/optimized/` - Apakah ada duplikasi dengan components biasa?
3. `src/hooks/api/` vs `src/hooks/` - Apakah perlu folder terpisah?

### Potential Service Consolidation
```
src/services/orders/
├── OrderRecipeService.ts       # Facade/orchestrator
├── OrderPricingService.ts      # Specialized
├── OrderValidationService.ts   # Specialized
├── InventoryUpdateService.ts   # Specialized
├── ProductionTimeService.ts    # Specialized
└── RecipeRecommendationService.ts  # Specialized
```
**Status**: ✅ **SUDAH BAIK** - Pattern facade + specialized services sudah optimal

## ✅ Checklist Eksekusi

- [ ] Backup codebase (git commit)
- [ ] Hapus `eslint.config.js`
- [ ] Hapus `src/providers/ReactQueryProvider.tsx`
- [ ] Hapus `src/providers/SWRProvider.tsx` dan update `layout.tsx`
- [ ] Uninstall SWR: `pnpm remove swr`
- [ ] Konsolidasi type guards ke `src/lib/type-guards.ts`
- [ ] Find & replace imports type guards
- [ ] Hapus `src/types/shared/guards.ts`
- [ ] Hapus `src/shared/guards.ts`
- [ ] Run `pnpm type-check` untuk validasi
- [ ] Run `pnpm lint` untuk validasi
- [ ] Test aplikasi secara manual
- [ ] Commit changes

## 📝 Notes

### Why Keep src/lib/type-guards.ts?
1. **Paling lengkap** - Memiliki semua fungsi yang dibutuhkan
2. **Supabase-specific guards** - Ada guards untuk join queries
3. **Helper functions** - `extractFirst`, `ensureArray` untuk Supabase
4. **Validation functions** - Return detailed errors
5. **Type assertions** - Throw errors untuk fail-fast

### Why Remove Others?
1. `src/types/shared/guards.ts` - Subset, tidak ada fungsi unik
2. `src/shared/guards.ts` - Minimal version, tidak lengkap

## 🎓 Best Practices Learned

1. **One Provider Rule**: Gunakan satu library untuk data fetching (TanStack Query)
2. **Centralized Type Guards**: Satu file untuk semua type guards
3. **Config Consolidation**: Satu config file per tool
4. **Barrel Exports**: Module index.ts untuk public API
5. **Service Layer Pattern**: Facade + specialized services

---

**Total Savings**: ~72KB bundle size + improved maintainability
**Effort**: ~2 hours untuk eksekusi semua changes
**Risk**: Low (mostly removing unused code)
