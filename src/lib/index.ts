

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
 *   import { cn, formatCurrentCurrency } from '@/lib'
 *   import { AppError, ValidationError } from '@/lib/errors'
 *   import { calculateHPP, detectAlerts } from '@/lib'
 */

// ============================================================================
// UTILITIES
// ============================================================================

export { cn } from '@/shared'
export { logger, uiLogger } from './logger'

// ============================================================================
// SUPABASE CLIENT UTILITIES
// ============================================================================

export {
  getSupabaseClient,
  typedInsert,
  typedUpdate,
  typedDelete,
  typedSelect,
  isAuthenticated,
  getCurrentUser,
  signOut,
  updateSession,
} from './supabase-client'

export type {
  QueryResult,
  QueryArrayResult,
} from './supabase-client'

// ============================================================================
// VALIDATION & ERRORS
// ============================================================================

export {
  requiredString,
  optionalString,
  positiveNumber,
  nonNegativeNumber,
  email,
  phone,
  uuid,
  rupiah,
  percentage,
  indonesianName,
  IngredientSchema,
  CustomerSchema,
  validateInput,
  sanitizeSQL,
  formatValidationErrors,
  zodErrorsToFieldErrors,
} from './validations/'

// ============================================================================
// SHARED UTILITIES
// ============================================================================

export {
  // Core utilities

  // Date utilities
  formatDate,
  formatDateTime,
  formatRelativeTime,

  // Array/Object utilities
  groupBy,
  sortBy,
  unique,
  uniqueBy,

  // String utilities
  capitalize,
  slugify,
  truncate,
  formatNumber,

  // Validation utilities
  isEmail,
  isPhoneNumber,
  formatPhoneNumber,

  // Business utilities
  formatProductName,
  formatOrderStatus,
  getStatusColor,
  calculatePercentage,
  calculateTrend,

  // Constants
  BUSINESS_TYPES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  CATEGORIES,
  UNITS,
} from '@/shared'

export type {
  BusinessType,
  OrderStatus,
  PaymentMethod,
  Category,
  Unit,
  BusinessEntity,
  Address,
  Contact,
} from '@/shared'

// ============================================================================
// API CORE
// ============================================================================

export {
  // Cache system
  apiCache,

  // Response utilities
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,

  // Validation utilities
  validateRequestData,
  validateRequestOrRespond,

  // Pagination utilities
  extractPagination,
  calculateOffset,
  createPaginationMeta,
  usePagination,

  // Middleware utilities
  withValidation,
  withQueryValidation,
  withRateLimit,
  withCors,
  withAuth,
  withMiddleware,

  // Error handling
  handleAPIError,
  createAPIErrorResponse,

  // Common schemas
  IdParamSchema,
  PaginationSchema,
  DateRangeSchema,
  StatusFilterSchema,
  SearchSchema,
  BulkDeleteSchema,
  BulkUpdateSchema,

  // Route handler utilities
  createRouteHandler,

  // Utility functions
  parseSearchParams,
  getClientIP,
  createETag,
  handleConditionalGET,
} from './api-core/'

export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  ValidationResult,
  PaginationParams,
  PaginationState,
  MiddlewareOptions,
  APIError,
} from './api-core/'

// ============================================================================
// CURRENCY & CALCULATIONS
// ============================================================================

export {
  formatCurrentCurrency,
  formatCurrency,
  parseCurrencyString,
  currencies,
  currencyConfigs,
} from './currency'

// ============================================================================
// SCHEDULING & CRON JOBS - REMOVED
// ============================================================================
// Cron jobs have been removed from the codebase
// Use external schedulers (Vercel Cron, GitHub Actions, etc.) instead

// ============================================================================
// BUSINESS SERVICES
// ============================================================================

// Note: Business services module is under development
// Current exports are minimal until full implementation is complete

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

export {
  // HPPCalculator,
  // HPPUtils,
}

// HPP functions moved to modules/hpp
// export {
//   calculateHPP,
// } from './hpp/'

export {
  AIClient,
  AISecurity,
  PromptBuilder,
  AIService,
  NLPProcessor,
  BusinessAI,
  processChatbotQuery,
  trainNLPModel,
  parseNaturalLanguage,
  generateAIInsights,
} from './ai'

export {
  captureError,
  captureMessage,
  handleApiError,
  handleAuthError,
  logAuthError,
  createAuthError,
  handleDatabaseError,
  AUTH_ERROR_MESSAGES,
} from './errors'

// Auth error utilities
export {
  getAuthErrorMessage,
  validateEmail,
  validatePassword,
  LoginSchema,
  RegisterSchema,
  PasswordResetSchema,
  UpdatePasswordSchema,
} from './auth-errors'

export type {
  ErrorSeverity,
  ErrorContext,
  AuthError,
} from './errors'
