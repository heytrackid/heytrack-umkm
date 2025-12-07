# HeyTrack Standardization Guide

## Overview

This guide documents the standardization efforts to consolidate constants, validation schemas, and naming conventions across the HeyTrack application.

## ✅ Completed

### 1. Constants Consolidation

**Single Source of Truth**: `@/lib/shared/constants`

All application constants are now centralized in one location:

```typescript
import { 
  ORDER_STATUSES,
  PAYMENT_METHODS,
  CUSTOMER_TYPES,
  getOrderStatusLabel,
  getOrderStatusColor,
  type OrderStatus,
  type PaymentMethod
} from '@/lib/shared/constants'
```

**Available Constants**:
- `ORDER_STATUSES` - Order status options with labels and colors
- `PAYMENT_STATUSES` - Payment status options
- `PAYMENT_METHODS` - Payment method options
- `CUSTOMER_TYPES` - Customer type classifications
- `RECIPE_DIFFICULTIES` - Recipe difficulty levels
- `INGREDIENT_UNITS` - Measurement units
- `PRIORITY_LEVELS` - Priority classifications
- `BUSINESS_UNITS` - Business department units
- `USER_ROLES` - User role definitions
- `STOCK_THRESHOLDS` - Inventory thresholds
- `PAGINATION_DEFAULTS` - Pagination configuration
- `VALIDATION_MESSAGES` - Form validation messages (Indonesian)
- `API_STATUS` - HTTP status codes
- `STORAGE_KEYS` - LocalStorage keys
- `UPLOAD_CONFIG` - File upload configuration
- `DATE_FORMATS` - Date format patterns
- `CURRENCY_CONFIG` - Currency settings
- `TABLE_CONFIG` - Table configuration
- `TOAST_DURATION` - Toast notification durations
- `MODAL_SIZES` - Modal size options
- `EXPORT_FORMATS` - Export format options
- `THEME_CONFIG` - Theme configuration

**Helper Functions**:
- `getOrderStatusLabel(status)` - Get localized status label
- `getOrderStatusColor(status)` - Get Tailwind color classes
- `getPaymentStatusLabel(status)` - Get payment status label
- `getPaymentStatusColor(status)` - Get payment status color
- `getPaymentMethodLabel(method)` - Get payment method label
- `getCustomerTypeLabel(type)` - Get customer type label
- `getRecipeDifficultyLabel(difficulty)` - Get difficulty label
- `getPriorityLevelLabel(priority)` - Get priority label
- `getPriorityLevelColor(priority)` - Get priority color

### 2. Validation Schemas Consolidation

**Single Source of Truth**: `@/lib/validations/common`

All validation schemas are now accessible from one import:

```typescript
import { 
  PaginationQuerySchema,
  UUIDSchema,
  OrderStatusEnum,
  CustomerSchema,
  ReportQuerySchema
} from '@/lib/validations/common'
```

**Available Schema Categories**:

#### Base Schemas
- `UUIDSchema`, `EmailSchema`, `PhoneSchema`
- `DateStringSchema`, `URLSchema`, `SlugSchema`
- `PositiveNumberSchema`, `NonNegativeNumberSchema`
- `RequiredString`, `OptionalString`
- `ColorHexSchema`, `PercentageSchema`, `CurrencyAmountSchema`

#### Enum Schemas
- `OrderStatusEnum`, `PaymentStatusEnum`, `PaymentMethodEnum`
- `CustomerTypeEnum`, `RecipeDifficultyEnum`, `IngredientUnitEnum`
- `PriorityLevelEnum`, `UserRoleEnum`, `ProductionStatusEnum`
- `BusinessUnitEnum`, `RecordTypeEnum`, `TransactionTypeEnum`

#### Common API Schemas
- `PaginationQuerySchema`, `DateRangeSchema`, `SearchSchema`
- `FileUploadSchema`, `ImageUploadSchema`
- `IdParamSchema`, `IdsParamSchema`
- `BulkDeleteSchema`, `BulkUpdateSchema`
- `ReportQuerySchema`, `SalesQuerySchema`
- `HPPExportQuerySchema`, `HPPComparisonQuerySchema`, `HPPAnalysisQuerySchema`
- `ErrorReportSchema`, `ErrorQuerySchema`

