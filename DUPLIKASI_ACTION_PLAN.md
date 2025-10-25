# 🎯 Action Plan: Menghilangkan Duplikasi

**Target:** Single Source of Truth untuk semua kode  
**Timeline:** 2-3 minggu  
**Risk Level:** Medium (perlu testing menyeluruh)

---

## 📅 Week 1: Critical Fixes

### Day 1-2: Consolidate Supabase Clients

#### Step 1: Audit Current Usage
```bash
# Cari semua import Supabase client
grep -r "from '@/lib/supabase'" src/
grep -r "from '@/hooks/useSupabaseClient'" src/
grep -r "from '@/utils/supabase" src/
```

#### Step 2: Create Migration Map
```typescript
// OLD → NEW mapping
'@/lib/supabase' → '@/utils/supabase/client' (client-side)
'@/lib/supabase' → '@/utils/supabase/server' (server-side)
'@/hooks/useSupabaseClient' → '@/utils/supabase/client'
```

#### Step 3: Refactor src/lib/supabase.ts
```typescript
// File: src/lib/db-helpers.ts (NEW)
export const dbService = {
  getIngredients: async () => { ... },
  addIngredient: async () => { ... },
  // ... move all dbService methods here
}

// File: src/lib/realtime-helpers.ts (NEW)
export const subscribeToTable = () => { ... }
export type RealtimePayload = { ... }
```

#### Step 4: Update All Imports
```bash
# Create a script to update imports
npx codemod --plugin transform-imports \
  --from '@/lib/supabase' \
  --to '@/utils/supabase/client'
```

#### Step 5: Delete Old Files
```bash
rm src/hooks/useSupabaseClient.ts
# Keep src/lib/supabase.ts temporarily for reference
mv src/lib/supabase.ts src/lib/supabase.ts.backup
```

#### Step 6: Test
```bash
npm run build
npm run type-check
# Test critical flows manually
```

---

### Day 3-4: Consolidate Database Hooks

#### Step 1: Identify All Usages
```bash
grep -r "from '@/hooks/useSupabaseData'" src/
grep -r "useRealtimeData" src/
```

#### Step 2: Create Migration Guide
```typescript
// OLD → NEW mapping
useRealtimeData() → useSupabaseQuery()
useCustomers() from useSupabaseData → useCustomers() from useSupabase
useIngredients() from useSupabaseData → useIngredients() from useSupabase
useOrders() from useSupabaseData → useOrders() from useSupabase
```

#### Step 3: Update Component by Component
```typescript
// BEFORE
import { useCustomers } from '@/hooks/useSupabaseData'
const { customers, loading, error } = useCustomers()

// AFTER
import { useCustomers } from '@/hooks/useSupabase'
const { data: customers, loading, error } = useCustomers()
```

#### Step 4: Delete Deprecated File
```bash
rm src/hooks/useSupabaseData.ts
```

#### Step 5: Test
```bash
npm run build
npm run type-check
# Test all CRUD operations
```

---

### Day 5: Consolidate Responsive Hooks

#### Step 1: Find All Usages
```bash
grep -r "from '@/hooks/use-mobile'" src/
grep -r "useMobile" src/ | grep -v "useResponsive"
```

#### Step 2: Update Imports
```typescript
// BEFORE
import { useMobile } from '@/hooks/use-mobile'
const isMobile = useMobile()

// AFTER
import { useResponsive } from '@/hooks/useResponsive'
const { isMobile } = useResponsive()
```

#### Step 3: Delete Old File
```bash
rm src/hooks/use-mobile.ts
```

#### Step 4: Test
```bash
# Test responsive behavior on different screen sizes
npm run dev
```

---

## 📅 Week 2: Type Definitions

### Day 1-3: Consolidate Interface Definitions

#### Step 1: Create Central Type Index
```typescript
// File: src/types/index.ts (already exists, enhance it)
// Ensure all types are exported from here

// Re-export everything
export type { Recipe, RecipeWithIngredients } from './recipes'
export type { Order, OrderWithItems } from './orders'
export type { Ingredient, IngredientWithStock } from './inventory'
export type { Customer, CustomerWithOrders } from './customers'
```

#### Step 2: Find All Local Interface Definitions
```bash
# Find duplicate Recipe interfaces
grep -r "interface Recipe" src/ --exclude-dir=types

# Find duplicate Order interfaces
grep -r "interface Order" src/ --exclude-dir=types

# Find duplicate Ingredient interfaces
grep -r "interface Ingredient" src/ --exclude-dir=types
```

#### Step 3: Refactor File by File

**Priority Files:**
1. `src/lib/data-synchronization/types.ts`
2. `src/services/excel-export-lazy.service.ts`
3. `src/services/production/ProductionDataIntegration.ts`
4. `src/lib/automation/hpp-automation.ts`
5. `src/modules/recipes/services/EnhancedHPPCalculationService.ts`

**Refactor Pattern:**
```typescript
// BEFORE: src/services/excel-export-lazy.service.ts
interface RecipeResponse {
  id: string
  name: string
  // ...
}

// AFTER
import { Recipe } from '@/types'
// Use Recipe directly or extend it
type RecipeResponse = Pick<Recipe, 'id' | 'name' | ...>
```

#### Step 4: Handle Special Cases

Some files need custom types that extend base types:
```typescript
// OK to keep if it extends base type
import { Recipe } from '@/types'

interface RecipeWithCalculations extends Recipe {
  hpp: number
  margin: number
  // custom fields
}
```

