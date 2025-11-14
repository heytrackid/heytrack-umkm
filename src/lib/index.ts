

/**
 * Barrel export for all lib utilities
 * Provides convenient single-import access to all library functions
 * 
 * ORGANIZATION:
 * - Utilities: Basic helpers (cn, debounce, logger)
 * - Validation & Errors: Input validation and error handling
 * - Database & API: Database and API utilities
 * - Currency & Calculations: Financial calculations
 * - Business Logic: Domain-specific business logic
 * - AI & Automation: AI and automation features
 * - External Services: Third-party integrations
 * 
 * Usage Examples:
 *   import { cn, formatCurrentCurrency } from '@/lib/index'
 *   import { AppError, ValidationError } from '@/lib/errors'
 *   import { calculateHPP, detectAlerts } from '@/lib/index'
 */

// ==========================================================
// UTILITIES
// ==========================================================

export { cn } from '@/shared'
export { logger, uiLogger } from './logger'

// ==========================================================
// SUPABASE CLIENT UTILITIES
// ==========================================================

export {
    getSupabaseClient, typedDelete, typedInsert, typedSelect, typedUpdate
} from './supabase-client'

export type {
    QueryArrayResult, QueryResult
} from './supabase-client'

// ==========================================================
// VALIDATION & ERRORS
// ==========================================================

export {
    CustomerSchema, IngredientSchema, email, formatValidationErrors, indonesianName, nonNegativeNumber, optionalString, percentage, phone, positiveNumber, requiredString, rupiah, sanitizeSQL, uuid, validateInput, zodErrorsToFieldErrors
} from './validations/'

// ==========================================================
// SHARED UTILITIES
// ==========================================================

export {

    // Constants
    BUSINESS_TYPES, CATEGORIES, ORDER_STATUSES,
    PAYMENT_METHODS, UNITS, calculatePercentage,
    calculateTrend,
    // String utilities
    capitalize,
    // Core utilities
    // Date utilities
    formatDate,
    formatDateTime, formatNumber, formatOrderStatus, formatPhoneNumber,

    // Business utilities
    formatProductName, formatRelativeTime, getStatusColor,
    // Array/Object utilities
    groupBy,
    // Validation utilities
    isEmail,
    isPhoneNumber, slugify, sortBy, truncate, unique,
    uniqueBy
} from '@/shared'

export type {
    Address, BusinessEntity, BusinessType, Category, Contact, OrderStatus,
    PaymentMethod, Unit
} from '@/shared'

// ==========================================================
// API CORE
// ==========================================================

export {
    BulkDeleteSchema,
    BulkUpdateSchema, DateRangeSchema,
    // Common schemas
    IdParamSchema,
    PaginationSchema, SearchSchema, StatusFilterSchema,
    // Cache system
    apiCache, calculateOffset, createAPIErrorResponse, createETag, createErrorResponse,
    createPaginatedResponse, createPaginationMeta,
    // Route handler utilities
    createRouteHandler,
    // Response utilities
    createSuccessResponse,
    // Pagination utilities
    extractPagination, getClientIP,
    // Error handling
    handleAPIError, handleConditionalGET,
    // Utility functions
    parseSearchParams, usePagination,
    // Validation utilities
    validateRequestData,
    validateRequestOrRespond, withCors, withMiddleware, withQueryValidation,
    withRateLimit,
    // Middleware utilities
    withValidation
} from './api-core/'

export type {
    APIError, ApiErrorResponse, ApiSuccessResponse, MiddlewareOptions, PaginatedResponse, PaginationParams,
    PaginationState, ValidationResult
} from './api-core/'

// ==========================================================
// CURRENCY & CALCULATIONS
// ==========================================================

export {
    currencies,
    currencyConfigs, formatCurrency, formatCurrentCurrency, parseCurrencyString
} from './currency'

// ==========================================================
// SCHEDULING & CRON JOBS - REMOVED
// ==========================================================
// Cron jobs have been removed from the codebase
// Use external schedulers (Vercel Cron, GitHub Actions, etc.) instead

// ==========================================================
// BUSINESS SERVICES
// ==========================================================

// Note: Business services module is under development
// Current exports are minimal until full implementation is complete

// ==========================================================
// BUSINESS LOGIC
// ==========================================================



// HPP functions moved to modules/hpp
// export {
//   calculateHPP,
// } from './hpp/'

export {
    AIClient,
    AISecurity, AIService, BusinessAI, NLPProcessor, PromptBuilder, generateAIInsights, parseNaturalLanguage, processChatbotQuery,
    trainNLPModel
} from './ai'

export {
    AUTH_ERROR_MESSAGES, captureError,
    captureMessage, createAuthError, handleApiError,
    handleAuthError, handleDatabaseError, logAuthError
} from './errors'

// Auth utilities removed - use new auth provider

export type {
    AuthError, ErrorContext, ErrorSeverity
} from './errors'

