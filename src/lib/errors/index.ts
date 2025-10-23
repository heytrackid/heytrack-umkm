/**
 * Centralized error handling exports
 * Import error handling utilities from this file
 */

// Auth errors and validation
export {
  AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES, ERROR_MESSAGES, ErrorCode, VALIDATION_ERRORS, getAuthErrorMessage, getErrorMessage, validateEmail,
  validatePassword,
  validatePasswordMatch, type AuthError
} from '../auth-errors'

// Client-side error handling
export {
  fetchWithErrorHandling, handleApiError, showErrorToast, showSuccessToast, useApiErrorHandler, type ApiErrorResponse as ClientApiErrorResponse
} from '../client-error-handler'

// Server-side error handling
export {
  HttpStatus, createErrorResponse,
  createSuccessResponse,
  handleAuthError,
  handleDatabaseError, handleForbidden,
  handleNotFound, handleUnauthorized, handleValidationError, validateAuth,
  withErrorHandling, type ApiErrorResponse,
  type ApiSuccessResponse
} from '../server-error-handler'

