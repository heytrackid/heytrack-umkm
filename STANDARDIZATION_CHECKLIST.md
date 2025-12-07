# HeyTrack Standardization Checklist

## 📋 Quick Start

Before you begin:
- [ ] Read `STANDARDIZATION_QUICK_REF.md`
- [ ] Run `./scripts/migrate-constants.sh` to scan for issues
- [ ] Review `STANDARDIZATION_GUIDE.md` for detailed instructions

## Phase 1: Constants Migration (High Priority)

### Order Status Values
- [ ] `src/modules/orders/components/OrdersPage.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/index.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/OrderCard.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/OrderStatusSummary.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/StatusSummary.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/StatsCards.tsx`
- [ ] `src/modules/orders/components/OrderDetailView.tsx`
- [ ] `src/components/orders/OrdersList.tsx`
- [ ] `src/app/orders/components/OrdersTableSection.tsx`

### Payment Status Values
- [ ] `src/modules/orders/components/OrdersPage.tsx`
- [ ] `src/modules/orders/components/OrdersPageComponents/index.tsx`
- [ ] `src/components/orders/OrdersList.tsx`

### Customer Type Values
- [ ] `src/app/customers/[id]/page.tsx`
- [ ] `src/components/customers/CustomerForm.tsx`

### Recipe Difficulty Values
- [ ] `src/components/recipes/RecipeForm.tsx`
- [ ] `src/components/recipes/RecipeDetailPage.tsx`
- [ ] `src/app/recipes/ai-generator/components/AIRecipeGeneratorLayout.tsx`

### Priority Level Values
- [ ] `src/modules/orders/components/OrderDetailView.tsx`
- [ ] `src/components/orders/OrdersList.tsx`

## Phase 2: Validation Schemas Migration (High Priority)

### API Routes - Pagination
- [ ] `src/app/api/orders/[[...slug]]/route.ts`
- [ ] `src/app/api/recipes/[[...slug]]/route.ts`
- [ ] `src/app/api/ingredients/[[...slug]]/route.ts`
- [ ] `src/app/api/customers/[[...slug]]/route.ts`
- [ ] `src/app/api/suppliers/[[...slug]]/route.ts`
- [ ] `src/app/api/expenses/[[...slug]]/route.ts`
- [ ] `src/app/api/operational-costs/[[...slug]]/route.ts`
- [ ] `src/app/api/production/batches/[[...slug]]/route.ts`
- [ ] `src/app/api/inventory/alerts/[[...slug]]/route.ts`

### API Routes - Date Range
- [ ] `src/app/api/reports/[...slug]/route.ts`
- [ ] `src/app/api/orders/[[...slug]]/route.ts`

### API Routes - Enum Validation
- [ ] Replace inline `z.enum(['PENDING', 'CONFIRMED', ...])` with `OrderStatusEnum`
- [ ] Replace inline `z.enum(['CASH', 'BANK_TRANSFER', ...])` with `PaymentMethodEnum`
- [ ] Replace inline `z.enum(['regular', 'vip', ...])` with `CustomerTypeEnum`

### Form Components
- [ ] `src/modules/orders/components/OrderForm.tsx`
- [ ] `src/components/forms/RecipeForm.tsx`
- [ ] `src/components/ingredients/IngredientsList.tsx`
- [ ] `src/app/suppliers/components/SupplierForm.tsx`
- [ ] `src/components/operational-costs/OperationalCostsList.tsx`

## Phase 3: Component File Naming (Medium Priority)

### Components Directory
- [ ] Rename all PascalCase files to kebab-case in `src/components/`
- [ ] Update all imports after renaming
- [ ] Verify no broken imports

### Modules Directory
- [ ] Rename all PascalCase files to kebab-case in `src/modules/`
- [ ] Update all imports after renaming
- [ ] Verify no broken imports

### App Directory
- [ ] Rename all PascalCase files to kebab-case in `src/app/*/components/`
- [ ] Update all imports after renaming
- [ ] Verify no broken imports

## Phase 4: TypeScript Strict Mode (Medium Priority)

### Remove 'any' Types
- [ ] `src/services/reports/ReportService.ts`
- [ ] `src/lib/services/ChatSessionService.ts`
- [ ] `src/lib/services/BusinessContextService.ts`

### Add Explicit Return Types
- [ ] Review all functions in `src/services/`
- [ ] Review all functions in `src/hooks/`
- [ ] Review all functions in `src/lib/`
- [ ] Review all functions in `src/utils/`

### Convert Class Components
- [ ] Identify remaining class components
- [ ] Convert to functional components
- [ ] Update tests if needed

## Verification Steps

After each phase:
- [ ] Run `pnpm run type-check:all`
- [ ] Run `pnpm run lint:all`
- [ ] Run `pnpm run validate:all`
- [ ] Run `npx vitest --run`
- [ ] Test affected features manually
- [ ] Run `./scripts/migrate-constants.sh` to verify progress

## Final Verification

Before marking complete:
- [ ] Zero hardcoded status values: `grep -r "=== 'PENDING'" src/`
- [ ] Zero inline schemas in API routes: `grep -r "z\.object({" src/app/api/`
- [ ] All component files use kebab-case: `find src/components -name "[A-Z]*.tsx"`
- [ ] Zero 'any' types: `grep -r ": any" src/`
- [ ] All tests pass: `npx vitest --run`
- [ ] Application runs without errors: `pnpm run dev`

## Progress Tracking

### Phase 1: Constants Migration
- Total Files: ~35
- Completed: 0
- Progress: 0%

### Phase 2: Validation Schemas
- Total Files: ~35
- Completed: 0
- Progress: 0%

### Phase 3: File Naming
- Total Files: ~100
- Completed: 0
- Progress: 0%

### Phase 4: TypeScript Strict
- Total Issues: ~110
- Completed: 0
- Progress: 0%

### Overall Progress
- Total Tasks: 180
- Completed: 0
- Progress: 0%

## Notes

- Update this checklist as you complete tasks
- Mark items with `[x]` when complete
- Add notes for any issues encountered
- Update progress percentages regularly

## Resources

- **Guide**: `STANDARDIZATION_GUIDE.md`
- **Quick Ref**: `STANDARDIZATION_QUICK_REF.md`
- **Summary**: `STANDARDIZATION_SUMMARY.md`
- **Scanner**: `./scripts/migrate-constants.sh`

---

**Last Updated**: December 7, 2024
**Status**: Ready to begin migration
