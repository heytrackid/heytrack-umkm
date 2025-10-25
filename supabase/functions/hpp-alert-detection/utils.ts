import type { AlertDetectionData, AlertErrorCode, ErrorResponse } from './types'

// ============================================================================
// Logging Utilities
// ============================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogContext {
    [key: string]: any
}

/**
 * Structured logging utility for Edge Functions
 * Logs are formatted as JSON for Supabase log collection
 */
export function log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        function: 'hpp-alert-detection',
        message,
        ...(context && { context }),
    }

    // Use console.log for all levels - Supabase will collect them
    console.log(JSON.stringify(logEntry))
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Format error response with proper structure
 */
export function formatErrorResponse(
    code: AlertErrorCode,
    message: string,
    additionalDetails?: Record<string, any>
): ErrorResponse {
    return {
        success: false,
        error: message,
        details: {
            code,
            message,
            ...additionalDetails,
        },
    }
}

/**
 * Format success response with execution metrics
 */
export function formatSuccessResponse(data: AlertDetectionData) {
    return {
        success: true,
        data,
    }
}

/**
 * Map error codes to HTTP status codes
 */
export function getHttpStatusForError(code: AlertErrorCode): number {
    const statusMap: Record<AlertErrorCode, number> = {
        AUTH_FAILED: 401,
        DB_CONNECTION_FAILED: 503,
        FETCH_USERS_FAILED: 500,
        FETCH_SNAPSHOTS_FAILED: 500,
        ALERT_GENERATION_FAILED: 500,
        SAVE_ALERTS_FAILED: 500,
        ALERT_DETECTION_FAILED: 500,
    }

    return statusMap[code] || 500
}

/**
 * Safely extract error message from unknown error type
 */
export function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message)
    }
    return 'Unknown error occurred'
}

/**
 * Log error with context
 */
export function logError(
    message: string,
    error: unknown,
    context?: LogContext
): void {
    const errorMessage = extractErrorMessage(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    log('error', message, {
        error: errorMessage,
        ...(errorStack && { stack: errorStack }),
        ...context,
    })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
    newValue: number,
    oldValue: number
): number {
    if (oldValue === 0) return 0
    return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Chunk array into smaller batches
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}
