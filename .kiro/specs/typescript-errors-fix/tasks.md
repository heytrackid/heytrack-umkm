# Implementation Plan

- [x] 1. Consolidate type definitions and remove duplicates
  - [x] 1.1 Remove duplicate `WorkflowContext` and `WorkflowResult` from `src/lib/automation/workflows/order-workflows.ts`
    - Import `WorkflowContext` and `WorkflowResult` from `@/types/features/automation`
    - Remove local type definitions
    - Update all references to use imported types
    - _Requirements: 3.1, 3.2_
  
  - [x] 1.2 Update test file imports to use canonical types
    - Update `src/lib/automation/workflows/__tests__/order-workflows.test.ts` to import types from `@/types/features/automation`
    - Remove any local type definitions
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 1.3 Update workflow index to use canonical types
    - Update `src/lib/automation/workflows/index.ts` to import types from `@/types/features/automation`
    - Ensure consistent type usage across all workflow registrations
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Fix AutomationConfig incomplete definitions
  - [x] 2.1 Update default config in `src/lib/automation/base-workflow.ts`
    - Add all 9 missing required properties to default config object
    - Set appropriate default values for each property
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Fix AutomationConfig import in `src/lib/automation/production-automation/system.ts`
    - Ensure `AutomationConfig` is imported from `@/types/features/automation`
    - Update `ProductionPlan` type to match expected structure with items, totalCost, estimatedTime
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.3 Update test file AutomationConfig mocks
    - Update `src/lib/automation/workflows/__tests__/order-workflows.test.ts` to include all required config properties in mocks
    - _Requirements: 2.1, 2.2_

- [x] 3. Fix component type errors
  - [x] 3.1 Fix generic type constraint in `src/components/ui/lazy-wrapper.tsx`
    - Update `createLazyComponent` to properly constrain TProps for ComponentType compatibility
    - Ensure WrappedComponent properly types props spreading
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.2 Define explicit prop interfaces in `src/modules/recipes/components/LazyComponents.tsx`
    - Create `SmartPricingAssistantProps` interface with recipeId, recipeName, and index signature
    - Update all component usages to use the defined interface
    - Fix ComponentType constraint issue with Record<string, unknown>
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Fix database query type errors
  - [x] 4.1 Fix transaction operation types in `src/lib/database/order-transactions.ts`
    - Ensure operation 3 (financial record) returns consistent `{ id: string } | null` type
    - Update operation array type to match TransactionOperation expectations
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 4.2 Fix SelectQueryError handling in `src/services/production/ProductionBatchService.ts`
    - Add proper error type checking before passing to error handler
    - Extract error message from SelectQueryError type
    - _Requirements: 4.1, 4.3_
  
  - [x] 4.3 Fix recipe ingredient type in `src/services/hpp/HppCalculatorService.ts`
    - Ensure ingredient data structure matches expected nested type with all required properties
    - Add type assertion or update query to include missing properties
    - _Requirements: 8.1, 8.2_

- [x] 5. Fix notification and generic type errors
  - [x] 5.1 Add missing type property in `src/lib/communications/manager.ts`
    - Add `type: 'info' as const` to notification data object
    - Ensure all required SmartNotification properties are present
    - _Requirements: 5.1, 5.2_
  
  - [x] 5.2 Fix generic constraint in `src/lib/errors/monitoring-service.ts`
    - Add type guard to ensure string type before using as object key
    - Update generic type parameter to satisfy `string | number | symbol` constraint
    - _Requirements: 6.1, 6.2_
  
  - [x] 5.3 Fix overload signature in `src/lib/shared/form-utils.ts`
    - Review and align function overload signatures with implementation
    - Ensure parameter types match across all overloads
    - _Requirements: 6.2, 6.3_
  
  - [x] 5.4 Fix index signature in `src/lib/debugging.ts`
    - Add proper type checking before dynamic property access
    - Use type guard or Record<string, unknown> type for indexed object
    - _Requirements: 7.1, 7.2_

- [x] 6. Verify all fixes and run tests
  - [x] 6.1 Run TypeScript compiler check
    - Execute `pnpm exec tsc --noEmit` to verify all 28 errors are resolved
    - Ensure no new errors were introduced
    - _Requirements: All_
  
  - [x] 6.2 Run build and lint checks
    - Execute `pnpm build` to ensure production build succeeds
    - Execute `pnpm lint` to ensure no new linting issues
    - _Requirements: All_
