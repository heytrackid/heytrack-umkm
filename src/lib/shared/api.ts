// Shared API utilities and helpers

import { apiLogger } from '@/lib/logger'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  timestamp?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  readonly code: string
  readonly message: string
  readonly details?: Record<string, any>
  readonly statusCode: number
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Common API error codes
export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: string = API_ERROR_CODES.UNKNOWN_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Create standardized API response
 */
export const createApiResponse = {
  success: <T>(data: T, message?: string): ApiResponse<T> => ({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }),

  error: (
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = API_ERROR_CODES.UNKNOWN_ERROR,
    details?: Record<string, any>
  ): ApiResponse => ({
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...details && { details },
  }),

  paginated: <T>(
    data: T[],
    pagination: PaginatedResponse<T>['pagination'],
    message?: string
  ): PaginatedResponse<T> => ({
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
  }),
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  withAuth?: boolean
  cache?: boolean
  cacheTimeout?: number
}

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: Required<ApiRequestConfig> = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withAuth: true,
  cache: false,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
}

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Retry utility with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = _error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      const jitter = Math.random() * 0.1 * exponentialDelay
      const delay = exponentialDelay + jitter

      apiLogger.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, { error })
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Cache utilities for API responses
 */
export const apiCache = {
  // Simple in-memory cache
  cache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  set: (key: string, data: any, ttl: number = DEFAULT_API_CONFIG.cacheTimeout) => {
    apiCache.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  },

  get: (key: string) => {
    const cached = apiCache.cache.get(key)
    if (!cached) {return null}

    if (Date.now() - cached.timestamp > cached.ttl) {
      apiCache.cache.delete(key)
      return null
    }

    return cached.data
  },

  clear: (key?: string) => {
    if (key) {
      apiCache.cache.delete(key)
    } else {
      apiCache.cache.clear()
    }
  },

  cleanup: () => {
    const now = Date.now()
    for (const [key, value] of apiCache.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        apiCache.cache.delete(key)
      }
    }
  },
}

/**
 * API request wrapper with error handling and retries
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  config: Partial<ApiRequestConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_API_CONFIG, ...config }
  const startTime = Date.now()

  // Check cache first
  if (finalConfig.cache) {
    const cacheKey = `${options.method || 'GET'}-${url}`
    const cached = apiCache.get(cacheKey)
    if (cached) {
      apiLogger.debug(`Cache hit for ${url}`)
      return cached
    }
  }

  const makeRequest = async (): Promise<T> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout)

    try {
      // Add authorization header if needed
      const headers = {
        ...finalConfig.headers,
        ...options.headers,
      }

      if (finalConfig.withAuth) {
        // Add auth header logic here
        // const token = await getAuthToken()
        // headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || API_ERROR_CODES.UNKNOWN_ERROR,
          response.status,
          errorData.details
        )
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      apiLogger.debug(`API call to ${url} completed in ${duration}ms`)

      // Cache response if enabled
      if (finalConfig.cache) {
        const cacheKey = `${options.method || 'GET'}-${url}`
        apiCache.set(cacheKey, data, finalConfig.cacheTimeout)
      }

      return data
    } catch (err) {
      clearTimeout(timeoutId)

      if (err instanceof ApiError) {
        throw err
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout',
          API_ERROR_CODES.TIMEOUT_ERROR,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error - please check your connection',
          API_ERROR_CODES.NETWORK_ERROR,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        API_ERROR_CODES.UNKNOWN_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }

  // Retry with backoff if configured
  if (finalConfig.retries > 0) {
    return retryWithBackoff(makeRequest, finalConfig.retries, finalConfig.retryDelay)
  }

  return makeRequest()
}

/**
 * HTTP method helpers
 */
export const apiMethods = {
  get: <T>(url: string, config?: Partial<ApiRequestConfig>) =>
    apiRequest<T>(url, { method: 'GET' }, config),

  post: <T>(url: string, data?: any, config?: Partial<ApiRequestConfig>) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, config),

  put: <T>(url: string, data?: any, config?: Partial<ApiRequestConfig>) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, config),

  patch: <T>(url: string, data?: any, config?: Partial<ApiRequestConfig>) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, config),

  delete: <T>(url: string, config?: Partial<ApiRequestConfig>) =>
    apiRequest<T>(url, { method: 'DELETE' }, config),
}

/**
 * URL building utilities
 */
export const urlBuilder = {
  // Build URL with query parameters
  withParams: (baseUrl: string, params: Record<string, any> = {}): string => {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)))
        } else {
          url.searchParams.set(key, String(value))
        }
      }
    })

    return url.toString()
  },

  // Build pagination URL
  withPagination: (baseUrl: string, page: number, limit: number, params: Record<string, any> = {}): string => urlBuilder.withParams(baseUrl, {
      ...params,
      page,
      limit,
    }),

  // Build search URL
  withSearch: (baseUrl: string, search: string, params: Record<string, any> = {}): string => urlBuilder.withParams(baseUrl, {
      ...params,
      search,
    }),
}

/**
 * API response transformers
 */
export const responseTransformers = {
  // Transform Supabase response to standardized format
  supabaseToStandard: <T>(response: any): ApiResponse<T> => {
    if (response.error) {
      return createApiResponse.error(
        response.error.message,
        HTTP_STATUS.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_ERROR,
        { supabaseError: response.error }
      )
    }

    return createApiResponse.success(response.data)
  },

  // Transform array response to paginated response
  arrayToPaginated: <T>(
    data: T[],
    page = 1,
    limit = 10,
    total: number = data.length
  ): PaginatedResponse<T> => {
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return createApiResponse.paginated(
      data,
      {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      }
    )
  },
}

/**
 * API monitoring and analytics
 */
export const apiAnalytics = {
  requests: new Map<string, { count: number; totalTime: number; errors: number }>(),

  trackRequest: (url: string, duration: number, error = false) => {
    const key = url.split('?')[0] // Remove query params for grouping
    const existing = apiAnalytics.requests.get(key) || { count: 0, totalTime: 0, errors: 0 }

    apiAnalytics.requests.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      errors: existing.errors + (error ? 1 : 0),
    })
  },

  getStats: () => {
    const stats: Array<{
      url: string
      count: number
      averageTime: number
      errorRate: number
    }> = []

    for (const [url, data] of apiAnalytics.requests.entries()) {
      stats.push({
        url,
        count: data.count,
        averageTime: data.totalTime / data.count,
        errorRate: (data.errors / data.count) * 100,
      })
    }

    return stats.sort((a, b) => b.count - a.count)
  },

  reset: () => {
    apiAnalytics.requests.clear()
  },
}

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 5 * 60 * 1000) // Clean up every 5 minutes
}
