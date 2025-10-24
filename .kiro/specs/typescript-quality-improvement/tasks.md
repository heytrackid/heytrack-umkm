# Implementation Plan

## Current Status Summary

**Completed:** Tasks 1-8, 11 - Core type infrastructure and major library files are fixed
**Remaining:** Tasks 9-10, 12-20 - Service files, modules, hooks, and final verification

**Key Remaining Work:**
- Fix ~60 remaining `any` types across services/, modules/, hooks/, and lib/ directories
- Type production automation and HPP automation helper methods  
- Fix error handling catch blocks (error: any → error: unknown)
- Type API validation middleware composition
- Final verification and build testing

**Note:** Most files have good type safety. Focus is on fixing explicit `any` usage, error handling, and improving type inference where needed.

---

- [x] 1. Setup type infrastructure and base definitions
  - Create new type definition files for API responses, components, and utilities
  - Add utility type helpers for common patterns
  - Create type guards and assertion functions
  - _Requirements: 1.3, 3.1, 3.2, 3.5_

- [x] 2. Fix core type definitions in src/types/
  - [x] 2.1 Enhance src/types/database.ts with proper table types
    - Add specific types for each database table
    - Create Insert and Update types for each table
    - Remove any usage in database types
    - _Requirements: 1.1, 3.1_

  - [x] 2.2 Create src/types/api.ts for API response types
    - Define ApiResponse<T> interface
    - Define ApiError interface
    - Define PaginatedResponse<T> interface
    - _Requirements: 3.2, 6.2_

  - [x] 2.3 Create src/types/components.ts for component prop types
    - Define BaseComponentProps interface
    - Define common component prop patterns
    - _Requirements: 5.1, 5.4_

  - [x] 2.4 Create src/types/utils.ts for utility types
    - Add RequiredNonNull<T> type
    - Add AsyncReturnType<T> type
    - Add type guard helpers
    - _Requirements: 1.3, 3.5_

- [x] 3. Fix src/lib/supabase.ts
  - [x] 3.1 Replace `any` types with proper SupabaseClient types
    - Fix _supabaseClient type from `any` to proper type
    - Fix getSupabaseClient return type
    - Fix mockClient type assertion
    - _Requirements: 1.1, 1.3_

  - [x] 3.2 Add proper generic types for database operations
    - Type all query methods
    - Add proper return types
    - _Requirements: 1.2, 3.3_

- [x] 4. Fix src/lib/automation-engine.ts
  - [x] 4.1 Replace `any` in database queries
    - Fix `(supabase as any)` type assertion
    - Add proper types for order queries
    - _Requirements: 1.1, 1.3_

  - [x] 4.2 Type generateHPPBusinessInsights function
    - Replace `affectedRecipes: any[]` with proper type
    - Add proper parameter types
    - _Requirements: 1.1, 3.3_

  - [x] 4.3 Type triggerEvent function
    - Replace `data: any = {}` with proper type
    - Add generic type parameter if needed
    - _Requirements: 1.1, 3.3_

- [x] 5. Fix src/lib/hpp-alert-detector.ts
  - [x] 5.1 Replace type assertions in cost breakdown
    - Fix `current.cost_breakdown as any`
    - Fix `previous.cost_breakdown as any`
    - Create proper CostBreakdown interface
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 5.2 Type affected_components properly
    - Replace `as any` assertions
    - Create proper ComponentChange interface
    - _Requirements: 1.1, 3.1_

- [x] 6. Fix src/lib/optimized-api.ts
  - [x] 6.1 Replace Map<string, Promise<any>> with proper types
    - Add generic type to RequestDeduplicator
    - Fix pendingRequests type
    - _Requirements: 1.1, 1.3_

  - [x] 6.2 Type API response methods
    - Fix getIngredients return type from `any[]`
    - Fix getRecipes return type from `any[]`
    - Fix getOrders return type from `any[]`
    - Fix getCustomers return type from `any[]`
    - _Requirements: 1.1, 3.2_

  - [x] 6.3 Type useOptimizedAPI hook
    - Replace `deps: any[] = []` with proper type
    - Add proper generic constraints
    - _Requirements: 1.1, 7.3_

- [x] 7. Fix src/lib/enhanced-api.ts
  - [x] 7.1 Type cache and pending requests
    - Fix `Map<string, Promise<any>>` type
    - Fix `Map<string, CacheEntry<any>>` type
    - _Requirements: 1.1, 1.3_

  - [x] 7.2 Type generateCacheKey parameter
    - Replace `params: any = {}` with proper type
    - _Requirements: 1.1, 3.3_

  - [x] 7.3 Type fetchWithCache method
    - Replace `queryFn: () => Promise<any>` with proper generic
    - _Requirements: 1.1, 3.3_

