
/**
 * API Core Module - Main Entry Point
 * Comprehensive API utilities for Next.js applications
 */

// Export all types
export * from './types'

// Export cache system
export { apiCache } from './cache'
export type { CacheEntry, CacheConfig } from './types'

// Export response utilities
export {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse
} from './responses'
export type { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse } from './types'

// Export validation utilities
export { validateRequestData, validateRequestOrRespond } from './validation'
export type { ValidationResult } from './types'

// Export pagination utilities
export {
  extractPagination,
  calculateOffset,
  createPaginationMeta,
  usePagination
} from './pagination'
export type { PaginationParams, PaginationState } from './types'

// Export middleware utilities
export * from './middleware'

// Export error handling
export { handleAPIError, createAPIErrorResponse } from './errors'
export type { APIError } from './types'

// Export common schemas
export * from './schemas'

// Export route handlers
export { createRouteHandler } from './handlers'
export type { RouteHandlerConfig, RouteHandlerContext } from './types'

// Export utility functions
export { parseSearchParams, getClientIP, createETag, handleConditionalGET } from './utils'
