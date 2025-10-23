/**
 * Pagination Utilities - Standardized pagination across all routes
 */

export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Build pagination query string
 */
export function buildPaginationQuery(params: PaginationParams): URLSearchParams {
  const query = new URLSearchParams()

  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.skip !== undefined) query.set('skip', String(params.skip))
  if (params.sort !== undefined) query.set('sort', params.sort)
  if (params.order !== undefined) query.set('order', params.order)

  return query
}

/**
 * Calculate pagination values
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  return {
    page: Math.max(1, page),
    limit: Math.min(limit, 100), // Max 100 per page
    total,
    totalPages,
    skip,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Validate pagination params
 */
export function validatePaginationParams(
  page?: number | string,
  limit?: number | string,
  defaults = { page: 1, limit: 10 }
) {
  const validatedPage = Math.max(1, Number(page) || defaults.page)
  const validatedLimit = Math.max(1, Math.min(100, Number(limit) || defaults.limit))

  return { page: validatedPage, limit: validatedLimit }
}

/**
 * Hook for pagination state management
 */
export function usePagination(defaultPage = 1, defaultLimit = 10) {
  const [page, setPage] = React.useState(defaultPage)
  const [limit, setLimit] = React.useState(defaultLimit)
  const [total, setTotal] = React.useState(0)

  const pagination = React.useMemo(
    () => calculatePagination(page, limit, total),
    [page, limit, total]
  )

  const goToPage = React.useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])

  const goToNextPage = React.useCallback(() => {
    if (pagination.hasNextPage) {
      setPage((p) => p + 1)
    }
  }, [pagination.hasNextPage])

  const goToPreviousPage = React.useCallback(() => {
    if (pagination.hasPreviousPage) {
      setPage((p) => p - 1)
    }
  }, [pagination.hasPreviousPage])

  const setPageSize = React.useCallback((newLimit: number) => {
    setLimit(Math.max(1, Math.min(100, newLimit)))
    setPage(1) // Reset to first page when changing page size
  }, [])

  const reset = React.useCallback(() => {
    setPage(defaultPage)
    setLimit(defaultLimit)
    setTotal(0)
  }, [defaultPage, defaultLimit])

  return {
    page,
    limit,
    total,
    setTotal,
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    reset,
  }
}

import React from 'react'