- [x] 8. Fix src/lib/api/cache.ts
  - [x] 8.1 Type cache maps properly
    - Fix `Map<string, CacheEntry<any>>` type
    - Fix `Map<string, Promise<any>>` type
    - Add proper generic types
    - _Requirements: 1.1, 1.3_

  - [x] 8.2 Type mutateWithCache function
    - Replace `R = any` with proper constraint
    - _Requirements: 1.1, 3.3_

- [x] 9. Fix src/lib/production-automation.ts
  - [x] 9.1 Type generateProductionSchedule parameters
    - Replace `orders: unknown[]` with proper Order[] type
    - Replace `ingredients: unknown[]` with proper Ingredient[] type
    - Replace `recipes: unknown[]` with proper Recipe[] type
    - _Requirements: 1.1, 3.1_

  - [x] 9.2 Type helper methods
    - Fix createProductionTask parameters from `any` to proper types
    - Fix groupOrdersByDeliveryDate to use proper Order type
    - Fix findScheduleConflicts ingredients parameter type
    - _Requirements: 1.1, 3.3_

- [x] 10. Fix src/lib/automation/hpp-automation.ts
  - [x] 10.1 Type recalculateRecipeHPP return type
    - Replace `Promise<any>` with proper HPPRecalculationResult interface
    - Create HPPRecalculationResult type with proper fields
    - _Requirements: 1.1, 3.4_

  - [x] 10.2 Type calculation helper methods
    - Fix calculateIngredientCosts parameter type from `any[]` to proper RecipeIngredient[]
    - Fix calculatePackagingCosts parameter type from `any[]` to proper PackagingItem[]
    - Fix generatePriceChangeNotifications affectedRecipes parameter type
    - Fix getRecipeData return type with proper Recipe interface
    - Fix getAllRecipeIds to return proper type
    - _Requirements: 1.1, 3.3_

  - [x] 10.3 Fix error handling catch blocks
    - Replace `catch (error: any)` with `catch (error: unknown)` in recalculateAllRecipes
    - Replace `catch (error: any)` in findRecipesUsingIngredient
    - Replace `catch (error: any)` in getAllRecipeIds
    - _Requirements: 1.1, 8.5_

- [x] 11. Fix src/lib/search-filter.ts
  - [x] 11.1 Type filterByConditions properly
    - Replace `conditions: Record<keyof T, any>` with proper type
    - Add proper generic constraints
    - _Requirements: 1.1, 1.3_

- [ ] 12. Fix src/lib/api-validation.ts
  - [ ] 12.1 Type withMiddleware function
    - Fix handler parameter type from `unknown` to proper NextRequest handler type
    - Fix middlewares array type from `Array<(handler: unknown) => any>` to proper middleware type
    - Add proper generic constraints for middleware composition
    - _Requirements: 1.1, 3.3, 6.5_

  - [ ] 12.2 Fix error handling
    - Replace `catch (error: unknown)` assertions with proper type guards
    - Fix error.code and error.message access with proper type checking
    - _Requirements: 1.1, 8.5_

- [x] 13. Fix src/services/ directory
  - [x] 13.1 Fix src/services/production/ProductionDataIntegration.ts
    - Replace `seasonal_trends: any[]` with proper SeasonalTrend[] type
    - _Requirements: 1.1, 3.1_

  - [x] 13.2 Fix src/services/production/BatchSchedulingService.ts
    - Type validateBatches parameter from `any[]` to ProductionBatch[]
    - Type resourceTimeline Map from `Map<string, any[]>` to proper type
    - Fix error handling catch blocks with `error: unknown`
    - _Requirements: 1.1, 3.3_

  - [x] 13.3 Fix src/services/inventory/AutoReorderService.ts
    - Type needsReorder rule parameter from `any` to ReorderRule
    - Type calculateReorderQuantity parameters from `any` to proper types
    - Type estimateReorderCost ingredient parameter
    - Fix error handling catch blocks
    - _Requirements: 1.1, 3.3_

  - [x] 13.4 Fix src/services/excel-export-lazy.service.ts
    - Replace `data: Record<string, any>[]` with proper generic type
    - Fix recipe/ingredient/order/customer mapping with proper types
    - Fix error handling catch blocks
    - _Requirements: 1.1, 3.1_

