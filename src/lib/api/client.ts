/**
 * Centralized API Client
 * Handles all HTTP requests with interceptors, error handling, retry logic, etc.
 */

import { apiLogger } from '@/lib/logger'

interface RequestConfig extends RequestInit {
  baseURL?: string
  retry?: number
  timeout?: number
  skipErrorLog?: boolean
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  status: number
}

interface ApiError extends Error {
  status: number
  data?: unknown
  response?: Response
}

// Request/Response logging utilities
const logger = {
  log: (message: string, data?: unknown) => {
    apiLogger.debug({ data }, message)
  },
  error: (message: string, error?: unknown) => {
    apiLogger.error({ err: error }, message)
  },
  warn: (message: string, data?: unknown) => {
    apiLogger.warn({ data }, message)
  },
}

/**
 * Retry mechanism with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 10000) + Math.random() * 1000
}

async function retryRequest(
  fn: () => Promise<Response>,
  maxRetries: number = 3,
  attempt: number = 0
): Promise<Response> {
  try {
    return await fn()
  } catch (error) {
    if (attempt < maxRetries) {
      const delay = getRetryDelay(attempt)
      logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryRequest(fn, maxRetries, attempt + 1)
    }
    throw error
  }
}

/**
 * Main API Client class
 */
class APIClient {
  private baseURL: string
  private defaultTimeout: number = 30000
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = []
  private responseInterceptors: Array<(response: Response) => Promise<Response>> = []
  private errorInterceptors: Array<(error: ApiError) => Promise<void>> = []

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * Register request interceptor
   */
  useRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Register response interceptor
   */
  useResponseInterceptor(interceptor: (response: Response) => Promise<Response>) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Register error interceptor
   */
  useErrorInterceptor(interceptor: (error: ApiError) => Promise<void>) {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(finalConfig)
    }
    return finalConfig
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse)
    }
    return finalResponse
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: ApiError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error)
    }
  }

  /**
   * Create ApiError from response
   */
  private async createApiError(response: Response, data?: unknown): Promise<ApiError> {
    const dataObj = data as { error?: string; message?: string } | undefined
    const error = new Error(
      dataObj?.error || dataObj?.message || `API Error: ${response.status}`
    ) as ApiError
    error.status = response.status
    error.response = response
    error.data = data
    return error
  }

  /**
   * Make HTTP request with full error handling and interceptors
   */
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      baseURL = this.baseURL,
      retry = 0,
      timeout = this.defaultTimeout,
      skipErrorLog = false,
      ...fetchConfig
    } = config

    const url = `${baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Set default headers
      const headers = {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      }

      let finalConfig: RequestConfig = {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      }

      // Apply request interceptors
      finalConfig = await this.applyRequestInterceptors(finalConfig)

      logger.log(`${finalConfig.method || 'GET'} ${url}`, {
        config: finalConfig,
      })

      // Make request with retry
      const makeRequest = () => fetch(url, finalConfig)
      let response = await retryRequest(makeRequest, retry)

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response)

      // Parse response
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')
      const data = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        const error = await this.createApiError(response, data)

        // Apply error interceptors
        if (!skipErrorLog) {
          await this.applyErrorInterceptors(error)
        }

        logger.error(`${response.status} ${url}`, error)

        return {
          success: false,
          error: (error instanceof Error ? error.message : String(error)),
          status: response.status,
        }
      }

      logger.log(`Success ${response.status} ${url}`, data)

      return {
        success: true,
        data: data as T,
        status: response.status,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      if (!skipErrorLog) {
        logger.error(errorMessage, error)
      }

      // Handle timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          status: 408,
        }
      }

      return {
        success: false,
        error: errorMessage,
        status: 0,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * GET request
   */
  get<T = unknown>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * POST request
   */
  post<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  put<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PATCH request
   */
  patch<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  delete<T = unknown>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Create singleton instance
const apiClient = new APIClient()

// Export for direct use
export { apiClient, APIClient }
export type { ApiError, ApiResponse, RequestConfig }

