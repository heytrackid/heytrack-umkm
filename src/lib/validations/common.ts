/**
 * Common Validation Schemas - Single Source of Truth
 * 
 * This file re-exports all validation schemas from their domain-specific locations.
 * Always import from this file to ensure consistency across the application.
 * 
 * Usage:
 * import { PaginationQuerySchema, UUIDSchema, OrderStatusEnum } from '@/lib/validations/common'
 */

// Base validation schemas
export {
    ColorHexSchema, CurrencyAmountSchema, DateStringSchema, EmailSchema, NonNegativeNumberSchema, OptionalString, PercentageSchema, PhoneSchema, PositiveNumberSchema, RequiredString, SlugSchema, URLSchema, UUIDSchema
} from './base-validations'

// Common domain schemas
export {
    BulkDeleteSchema,
    BulkUpdateSchema, DateRangeQuerySchema, DateRangeSchema, ErrorQuerySchema, ErrorReportSchema, FileUploadSchema, HPPAnalysisQuerySchema, HPPComparisonQuerySchema, HPPExportQuerySchema, IdParamSchema,
    IdsParamSchema, ImageUploadSchema, PaginationQuerySchema, PaginationSchema, ReportQuerySchema,
    SalesQuerySchema, SearchSchema, StatusFilterSchema, type DateRangeQuery, type ErrorQuery, type ErrorReport, type FileUpload,
    type ImageUpload, type PaginationQuery, type ReportQuery,
    type SalesQuery
} from './domains/common'

// Enum schemas for API validation
export {
    CustomerTypeEnum, IngredientUnitEnum, OrderStatusEnum, PaymentMethodEnum, PaymentStatusEnum, PriorityLevelEnum, RecipeDifficultyEnum, UserRoleEnum
} from './base-validations'

// Form validation schemas
export {
    BulkIngredientSchema,
    BulkRecipeSchema, CustomerSchema, FinancialRecordSchema, IngredientFormSchema, IngredientSchema, OperationalCostFormSchema, OrderItemSchema, OrderSchema, ProductionSchema, RecipeIngredientSchema, RecipeSchema, StockTransactionSchema, SupplierFormSchema
} from './form-validations'

// API validation schemas
export {
    FileUploadSchema as APIFileUploadSchema, AppSettingsSchema, BusinessInfoSettingsSchema, CurrencyFormatSchema, HPPCalculationInputSchema, InventoryCalculationSchema, RegionalSettingsSchema, ReportGenerationSchema, SalesCalculationSchema, SecuritySettingsSchema,
    ThemeSettingsSchema, UserProfileSettingsSchema, WebhookPayloadSchema
} from './api-validations'

// AI-generated schemas
export {
    ingredientSchema as AIIngredientSchema,
    operationalCostSchema as AIOperationalCostSchema,
    recipeIngredientSchema as AIRecipeIngredientSchema,
    recipeSchema as AIRecipeSchema,
    businessBootstrapInputSchema,
    businessBootstrapOutputSchema
} from './ai-generated'

