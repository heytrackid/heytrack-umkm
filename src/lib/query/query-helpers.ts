/**
 * React Query Helper Functions
 * Standard utilities for API requests with consistent behavior
 */

import { apiLogger } from '@/lib/logger'

/**
 * API Response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function extractDataArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[]
  }

  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data?: unknown }).data
    if (Array.isArray(data)) {
      return data as T[]
    }
  }

  return []
}

/**
 * Standard fetch with timeout, credentials, and error handling
 * 
 * @param endpoint - API endpoint (e.g., '/api/recipes')
 * @param options - Fetch options
 * @param timeout - Request timeout in milliseconds (default: 30000)
 * @returns Parsed response data
 * @throws Error if request fails or times out
 * 
 * @example
 * ```typescript
 * const recipes = await fetchApi<Recipe[]>('/api/recipes')
 * ```
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  timeout = 30000
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include', // Always include credentials for auth
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }

      apiLogger.error({ endpoint, status: response.status, error: errorMessage }, 'API request failed')
      throw new Error(errorMessage)
    }

    // Parse response
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!isJson) {
      apiLogger.warn({ endpoint, contentType }, 'Non-JSON response received')
      return null as T
    }

    const data = await response.json()

    // Handle ApiResponse format
    if (data && typeof data === 'object' && 'success' in data) {
      const apiResponse = data as ApiResponse<T>
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Request failed')
      }

      // If response has pagination, return full response (data + pagination)
      if ('pagination' in data) {
        return data as T
      }

      return apiResponse.data as T
    }

    // Return raw data if not in ApiResponse format
    return data as T

  } catch (error) {
    clearTimeout(timeoutId)

    // Handle abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      const message = 'Request timeout - please try again'
      apiLogger.error({ endpoint, timeout }, message)
      throw new Error(message)
    }

    // Re-throw other errors
    throw error
  }
}

/**
 * POST request helper
 * 
 * @example
 * ```typescript
 * const newRecipe = await postApi<Recipe>('/api/recipes', { name: 'New Recipe' })
 * ```
 */
export async function postApi<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
  timeout = 30000
): Promise<T> {
  const requestOptions: RequestInit = {
    ...(options || {}),
    method: 'POST',
  }
  if (data !== undefined) {
    requestOptions.body = JSON.stringify(data)
  }
  return fetchApi<T>(endpoint, requestOptions, timeout)
}

/**
 * PUT request helper
 * 
 * @example
 * ```typescript
 * const updated = await putApi<Recipe>('/api/recipes/123', { name: 'Updated Recipe' })
 * ```
 */
export async function putApi<T>(
  endpoint: string,
  data: unknown,
  options?: RequestInit,
  timeout = 30000
): Promise<T> {
  const requestOptions = {
    ...(options || {}),
    method: 'PUT',
  }
  if (data != null) {
    requestOptions.body = JSON.stringify(data)
  }
  return fetchApi<T>(endpoint, requestOptions, timeout)
}

/**
 * PATCH request helper
 * 
 * @example
 * ```typescript
 * const patched = await patchApi<Recipe>('/api/recipes/123', { name: 'Patched Recipe' })
 * ```
 */
export async function patchApi<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit,
  timeout = 30000
): Promise<T> {
  const requestOptions = {
    ...options,
    method: 'PUT',
    ...(data !== undefined && { body: JSON.stringify(data) })
  }
  if (data) {
    requestOptions.body = JSON.stringify(data)
  }
  return fetchApi<T>(endpoint, requestOptions, timeout)
}

/**
 * DELETE request helper
 * 
 * @example
 * ```typescript
 * await deleteApi('/api/recipes/123')
 * ```
 */
export async function deleteApi<T = void>(
  endpoint: string,
  options?: RequestInit,
  timeout = 30000
): Promise<T> {
  return fetchApi<T>(
    endpoint,
    {
      ...options,
      method: 'DELETE',
    },
    timeout
  )
}

/**
 * Build URL with query parameters
 * 
 * @example
 * ```typescript
 * const url = buildApiUrl('/api/recipes', { limit: 10, search: 'cake' })
 * // Returns: '/api/recipes?limit=10&search=cake'
 * ```
 */
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, boolean | number | string | null | undefined>
): string {
  if (!params) {
    return endpoint
  }

  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}
