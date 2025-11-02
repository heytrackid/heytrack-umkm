import { toast } from '@/hooks/use-toast';
import { apiLogger } from '@/lib/logger';


/**
 * Client-Side API Error Handler
 * Handles errors from API calls on the client side
 */


export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiErrorHandler {
  static handle(error: unknown, context?: string, showNotification = true): ApiResponse {
    // Log the error
    apiLogger.error({
      error,
      context,
      timestamp: new Date().toISOString()
    }, 'Client API Error');

    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      message = error.message;
      code = error.name;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle specific error types
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.status) {
        switch (errorObj.status) {
          case 400:
            message = errorObj.message || 'Bad request';
            code = 'BAD_REQUEST';
            break;
          case 401:
            message = 'Authentication required';
            code = 'AUTH_REQUIRED';
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
            message = errorObj.message || `Server error (${errorObj.status})`;
            code = `SERVER_ERROR_${errorObj.status}`;
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
      status: response.status,
      message: errorData.message || response.statusText,
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
      };
    } catch (error) {
      return this.handle(error, context, showNotification);
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

  const handleFetchError = async (
    response: Response,
    context?: string,
    showNotification = true
  ): Promise<ApiResponse> => ApiErrorHandler.handleFetchError(response, context, showNotification);

  const safeExecute = async <T,>(
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