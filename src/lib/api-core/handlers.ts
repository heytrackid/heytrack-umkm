/**
 * Route Handlers Module
 * Utilities for creating standardized API route handlers
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequestData, validateRequestOrRespond } from './validation'
import { extractPagination } from './pagination'
import { createErrorResponse } from './responses'
import { handleAPIError, createAPIErrorResponse } from './errors'
import { apiCache } from './cache'
import type { RouteHandlerConfig, RouteHandlerContext } from './types'

/**
 * Create standardized route handler with middleware support
 */
export function createRouteHandler<T>(
  handler: (context: RouteHandlerContext<T>) => Promise<NextResponse>,
  config: RouteHandlerConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Run middleware
      if (config.middleware) {
        for (const middleware of config.middleware) {
          const result = await middleware(request)
          if (result) {
            return result
          }
        }
      }

      // Validate request data
      let validatedData: T | undefined
      if (config.validation?.body) {
        const result = await validateRequestOrRespond(request, config.validation.body)
        if (result instanceof NextResponse) {
          return result
        }
        validatedData = result
      }

      // Validate query params
      if (config.validation?.query) {
        const { searchParams } = new URL(request.url)
        const queryData = Object.fromEntries(searchParams.entries())
        const result = validateRequestData(queryData, config.validation.query)
        if (!result.success) {
          return createErrorResponse('Query validation failed', 400, result.errors)
        }
      }

      // Extract pagination
      let pagination: any
      if (config.pagination) {
        pagination = extractPagination(request)
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
          if (responseData.success && responseData.data) {
            apiCache.set(config.caching.key, responseData.data, config.caching.ttl)
          }
        } catch (error) {
          // Ignore cache errors
        }
      }

      return response
    } catch (err) {
      const apiError = handleAPIError(_error)
      return createAPIErrorResponse(apiError)
    }
  }
}
