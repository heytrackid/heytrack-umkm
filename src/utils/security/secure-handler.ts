import { type NextRequest, type NextResponse } from 'next/server'

import { handleAPIError } from '@/lib/errors/api-error-handler'

import { withSecurity, type SecurityConfig, SecurityPresets } from './api-middleware'

type Handler<Params extends Record<string, unknown>> = (request: NextRequest, params: Params) => Promise<NextResponse>

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
