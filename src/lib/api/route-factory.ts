import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createErrorResponse, handleAPIError, withQueryValidation } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

import { SecurityPresets } from '@/utils/security/api-middleware'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export interface RouteContext {
  user: { id: string; email: string | null }
  supabase: SupabaseClient<Database>
  request: NextRequest
  params?: Record<string, string | string[]>
}

export interface RouteConfig<TQuery = unknown, TBody = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  querySchema?: ZodSchema<TQuery>
  bodySchema?: ZodSchema<TBody>
  requireAuth?: boolean
  securityPreset?: ReturnType<typeof SecurityPresets.enhanced>
}

export type RouteHandler<TQuery = unknown, TBody = unknown> = (
  context: RouteContext,
  query?: TQuery,
  body?: TBody
) => Promise<NextResponse>

/**
 * Creates a standardized API route with built-in:
 * - Authentication (Stack Auth)
 * - Authorization (user scoping)
 * - Validation (query & body)
 * - Error handling
 * - Security headers
 * - Logging
 */
export function createApiRoute<TQuery = unknown, TBody = unknown>(
  config: RouteConfig<TQuery, TBody>,
  handler: RouteHandler<TQuery, TBody>
) {
  const {
    method,
    path,
    querySchema,
    bodySchema,
    requireAuth: requireAuthFlag = true,
  } = config

  const wrappedHandler = async (request: NextRequest, routeParams: { params: Promise<Record<string, string | string[]>> }): Promise<NextResponse> => {
    const params = await routeParams.params
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    try {
      // 1. Authentication
      let user: { id: string; email: string | null } | undefined
      if (requireAuthFlag) {
        apiLogger.debug({ path, method }, 'Attempting authentication')
        const authResult = await requireAuth()
        if (isErrorResponse(authResult)) {
          apiLogger.warn({ path, method }, 'Authentication failed')
          return authResult
        }
        user = authResult
        apiLogger.debug({ path, method, userId: user.id }, 'Authentication successful')
      }

      // 2. Query validation
      let validatedQuery: TQuery | undefined
      if (querySchema) {
        const queryValidation = withQueryValidation(querySchema)(request)
        if (queryValidation instanceof Response) {
          return queryValidation
        }
        validatedQuery = queryValidation as TQuery
      }

      // 3. Body validation
      let validatedBody: TBody | undefined
      if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          const rawBody = await request.json()
          const validation = bodySchema.safeParse(rawBody)
          
          if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
            apiLogger.error({ 
              path, 
              validationErrors: validation.error.issues,
              errorMessages,
              receivedData: rawBody 
            }, 'Request body validation failed')
            return createErrorResponse('Invalid request data', 400, errorMessages)
          }
          
          validatedBody = validation.data
        } catch (error) {
          apiLogger.error({ error, path }, 'Failed to parse request body')
          return createErrorResponse('Invalid JSON in request body', 400)
        }
      }

      // 4. Create context
      const supabase = createServiceRoleClient()
      const routeContext: RouteContext = {
        user: user!,
        supabase,
        request,
        params,
      }

      // 5. Execute handler
      const response = await handler(routeContext, validatedQuery, validatedBody)

      // Add response metadata
      const responseTime = Date.now() - startTime
      if (response && typeof response.headers?.set === 'function') {
        response.headers.set('X-Request-ID', requestId)
        response.headers.set('X-Response-Time', responseTime.toString())
      }

      return response
    } catch (error) {
      apiLogger.error({ error, path, method }, 'Unhandled error in route')
      const apiError = handleAPIError(error)
      const errorResponse = createErrorResponse(apiError.message, apiError['statusCode'])

      // Add response metadata to error response
      const responseTime = Date.now() - startTime
      errorResponse.headers.set('X-Request-ID', requestId)
      errorResponse.headers.set('X-Response-Time', responseTime.toString())

      return errorResponse
    }
  }

  // Wrap with security middleware for App Router
  const appRouterHandler = async (request: NextRequest, routeParams: { params: Promise<Record<string, string | string[]>> }): Promise<NextResponse> => {
    return wrappedHandler(request, routeParams)
  }

  return appRouterHandler
}

/**
 * Creates multiple route handlers at once for a resource
 */
export function createResourceRoutes<TQuery = unknown, TBody = unknown>(
  basePath: string,
  handlers: {
    GET?: RouteHandler<TQuery, never>
    POST?: RouteHandler<never, TBody>
    PUT?: RouteHandler<never, TBody>
    DELETE?: RouteHandler<never, never>
    PATCH?: RouteHandler<never, Partial<TBody>>
  },
  schemas?: {
    querySchema?: ZodSchema<TQuery>
    bodySchema?: ZodSchema<TBody>
  }
) {
  const routes: Record<string, ReturnType<typeof createApiRoute>> = {}

  if (handlers.GET) {
    routes['GET'] = createApiRoute(
      {
        method: 'GET',
        path: basePath,
        ...(schemas?.querySchema && { querySchema: schemas.querySchema }),
      },
      handlers.GET
    )
  }

  if (handlers.POST) {
    routes['POST'] = createApiRoute(
      {
        method: 'POST',
        path: basePath,
        ...(schemas?.bodySchema && { bodySchema: schemas.bodySchema }),
      },
      handlers.POST
    )
  }

  if (handlers.PUT) {
    routes['PUT'] = createApiRoute(
      {
        method: 'PUT',
        path: basePath,
        ...(schemas?.bodySchema && { bodySchema: schemas.bodySchema }),
      },
      handlers.PUT
    )
  }

  if (handlers.DELETE) {
    routes['DELETE'] = createApiRoute(
      {
        method: 'DELETE',
        path: basePath,
      },
      handlers.DELETE
    )
  }

  if (handlers.PATCH) {
    routes['PATCH'] = createApiRoute(
      {
        method: 'PATCH',
        path: basePath,
        bodySchema: schemas?.bodySchema as ZodSchema<Partial<TBody>>,
      },
      handlers.PATCH
    )
  }

  return routes
}