#### Form Schemas
- `IngredientSchema`, `RecipeSchema`, `RecipeIngredientSchema`
- `CustomerSchema`, `OrderSchema`, `OrderItemSchema`
- `ProductionSchema`, `FinancialRecordSchema`, `StockTransactionSchema`
- `SupplierFormSchema`, `OperationalCostFormSchema`

#### API Validation Schemas
- `UserProfileSettingsSchema`, `BusinessInfoSettingsSchema`
- `RegionalSettingsSchema`, `SecuritySettingsSchema`, `ThemeSettingsSchema`
- `HPPCalculationInputSchema`, `CurrencyFormatSchema`
- `InventoryCalculationSchema`, `SalesCalculationSchema`
- `ReportGenerationSchema`

#### AI Schemas
- `AIIngredientSchema`, `AIOperationalCostSchema`
- `AIRecipeIngredientSchema`, `AIRecipeSchema`
- `businessBootstrapInputSchema`, `businessBootstrapOutputSchema`

### 3. Deprecated Code Cleanup

**Removed from `src/shared/index.ts`**:
- Deprecated `ORDER_STATUSES` (lowercase values)
- Deprecated `PAYMENT_METHODS` (lowercase values)
- Duplicate constant definitions

**Now Re-exports from Centralized Location**:
```typescript
// src/shared/index.ts now re-exports from @/lib/shared/constants
export {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  // ... all centralized constants
} from '@/lib/shared/constants'
```

## 🔄 Migration Required

### Priority 1: Replace Hardcoded Status Values

**Problem**: Components use string literals instead of constants

**Before**:
```typescript
orders.filter(o => o.status === 'PENDING')
orders.filter(o => o.status === 'CONFIRMED')
```

**After**:
```typescript
import { ORDER_STATUSES } from '@/lib/shared/constants'

orders.filter(o => o.status === ORDER_STATUSES[0].value) // 'PENDING'
orders.filter(o => o.status === ORDER_STATUSES[1].value) // 'CONFIRMED'
```

**Files Requiring Updates** (35+ files):
- `src/modules/orders/components/OrdersPage.tsx`
- `src/modules/orders/components/OrdersPageComponents/*.tsx`
- `src/modules/orders/components/OrderDetailView.tsx`
- `src/components/orders/OrdersList.tsx`
- And more...

### Priority 2: Replace Inline Zod Schemas

**Problem**: API routes define inline schemas instead of using centralized ones

**Before**:
```typescript
// src/app/api/orders/route.ts
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})
```

**After**:
```typescript
import { PaginationQuerySchema } from '@/lib/validations/common'

// Use centralized schema
const validatedQuery = PaginationQuerySchema.parse(query)
```

**Files Requiring Updates** (35+ API routes):
- `src/app/api/orders/[[...slug]]/route.ts`
- `src/app/api/recipes/[[...slug]]/route.ts`
- `src/app/api/ingredients/[[...slug]]/route.ts`
- `src/app/api/customers/[[...slug]]/route.ts`
- And more...

### Priority 3: Component File Naming

**Problem**: 100+ component files use PascalCase instead of kebab-case

**Current**: `CustomerForm.tsx`, `OrdersList.tsx`, `RecipeCard.tsx`
**Target**: `customer-form.tsx`, `orders-list.tsx`, `recipe-card.tsx`

**Note**: Next.js supports both formats. This is a lower priority cosmetic change.

**Affected Directories**:
- `src/components/` (all subdirectories)
- `src/modules/*/components/`
- `src/app/*/components/`

### Priority 4: TypeScript Strict Mode

**Issues Found**:
- 3 uses of `any` type
- 100+ functions missing explicit return types
- 5 class components (should be functional)

**Example Fixes**:

**Before**:
```typescript
function processData(data: any) {
  return data.map(item => item.value)
}
```

**After**:
```typescript
function processData(data: DataItem[]): number[] {
  return data.map(item => item.value)
}
```

## 📋 Migration Checklist

### Phase 1: Constants (High Priority)
- [ ] Update all order status checks to use `ORDER_STATUSES`
- [ ] Update all payment method references to use `PAYMENT_METHODS`
- [ ] Update all customer type references to use `CUSTOMER_TYPES`
- [ ] Replace hardcoded status labels with helper functions
- [ ] Update all color classes to use helper functions

