/**
 * TypeScript interfaces for HPP Data Archival Edge Function
 */

/**
 * HPP Snapshot structure from database
 */
export interface HPPSnapshot {
    id: string
    recipe_id: string
    user_id: string
    snapshot_date: string
    hpp_value: number
    material_cost: number
    operational_cost: number
    cost_breakdown: CostBreakdown
    selling_price: number | null
    margin_percentage: number | null
    created_at: string
    updated_at: string
}

/**
 * Cost breakdown structure
 */
export interface CostBreakdown {
    ingredients: IngredientCost[]
    operational: OperationalCost[]
}

export interface IngredientCost {
    id: string
    name: string
    quantity: number
    unit: string
    unit_cost: number
    total_cost: number
}

export interface OperationalCost {
    id: string
    name: string
    cost: number
    allocation_method: string
}

/**
 * Archival result structure
 */
export interface ArchivalResult {
    snapshots_archived: number
    oldest_date: string | null
    remaining_old_snapshots: number
    total_in_archive: number
    batches_processed: number
    errors: BatchError[]
}

/**
 * Batch error structure
 */
export interface BatchError {
    batch: number
    error: string
}

/**
 * Success response structure
 */
export interface ArchivalSuccessResponse {
    success: true
    data: {
        snapshots_archived: number
        oldest_date: string | null
        remaining_old_snapshots: number
        total_in_archive: number
        batches_processed: number
        execution_time_ms: number
        timestamp: string
    }
}

/**
 * Error response structure
 */
export interface ArchivalErrorResponse {
    success: false
    error: string
    details: {
        code: string
        message: string
    }
}

/**
 * Error codes for archival operations
 */
export type ArchivalErrorCode =
    | 'AUTH_FAILED'
    | 'DB_CONNECTION_FAILED'
    | 'FETCH_SNAPSHOTS_FAILED'
    | 'INSERT_ARCHIVE_FAILED'
    | 'DELETE_SNAPSHOTS_FAILED'
    | 'VERIFICATION_FAILED'
    | 'UNKNOWN_ERROR'

/**
 * Log level type
 */
export type LogLevel = 'info' | 'warn' | 'error'

/**
 * Log context structure
 */
export interface LogContext {
    [key: string]: unknown
}
