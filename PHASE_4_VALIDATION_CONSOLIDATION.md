# Phase 4: Validation Schema Consolidation ✅

## Findings - Duplicate Schemas

### 1. PaginationQuerySchema - DUPLICATE! ⚠️

**Location 1:** `src/lib/validations/pagination.ts`
```typescript
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().nonnegative().optional(),
})
```

**Location 2:** `src/lib/validations/domains/common.ts`
```typescript
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(() => 1),
  limit: z.coerce.number().int().min(1).max(10000).default(1000).catch(() => 1000),
  search: z.string().nullable().optional().transform(val => val ?? undefined),
  sort_by: z.string().nullable().optional().transform(val => val ?? undefined),
  sort_order: z.enum(['asc', 'desc']).default('desc').catch(() => 'desc' as const),
})
```

**Difference:**
- Different max limits (100 vs 10000)
- Different defaults (10 vs 1000)
- domains/common has search & sort fields
- domains/common has error catching

### 2. Base Validation Schemas - Good! ✅

`src/lib/validations/base-validations.ts` already has:
- UUIDSchema
- EmailSchema
- PhoneSchema
- DateStringSchema
- PositiveNumberSchema
- NonNegativeNumberSchema
- All enum schemas

**Status:** Already consolidated! No action needed.

---

## Action Plan

### Step 1: Consolidate Pagination Schemas

**Decision:** Keep `domains/common.ts` version (more feature-rich)

**Rationale:**
- Has search & sort built-in
- Better error handling with `.catch()`
- Higher limit (10000) for admin/export use cases
- More flexible

**Action:**
1. Update `pagination.ts` to re-export from `domains/common.ts`
2. Add deprecation notice
3. Keep for backward compatibility

### Step 2: Create Common Schema Barrel Export

**New File:** `src/lib/validations/common/index.ts`

Export all commonly used schemas:
- PaginationQuerySchema
- DateRangeSchema
- FileUploadSchema
- IdParamSchema
- BulkDeleteSchema
- etc.

### Step 3: Update Imports (Gradual)

No breaking changes - just recommend new import path in docs.

---

## Implementation

### File 1: Update pagination.ts
```typescript
// DEPRECATED: Import from @/lib/validations/domains/common instead
export { 
  PaginationQuerySchema,
  type PaginationQuery 
} from '@/lib/validations/domains/common'

// Keep legacy interfaces for backward compatibility
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
```

### File 2: Create common barrel export
```typescript
// src/lib/validations/common/index.ts
export {
  // Pagination
  PaginationSchema,
  PaginationQuerySchema,
  type PaginationQuery,
  
  // Date ranges
  DateRangeSchema,
  DateRangeQuerySchema,
  type DateRangeQuery,
  
  // File uploads
  FileUploadSchema,
  ImageUploadSchema,
  type FileUpload,
  type ImageUpload,
  
  // ID params
  IdParamSchema,
  IdsParamSchema,
  
  // Bulk operations
  BulkDeleteSchema,
  BulkUpdateSchema,
  
  // Reports
  ReportQuerySchema,
  SalesQuerySchema,
  type ReportQuery,
  type SalesQuery,
} from '@/lib/validations/domains/common'

export {
  // Base validations
  UUIDSchema,
  EmailSchema,
  PhoneSchema,
  DateStringSchema,
  PositiveNumberSchema,
  NonNegativeNumberSchema,
  
  // Enums
  OrderStatusEnum,
  PaymentMethodEnum,
  UserRoleEnum,
  ProductionStatusEnum,
  
  // Utilities
  validateFormData,
  formatValidationErrors,
  zodErrorsToFieldErrors,
} from '@/lib/validations/base-validations'
```

---

## Benefits

1. **Single Import Path:** `@/lib/validations/common`
2. **No Breaking Changes:** Old imports still work
3. **Better Organization:** Clear common vs domain-specific
4. **Type Safety:** All types exported together
5. **Easy Discovery:** One place to find common schemas

---

## Migration Example

### Before
```typescript
import { PaginationQuerySchema } from '@/lib/validations/pagination'
import { UUIDSchema } from '@/lib/validations/base-validations'
import { DateRangeSchema } from '@/lib/validations/domains/common'
```

### After
```typescript
import { 
  PaginationQuerySchema,
  UUIDSchema,
  DateRangeSchema 
} from '@/lib/validations/common'
```

---

## Status: Ready to Implement ✅

**Risk:** Low - backward compatible
**Impact:** High - better DX
**Time:** 15 minutes
