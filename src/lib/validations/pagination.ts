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
 */
export function parsePaginationQuery(searchParams: URLSearchParams): PaginationQuery {
  const params = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  }

  return PaginationQuerySchema.parse(params)
}