- [x] 14. Fix src/modules/ directory
  - [x] 14.1 Fix src/modules/reports/index.ts
    - Replace `data: any[]` with proper generic type `data: T[]`
    - _Requirements: 1.1, 3.1_

  - [x] 14.2 Fix src/modules/notifications/components/LazyComponents.tsx
    - Type ingredients from `any[]` to Ingredient[]
    - Type orders from `any[]` to Order[]
    - Type financialMetrics from `any` to FinancialMetrics
    - Replace `[key: string]: any` with proper index signature
    - _Requirements: 1.1, 5.1_

  - [x] 14.3 Fix src/modules/notifications/components/SmartNotificationCenter.tsx
    - Fix type assertion `notif.type as any` with proper enum type
    - Fix type assertion `notif.category as any` with proper enum type
    - Fix error handling catch block
    - _Requirements: 1.1, 5.1_

  - [x] 14.4 Fix src/modules/orders/ components
    - Fix OrderDetailView order prop from `any` to proper Order type
    - Fix OrdersTableView state types from `any[]` and `any` to proper types
    - Fix OrdersPage activeView type assertion
    - Fix helper functions parameter types
    - _Requirements: 1.1, 5.1_

  - [x] 14.5 Fix src/modules/orders/services/ files
    - Fix RecipeRecommendationService recipeFrequency Map type
    - Fix RecipeAvailabilityService checkIngredientAvailability parameter
    - Fix all error handling catch blocks
    - _Requirements: 1.1, 3.3_

- [ ] 15. Fix src/hooks/ directory
  - [ ] 15.1 Fix src/hooks/useSupabaseCRUD.ts
    - Already has proper generic types, verify implementation
    - Ensure all return types are explicit
    - _Requirements: 1.1, 7.1, 7.2_

  - [ ] 15.2 Review and verify other hooks
    - Check useAuth, useSupabase, useLoading for any remaining issues
    - Ensure all hooks have explicit return types
    - Verify generic constraints are properly defined
    - _Requirements: 7.1, 7.4_

- [ ] 16. Fix src/components/ directory
  - [ ] 16.1 Review component prop types
    - Most components already have proper interfaces
    - Verify all event handlers are properly typed
    - Check for any remaining implicit types
    - _Requirements: 5.1, 5.3_

  - [ ] 16.2 Verify children prop types
    - Ensure React.ReactNode is used consistently
    - Already defined in BaseComponentProps
    - _Requirements: 5.4_

- [ ] 17. Fix src/app/api/ routes
  - [ ] 17.1 Review API route handlers
    - Most routes already use proper validation with Zod schemas
    - Verify all request/response bodies are typed
    - Check for any remaining implicit types
    - _Requirements: 6.1, 6.2_

  - [ ] 17.2 Verify error response types
    - Error handling already uses typed responses via api-validation
    - Ensure consistency across all routes
    - _Requirements: 6.3_

  - [ ] 17.3 Verify query and route parameters
    - Most routes use proper parameter extraction
    - Ensure all dynamic routes have typed params
    - _Requirements: 6.4_

- [ ] 18. Verify import consistency
  - [ ] 18.1 Verify path alias usage
    - Path aliases (@/) are already consistently used
    - Spot check for any remaining relative imports
    - _Requirements: 2.2_

  - [ ] 18.2 Verify React imports
    - React 19 doesn't require React import for JSX
    - Check for unnecessary imports
    - _Requirements: 2.4_

  - [ ] 18.3 Check for circular dependencies
    - Run build to identify any circular imports
    - Fix if any are found
    - _Requirements: 2.3_

- [ ] 19. Review TypeScript configuration
  - [ ] 19.1 Consider enabling stricter compiler options
    - Evaluate enabling noUnusedLocals (may have many violations)
    - Evaluate enabling noUnusedParameters (may have many violations)
    - Evaluate enabling noImplicitReturns
    - Enable incrementally to avoid breaking changes
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 19.2 Verify path mappings
    - Path mappings already configured correctly
    - Test that all @/ imports resolve properly
    - _Requirements: 4.5_

- [ ] 20. Final verification and cleanup
  - [ ] 20.1 Run type check on entire codebase
    - Execute `npm run type-check` or `tsc --noEmit`
    - Fix any remaining type errors
    - Document any intentional suppressions
    - _Requirements: 1.4_

  - [ ] 20.2 Search for remaining any usage
    - Run grep search for explicit `any` types
    - Verify all are either fixed or documented as intentional
    - Focus on: `any[]`, `: any`, `<any>`, `as any`
    - _Requirements: 1.1_

  - [ ] 20.3 Test build process
    - Run full production build
    - Ensure build completes successfully
    - Verify build time is reasonable (< 2 minutes)
    - Test that application runs correctly after build
    - _Requirements: 4.4_

  - [ ] 20.4 Document remaining technical debt
    - Create list of any remaining `any` types with justification
    - Document any areas that need future improvement
    - Update this spec with lessons learned
    - _Requirements: 1.1, 1.4_
