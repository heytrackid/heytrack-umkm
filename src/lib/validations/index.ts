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
  OrderInsertSchema,
  OrderUpdateSchema,
  RecipeInsertSchema,
  RecipeUpdateSchema,
  IngredientInsertSchema,
  IngredientUpdateSchema,
  SupplierInsertSchema,
  SupplierUpdateSchema,
  SalesInsertSchema,
  SalesUpdateSchema,
  ExpenseInsertSchema,
  ExpenseUpdateSchema,
  OperationalCostInsertSchema,
  OperationalCostUpdateSchema,
  IngredientPurchaseInsertSchema,
  IngredientPurchaseUpdateSchema,
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
} from './api-validations'

export type {
  IngredientForm,
  OrderForm,
  RecipeForm,
  CustomerForm,
  PaginationQuery,
  DateRangeQuery,
  FileUpload,
  ImageUpload,
} from './api-validations'
