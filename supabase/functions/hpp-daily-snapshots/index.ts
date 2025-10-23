import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createSnapshotsForAllUsers } from './snapshot-manager.ts'
import type { EdgeFunctionData, EdgeFunctionResponse } from './types.ts'
import {
    checkExecutionTimeWarning,
    ERROR_CODES,
    formatErrorResponse,
    formatExecutionTime,
    logError,
    logInfo
} from './utils.ts'

/**
 * HPP Daily Snapshots Edge Function
 * 
 * This function creates daily HPP (Harga Pokok Produksi) snapshots for all active recipes.
 * It is triggered by pg-cron daily at 00:00 UTC.
 * 
 * @see .kiro/specs/hpp-edge-function-migration/design.md
 */

/**
 * Validate authorization header
 */
function validateAuthorization(req: Request): boolean {
    const authHeader = req.headers.get('Authorization')
    const expectedToken = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`

    return authHeader === expectedToken
}

/**
 * Initialize Supabase client with service role
 */
function initializeSupabaseClient(): SupabaseClient {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

/**
 * Format success response
 */
function formatSuccessResponse(
    totalUsers: number,
    totalRecipes: number,
    snapshotsCreated: number,
    snapshotsFailed: number,
    executionTimeMs: number,
    errors: any[]
): EdgeFunctionResponse {
    const data: EdgeFunctionData = {
        total_users: totalUsers,
        total_recipes: totalRecipes,
        snapshots_created: snapshotsCreated,
        snapshots_failed: snapshotsFailed,
        execution_time_ms: executionTimeMs,
        timestamp: new Date().toISOString()
    }

    // Include errors if any
    if (errors.length > 0) {
        data.errors = errors
    }

    return {
        success: true,
        data
    }
}

/**
 * Main Edge Function handler
 */
Deno.serve(async (req: Request) => {
    try {
        // Validate authorization
        if (!validateAuthorization(req)) {
            logError('Authorization failed', {
                has_auth_header: !!req.headers.get('Authorization')
            })

            return new Response(
                JSON.stringify(formatErrorResponse(ERROR_CODES.AUTH_FAILED)),
                {
                    status: ERROR_CODES.AUTH_FAILED.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Initialize Supabase client
        const supabase = initializeSupabaseClient()

        // Log execution start
        logInfo('HPP daily snapshots execution started')

        // Create snapshots for all users
        const metrics = await createSnapshotsForAllUsers(supabase, {
            batchSize: 10,
            delayMs: 100
        })

        const executionTime = metrics.end_time! - metrics.start_time

        // Check for execution time warning
        if (checkExecutionTimeWarning(executionTime)) {
            logError('Execution time exceeded warning threshold', {
                execution_time_ms: executionTime,
                formatted_time: formatExecutionTime(executionTime)
            })
        }

        // Log completion
        logInfo('HPP daily snapshots execution completed', {
            total_users: metrics.total_users,
            total_recipes: metrics.total_recipes,
            snapshots_created: metrics.snapshots_created,
            snapshots_failed: metrics.snapshots_failed,
            execution_time_ms: executionTime,
            formatted_time: formatExecutionTime(executionTime),
            error_count: metrics.errors.length
        })

        // Format and return response
        const response = formatSuccessResponse(
            metrics.total_users,
            metrics.total_recipes,
            metrics.snapshots_created,
            metrics.snapshots_failed,
            executionTime,
            metrics.errors
        )

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        logError('HPP daily snapshots execution failed', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        })

        return new Response(
            JSON.stringify(
                formatErrorResponse(ERROR_CODES.EXECUTION_FAILED, {
                    error: error instanceof Error ? error.message : String(error)
                })
            ),
            {
                status: ERROR_CODES.EXECUTION_FAILED.status,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
})
