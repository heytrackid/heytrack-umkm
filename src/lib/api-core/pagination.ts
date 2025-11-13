import type { PaginationParams, PaginationState } from '@/lib/api-core/types'
import type { NextRequest } from 'next/server'

/**
 * Pagination Module
 * Pagination utilities for API responses
 */


/**
 * Extract pagination parameters from request
 */
export function extractPagination(request: NextRequest): PaginationState {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(10000, Math.max(1, parseInt(searchParams.get('limit') ?? '1000')))
  const offset = (page - 1) * limit

  return { page, limit, offset, total: 0, pages: 0 }
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const pages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  }
}

/**
 * Apply pagination to array of items
 */
export function usePagination<T>(items: T[], params: PaginationParams) {
  const { page = 1, limit = 1000, offset } = params
  const actualOffset = offset ?? calculateOffset(page, limit)
  const paginatedItems = items.slice(actualOffset, actualOffset + limit)
  const total = items.length

  return {
    items: paginatedItems,
    pagination: createPaginationMeta(total, page, limit)
  }
}
