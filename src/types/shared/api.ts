

/**
 * API Response Types
 * Provides type-safe interfaces for API responses, errors, and pagination
 */

/**
 * Standard API response wrapper
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    success: boolean;
}

/**
 * API error structure
 */
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

/**
 * Paginated response structure
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string | number | boolean | null>;
}

/**
 * Mutation response for create/update/delete operations
 */
export interface MutationResponse<T> extends ApiResponse<T> {
    affected?: number;
}
