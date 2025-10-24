/**
 * Utility functions for HPP Data Archival Edge Function
 */

import type { ArchivalErrorCode, LogContext, LogLevel } from './types.ts'

// ============================================================================
// Logging Utilities
// ============================================================================

/**
 * Structured logging utility for Edge Functions
 * Logs are formatted as JSON with timestamp and context for Supabase log collection
 * 
 * Subtask 8.1: Create structured logging utility
 * - Implement log function with levels (info, warn, error)
 * - Format logs as JSON with timestamp and context
 * - Use console.log for Supabase log collection (Edge Functions use console.log)
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 11.4
 */
export function log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        function: 'hpp-data-archival',
        message,
        ...(context && { context })
    }

    // Use console.log for all levels - Supabase will collect them
    console.log(JSON.stringify(logEntry))
}

/**
 * Log error with context and stack trace
 * Extracts error details safely from unknown error types
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
        ...context
    })
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

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Format error response with proper structure
 * 
 * Subtask 8.2: Implement error categorization
 * - Define error types (AUTH_FAILED, FETCH_SNAPSHOTS_FAILED, etc.)
 * - Create error formatting functions
 * - Map errors to HTTP status codes
 * 
 * Requirements: 8.3, 8.5
 */
export function formatErrorResponse(
    code: ArchivalErrorCode,
    message: string,
    additionalDetails?: Record<string, any>
): {
    success: false
    error: string
    details: Record<string, any>
} {
    return {
        success: false,
        error: message,
        details: {
            code,
            message,
            ...additionalDetails
        }
    }
}

/**
 * Map error codes to HTTP status codes
 * Provides consistent HTTP status codes for different error types
 * 
 * Requirements: 8.3, 8.5
 */
export function getHttpStatusForError(code: ArchivalErrorCode): number {
    const statusMap: Record<ArchivalErrorCode, number> = {
        AUTH_FAILED: 401,
        DB_CONNECTION_FAILED: 503,
        FETCH_SNAPSHOTS_FAILED: 500,
        INSERT_ARCHIVE_FAILED: 500,
        DELETE_SNAPSHOTS_FAILED: 500,
        VERIFICATION_FAILED: 500,
        UNKNOWN_ERROR: 500
    }

    return statusMap[code] || 500
}

/**
 * Format success response with execution metrics
 */
export function formatSuccessResponse(
    data: {
        snapshots_archived: number
        oldest_date: string | null
        remaining_old_snapshots: number
        total_in_archive: number
        batches_processed: number
    },
    executionTimeMs: number
): Response {
    return new Response(
        JSON.stringify({
            success: true,
            data: {
                ...data,
                execution_time_ms: executionTimeMs,
                timestamp: new Date().toISOString()
            }
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}

/**
 * Validate authorization header
 */
export function validateAuthorization(req: Request): boolean {
    const authHeader = req.headers.get('Authorization')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!authHeader || !serviceRoleKey) {
        return false
    }

    const expectedToken = `Bearer ${serviceRoleKey}`
    return authHeader === expectedToken
}

/**
 * Split array into chunks of specified size
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
