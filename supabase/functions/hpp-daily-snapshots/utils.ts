/**
 * Utility functions for HPP Edge Function
 * 
 * Provides logging, error handling, and common utility functions.
 */

import type { ProcessingError } from './types.ts'

// ============================================================================
// Logging Utilities
// ============================================================================

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, unknown>
}

/**
 * Structured logging function
 * Logs are formatted as JSON for easy parsing in Supabase dashboard
 */
export function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(context && { context })
    }

    console.log(JSON.stringify(logEntry))
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: Record<string, unknown>): void {
    log('info', message, context)
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: Record<string, unknown>): void {
    log('warn', message, context)
}

/**
 * Log error message
 */
export function logError(message: string, context?: Record<string, unknown>): void {
    log('error', message, context)
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

export interface ErrorCode {
    code: string
    message: string
    status: number
}

export const ERROR_CODES = {
    AUTH_FAILED: {
        code: 'AUTH_FAILED',
        message: 'Invalid or missing authorization token',
        status: 401
    },
    DB_CONNECTION_FAILED: {
        code: 'DB_CONNECTION_FAILED',
        message: 'Failed to connect to database',
        status: 500
    },
    CALCULATION_FAILED: {
        code: 'CALCULATION_FAILED',
        message: 'HPP calculation failed',
        status: 500
    },
    INVALID_DATA: {
        code: 'INVALID_DATA',
        message: 'Snapshot data validation failed',
        status: 400
    },
    EXECUTION_FAILED: {
        code: 'EXECUTION_FAILED',
        message: 'Edge function execution failed',
        status: 500
    }
} as const

/**
 * Create a processing error object
 */
export function createProcessingError(
    error: unknown,
    context?: { user_id?: string; recipe_id?: string }
): ProcessingError {
    return {
        ...context,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
    }
}

/**
 * Format error for response
 */
export function formatErrorResponse(
    errorCode: ErrorCode,
    additionalDetails?: Record<string, unknown>
) {
    return {
        success: false,
        error: errorCode.message,
        details: {
            code: errorCode.code,
            message: errorCode.message,
            ...additionalDetails
        }
    }
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate snapshot data before insertion
 */
export function validateSnapshotData(data: {
    hpp_value: number
    material_cost: number
    operational_cost: number
}): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (data.hpp_value < 0) {
        errors.push('HPP value cannot be negative')
    }

    if (data.material_cost < 0) {
        errors.push('Material cost cannot be negative')
    }

    if (data.operational_cost < 0) {
        errors.push('Operational cost cannot be negative')
    }

    if (isNaN(data.hpp_value) || !isFinite(data.hpp_value)) {
        errors.push('HPP value must be a valid number')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

// ============================================================================
// Batch Processing Utilities
// ============================================================================

/**
 * Process items in batches with error handling
 */
export async function processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: {
        batchSize?: number
        delayMs?: number
        onError?: (error: unknown, item: T) => void
    } = {}
): Promise<{ successes: R[]; errors: unknown[] }> {
    const {
        batchSize = 10,
        delayMs = 100,
        onError
    } = options

    const successes: R[] = []
    const errors: unknown[] = []

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)

        const results = await Promise.allSettled(
            batch.map(item => processor(item))
        )

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successes.push(result.value)
            } else {
                errors.push(result.reason)
                if (onError) {
                    onError(result.reason, batch[index])
                }
            }
        })

        // Add delay between batches (except for last batch)
        if (i + batchSize < items.length && delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }

    return { successes, errors }
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Format execution time in human-readable format
 */
export function formatExecutionTime(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`
    }

    const seconds = Math.floor(ms / 1000)
    const remainingMs = ms % 1000

    if (seconds < 60) {
        return `${seconds}.${Math.floor(remainingMs / 100)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}m ${remainingSeconds}s`
}

/**
 * Check if execution time exceeds warning threshold
 */
export function checkExecutionTimeWarning(ms: number, warningThresholdMs: number = 300000): boolean {
    return ms > warningThresholdMs
}

// ============================================================================
// Data Formatting Utilities
// ============================================================================

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0
    return (part / total) * 100
}

/**
 * Round to decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
    const multiplier = Math.pow(10, decimals)
    return Math.round(value * multiplier) / multiplier
}
