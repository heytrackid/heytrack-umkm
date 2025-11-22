// lib/api/versioning.ts
// API Versioning System

import { NextRequest } from 'next/server'

export type APIVersion = 'v1' | 'v2'

export const CURRENT_API_VERSION: APIVersion = 'v1'
export const SUPPORTED_VERSIONS: APIVersion[] = ['v1']

/**
 * Extract API version from request
 * Supports both URL-based (/api/v1/resource) and header-based (Accept-Version: v1) versioning
 */
export function extractAPIVersion(request: NextRequest, params?: Record<string, string | string[]>): APIVersion {
  // Check URL-based versioning first (/api/v1/resource)
  if (params?.['version']) {
    const urlVersion = params['version'] as string
    if (isValidVersion(urlVersion)) {
      return urlVersion as APIVersion
    }
  }

  // Check header-based versioning (Accept-Version: v1)
  const headerVersion = request.headers.get('accept-version') || request.headers.get('api-version')
  if (headerVersion && isValidVersion(headerVersion)) {
    return headerVersion as APIVersion
  }

  // Default to current version
  return CURRENT_API_VERSION
}

/**
 * Validate if a version string is supported
 */
export function isValidVersion(version: string): version is APIVersion {
  return SUPPORTED_VERSIONS.includes(version as APIVersion)
}

/**
 * Get version-specific route handler
 */
export function getVersionedHandler<T>(
  handlers: Record<APIVersion, T>,
  version: APIVersion = CURRENT_API_VERSION
): T {
  return handlers[version] || handlers[CURRENT_API_VERSION]
}

/**
 * Create version-aware API route
 */
export function createVersionedRoute<TQuery = unknown, TBody = unknown>(
  config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    path: string
    querySchema?: unknown
    bodySchema?: unknown
    versions?: {
      [K in APIVersion]?: {
        handler: (context: unknown, query?: TQuery, body?: TBody) => Promise<unknown>
        querySchema?: unknown
        bodySchema?: unknown
      }
    }
  }
) {
  return async (context: unknown) => {
    const { request, params } = context as { request: NextRequest; params?: Record<string, string | string[]> }
    const version = extractAPIVersion(request, params)

    const versionConfig = config.versions?.[version]
    if (!versionConfig) {
      // Fallback to default handler if version not specified
      const defaultHandler = config.versions?.[CURRENT_API_VERSION]?.handler
      if (defaultHandler) {
        return defaultHandler(context)
      }
      throw new Error(`API version ${version} not supported for ${config.path}`)
    }

    return versionConfig.handler(context)
  }
}

/**
 * Version compatibility helpers
 */
export const VersionUtils = {
  /**
   * Check if a version supports a feature
   */
  supportsFeature: (version: APIVersion, feature: string): boolean => {
    const featureMatrix: Record<APIVersion, string[]> = {
      v1: ['basic_crud', 'pagination', 'search', 'filtering'],
      v2: ['basic_crud', 'pagination', 'search', 'filtering', 'advanced_filtering', 'bulk_operations']
    }

    return featureMatrix[version]?.includes(feature) ?? false
  },

  /**
   * Get deprecated features for a version
   */
  getDeprecatedFeatures: (version: APIVersion): string[] => {
    const deprecationMatrix: Record<APIVersion, string[]> = {
      v1: [], // v1 is current, nothing deprecated
      v2: []  // v2 is future
    }

    return deprecationMatrix[version] ?? []
  },

  /**
   * Add version headers to response
   */
  addVersionHeaders: (response: Response, version: APIVersion): Response => {
    const newResponse = new Response(response.body, response)

    newResponse.headers.set('X-API-Version', version)
    newResponse.headers.set('X-API-Current-Version', CURRENT_API_VERSION)

    if (version !== CURRENT_API_VERSION) {
      newResponse.headers.set('X-API-Version-Deprecated', 'true')
    }

    return newResponse
  }
}

/**
 * Middleware to handle API versioning
 */
export function withVersioning(handler: (request: NextRequest, params?: Record<string, string | string[]>) => Promise<Response>) {
  return async (request: NextRequest, params?: Record<string, string | string[]>) => {
    const version = extractAPIVersion(request, params)

    // Add version to request for use in handlers
    ;(request as { apiVersion?: string }).apiVersion = version

    const response = await handler(request, params)

    // Add version headers to response
    if (response instanceof Response) {
      return VersionUtils.addVersionHeaders(response, version)
    }

    return response
  }
}