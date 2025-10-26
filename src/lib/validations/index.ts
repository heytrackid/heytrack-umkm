// Validation modules index
// Re-exports all validation schemas for backward compatibility and code splitting

// Base validations
export * from './base-validations'

// Form validations - export everything
export * from './form-validations'

// Database validations - export all Insert/Update schemas
export {
  CustomerInsertSchema,
  CustomerUpdateSchema,
  OrderItemInsertSchema,
  OrderInsertSchema,
  OrderUpdateSchema,
  IngredientInsertSchema,
  IngredientUpdateSchema,
  IngredientPurchaseInsertSchema,
  IngredientPurchaseUpdateSchema,
  RecipeIngredientInsertSchema,
  RecipeInsertSchema,
  RecipeUpdateSchema,
  SupplierInsertSchema,
  SupplierUpdateSchema,
  OperationalCostInsertSchema,
  OperationalCostUpdateSchema,
  ExpenseInsertSchema,
  ExpenseUpdateSchema,
  SalesInsertSchema,
  SalesUpdateSchema,
} from './database-validations'

// API validations - export commonly used schemas
export {
  // Form schemas
  IngredientFormSchema,
  OrderFormSchema,
  RecipeFormSchema,
  CustomerFormSchema,

  // Query schemas
  PaginationQuerySchema,
  DateRangeQuerySchema,
  PaginationSchema,
  DateRangeSchema,

  // HPP schemas
  HPPExportQuerySchema,
  HPPComparisonQuerySchema,
  HPPAnalysisQuerySchema,

  // Other schemas
  IdParamSchema,
  ReportQuerySchema,
  SalesQuerySchema,
  FileUploadSchema,
  ImageUploadSchema,
} from './domains'

// Domain-specific exports
export {
  // Validation helpers
  CustomerValidationHelpers,
  OrderValidationHelpers,
  IngredientValidationHelpers,
  RecipeValidationHelpers,
} from './domains'

// Enhanced schemas with business rules
export type {
  EnhancedCustomerInsert,
  EnhancedCustomerUpdate,
  EnhancedOrderInsert,
  EnhancedOrderUpdate,
  EnhancedIngredientInsert,
  EnhancedIngredientUpdate,
  EnhancedRecipeInsert,
  EnhancedRecipeUpdate,
} from './domains'

// Validation caching
export {
  validationCache,
  withValidationCache,
  CachedValidationHelpers,
  ValidationPerformanceMonitor,
  ValidationCache,
} from './cache'

export type { ValidationCacheConfig } from './cache'
