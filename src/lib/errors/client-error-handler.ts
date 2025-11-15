import { toast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')

// Session handler functions
async function handleSessionExpired(): Promise<void> {
  const sessionLogger = createClientLogger('SessionHandler')
  sessionLogger.warn({}, 'Session expired, clearing local data')
  
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    window.location.href = '/auth/login?session_expired=true'
  }
}

function isSessionExpiredError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  return (
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized')
  )
}


/**
 * Client-Side API Error Handler
 * Handles errors from API calls on the client side
 */


export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
  success: boolean;
}

export class ApiErrorHandler {
  static handle(error: unknown, context?: string, showNotification = true): ApiResponse {
    // Check if this is a session expired error
    if (isSessionExpiredError(error)) {
      void handleSessionExpired()
      return {
        error: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED',
        success: false,
      }
    }

    // Log the error
    logger.error({
      error,
      context,
      timestamp: new Date().toISOString()
    }, 'Client API Error');

    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      const { message: errorMessage, name } = error;
      message = errorMessage;
      code = name;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle specific error types
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as { status?: number; message?: string; code?: string };
      if (errorObj['status']) {
        switch (errorObj['status']) {
          case 400:
            message = errorObj['message'] ?? 'Bad request';
            code = 'BAD_REQUEST';
            break;
          case 401:
            message = 'Authentication required';
            code = 'AUTH_REQUIRED';
            // Handle session expired
            void handleSessionExpired()
            break;
          case 403:
            message = 'Access denied';
            code = 'ACCESS_DENIED';
            break;
          case 404:
            message = 'Resource not found';
            code = 'NOT_FOUND';
            break;
          case 429:
            message = 'Too many requests';
            code = 'RATE_LIMITED';
            break;
          case 500:
            message = 'Internal server error';
            code = 'INTERNAL_ERROR';
            break;
          default:
            message = errorObj['message'] ?? `Server error (${errorObj['status']})`;
            code = `SERVER_ERROR_${errorObj['status']}`;
        }
      }
    }

    // Show toast notification if requested
    if (showNotification) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }

    return {
      error: message,
      code,
      success: false,
    };
  }

  /**
   * Handle fetch errors specifically
   */
  static async handleFetchError(
    response: Response,
    context?: string,
    showNotification = true
  ): Promise<ApiResponse> {
    const errorData = await response.json().catch(() => ({}));
    
    const error = {
      status: response['status'],
      message: errorData.message ?? response.statusText,
      details: errorData.details,
    };

    return this.handle(error, context, showNotification);
  }

  /**
   * Safely execute an API call with error handling
   */
  static async safeExecute<T>(
    apiCall: () => Promise<T>,
    context?: string,
    showNotification = true
  ): Promise<ApiResponse<T>> {
    try {
      const data = await apiCall();
      return {
        data,
        success: true,
      } as ApiResponse<T>;
    } catch (error) {
      return this.handle(error, context, showNotification) as ApiResponse<T>;
    }
  }
}

/**
 * Hook to provide error handling utilities
 */
export const useErrorHandler = () => {
  const handleError = (
    error: unknown,
    context?: string,
    showNotification = true
  ): ApiResponse => ApiErrorHandler.handle(error, context, showNotification);

  const handleFetchError = (
    response: Response,
    context?: string,
    showNotification = true
  ): Promise<ApiResponse> => ApiErrorHandler.handleFetchError(response, context, showNotification);

  const safeExecute = <T,>(
    apiCall: () => Promise<T>,
    context?: string,
    showNotification = true
  ): Promise<ApiResponse<T>> => ApiErrorHandler.safeExecute(apiCall, context, showNotification);

  return {
    handleError,
    handleFetchError,
    safeExecute,
  };
};
