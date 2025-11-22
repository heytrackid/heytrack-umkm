/**
 * Common Validation Schemas - Single Source of Truth
 * 
 * This barrel export provides easy access to all commonly used validation schemas.
 * Import from here instead of individual files for better organization.
 * 
 * @example
 * ```typescript
 * import { 
 *   PaginationQuerySchema,
 *   UUIDSchema,
 *   DateRangeSchema 
 * } from '@/lib/validations/common'
 * ```
 */

// ==========================================================
// PAGINATION & SORTING
// ==========================================================

export {
    PaginationQuerySchema, PaginationSchema, type PaginationQuery
} from '@/lib/validations/domains/common'

// ==========================================================
// DATE & TIME
// ==========================================================

export {
    DateRangeQuerySchema, DateRangeSchema, type DateRangeQuery
} from '@/lib/validations/domains/common'

export { DateStringSchema } from '@/lib/validations/base-validations'

// ==========================================================
// FILE UPLOADS
// ==========================================================

export {
    FileUploadSchema,
    ImageUploadSchema,
    type FileUpload,
    type ImageUpload
} from '@/lib/validations/domains/common'

// ==========================================================
// ID PARAMETERS
// ==========================================================

export {
    IdParamSchema,
    IdsParamSchema
} from '@/lib/validations/domains/common'

export { UUIDSchema } from '@/lib/validations/base-validations'

// ==========================================================
// BULK OPERATIONS
// ==========================================================

export {
    BulkDeleteSchema,
    BulkUpdateSchema
} from '@/lib/validations/domains/common'

// ==========================================================
// REPORTS & ANALYTICS
// ==========================================================

export {
    HPPAnalysisQuerySchema, HPPComparisonQuerySchema, HPPExportQuerySchema, ReportQuerySchema,
    SalesQuerySchema, type ReportQuery,
    type SalesQuery
} from '@/lib/validations/domains/common'

// ==========================================================
// SEARCH & FILTERS
// ==========================================================

export {
    SearchSchema, StatusFilterSchema
} from '@/lib/validations/domains/common'

// ==========================================================
// ERROR HANDLING
// ==========================================================

export {
    ErrorQuerySchema, ErrorReportSchema, type ErrorQuery, type ErrorReport
} from '@/lib/validations/domains/common'

// ==========================================================
// BASE VALIDATIONS
// ==========================================================

export {
    BusinessUnitEnum,
    // Schemas
    EmailSchema, formatValidationErrors, NonNegativeNumberSchema,

    // Enums
    OrderStatusEnum,
    PaymentMethodEnum, PhoneSchema,
    PositiveNumberSchema, ProductionStatusEnum, RecordTypeEnum,
    TransactionTypeEnum, UserRoleEnum,
    // Utilities
    validateFormData, zodErrorsToFieldErrors
} from '@/lib/validations/base-validations'

// ==========================================================
// LEGACY EXPORTS (for backward compatibility)
// ==========================================================

export {
    email, indonesianName, nonNegativeNumber, optionalString, percentage, phone, positiveNumber, requiredString, rupiah, uuid
} from '@/lib/validations/base-validations'

