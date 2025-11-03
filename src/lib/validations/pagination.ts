import { z } from 'zod'



/**
 * Pagination Query Schema
 * For validating pagination query parameters in API routes
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

/**
 * Pagination Metadata
 * Standard pagination response metadata
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
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Create pagination metadata
 * Helper function to generate pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Validate and parse pagination query parameters
 */
export function parsePaginationQuery(searchParams: URLSearchParams): PaginationQuery {
  const params = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  }
  
  return PaginationQuerySchema.parse(params)
}
