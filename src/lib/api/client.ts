import { apiLogger } from '@/lib/logger'

/**
 * API Client
 * Centralized API client with error handling and type safety
 */


export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, boolean | number | string>
}

// Alias for backward compatibility
export type RequestConfig = ApiRequestOptions

/**
 * Base API client
 */
export class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params)
      const response = await fetch(url, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        credentials: 'include', // Include cookies for authentication
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error) as ApiResponse<T>
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params)
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include', // Include cookies for authentication
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error) as ApiResponse<T>
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params)
      const response = await fetch(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include', // Include cookies for authentication
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error) as ApiResponse<T>
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params)
      const response = await fetch(url, {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include', // Include cookies for authentication
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error) as ApiResponse<T>
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params)
      const response = await fetch(url, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        credentials: 'include', // Include cookies for authentication
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error) as ApiResponse<T>
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, boolean | number | string>): string {
    const url = `${this.baseUrl}${endpoint}`
    
    if (!params) {return url}

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })

    return `${url}?${searchParams.toString()}`
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      const error = isJson ? await response.json() : { error: response.statusText }
      apiLogger.error({ error, status: response.status }, 'API request failed')

      return {
        success: false,
        error: error.error ?? error.message ?? 'Request failed'
      }
    }

    const _data = isJson ? await response.json() : null

    return {
      success: true,
      data: _data as T
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): ApiResponse {
    const message = error instanceof Error ? error.message : 'Unknown error'
    apiLogger.error({ error }, 'API client error')

    return {
      success: false,
      error: message
    }
  }
}

// Export default instance
export const apiClient = new ApiClient()