#### Step 5: Test Each Refactor
```bash
npm run type-check
npm run build
```

---

### Day 4-5: Consolidate Zod Schemas

#### Step 1: Audit Schema Files
```bash
# Find all Zod schema definitions
grep -r "z.object" src/lib/validations/
grep -r "z.object" src/lib/api-validation.ts
```

#### Step 2: Identify Duplicates
```typescript
// Duplicates found:
// - PaginationSchema (2 places)
// - DateRangeSchema (2 places)
// - IdParamSchema (2 places)
```

#### Step 3: Refactor api-validation.ts
```typescript
// File: src/lib/api-validation.ts
// BEFORE: Has duplicate schemas

// AFTER: Import from validations
import {
  PaginationQuerySchema,
  DateRangeQuerySchema,
  IdParamSchema,
} from '@/lib/validations/api-validations'

// Keep only middleware functions
export function withValidation() { ... }
export function withQueryValidation() { ... }
export function withRateLimit() { ... }
// etc.
```

#### Step 4: Update All Imports
```bash
# Find files importing from api-validation.ts
grep -r "from '@/lib/api-validation'" src/

# Update to import from correct source
```

#### Step 5: Test
```bash
npm run type-check
npm run build
# Test API routes
```

---

## 📅 Week 3: Cleanup & Documentation

### Day 1-2: Final Cleanup

#### Remove Backup Files
```bash
rm src/lib/supabase.ts.backup
rm -rf .temp/old-hooks/
```

#### Update Barrel Exports
```typescript
// File: src/hooks/index.ts
export { useSupabase, useSupabaseQuery, useSupabaseMutation } from './useSupabase'
export { useResponsive, useMediaQuery } from './useResponsive'
// Remove deprecated exports
```

#### Clean Up Unused Imports
```bash
npx eslint src/ --fix
npx prettier --write src/
```

---

### Day 3-4: Documentation

#### Update README Files
```markdown
# src/hooks/README.md
## Available Hooks

### Database Hooks
- `useSupabaseQuery()` - Query data with realtime
- `useSupabaseMutation()` - Create, update, delete
- `useSupabaseCRUD()` - Combined CRUD operations

### Responsive Hooks
- `useResponsive()` - Detect screen size
- `useMediaQuery()` - Custom media queries

## Deprecated Hooks
❌ `useSupabaseData` - Use `useSupabase` instead
❌ `useMobile` from use-mobile.ts - Use `useResponsive` instead
```

#### Create Migration Guide
```markdown
# MIGRATION_GUIDE.md

## Migrating from Old Hooks

### useSupabaseData → useSupabase
...

### useMobile → useResponsive
...
```

#### Update Type Documentation
```typescript
// src/types/README.md
# Type System

## Single Source of Truth
All types are defined in `src/types/` directory.

## Usage
```typescript
import { Recipe, Order, Ingredient } from '@/types'
```

## DO NOT
❌ Define local interfaces for database entities
❌ Create duplicate type definitions
```

---

### Day 5: Testing & Verification

#### Comprehensive Testing
```bash
# Type checking
npm run type-check

# Build
npm run build

# Linting
npm run lint

# Unit tests (if any)
npm run test

# E2E tests (if any)
npm run test:e2e
```

#### Manual Testing Checklist
- [ ] Login/Logout works
- [ ] CRUD operations for all entities
- [ ] Responsive behavior on mobile/tablet/desktop
- [ ] Real-time updates work
- [ ] API routes respond correctly
- [ ] Forms validate properly
- [ ] No console errors
- [ ] No TypeScript errors

#### Performance Check
```bash
# Check bundle size
npm run build
# Compare with previous build

# Check for unused code
npx depcheck
```

---

## 📊 Success Metrics

### Before Cleanup
- Duplicate files: 5
- Duplicate interfaces: 20+
- Duplicate schemas: 10+
- Lines of code: ~50,000

### After Cleanup (Target)
- Duplicate files: 0 ✅
- Duplicate interfaces: 0 ✅
- Duplicate schemas: 0 ✅
- Lines of code: ~48,000 (-4%)
- Type safety: +20%
- Maintainability: +40%

---

## 🚨 Risk Mitigation

### Backup Strategy
```bash
# Before starting
git checkout -b refactor/remove-duplicates
git push origin refactor/remove-duplicates

# Create backup branch
git checkout -b backup/before-refactor
git push origin backup/before-refactor
```

### Rollback Plan
```bash
# If something goes wrong
git checkout main
git branch -D refactor/remove-duplicates
git checkout backup/before-refactor
```

### Testing Strategy
1. Test after each major change
2. Keep old code commented for reference
3. Deploy to staging first
4. Monitor for errors
5. Have rollback plan ready

---

## 📝 Checklist

### Week 1
- [ ] Consolidate Supabase clients
- [ ] Consolidate database hooks
- [ ] Consolidate responsive hooks
- [ ] All tests pass
- [ ] No TypeScript errors

### Week 2
- [ ] Consolidate type definitions
- [ ] Consolidate Zod schemas
- [ ] Update all imports
- [ ] All tests pass
- [ ] No TypeScript errors

### Week 3
- [ ] Final cleanup
- [ ] Update documentation
- [ ] Comprehensive testing
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## 🎉 Done!

Setelah selesai, codebase akan:
- ✅ Single source of truth untuk semua types
- ✅ Tidak ada duplikasi kode
- ✅ Lebih mudah di-maintain
- ✅ Type safety lebih baik
- ✅ Bundle size lebih kecil
- ✅ Developer experience lebih baik

