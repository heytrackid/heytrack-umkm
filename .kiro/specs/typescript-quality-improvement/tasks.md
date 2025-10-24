# Implementation Plan

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

- [-] 3. Fix src/lib/supabase.ts
  - [-] 3.1 Replace `any` types with proper SupabaseClient types
    - Fix _supabaseClient type from `any` to proper type
    - Fix getSupabaseClient return type
    - Fix mockClient type assertion
    - _Requirements: 1.1, 1.3_

  - [ ] 3.2 Add proper generic types for database operations
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

- [-] 6. Fix src/lib/optimized-api.ts
  - [x] 6.1 Replace Map<string, Promise<any>> with proper types
    - Add generic type to RequestDeduplicator
    - Fix pendingRequests type
    - _Requirements: 1.1, 1.3_

  - [ ] 6.2 Type API response methods
    - Fix getIngredients return type from `any[]`
    - Fix getRecipes return type from `any[]`
    - Fix getOrders return type from `any[]`
    - Fix getCustomers return type from `any[]`
    - _Requirements: 1.1, 3.2_

  - [ ] 6.3 Type useOptimizedAPI hook
    - Replace `deps: any[] = []` with proper type
    - Add proper generic constraints
    - _Requirements: 1.1, 7.3_

- [ ] 7. Fix src/lib/enhanced-api.ts
  - [ ] 7.1 Type cache and pending requests
    - Fix `Map<string, Promise<any>>` type
    - Fix `Map<string, CacheEntry<any>>` type
    - _Requirements: 1.1, 1.3_

  - [ ] 7.2 Type generateCacheKey parameter
    - Replace `params: any = {}` with proper type
    - _Requirements: 1.1, 3.3_

  - [ ] 7.3 Type fetchWithCache method
    - Replace `queryFn: () => Promise<any>` with proper generic
    - _Requirements: 1.1, 3.3_

- [ ] 8. Fix src/lib/api/cache.ts
  - [ ] 8.1 Type cache maps properly
    - Fix `Map<string, CacheEntry<any>>` type
    - Fix `Map<string, Promise<any>>` type
    - Add proper generic types
    - _Requirements: 1.1, 1.3_

  - [ ] 8.2 Type mutateWithCache function
    - Replace `R = any` with proper constraint
    - _Requirements: 1.1, 3.3_

- [ ] 9. Fix src/lib/production-automation.ts
  - [ ] 9.1 Type generateProductionSchedule parameters
    - Replace `orders: any[]` with proper Order[] type
    - Replace `ingredients: any[]` with proper Ingredient[] type
    - Replace `recipes: any[]` with proper Recipe[] type
    - _Requirements: 1.1, 3.1_

  - [ ] 9.2 Type helper methods
    - Fix validateBatches parameter type
    - Fix resourceTimeline Map type
    - _Requirements: 1.1, 3.3_

- [ ] 10. Fix src/lib/automation/hpp-automation.ts
  - [ ] 10.1 Type recalculateRecipeHPP return type
    - Replace `Promise<any>` with proper return type
    - _Requirements: 1.1, 3.4_

  - [ ] 10.2 Type calculation helper methods
    - Fix calculateIngredientCosts parameter type
    - Fix calculatePackagingCosts parameter type
    - Fix generatePriceChangeNotifications parameter type
    - _Requirements: 1.1, 3.3_

- [ ] 11. Fix src/lib/search-filter.ts
  - [ ] 11.1 Type filterByConditions properly
    - Replace `conditions: Record<keyof T, any>` with proper type
    - Add proper generic constraints
    - _Requirements: 1.1, 1.3_

- [ ] 12. Fix src/lib/api-validation.ts
  - [ ] 12.1 Replace z.any() with proper schemas
    - Fix BulkUpdateSchema updates field
    - Create proper schema for updates
    - _Requirements: 1.1, 1.3_

  - [ ] 12.2 Type withMiddleware function
    - Fix handler parameter type
    - Fix middlewares array type
    - _Requirements: 1.1, 3.3, 6.5_

- [ ] 13. Fix src/services/ directory
  - [ ] 13.1 Fix src/services/production/ProductionDataIntegration.ts
    - Replace `seasonal_trends: any[]` with proper type
    - _Requirements: 1.1, 3.1_

  - [ ] 13.2 Fix src/services/production/BatchSchedulingService.ts
    - Type validateBatches parameter properly
    - Type resourceTimeline Map properly
    - _Requirements: 1.1, 3.3_

- [ ] 14. Fix src/modules/ directory
  - [ ] 14.1 Fix src/modules/reports/index.ts
    - Replace `data: any[]` with proper generic type
    - _Requirements: 1.1, 3.1_

  - [ ] 14.2 Fix src/modules/notifications/components/LazyComponents.tsx
    - Type ingredients, orders, financialMetrics properly
    - Remove `unknown` type usage
    - _Requirements: 1.1, 5.1_

- [ ] 15. Fix src/hooks/ directory
  - [ ] 15.1 Fix src/hooks/useSupabaseCRUD.ts
    - Add proper generic types throughout
    - Fix return types
    - _Requirements: 1.1, 7.1, 7.2_

  - [ ] 15.2 Fix other hooks with any usage
    - Review and fix all hooks
    - Add explicit return types
    - _Requirements: 7.1, 7.4_

- [ ] 16. Fix src/components/ directory
  - [ ] 16.1 Add prop interfaces for all components
    - Create proper Props interfaces
    - Type all event handlers
    - _Requirements: 5.1, 5.3_

  - [ ] 16.2 Fix children prop types
    - Use React.ReactNode for children
    - _Requirements: 5.4_

- [ ] 17. Fix src/app/api/ routes
  - [ ] 17.1 Type all request handlers
    - Add proper types for request bodies
    - Add proper types for response bodies
    - _Requirements: 6.1, 6.2_

  - [ ] 17.2 Type error responses
    - Use typed error responses
    - _Requirements: 6.3_

  - [ ] 17.3 Type query and route parameters
    - Add proper types for all parameters
    - _Requirements: 6.4_

- [ ] 18. Fix import statements
  - [ ] 18.1 Ensure consistent path alias usage
    - Use @/ for all src imports
    - Fix any relative imports that should use aliases
    - _Requirements: 2.2_

  - [ ] 18.2 Fix React imports
    - Use named imports consistently
    - Remove unnecessary React imports in React 19
    - _Requirements: 2.4_

  - [ ] 18.3 Check for circular dependencies
    - Identify and fix any circular imports
    - _Requirements: 2.3_

- [ ] 19. Update TypeScript configuration
  - [ ] 19.1 Enable stricter compiler options
    - Enable noUnusedLocals
    - Enable noUnusedParameters
    - Enable noImplicitReturns
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 19.2 Verify path mappings
    - Ensure all module aliases work correctly
    - _Requirements: 4.5_

- [ ] 20. Final verification and cleanup
  - [ ] 20.1 Run type check on entire codebase
    - Fix any remaining type errors
    - _Requirements: 1.4_

  - [ ] 20.2 Search for remaining any usage
    - Verify no explicit any types remain
    - _Requirements: 1.1_

  - [ ] 20.3 Test build process
    - Ensure build completes successfully
    - Verify build time is reasonable
    - _Requirements: 4.4_
