/**
 * Client-side error handling utilities
 * Provides helper functions for handling API errors with toast notifications
 */

'use client'

import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ErrorCode, getErrorMessage } from './auth-errors'

/**
 * API Error Response interface
 */
export interface ApiErrorResponse {
    error: string
    code?: ErrorCode
    details?: string
}

/**
 * Handle API errors with toast notifications and automatic redirects
 */
export function useApiErrorHandler() {
    const router = useRouter()

    const handleError = (error: unknown, customMessage?: string) => {
        console.error('API Error:', error)

        // Handle fetch errors
        if (error instanceof Response) {
            handleResponseError(error, router, customMessage)
            return
        }

        // Handle Error objects
        if (error instanceof Error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: customMessage || error.message || getErrorMessage(ErrorCode.INTERNAL_ERROR),
            })
            return
        }

        // Handle unknown errors
        toast({
            variant: 'destructive',
            title: 'Error',
            description: customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR),
        })
    }

    return { handleError }
}

/**
 * Handle Response errors
 */
async function handleResponseError(
    response: Response,
    router: ReturnType<typeof useRouter>,
    customMessage?: string
) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
        toast({
            variant: 'destructive',
            title: 'Sesi Berakhir',
            description: getErrorMessage(ErrorCode.SESSION_EXPIRED),
        })

        // Redirect to login with return URL
        const currentPath = window.location.pathname
        router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`)
        return
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
        toast({
            variant: 'destructive',
            title: 'Akses Ditolak',
            description: getErrorMessage(ErrorCode.FORBIDDEN),
        })
        return
    }

    // Handle 404 Not Found
    if (response.status === 404) {
        toast({
            variant: 'destructive',
            title: 'Tidak Ditemukan',
            description: getErrorMessage(ErrorCode.NOT_FOUND),
        })
        return
    }

    // Try to parse error response
    try {
        const errorData: ApiErrorResponse = await response.json()

        const message = errorData.code
            ? getErrorMessage(errorData.code)
            : errorData.error || customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR)

        toast({
            variant: 'destructive',
            title: 'Error',
            description: message,
        })
    } catch {
        // If parsing fails, show generic error
        toast({
            variant: 'destructive',
            title: 'Error',
            description: customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR),
        })
    }
}

/**
 * Standalone function to handle API errors (for use outside of React components)
 */
export async function handleApiError(
    error: unknown,
    options?: {
        customMessage?: string
        onUnauthorized?: () => void
    }
): Promise<void> {
    console.error('API Error:', error)

    // Handle fetch Response errors
    if (error instanceof Response) {
        // Handle 401 Unauthorized
        if (error.status === 401) {
            toast({
                variant: 'destructive',
                title: 'Sesi Berakhir',
                description: getErrorMessage(ErrorCode.SESSION_EXPIRED),
            })

            if (options?.onUnauthorized) {
                options.onUnauthorized()
            } else {
                // Default: redirect to login
                const currentPath = window.location.pathname
                window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`
            }
            return
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
            toast({
                variant: 'destructive',
                title: 'Akses Ditolak',
                description: getErrorMessage(ErrorCode.FORBIDDEN),
            })
            return
        }

        // Handle 404 Not Found
        if (error.status === 404) {
            toast({
                variant: 'destructive',
                title: 'Tidak Ditemukan',
                description: getErrorMessage(ErrorCode.NOT_FOUND),
            })
            return
        }

        // Try to parse error response
        try {
            const errorData: ApiErrorResponse = await error.json()

            const message = errorData.code
                ? getErrorMessage(errorData.code)
                : errorData.error || options?.customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR)

            toast({
                variant: 'destructive',
                title: 'Error',
                description: message,
            })
        } catch {
            // If parsing fails, show generic error
            toast({
                variant: 'destructive',
                title: 'Error',
                description: options?.customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR),
            })
        }
        return
    }

    // Handle Error objects
    if (error instanceof Error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: options?.customMessage || error.message || getErrorMessage(ErrorCode.INTERNAL_ERROR),
        })
        return
    }

    // Handle unknown errors
    toast({
        variant: 'destructive',
        title: 'Error',
        description: options?.customMessage || getErrorMessage(ErrorCode.INTERNAL_ERROR),
    })
}

/**
 * Wrapper for fetch requests with automatic error handling
 */
export async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit,
    errorOptions?: {
        customMessage?: string
        onUnauthorized?: () => void
    }
): Promise<T> {
    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            await handleApiError(response, errorOptions)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('HTTP error!')) {
            // Already handled by handleApiError
            throw error
        }

        // Handle network errors
        await handleApiError(error, errorOptions)
        throw error
    }
}

/**
 * Show success toast notification
 */
export function showSuccessToast(title: string, description?: string) {
    toast({
        title,
        description,
    })
}

/**
 * Show error toast notification
 */
export function showErrorToast(description: string, title: string = 'Error') {
    toast({
        variant: 'destructive',
        title,
        description,
    })
}
