
/**
 * API Core Module - Main Entry Point
 * Comprehensive API utilities for Next.js applications
 */

// Export all types
export type * from './types'
export type { PaginationMeta } from './types'

// Export cache system
export { apiCache } from './cache'
export type { CacheConfig, CacheEntry } from './types'

// Export response utilities
export {
    createErrorResponse,
    createPaginatedResponse, createSuccessResponse
} from './responses'
export type { ApiErrorResponse, ApiSuccessResponse, PaginatedResponse } from './types'

// Export validation utilities
export type { ValidationResult } from './types'
export { validateRequestData, validateRequestOrRespond } from './validation'

// Export pagination utilities
export {
    calculateOffset,
    createPaginationMeta, extractPagination, usePagination
} from './pagination'
export type { PaginationParams, PaginationState } from './types'

// Export middleware utilities
export * from './middleware'

// Export error handling
export { createAPIErrorResponse, handleAPIError } from './errors'
export type { APIError } from './types'

// Export common schemas
export * from './schemas'

// Export route handlers
export { createRouteHandler } from './handlers'
export type { RouteHandlerConfig, RouteHandlerContext } from './types'

// Export utility functions
export { createETag, getClientIP, handleConditionalGET, parseSearchParams } from './utils'

