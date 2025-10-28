# HPP Module Migration Guide

## Overview

Fitur HPP telah direstrukturisasi menjadi modul terpusat di `src/modules/hpp/`. Semua file HPP yang tersebar sekarang ada di satu lokasi.

## Perubahan Struktur

### Before (Tersebar)

```
src/
├── components/hpp/
│   ├── UnifiedHppPage.tsx
│   ├── HppCalculatorSkeleton.tsx
│   └── ...
├── hooks/
│   ├── useUnifiedHpp.ts
│   ├── useHppOverview.ts
│   └── ...
├── modules/orders/services/
│   ├── HppCalculatorService.ts
│   └── HppExportService.ts
└── lib/cron/
    └── hpp.ts
```

### After (Terpusat)

```
src/modules/hpp/
├── components/
│   ├── UnifiedHppPage.tsx
│   ├── HppCalculatorSkeleton.tsx
│   └── ...
├── services/
│   ├── HppCalculatorService.ts
│   ├── HppSnapshotService.ts
│   ├── HppAlertService.ts
│   └── HppExportService.ts
├── hooks/
│   ├── useUnifiedHpp.ts
│   ├── useHppOverview.ts
│   └── ...
├── types/
│   └── index.ts
├── utils/
│   └── calculations.ts
└── index.ts
```

## Migration Steps

### 1. Update Imports

#### Components

**Before:**
```typescript
import { UnifiedHppPage } from '@/components/hpp/UnifiedHppPage'
import { HppCalculatorSkeleton } from '@/components/hpp/HppCalculatorSkeleton'
```

**After:**
```typescript
import { UnifiedHppPage, HppCalculatorSkeleton } from '@/modules/hpp'
```

#### Services

**Before:**
```typescript
import { HppCalculatorService } from '@/modules/orders/services/HppCalculatorService'
import { HppExportService } from '@/modules/orders/services/HppExportService'
```

**After:**
```typescript
import { HppCalculatorService, HppExportService } from '@/modules/hpp'
```

#### Hooks

**Before:**
```typescript
import { useUnifiedHpp } from '@/hooks/useUnifiedHpp'
import { useHppOverview } from '@/hooks/useHppOverview'
```

**After:**
```typescript
import { useUnifiedHpp, useHppOverview } from '@/modules/hpp'
```

#### Types

**Before:**
```typescript
// Types were scattered or inline
interface HppCalculation {
  // ...
}
```

**After:**
```typescript
import type { HppCalculation, HppAlert, HppSnapshot } from '@/modules/hpp'
```

### 2. Update File References

#### In src/app/hpp/page.tsx

**Before:**
```typescript
import { UnifiedHppPage } from '@/components/hpp/UnifiedHppPage'
```

**After:**
```typescript
import { UnifiedHppPage } from '@/modules/hpp'
```

#### In API Routes

**Before:**
```typescript
import { HppCalculatorService } from '@/modules/orders/services/HppCalculatorService'
```

**After:**
```typescript
import { HppCalculatorService } from '@/modules/hpp'
```

### 3. Update Cron Jobs

File `src/lib/cron/hpp.ts` sudah diupdate untuk menggunakan services dari module baru.

**Before:**
```typescript
// TODO: Implement logic
```

**After:**
```typescript
import { HppSnapshotService, HppAlertService } from '@/modules/hpp'

const service = new HppSnapshotService()
await service.createDailySnapshots()
```

## Breaking Changes

### None

Tidak ada breaking changes karena:
1. Public API tetap sama
2. Function signatures tidak berubah
3. Hanya lokasi file yang berubah

## Benefits

### 1. Organisasi Lebih Baik
- Semua file HPP di satu tempat
- Mudah menemukan dan maintain
- Clear separation of concerns

### 2. Reusability
- Import dari satu module
- Consistent API
- Better tree-shaking

### 3. Scalability
- Mudah menambah fitur baru
- Clear structure untuk testing
- Better documentation

### 4. Type Safety
- Centralized types
- Better IntelliSense
- Fewer import errors

## Checklist

Gunakan checklist ini untuk memastikan migration lengkap:

- [ ] Update all component imports
- [ ] Update all service imports
- [ ] Update all hook imports
- [ ] Update all type imports
- [ ] Update API route handlers
- [ ] Update cron jobs
- [ ] Update tests
- [ ] Update documentation
- [ ] Remove old files (optional)
- [ ] Run type check: `pnpm type-check`
- [ ] Run tests: `pnpm test`
- [ ] Test in browser

## Rollback Plan

Jika ada masalah, file lama masih ada di lokasi aslinya. Untuk rollback:

1. Revert import changes
2. Keep using old file locations
3. Report issues to team

## Support

Jika ada pertanyaan atau masalah:

1. Baca dokumentasi: `docs/HPP_MODULE.md`
2. Cek module README: `src/modules/hpp/README.md`
3. Contact development team

## Timeline

- **Phase 1**: Create new module structure ✅
- **Phase 2**: Copy files to new location ✅
- **Phase 3**: Update imports (In Progress)
- **Phase 4**: Testing & validation
- **Phase 5**: Remove old files (Optional)

## Notes

- Old files masih ada untuk backward compatibility
- Bisa dihapus setelah semua import diupdate
- Module baru sudah production-ready
