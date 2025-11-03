# Design Document

## Overview

This design outlines the systematic approach to fixing 28 TypeScript compilation errors across the HeyTrack application. The errors fall into several categories: component type mismatches, automation configuration inconsistencies, workflow context type conflicts, database query type issues, and generic type constraint violations.

## Architecture

### Error Categories

The errors are organized into 8 distinct categories:

1. **Component Type Errors** (4 errors) - React component prop type mismatches
2. **Automation Config Errors** (3 errors) - Incomplete AutomationConfig objects
3. **Workflow Context Errors** (7 errors) - Type path conflicts in WorkflowContext
4. **Database Query Errors** (3 errors) - Supabase query type mismatches
5. **Notification Type Errors** (1 error) - SmartNotification property mismatches
6. **Generic Constraint Errors** (3 errors) - Type parameter constraint violations
7. **Index Signature Errors** (1 error) - Implicit any from string indexing
8. **Recipe Ingredient Errors** (2 errors) - Nested data structure type mismatches

### Root Causes

1. **Type Import Path Conflicts**: Multiple definitions of the same type (e.g., `WorkflowContext`, `AutomationConfig`) exist in different files, causing type incompatibility
2. **Incomplete Type Definitions**: Default config objects missing required properties
3. **Generic Type Constraints**: Component wrappers not properly constraining generic types
4. **Database Schema Mismatches**: Query results not matching expected types due to schema changes
5. **Implicit Any Types**: Dynamic property access without proper type guards

## Components and Interfaces

### 1. Component Type Fixes

#### lazy-wrapper.tsx
- **Issue**: `TProps` generic not properly constrained for React components
- **Solution**: Add `ComponentType` constraint to ensure TProps is valid for React components
- **Change**: Update `createLazyComponent` signature to properly type the wrapped component

#### LazyComponents.tsx
- **Issue**: Props passed to lazy components don't match expected types
- **Solution**: Define explicit prop interfaces for lazy-loaded components
- **Change**: Create `SmartPricingAssistantProps` interface and use it consistently

### 2. Automation Configuration Fixes

#### base-workflow.ts
- **Issue**: Default config missing 9 required properties
- **Solution**: Add all required properties from `AutomationConfig` interface
- **Properties to add**:
  - `defaultProfitMargin: 0.3`
  - `minimumProfitMargin: 0.15`
  - `maximumProfitMargin: 0.6`
  - `autoReorderDays: 7`
  - `safetyStockMultiplier: 1.5`
  - `productionLeadTime: 2`
  - `batchOptimizationThreshold: 10`
  - `lowProfitabilityThreshold: 0.2`
  - `cashFlowWarningDays: 30`

#### production-automation/system.ts
- **Issue**: `ProductionPlan` type mismatch and `AutomationConfig` import conflict
- **Solution**: 
  - Import `ProductionPlan` from correct location
  - Ensure `AutomationConfig` is imported from `@/types/features/automation`
  - Update return type to match expected structure

### 3. Workflow Context Type Consolidation

#### Strategy
- **Root Cause**: `WorkflowContext` defined in multiple locations
  - `src/types/features/automation.ts` (canonical)
  - `src/lib/automation/workflows/order-workflows.ts` (duplicate)
- **Solution**: Remove duplicate definition, use single source of truth

#### Files to Update
1. `order-workflows.ts` - Remove local `WorkflowContext` definition, import from types
2. `order-workflows.test.ts` - Update imports to use canonical type
3. `workflows/index.ts` - Ensure consistent type usage

### 4. Database Query Type Fixes

#### order-transactions.ts
- **Issue**: Transaction operation array type mismatch
- **Solution**: Ensure all operations return consistent nullable types
- **Change**: Update operation 3 to return `{ id: string } | null` instead of `{ id: string } | null | { id: string }[]`

#### ProductionBatchService.ts
- **Issue**: `SelectQueryError` type not compatible with `DataObject`
- **Solution**: Add proper error handling before passing to error handler
- **Change**: Check for error type and extract message before passing to handler

### 5. Notification Type Fixes

#### communications/manager.ts
- **Issue**: Notification object missing required properties
- **Solution**: Add missing `type` property to notification
- **Change**: Add `type: 'info' as const` to notification data

