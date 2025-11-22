import { z } from 'zod'

/**
 * DEPRECATED: Import from @/lib/validations/domains/common instead
 * This file is kept for backward compatibility only
 * 
 * The common.ts version has more features:
 * - Search & sort fields
 * - Better error handling
 * - Higher limits for admin use
 */

// Re-export from the canonical location
export {
    PaginationQuerySchema,
    type PaginationQuery
} from '@/lib/validations/domains/common'

/**
 * Legacy Pagination Query Schema (simple version)
 * @deprecated Use PaginationQuerySchema from @/lib/validations/domains/common
 */
export const SimplePaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export type SimplePaginationQuery = z.infer<typeof SimplePaginationQuerySchema>

/**
 * Pagination Metadata
 * Standard pagination response metadata
 * @deprecated Use PaginationMeta from @/lib/api-core/types instead
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Paginated Response
 * Standard structure for paginated API responses
 * @deprecated Use PaginatedResponse from @/lib/api-core/types instead
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Validate and parse pagination query parameters
 * @deprecated Use PaginationQuerySchema.parse() directly
 */
export function parsePaginationQuery(searchParams: URLSearchParams): SimplePaginationQuery {
  const params = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  }

  return SimplePaginationQuerySchema.parse(params)
}
