// lib/api/response-metadata.ts
// Automatic response metadata addition

import { apiLogger } from '@/lib/logger'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export interface ResponseMetadata {
  requestId: string
  timestamp: string
  responseTime: number
  apiVersion?: string | undefined
  userId?: string | undefined
  path: string
  method: string
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${randomUUID()}`
}

/**
 * Create response metadata
 */
export function createResponseMetadata(
  request: NextRequest,
  startTime: number,
  userId?: string,
  apiVersion?: string
): ResponseMetadata {
  const endTime = Date.now()
  const responseTime = endTime - startTime

  return {
    requestId: generateRequestId(),
    timestamp: new Date(endTime).toISOString(),
    responseTime,
    apiVersion,
    userId,
    path: request.nextUrl.pathname,
    method: request.method,
  }
}

/**
 * Add metadata headers to a response
 */
export function addMetadataHeaders(
  response: NextResponse,
  metadata: ResponseMetadata
): NextResponse {
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })

  // Add metadata headers
  newResponse.headers.set('X-Request-ID', metadata.requestId)
  newResponse.headers.set('X-Response-Time', metadata.responseTime.toString())
  newResponse.headers.set('X-Timestamp', metadata.timestamp)
  newResponse.headers.set('X-API-Path', metadata.path)
  newResponse.headers.set('X-API-Method', metadata.method)

  if (metadata.apiVersion) {
    newResponse.headers.set('X-API-Version', metadata.apiVersion)
  }

  if (metadata.userId) {
    newResponse.headers.set('X-User-ID', metadata.userId)
  }

  // Add cache control headers for better performance
  if (!newResponse.headers.has('Cache-Control')) {
    if (metadata.method === 'GET') {
      newResponse.headers.set('Cache-Control', 'private, max-age=300') // 5 minutes for GET requests
    } else {
      newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }

  return newResponse
}

/**
 * Enhanced response creation with automatic metadata
 */
export function createSuccessResponseWithMetadata<T>(
  data: T,
  message?: string,
  pagination?: unknown,
  status: number = 200,
  metadata?: Partial<ResponseMetadata>
): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      success: true,
      data,
      message,
      pagination,
      ...(metadata && { _metadata: metadata }),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  return response
}

/**
 * Enhanced error response with metadata
 */
export function createErrorResponseWithMetadata(
  error: string | Error,
  status: number = 500,
  code?: string,
  metadata?: Partial<ResponseMetadata>
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error

  const response = new NextResponse(
    JSON.stringify({
      success: false,
      error: errorMessage,
      code,
      ...(metadata && { _metadata: metadata }),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  return response
}

/**
 * Middleware to automatically add response metadata
 */
export function withResponseMetadata(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  options: {
    includeUserId?: boolean
    includeApiVersion?: boolean
  } = {}
) {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      // Extract user ID if available (from auth middleware)
      let userId: string | undefined
      if (options.includeUserId) {
        // This would be set by authentication middleware
        userId = (request as { user?: { id: string } }).user?.id
      }

      // Extract API version if available
      let apiVersion: string | undefined
      if (options.includeApiVersion) {
        apiVersion = (request as { apiVersion?: string }).apiVersion
      }

      // Call the original handler
      const response = await handler(request, context)

      // Create metadata
      const metadata = createResponseMetadata(request, startTime, userId, apiVersion)

      // Add metadata to response
      const enhancedResponse = addMetadataHeaders(response, metadata)

      return enhancedResponse
    } catch (error) {
      // Handle errors with metadata
      const metadata = createResponseMetadata(request, startTime)

      const errorResponse = createErrorResponseWithMetadata(
        error instanceof Error ? error : 'Internal server error',
        500,
        'INTERNAL_ERROR',
        metadata
      )

      return errorResponse
    }
  }
}

/**
 * Performance monitoring utilities
 */
export const ResponseMonitoring = {
  /**
   * Log slow responses
   */
  logSlowResponse: (metadata: ResponseMetadata, thresholdMs: number = 1000) => {
    if (metadata.responseTime > thresholdMs) {
      apiLogger.warn({
        path: metadata.path,
        method: metadata.method,
        requestId: metadata.requestId,
        userId: metadata.userId,
      }, `Slow response detected: ${metadata.responseTime}ms`)
    }
  },

  /**
   * Track response time percentiles
   */
  trackResponseTime: (metadata: ResponseMetadata) => {
    // This could integrate with a metrics system like Prometheus
    // For now, just log for monitoring
    if (metadata.responseTime > 5000) {
      apiLogger.error(metadata, `Very slow response: ${metadata.responseTime}ms`)
    }
  },
}

/**
 * Request tracing utilities
 */
export const RequestTracing = {
  /**
   * Create a trace context for distributed tracing
   */
  createTraceContext: (requestId: string) => {
    return {
      traceId: requestId,
      spanId: generateRequestId(),
      parentSpanId: undefined,
    }
  },

  /**
   * Add tracing headers to outgoing requests
   */
  addTracingHeaders: (headers: Headers, traceContext: { traceId: string; spanId: string; parentSpanId?: string }) => {
    headers.set('X-Trace-ID', traceContext.traceId)
    headers.set('X-Span-ID', traceContext.spanId)
    if (traceContext.parentSpanId) {
      headers.set('X-Parent-Span-ID', traceContext.parentSpanId)
    }
  },
}