import { type NextRequest, NextResponse } from 'next/server'

import { apiCache } from '@/lib/api-core/cache'
import { handleAPIError, createAPIErrorResponse } from '@/lib/api-core/errors'
import { extractPagination } from '@/lib/api-core/pagination'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { validateRequestData, validateRequestOrRespond } from '@/lib/api-core/validation'

import type { RouteHandlerConfig, RouteHandlerContext } from '@/lib/api-core/types'
import type { z } from 'zod'

/**
 * Route Handlers Module
 * Utilities for creating standardized API route handlers
 */


/**
 * Create standardized route handler with middleware support
 */
export function createRouteHandler<T>(
  handler: (context: RouteHandlerContext<T>) => Promise<NextResponse>,
  config: RouteHandlerConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Run middleware
      if (config.middleware) {
        for (const middleware of config.middleware) {
          const result = await middleware(request)
          if (result instanceof NextResponse) {
            return result
          }
        }
      }

      // Validate request data
      let validatedData: T | undefined
      if (config.validation?.['body']) {
        const result = await validateRequestOrRespond(request, config.validation['body'] as z.ZodType<T>)
        if (result instanceof NextResponse) {
          return result
        }
        validatedData = result
      }

      // Validate query params
      if (config.validation?.['query']) {
        const { searchParams } = new URL(request.url)
        const queryData = Object.fromEntries(searchParams.entries())
        const result = validateRequestData(queryData, config.validation['query'] as z.ZodType)
        if (!result.success) {
          return createErrorResponse('Query validation failed', 400, result.errors)
        }
      }

      // Extract pagination
      let pagination: { page: number; limit: number; offset: number; total: number; pages: number } | undefined
      if (config.pagination) {
        const paginationData = extractPagination(request)
        pagination = {
          ...paginationData,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0
        }
      }

      // Check cache
      if (config.caching && request.method === 'GET') {
        const cached = apiCache.get(config.caching.key)
        if (cached) {
          return createSuccessResponse(cached)
        }
      }

      // Execute handler
      const response = await handler({
        request,
        validatedData,
        pagination
      })

      // Cache response if configured
      if (config.caching && request.method === 'GET') {
        // Extract data from response (simplified)
        try {
          const responseClone = response.clone()
          const responseData = await responseClone.json()
          if (responseData.success && responseData['data']) {
            apiCache.set(config.caching.key, responseData['data'], config.caching.ttl)
          }
        } catch (_error) {
          // Ignore cache errors
        }
      }

      return response
    } catch (error) {
      const apiError = handleAPIError(error)
      return createAPIErrorResponse(apiError)
    }
  }
}
