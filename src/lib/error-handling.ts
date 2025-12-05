import { errorToast } from '@/hooks/use-toast'
import { uiLogger } from '@/lib/logger'

/**
 * getErrorMessage - Extracts user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'Terjadi kesalahan tak terduga'
}

/**
 * classifyClientError - Maps technical errors to user-friendly Indonesian messages
 */
export function classifyClientError(error: unknown): string {
  const msg = getErrorMessage(error).toLowerCase()

  // Authentication errors
  if (msg.includes('authentication') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('sign-in')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.'
  }

  // Network errors
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout') || msg.includes('failed to fetch') || error instanceof Error && error.name === 'AbortError') {
    return 'Masalah koneksi internet. Silakan periksa koneksi Anda.'
  }

  // Validation errors
  if (msg.includes('validation') || msg.includes('zoderror') || msg.includes('400') || msg.includes('invalid request')) {
    return 'Data yang dimasukkan tidak valid. Silakan periksa kembali.'
  }

  // Not found errors
  if (msg.includes('not found') || msg.includes('404') || msg.includes('pgrst116')) {
    return 'Data tidak ditemukan.'
  }

  // Permission errors
  if (msg.includes('forbidden') || msg.includes('403') || msg.includes('insufficient permissions')) {
    return 'Anda tidak memiliki akses untuk melakukan tindakan ini.'
  }

  // Rate limit errors
  if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many requests')) {
    return 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
  }

  // Server errors
  if (msg.includes('500') || msg.includes('internal server error') || msg.includes('database error')) {
    return 'Terjadi kesalahan server. Silakan coba lagi nanti.'
  }

  // Default fallback
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

/**
 * isAuthError - Check if error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase()
  return msg.includes('authentication') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('sign-in')
}

/**
 * isNetworkError - Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase()
  return msg.includes('network') || msg.includes('fetch') || msg.includes('timeout') || msg.includes('failed to fetch') || (error instanceof Error && error.name === 'AbortError')
}

/**
 * handleError - Primary error handler for API operations and mutations
 * @param error - The error object
 * @param context - Context string (e.g., 'Create order', 'useOrders: delete')
 * @param showToast - Whether to show toast notification (default: true)
 * @param customMessage - Custom user message (optional, falls back to classification)
 */
export function handleError(
  error: unknown,
  context: string,
  showToast: boolean = true,
  customMessage?: string
): void {
  // Log the error with context
  uiLogger.error({ error, context }, `Error handled: ${context}`)

  // Show toast if requested
  if (showToast) {
    const userMessage = customMessage || classifyClientError(error)
    errorToast('Terjadi Kesalahan', userMessage)
  }

  // Handle special cases
  if (isAuthError(error)) {
    // Redirect to login page for auth errors
    uiLogger.info({ context }, 'Auth error detected, redirecting to login')
    // Use window.location for client-side redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/handler/sign-in'
    }
  }
}

/**
 * handleApiError - Specialized handler for API errors with enhanced context
 * @param error - The error object
 * @param context - Context string for the API operation
 * @param customMessage - Custom user message (optional)
 */
export function handleApiError(
  error: unknown,
  context: string,
  customMessage?: string
): void {
  // Enhanced logging for API errors
  uiLogger.error({
    error,
    context,
    type: 'api_error',
    timestamp: new Date().toISOString()
  }, `API Error: ${context}`)

  // Use handleError for consistent behavior
  handleError(error, `API: ${context}`, true, customMessage)
}

/**
 * handleClientError - Unified client-side error handler (fallback for all errors)
 * @param error - The error object
 * @param context - Context string (optional, defaults to 'Unknown')
 */
export function handleClientError(error: unknown, context = 'Unknown'): void {
  handleError(error, context, true)
}

/**
 * handleFormValidationError - Handle form validation errors with field-specific messages
 * @param error - The validation error
 * @param setError - React Hook Form's setError function
 * @param context - Context string for logging
 */
export function handleFormValidationError(
  error: unknown,
  setError: (name: string, error: { message: string }) => void,
  context: string
): void {
  // Log the error
  uiLogger.error({ error, context }, `Form validation error: ${context}`)

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    zodError.issues.forEach((issue) => {
      const fieldName = issue.path.join('.')
      setError(fieldName, { message: issue.message })
    })
  } else {
    // Fallback to general error
    handleError(error, context, true, 'Data yang dimasukkan tidak valid')
  }
}

/**
 * handleFormSubmitError - Handle form submission errors with proper field error setting
 * @param error - The submission error
 * @param setError - React Hook Form's setError function
 * @param context - Context string for logging
 * @param customMessage - Custom user message
 */
export function handleFormSubmitError(
  error: unknown,
  setError: (name: string, error: { message: string }) => void,
  context: string,
  customMessage?: string
): void {
  // Check if it's a validation error with field details
  if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 400 && 'details' in error) {
    const apiError = error as { details: Record<string, string> }
    Object.entries(apiError.details).forEach(([field, message]) => {
      setError(field, { message })
    })
    uiLogger.error({ error, context }, `Form submission validation error: ${context}`)
  } else {
    // Use standard error handling
    handleError(error, context, true, customMessage)
  }
}
