# Implementation Plan: Fix Any Types

- [x] 1. Create new type definitions for missing types
  - Create `src/types/forms.ts` with form-related types including `FormFieldUpdate`, `OrderItemUpdate`
  - Create `src/types/analytics.ts` with analytics types including `InventoryAnalysis`, `PricingAnalysis`
  - Create `src/types/export.ts` with export-related types including `ExportData`, `ExportOptions`
  - Create `src/types/charts.ts` with chart-related types including `ChartDataPoint`, `ChartConfig`
  - Update `src/types/notifications.ts` with proper `NotificationData` interface
  - Export all new types from `src/types/index.ts`
  - _Requirements: 1.1, 6.1, 6.2, 6.3_

- [x] 2. Fix order services (High Priority)
- [x] 2.1 Fix OrderPricingService.ts
  - Replace `(r: any)` with proper `Recipe` type in find operations
  - Replace `(recipe as any).id` with proper type assertion or optional chaining
  - Replace `(recipe as any).name` with proper type access
  - Replace `(recipe as any).price` with proper type access
  - _Requirements: 2.1, 2.2, 5.1_

- [x] 2.2 Fix InventoryUpdateService.ts
  - Replace `(recipe as any).recipe_ingredients` with proper `RecipeWithIngredients` type
  - Replace `as any` in Supabase insert operations with proper typed inserts
  - Add proper types for ingredient update operations
  - _Requirements: 2.1, 5.1, 5.3_

- [x] 2.3 Fix OrderValidationService.ts
  - Replace `(recipe as any).recipe_ingredients` with proper type
  - Replace `(recipe as any).name` with proper type access
  - Add proper error type definitions
  - _Requirements: 2.1, 5.1_

- [x] 2.4 Fix ProductionTimeService.ts
  - Replace `(r: any)` with `Recipe` type in find operations
  - Replace `const recipe = ... as any` with proper type
  - Add proper null checking for recipe properties
  - _Requirements: 2.1, 5.1_

- [x] 3. Fix recipe components (High Priority)
- [x] 3.1 Fix RecipesPage.tsx
  - Replace `(value) => setActiveView(value as any)` with proper union type
  - Add proper type for `activeView` state
  - _Requirements: 2.1, 4.1, 4.3_

- [x] 3.2 Fix SmartPricingAssistant.tsx
  - Replace `useState<any>(null)` with proper `PricingAnalysis | null` type
  - Replace `(tier as any)` with proper tier type assertion
  - Add proper type for pricing tier selection
  - _Requirements: 4.1, 4.3_

- [x] 4. Fix automation components (High Priority)
- [x] 4.1 Fix smart-notifications.tsx
  - Replace `data?: any` in notification interface with proper `NotificationData` type
  - Replace `(notif: any, index: number)` with proper notification type
  - Replace `(order: any)` with proper `Order` type
  - Replace `(item: any)` with proper `OrderItem` type
  - Replace `(ing: any)` with proper `Ingredient` type
  - Replace `(notif: any)` in map operations with proper type
  - Replace `(n: any)` in filter operations with proper type
  - _Requirements: 2.1, 4.1, 4.2_

- [x] 4.2 Fix smart-inventory-manager.tsx
  - Replace `useState<any[]>([])` with proper `InventoryAnalysis[]` type
  - Add proper types for inventory analysis data
  - _Requirements: 4.1, 4.3_

- [x] 4.3 Fix smart-pricing-assistant.tsx
  - Replace any `any` types with proper pricing analysis types
  - Add proper types for pricing recommendations
  - _Requirements: 4.1, 4.3_

- [x] 5. Fix order UI components (Medium Priority)
- [x] 5.1 Fix OrderForm.tsx in modules/orders/components
  - Replace `(field: keyof OrderFormData, value: any)` with generic type
  - Replace `(index: number, field: string, value: any)` with proper typed update
  - Add proper type constraints for form field updates
  - _Requirements: 2.1, 2.2_

- [x] 5.2 Fix OrderDetailView.tsx
  - Replace `(item: any, index: number)` with proper `OrderItem` type
  - Replace `(sum: number, item: any)` with proper reduce types
  - _Requirements: 2.1_

- [x] 5.3 Fix OrdersTableView.tsx
  - Replace `status: newStatus as any` with proper `OrderStatus` type
  - Add proper type checking for status updates
  - _Requirements: 2.1, 5.1_

- [x] 5.4 Fix WhatsAppFollowUp.tsx
  - Replace `(order: any): OrderData` with proper `Order` type
  - Replace `(item: any)` in map with proper `OrderItem` type
  - _Requirements: 2.1_

- [x] 6. Fix form components (Medium Priority)
- [x] 6.1 Fix OrderForm.tsx in components/orders
  - Replace `(field: keyof OrderFormData, value: any)` with generic type
  - Replace `(index: number, field: string, value: any)` with typed update
  - _Requirements: 2.1, 2.2_

- [x] 6.2 Fix modules/orders/types.ts
  - Replace `value: any` in `updateFormData` with proper generic type
  - Replace `value: any` in `updateItem` with proper generic type
  - _Requirements: 2.1, 2.2, 6.1_

- [x] 7. Fix export services (Low Priority)
- [x] 7.1 Fix excel-export-lazy.service.ts
  - Replace `data: any[]` with generic `ExportData<T>` type
  - Replace `(data: any, options?: any)` in exportToExcel with proper types
  - Replace `(data: any, options?: any)` in exportToCSV with proper types
  - Replace `(row: any)` in map with generic row type
  - _Requirements: 2.1, 3.1, 3.2_

- [x] 8. Fix chart components (Low Priority)
- [x] 8.1 Fix InventoryTrendsChart.tsx
  - Replace `(props: any)` with proper `ChartProps` interface
  - Add proper type for chart configuration
  - _Requirements: 2.1_

- [ ] 9. Fix remaining components
- [ ] 9.1 Fix columns-helper.tsx
  - Replace `size: options?.width as any` with proper type assertion
  - _Requirements: 5.1_

- [ ] 9.2 Fix WebVitalsReporter.tsx
  - Replace `(metric: any)` with proper web vitals metric type
  - _Requirements: 2.1_

- [x] 10. Add type guards for runtime validation
  - Create type guard functions in `src/types/guards.ts` for `OrderItem`, `Recipe`, `Ingredient`
  - Add validation functions for complex types
  - Export type guards from types index
  - _Requirements: 4.2, 5.2_

- [x] 11. Update TypeScript configuration
  - Update `tsconfig.json` to enable `noImplicitAny: true`
  - Update `tsconfig.json` to enable `strict: true`
  - Verify all files compile without errors
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 12. Add ESLint rules to prevent future any usage
  - Add `@typescript-eslint/no-explicit-any` rule to ESLint config
  - Configure rule to error on `any` usage
  - Add exceptions for legitimate cases with comments
  - _Requirements: 8.3, 8.4_

- [ ] 13. Verify type safety across codebase
  - Run TypeScript compiler with strict mode
  - Check for any remaining `any` types
  - Verify no type errors in build
  - _Requirements: 7.1, 7.4_