### 6. Generic Constraint Fixes

#### monitoring-service.ts
- **Issue**: Generic type parameter doesn't satisfy `string | number | symbol` constraint
- **Solution**: Add type guard to ensure string type before using as key
- **Change**: Use conditional type checking or type assertion

#### form-utils.ts
- **Issue**: Overload signature mismatch
- **Solution**: Review function overloads and ensure parameter types match
- **Change**: Align overload signatures with implementation

#### LazyComponents.tsx (ComponentType)
- **Issue**: `Record<string, unknown>` doesn't satisfy `ComponentType` constraint
- **Solution**: Use proper component type instead of Record
- **Change**: Define explicit component prop types

### 7. Index Signature Fixes

#### debugging.ts
- **Issue**: String expression used to index object without index signature
- **Solution**: Add type guard or use `Record<string, unknown>` type
- **Change**: Add proper type checking before property access

### 8. Recipe Ingredient Type Fixes

#### HppCalculatorService.ts
- **Issue**: Ingredient data structure doesn't match expected nested type
- **Solution**: Ensure query includes all required nested properties
- **Change**: Update query or add type assertion with proper validation

## Data Models

### Type Consolidation Map

```typescript
// Canonical type locations
AutomationConfig -> src/types/features/automation.ts
WorkflowContext -> src/types/features/automation.ts
WorkflowResult -> src/types/features/automation.ts
ProductionPlan -> src/types/features/automation.ts
SmartNotification -> src/types/features/automation.ts
```

### Updated Type Definitions

```typescript
// Complete AutomationConfig
interface AutomationConfig {
  enabled: boolean
  maxConcurrentJobs: number
  retryAttempts: number
  notificationEnabled: boolean
  defaultProfitMargin: number
  minimumProfitMargin: number
  maximumProfitMargin: number
  autoReorderDays: number
  safetyStockMultiplier: number
  productionLeadTime: number
  batchOptimizationThreshold: number
  lowProfitabilityThreshold: number
  cashFlowWarningDays: number
}

// Component prop types
interface SmartPricingAssistantProps {
  recipeId: string
  recipeName: string
  [key: string]: unknown
}
```

## Error Handling

### Type Error Prevention Strategy

1. **Single Source of Truth**: Use canonical type definitions from `@/types`
2. **Explicit Imports**: Always import types from their canonical location
3. **Type Guards**: Add runtime type checking for dynamic operations
4. **Strict Null Checks**: Handle nullable types explicitly
5. **Generic Constraints**: Properly constrain generic type parameters

### Validation Approach

1. Fix errors in dependency order (types first, then consumers)
2. Run `tsc --noEmit` after each category of fixes
3. Verify no new errors introduced
4. Check related files for similar patterns

## Testing Strategy

### Verification Steps

1. **Type Check**: Run `pnpm exec tsc --noEmit` to verify all errors resolved
2. **Build Test**: Run `pnpm build` to ensure production build succeeds
3. **Lint Check**: Run `pnpm lint` to ensure no new linting issues
4. **Unit Tests**: Run existing tests to ensure no runtime regressions

### Test Coverage

- Component rendering with correct props
- Automation workflows with complete config
- Database queries with proper types
- Error handling with type guards

### Regression Prevention

1. Add type tests for critical interfaces
2. Document type import patterns
3. Create ESLint rules for type import consistency
4. Add pre-commit hooks for type checking

## Implementation Order

1. **Phase 1**: Type consolidation (remove duplicates, establish canonical sources)
2. **Phase 2**: Configuration fixes (complete AutomationConfig objects)
3. **Phase 3**: Component type fixes (add proper constraints and interfaces)
4. **Phase 4**: Database query fixes (align types with schema)
5. **Phase 5**: Generic and index signature fixes (add proper constraints)
6. **Phase 6**: Verification (run full type check and tests)

## Dependencies

- TypeScript 5.9
- React 18.3 type definitions
- Supabase type definitions
- Existing type definitions in `src/types/`

## Performance Considerations

- Type checking performance should not be impacted
- No runtime performance impact (types are compile-time only)
- Build time may slightly improve with fewer type errors

## Security Considerations

- Type safety improvements reduce runtime errors
- Proper null checking prevents potential crashes
- Type guards add runtime validation where needed
