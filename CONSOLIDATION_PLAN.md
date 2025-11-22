# HeyTrack Code Consolidation Plan

## Executive Summary
This document outlines the complete consolidation strategy to eliminate code duplication and establish single sources of truth across the HeyTrack codebase.

## Phase 1: Constants Consolidation ✅ IN PROGRESS

### Current State Analysis

**Duplicate Files:**
1. `src/lib/shared/constants.ts` - **PRIMARY** (most comprehensive, uppercase with colors)
2. `src/lib/shared/form-utils.ts` - Contains lowercase duplicates
3. `src/shared/index.ts` - Contains object format duplicates

### Consolidation Strategy

#### Step 1: Establish Single Source
**File:** `src/lib/shared/constants.ts` (already comprehensive)

**Rationale:**
- Already contains uppercase values (database standard)
- Includes color mappings for UI
- Most complete implementation
- Follows TypeScript best practices with `as const`

#### Step 2: Remove Duplicates
**Files to Clean:**
- `src/lib/shared/form-utils.ts` - Remove ORDER_STATUSES, PAYMENT_METHODS, CUSTOMER_TYPES
- `src/shared/index.ts` - Remove ORDER_STATUSES, PAYMENT_METHODS constants

#### Step 3: Create Migration Helpers
Add helper functions to `src/lib/shared/constants.ts` for backward compatibility:
- `getOrderStatusLabel(status: string): string`
- `getOrderStatusColor(status: string): string`
- `getPaymentMethodLabel(method: string): string`

### Impact Assessment
- **Files Affected:** 3 files (low risk)
- **Breaking Changes:** None (if migration helpers added)
- **Benefits:** 
  - Single source of truth
  - Consistent data across app
  - Easier maintenance

---

## Phase 2: Currency Utilities Consolidation

### Current State Analysis

**Duplicate Files:**
1. `src/lib/currency.ts` - **PRIMARY** (robust, type-safe, multi-currency)
2. `src/lib/shared/utilities.ts` - Simple implementation
3. `src/components/orders/utils.ts` - Re-exports (if exists)

### Consolidation Strategy

#### Step 1: Establish Single Source
**File:** `src/lib/currency.ts` (keep as primary)

**Rationale:**
- Full Currency type support
- Multi-currency support
- Advanced formatting options
- Locale-aware
- Input parsing capabilities

#### Step 2: Remove Duplicates
**Files to Clean:**
- `src/lib/shared/utilities.ts` - Remove formatCurrency, keep other utilities
- Update all imports to use `@/lib/currency`

#### Step 3: Migration Path
```typescript
// OLD (utilities.ts)
import { formatCurrency } from '@/lib/shared/utilities'
formatCurrency(1000, 'IDR', 'id-ID')

// NEW (currency.ts)
import { formatCurrentCurrency } from '@/lib/currency'
formatCurrentCurrency(1000)
```

### Impact Assessment
- **Files Affected:** ~20+ files using formatCurrency
- **Breaking Changes:** Function signature changes
- **Benefits:**
  - Consistent currency handling
  - Better type safety
  - Multi-currency ready

---

## Phase 3: API Route Template

### Current State Analysis
**Problem:** 50+ API routes with duplicate boilerplate:
- `export const runtime = 'nodejs'`
- Similar error handling patterns
- Repeated auth checks
- Duplicate response formatting

### Consolidation Strategy

#### Step 1: Create Route Template
**New File:** `src/lib/api/route-template.ts`

```typescript
export function createApiRoute(config: {
  runtime?: 'nodejs' | 'edge'
  auth?: boolean
  handler: (req: Request, context: RouteContext) => Promise<Response>
}) {
  // Template implementation
}
```

#### Step 2: Gradual Migration
- Start with new routes
- Migrate existing routes incrementally
- Add ESLint rule to enforce pattern

### Impact Assessment
- **Files Affected:** 50+ API routes
- **Breaking Changes:** None (gradual migration)
- **Benefits:**
  - 60% less boilerplate
  - Consistent error handling
  - Easier testing

---

## Phase 4: Validation Schema Consolidation

### Current State Analysis
**Problem:** Overlapping validation schemas across domains

**Duplicate Patterns:**
- Pagination schemas
- Date range schemas
- Currency amount schemas
- Phone/email validation

### Consolidation Strategy

#### Step 1: Extract Common Schemas
**New File:** `src/lib/validations/common.ts`

```typescript
export const paginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(100)
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
})

export const currencyAmountSchema = z.number().min(0).max(100000000)
```

#### Step 2: Refactor Domain Schemas
Update domain schemas to reuse common parts

### Impact Assessment
- **Files Affected:** 10+ validation files
- **Breaking Changes:** None (schema behavior unchanged)
- **Benefits:**
  - DRY principle
  - Consistent validation
  - Easier updates

---

## Implementation Timeline

### Week 1-2: Phase 1 (Constants)
- [x] Audit complete
- [ ] Remove duplicates from form-utils.ts
- [ ] Remove duplicates from shared/index.ts
- [ ] Add migration helpers
- [ ] Update imports
- [ ] Test thoroughly

### Week 3-4: Phase 2 (Currency)
- [ ] Audit all formatCurrency usage
- [ ] Update imports to currency.ts
- [ ] Remove duplicate from utilities.ts
- [ ] Test formatting across app
- [ ] Performance testing

### Week 5-6: Phase 3 (API Routes)
- [ ] Create route template
- [ ] Document pattern
- [ ] Migrate 5 routes as pilot
- [ ] Add ESLint rule
- [ ] Gradual migration plan

### Week 7-8: Phase 4 (Validation)
- [ ] Extract common schemas
- [ ] Update domain schemas
- [ ] Integration testing
- [ ] Documentation

---

## Success Metrics

### Code Quality
- **Duplication Reduction:** Target 60% reduction
- **File Count:** Reduce by ~10 files
- **Bundle Size:** Reduce by ~5-10KB

### Developer Experience
- **Onboarding Time:** Easier to find constants
- **Maintenance Time:** Single place to update
- **Bug Reduction:** Consistent behavior

### Performance
- **Build Time:** Slight improvement from less code
- **Runtime:** No impact (same logic)
- **Bundle Size:** Smaller from deduplication

---

## Risk Mitigation

### Testing Strategy
1. Unit tests for all consolidated utilities
2. Integration tests for critical paths
3. Manual testing of UI components
4. Regression testing

### Rollback Plan
1. Git branches for each phase
2. Feature flags for gradual rollout
3. Monitoring for errors
4. Quick revert capability

### Communication
1. Team notification before each phase
2. Documentation updates
3. Code review for all changes
4. Post-implementation review

---

## Next Steps

1. **Immediate:** Complete Phase 1 (Constants)
2. **This Week:** Start Phase 2 (Currency)
3. **Next Sprint:** Plan Phase 3 (API Routes)
4. **Future:** Phase 4 (Validation)

---

## Appendix: File Inventory

### Constants Files
- ✅ `src/lib/shared/constants.ts` - PRIMARY
- ⚠️ `src/lib/shared/form-utils.ts` - HAS DUPLICATES
- ⚠️ `src/shared/index.ts` - HAS DUPLICATES

### Currency Files
- ✅ `src/lib/currency.ts` - PRIMARY
- ⚠️ `src/lib/shared/utilities.ts` - HAS DUPLICATE

### API Route Files
- 50+ files in `src/app/api/**/**/route.ts`

### Validation Files
- `src/lib/validations/domains/*.ts`
- `src/lib/validations/index.ts`

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-22  
**Status:** Phase 1 In Progress