### Phase 2: Validation Schemas (High Priority)
- [ ] Update API routes to use centralized pagination schemas
- [ ] Update API routes to use centralized date range schemas
- [ ] Update API routes to use centralized enum schemas
- [ ] Remove inline Zod schema definitions
- [ ] Update form components to use centralized form schemas

### Phase 3: Naming Conventions (Medium Priority)
- [ ] Rename component files to kebab-case
- [ ] Update all imports after renaming
- [ ] Verify no broken imports

### Phase 4: TypeScript Strict Mode (Medium Priority)
- [ ] Replace all `any` types with proper types
- [ ] Add explicit return types to all functions
- [ ] Convert class components to functional components
- [ ] Enable `noImplicitAny` in tsconfig.json
- [ ] Enable `strictNullChecks` in tsconfig.json

## 🛠️ Tools & Scripts

### Find Hardcoded Status Values
```bash
# Find PENDING, CONFIRMED, etc. in TSX files
grep -r "status === 'PENDING'" src/
grep -r "status === 'CONFIRMED'" src/
```

### Find Inline Zod Schemas
```bash
# Find z.object({ in API routes
grep -r "z\.object({" src/app/api/
```

### Find PascalCase Component Files
```bash
# Find component files with capital letters
find src/components -name "[A-Z]*.tsx"
find src/modules -name "[A-Z]*.tsx"
```

### Find Missing Return Types
```bash
# Use TypeScript compiler
pnpm run type-check:all
```

## 📚 Best Practices

### 1. Always Import from Centralized Locations

**Constants**:
```typescript
import { ORDER_STATUSES, getOrderStatusLabel } from '@/lib/shared/constants'
```

**Validation**:
```typescript
import { PaginationQuerySchema, UUIDSchema } from '@/lib/validations/common'
```

**Currency**:
```typescript
import { formatCurrentCurrency } from '@/lib/currency'
```

### 2. Use Helper Functions

**Don't**:
```typescript
const label = status === 'PENDING' ? 'Menunggu' : 
              status === 'CONFIRMED' ? 'Dikonfirmasi' : 'Unknown'
```

**Do**:
```typescript
import { getOrderStatusLabel } from '@/lib/shared/constants'
const label = getOrderStatusLabel(status)
```

### 3. Use Enum Schemas for Validation

**Don't**:
```typescript
const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
})
```

**Do**:
```typescript
import { OrderStatusEnum } from '@/lib/validations/common'
const schema = z.object({
  status: OrderStatusEnum
})
```

### 4. Type Safety

**Always use TypeScript types from constants**:
```typescript
import { type OrderStatus, type PaymentMethod } from '@/lib/shared/constants'

function processOrder(status: OrderStatus, method: PaymentMethod): void {
  // Type-safe function
}
```

## 🔍 Verification

After migration, verify:

1. **No hardcoded status strings**: `grep -r "=== 'PENDING'" src/`
2. **No inline schemas in API routes**: `grep -r "z\.object({" src/app/api/`
3. **All imports resolve**: `pnpm run type-check:all`
4. **No runtime errors**: `pnpm run dev` and test all features
5. **Tests pass**: `npx vitest --run`

## 📖 Related Documentation

- `CONSOLIDATION_COMPLETE.md` - Full consolidation details
- `QUICK_REFERENCE.md` - Quick reference guide
- `.kiro/steering/tech.md` - Technology stack
- `.kiro/steering/structure.md` - Project structure
- `.kiro/steering/product.md` - Product overview

## 🎯 Success Metrics

- ✅ Single source of truth for all constants
- ✅ Single source of truth for all validation schemas
- ⏳ Zero hardcoded status values (Target: 0/150+)
- ⏳ Zero inline Zod schemas in API routes (Target: 0/35+)
- ⏳ 100% kebab-case component files (Target: 100%)
- ⏳ Zero `any` types (Target: 0/3)
- ⏳ 100% explicit return types (Target: 100%)

## 🚀 Next Steps

1. **Immediate**: Start migrating hardcoded status values
2. **This Week**: Migrate inline Zod schemas in API routes
3. **This Month**: Complete component file renaming
4. **Ongoing**: Enforce strict TypeScript mode

---

**Last Updated**: December 7, 2024
**Status**: Phase 1 Complete, Phase 2-4 In Progress
