# TypeScript & Lint Errors Summary

## Current Status
- **TypeScript Errors**: 86 errors remaining
- **ESLint Errors**: 4 errors (mostly React Compiler warnings)

## Major Error Categories

### 1. InventoryDashboard Component (Multiple Errors)
**File**: `src/components/inventory/InventoryDashboard.tsx`

**Issues**:
- Missing `InventoryAlertsList` component (was imported from deleted service)
- Missing `ReorderSuggestion` type
- References to undefined `inventoryStatus` object

**Fix Needed**:
- Create proper component for displaying alerts
- Define proper types for reorder suggestions
- Calculate inventory status from alerts data

### 2. ProductionCapacityManager (40+ Errors)
**File**: `src/components/production/ProductionCapacityManager.tsx`

**Issues**:
- Missing properties in `ProductionConstraints` type
- References to deleted `batchSchedulingService`
- Type mismatches for break_times array

**Status**: Partially fixed
- ✅ Added missing properties to `ProductionConstraints`
- ✅ Replaced service calls with hooks
- ❌ Still has type errors for complex properties

### 3. Settings Manager Type Mismatches
**File**: `src/app/settings/hooks/useSettingsManager.ts`

**Issues**:
- Type conversion errors between `GeneralSettings` and `BusinessSettings`
- Type conversion errors between `UserSettings` and `ProfileSettings`
- Type conversion errors for `PreferencesSettings`

**Fix Needed**:
- Align type definitions between old and new settings types
- Create proper type adapters/mappers

### 4. Supplier Form Type Issues
**File**: `src/app/suppliers/page.tsx`, `src/app/suppliers/components/SupplierForm.tsx`

**Issues**:
- Missing `user_id` in supplier creation
- Type mismatch between form data and Insert type

**Status**: Partially fixed
- ✅ Fixed `is_active` default value issue
- ❌ Still missing `user_id` handling

### 5. Ingredient Purchases Type Mismatches
**Files**: 
- `src/app/ingredients/page.tsx`
- `src/app/ingredients/purchases/components/IngredientPurchasesLayout.tsx`

**Issues**:
- Type mismatch between `IngredientPurchaseWithDetails` and `IngredientPurchase`
- `supplier` property type incompatibility (object vs string)

**Status**: Partially fixed
- ✅ Fixed purchases mapping
- ❌ Still has type incompatibilities in layout component

### 6. Missing Auth Exports
**Files**: Multiple files importing `useAuth`, `useAuthMe`

**Status**: ✅ Fixed
- Added re-exports in `src/hooks/index.ts`

## ESLint Errors

### 1. React Hook Form Watch Function (2 errors)
**Files**:
- `src/app/customers/components/CustomerDialog.tsx`
- `src/app/customers/components/CustomerForm.tsx`

**Issue**: React Compiler incompatibility with `watch()` function
**Severity**: Warning (not breaking)
**Fix**: Can be suppressed or refactored to use controlled components

### 2. Unused ESLint Directive (1 warning)
**File**: `src/app/orders/components/OrdersTableSection.tsx`
**Fix**: Remove unused eslint-disable comment

### 3. setState in useEffect (1 error)
**File**: `src/app/recipes/ai-generator/components/AIRecipeGeneratorLayout.tsx`
**Issue**: Calling `setHasUnsavedChanges(true)` directly in useEffect
**Fix**: Move to event handlers or use proper dependency array

## Recommended Fix Priority

### High Priority (Breaking Errors)
1. ✅ Fix missing auth exports
2. ❌ Fix InventoryDashboard component
3. ❌ Fix ProductionCapacityManager remaining errors
4. ❌ Fix Settings type mismatches
5. ❌ Fix Supplier form user_id issue

### Medium Priority (Type Safety)
6. ❌ Fix Ingredient Purchases type mismatches
7. ❌ Align all WithDetails types properly

### Low Priority (Warnings)
8. ❌ Fix React Compiler warnings
9. ❌ Fix setState in useEffect
10. ❌ Remove unused eslint directives

## Quick Wins

These can be fixed quickly:
1. ✅ Add missing exports to hooks/index.ts
2. ✅ Fix ProductionConstraints type definition
3. ❌ Remove unused eslint-disable comments
4. ❌ Add proper type guards for optional properties

## Long-term Solutions

1. **Create proper type definitions** for all WithDetails types
2. **Standardize API response types** across all hooks
3. **Create type adapters** for legacy code compatibility
4. **Add runtime type validation** with Zod schemas
5. **Enable strict null checks** gradually

## Notes

- Most errors are related to the service → hooks migration
- Type definitions need to be aligned between old and new code
- Some components still reference deleted services
- React Compiler warnings are non-breaking but should be addressed

## Next Steps

1. Fix InventoryDashboard completely (create missing components)
2. Complete ProductionCapacityManager fixes
3. Create type adapters for Settings
4. Add user_id handling in Supplier mutations
5. Run full type-check and fix remaining errors systematically
