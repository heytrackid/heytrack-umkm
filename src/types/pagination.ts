/**
 * Pagination types for API responses
 * Standardized pagination interface - matches backend API response
 * 
 * @see src/lib/api-core/types.ts for the canonical definition
 */

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  // Backward compatibility aliases
  totalPages?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface ApiListResponse<T> {
  data: T[]
  pagination?: PaginationMeta
}

// Re-export from api-core for backward compatibility
export type { PaginationMeta as ApiPaginationMeta } from '@/lib/api-core/types'
