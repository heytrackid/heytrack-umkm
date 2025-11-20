import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest, NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createErrorResponse, handleAPIError, withQueryValidation } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export interface RouteContext {
  user: { id: string; email: string | null }
  supabase: SupabaseClient<Database>
  request: NextRequest
  params?: Record<string, string>
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
    securityPreset = SecurityPresets.enhanced(),
  } = config

  const wrappedHandler = async (request: NextRequest, params: Record<string, string>): Promise<NextResponse> => {
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
      
      return response
    } catch (error) {
      apiLogger.error({ error, path, method }, 'Unhandled error in route')
      const apiError = handleAPIError(error)
      return createErrorResponse(apiError.message, apiError['statusCode'])
    }
  }

  // Wrap with security middleware
  return createSecureHandler(wrappedHandler as never, `${method} ${path}`, securityPreset)
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
        querySchema: schemas?.querySchema,
      },
      handlers.GET
    )
  }

  if (handlers.POST) {
    routes['POST'] = createApiRoute(
      {
        method: 'POST',
        path: basePath,
        bodySchema: schemas?.bodySchema,
      },
      handlers.POST
    )
  }

  if (handlers.PUT) {
    routes['PUT'] = createApiRoute(
      {
        method: 'PUT',
        path: basePath,
        bodySchema: schemas?.bodySchema,
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
