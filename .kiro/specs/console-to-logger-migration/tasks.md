# Implementation Plan

- [x] 1. Prepare logger utility and verify setup
  - Verify that `src/lib/logger.ts` is properly configured
  - Ensure all context-specific loggers are exported correctly
  - Test logger output in development mode
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3_

- [x] 2. Migrate Services Layer
  - [x] 2.1 Migrate `src/services/production/ProductionDataIntegration.ts`
    - Replace all `console.error()` with `logger.error()`
    - Add logger import statement
    - Use appropriate error object format with `{ err: error }`
    - _Requirements: 1.2, 2.7, 3.1, 4.1, 4.2_

  - [x] 2.2 Migrate `src/services/production/BatchSchedulingService.ts`
    - Replace all `console.error()` with `logger.error()`
    - Add logger import statement
    - _Requirements: 1.2, 2.7, 3.1, 4.1_

  - [x] 2.3 Migrate `src/services/excel-export-lazy.service.ts`
    - Replace all `console.error()` with `logger.error()`
    - Add logger import statement
    - _Requirements: 1.2, 2.7, 3.1, 4.1_

- [x] 3. Migrate Modules Layer
  - [x] 3.1 Migrate `src/modules/orders/services/` directory
    - Migrate `ProductionTimeService.ts`
    - Migrate `InventoryUpdateService.ts`
    - Migrate `RecipeAvailabilityService.ts`
    - Migrate `RecipeRecommendationService.ts`
    - Migrate `OrderPricingService.ts`
    - Migrate `OrderValidationService.ts`
    - Replace all `console.error()` with `logger.error()`
    - Add logger import statements
    - _Requirements: 1.2, 2.7, 3.1, 4.1_

  - [x] 3.2 Migrate `src/modules/orders/components/` directory
    - Migrate `OrdersPage.tsx` - use `uiLogger`
    - Migrate `OrderForm.tsx` - use `uiLogger`
    - Replace `console.error()` with `uiLogger.error()`
    - Add uiLogger import statements
    - _Requirements: 1.2, 2.6, 3.2, 4.1_

  - [x] 3.3 Migrate `src/modules/recipes/` directory
    - Migrate `hooks/useHPPCalculation.ts`
    - Migrate `services/HPPCalculationService.ts`
    - Migrate `components/EnhancedHPPCalculator.tsx` - use `uiLogger`
    - Migrate `components/RecipesPage.tsx` - use `uiLogger`
    - Migrate `components/SmartPricingAssistant.tsx` - use `uiLogger`
    - Migrate `components/AdvancedHPPCalculator.tsx` - use `uiLogger`
    - Replace all console statements with appropriate logger methods
    - _Requirements: 1.1, 1.2, 2.6, 2.7, 3.1, 3.2, 4.1_

  - [x] 3.4 Migrate `src/modules/notifications/components/SmartNotificationCenter.tsx`
    - Replace `console.error()` with `uiLogger.error()`
    - Add uiLogger import statement
    - _Requirements: 1.2, 2.6, 3.2, 4.1_

- [x] 4. Migrate Library Layer - Core Files
  - [x] 4.1 Migrate `src/lib/supabase.ts`
    - Replace `console.warn()` with `dbLogger.warn()`
    - Replace `console.error()` with `dbLogger.error()`
    - Add dbLogger import statement
    - _Requirements: 1.2, 1.3, 2.2, 3.2, 4.1_

  - [x] 4.2 Migrate `src/lib/server-error-handler.ts`
    - Replace all `console.error()` with `logger.error()`
    - Replace all `console.warn()` with `logger.warn()`
    - Use proper error object format
    - Add logger import statement
    - _Requirements: 1.2, 1.3, 2.7, 3.1, 4.1, 4.2_

  - [x] 4.3 Migrate `src/lib/errors/AppError.ts`
    - Update `logError()` function to use logger instead of console
    - Handle both server-side and client-side logging
    - Add logger import statement
    - _Requirements: 1.2, 2.7, 3.1, 4.1, 4.2_

  - [x] 4.4 Migrate `src/lib/api/client.ts`
    - Refactor internal logger object to use `apiLogger`
    - Replace `console.log()` with `apiLogger.debug()`
    - Replace `console.error()` with `apiLogger.error()`
    - Replace `console.warn()` with `apiLogger.warn()`
    - Add apiLogger import statement
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.2, 4.1_

- [x] 5. Migrate Library Layer - API and Cache Files
  - [x] 5.1 Migrate `src/lib/api-validation.ts`
    - Replace all `console.error()` with `apiLogger.error()`
    - Add apiLogger import statement
    - _Requirements: 1.2, 2.1, 3.2, 4.1_

  - [x] 5.2 Migrate `src/lib/api-cache.ts`
    - Replace `console.warn()` with `apiLogger.warn()`
    - Add apiLogger import statement
    - _Requirements: 1.3, 2.1, 3.2_

  - [x] 5.3 Migrate `src/lib/query-cache.ts`
    - Replace `console.warn()` with `dbLogger.warn()`
    - Replace `console.log()` with `dbLogger.info()`
    - Add dbLogger import statement
    - _Requirements: 1.1, 1.3, 2.2, 3.2_

  - [x] 5.4 Migrate `src/lib/sync-api.ts`
    - Replace all `console.error()` with `apiLogger.error()`
    - Add apiLogger import statement
    - _Requirements: 1.2, 2.1, 3.2, 4.1_

- [x] 6. Migrate Library Layer - HPP and Business Logic Files
  - [x] 6.1 Migrate `src/lib/hpp-calculator.ts`
    - Replace `console.warn()` with `logger.warn()`
    - Add logger import statement
    - _Requirements: 1.3, 2.7, 3.1_

  - [x] 6.2 Migrate `src/lib/hpp-alert-detector.ts`
    - Replace `console.error()` with `logger.error()`
    - Add logger import statement
    - _Requirements: 1.2, 2.7, 3.1, 4.1_

  - [x] 6.3 Migrate `src/lib/ai-services/index.ts`
    - Replace `console.warn()` with `logger.warn()`
    - Add logger import statement
    - _Requirements: 1.3, 2.7, 3.1_

  - [x] 6.4 Migrate `src/lib/automation/notification-system.ts`
    - Replace `console.log()` with `automationLogger.info()`
    - Add automationLogger import statement
    - _Requirements: 1.1, 2.5, 3.2_

  - [x] 6.5 Migrate `src/lib/automation/hpp-automation.ts`
    - Replace all `console.log()` with `automationLogger.info()`
    - Replace all `console.error()` with `automationLogger.error()`
    - Add automationLogger import statement
    - _Requirements: 1.1, 1.2, 2.5, 3.2, 4.1_

- [x] 7. Verify migration completeness
  - Run grep search to find any remaining console statements in src/
  - Check that all modified files compile without errors
  - Verify logger imports are correct and unused imports are removed
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 8. Test logger output
  - Start development server and verify logs appear correctly
  - Test API endpoints and verify apiLogger output
  - Test database operations and verify dbLogger output
  - Trigger error scenarios and verify error logging format
  - Verify that error stack traces are preserved
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 9. Create migration documentation
  - Document the migration process and patterns used
  - Create guidelines for future logging practices
  - Add examples of proper logger usage
  - _Requirements: 3.5_
