import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError } from '@/lib/errors/api-error-handler'

import { withSecurity, type SecurityConfig, SecurityPresets } from '@/utils/security/api-middleware'

type Handler<Params extends Record<string, unknown>> = (request: NextRequest, params: Params) => Promise<NextResponse>

type RouteHandler = (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>

type SecurityPreset = SecurityConfig | (() => SecurityConfig)

function resolveConfig(preset?: SecurityPreset): SecurityConfig {
  if (!preset) {
    return SecurityPresets.enhanced()
  }

  return typeof preset === 'function' ? preset() : preset
}

export function createSecureHandler<Params extends Record<string, unknown> = Record<string, never>>(
  handler: Handler<Params>,
  context: string,
  preset?: SecurityPreset
) {
  const config = resolveConfig(preset)

  const wrappedHandler: Handler<Params> = async (request, params) => {
    try {
      return await handler(request, params)
    } catch (error) {
      return handleAPIError(error, context)
    }
  }

  return withSecurity(wrappedHandler, config)
}

// New function for App Router dynamic routes
export function createSecureRouteHandler(
  handler: RouteHandler,
  context: string,
  preset?: SecurityPreset
) {
  const config = resolveConfig(preset)

  const wrappedHandler: RouteHandler = async (request, routeContext) => {
    // Apply security checks
    if (config.validateContentType) {
      const contentType = request.headers.get('content-type')?.split(';')[0] || ''
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        if (contentType && !config.allowedContentTypes?.includes(contentType)) {
          return NextResponse.json(
            { error: 'Invalid content type. Only application/json is allowed.' },
            { status: 400 }
          )
        }
      }
    }

    try {
      return await handler(request, routeContext)
    } catch (error) {
      return handleAPIError(error, context)
    }
  }

  return wrappedHandler
}
