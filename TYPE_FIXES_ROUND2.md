# TypeScript Type Fixes - Round 2

## Progress
- **Previous**: 322 errors
- **Current**: 313 errors  
- **Fixed**: 9 errors ✅

## Fixes Applied in Round 2

### 1. Customer Detail Page ✅
- Fixed null safety for `order.status` (line 259)
- Added `ConfirmDialog` import
- Changed: `order.status` → `order.status ?? 'PENDING'`

### 2. ErrorBoundary Component ✅
- Added missing React type imports: `ReactNode`, `ErrorInfo`, `ComponentType`
- Fixed all React type references

### 3. RecipeFormPage ✅
- Added missing `Database` type import
- Fixed type reference for recipe_ingredients mapping

### 4. RecipeStatsCards ✅
- Added missing `getDifficultyLabel` helper function
- Maps difficulty enum to Indonesian labels

### 5. ProductionTimeline ✅
- Replaced non-existent `Oven` icon with `Flame` icon from lucide-react
- Updated all icon usages throughout the file

## Remaining Critical Issues (~313 errors)

### High Priority (Need Database Schema Updates)
1. **Production Batch Properties** (~15 errors)
   - Missing: `scheduled_start`, `scheduled_end`, `estimated_duration`, `batch_status`
   - Files affected: ProductionBatchExecution.tsx, ProductionTimeline.tsx
   - **Action**: Need to add these columns to database or update types

2. **AI Recipe Generator** (~6 errors)
   - Supabase insert type mismatches
   - Type narrowing issues with `never` type
   - **Action**: Fix Supabase client typing

### Medium Priority (Component Issues)
3. **Lazy Loading Components** (~10 errors)
   - modal-lazy-loader.tsx: Props type mismatches
   - progressive-loading.tsx: Generic type constraints
   - **Action**: Fix component prop interfaces

4. **Form Components** (~15 errors)
   - SharedForm.tsx: Zod resolver type issues
   - crud-form.tsx: HTML attribute type mismatches
   - **Action**: Update form type definitions

5. **Chart Components** (~8 errors)
   - chart.tsx: Missing properties from Recharts
   - pie-chart.tsx: Arithmetic operation type issues
   - **Action**: Update chart prop types

6. **UI Components** (~12 errors)
   - calendar.tsx: Missing CalendarRoot, CalendarChevron
   - confirmation-dialog.tsx: Icon component type issues
   - **Action**: Fix component type definitions

### Low Priority (Type Refinements)
7. **useOrders Hook** (~5 errors)
   - Function signature mismatches
   - Expected 1-2 arguments, got 3
   - **Action**: Update function signatures

8. **Automation Workflows** (~remaining errors)
   - Test file type mismatches
   - Mock type incompatibilities
   - **Action**: Align test types with implementation

## Next Actions

### Immediate (Can Fix Now)
- [ ] Fix SharedForm Zod resolver types
- [ ] Fix EmptyState props in SharedDataTable
- [ ] Fix useOrders function signatures
- [ ] Add missing Calendar component types

### Requires Database Changes
- [ ] Add production batch columns to schema
- [ ] Run `pnpm supabase:types` to regenerate types
- [ ] Update ProductionBatch interfaces

### Requires Component Refactoring
- [ ] Refactor lazy loading prop types
- [ ] Update chart component wrappers
- [ ] Fix form component generics

## Commands

```bash
# Current type check
pnpm type-check

# Count errors
pnpm type-check 2>&1 | grep "error TS" | wc -l

# View specific file errors
pnpm type-check 2>&1 | grep "filename.tsx"
```

## Notes
- Core type system is stable ✅
- Most remaining errors are component-specific
- Some errors require database schema updates
- Progress is steady and systematic
