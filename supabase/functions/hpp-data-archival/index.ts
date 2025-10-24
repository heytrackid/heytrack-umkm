/**
 * HPP Data Archival Edge Function
 * 
 * Archives old HPP snapshots (> 1 year) from hpp_snapshots to hpp_snapshots_archive
 * Scheduled to run monthly on the 1st at 02:00 UTC via pg-cron
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 8.4, 11.1, 11.2
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { archiveOldSnapshots } from './archival-manager.ts'
import { formatErrorResponse, log } from './utils.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Main Deno serve handler
 * 
 * Subtask 7.1: Create main request handler in index.ts
 * - Set up Deno.serve with HTTP handler
 * - Parse incoming requests
 * - Route to archival workflow
 * - Return JSON responses with proper status codes
 */
Deno.serve(async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const startTime = Date.now()
    const executionId = crypto.randomUUID()

    log('info', 'HPP Data Archival execution started', {
        execution_id: executionId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    })

    try {
        /**
         * Subtask 7.2: Implement authorization middleware
         * - Extract authorization header from request
         * - Validate bearer token against service role key
         * - Return 401 for invalid/missing authorization
         * - Log authentication attempts
         */
        const authHeader = req.headers.get('Authorization')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!authHeader) {
            const errorResponse = formatErrorResponse(
                'AUTH_FAILED',
                'Missing authorization header',
                { execution_id: executionId, hasAuthHeader: false }
            )

            log('error', 'Authorization failed: Missing authorization header', {
                execution_id: executionId,
                hasAuthHeader: false
            })

            return new Response(
                JSON.stringify(errorResponse),
                {
                    status: getHttpStatusForError('AUTH_FAILED'),
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        if (authHeader !== `Bearer ${serviceRoleKey}`) {
            const errorResponse = formatErrorResponse(
                'AUTH_FAILED',
                'Invalid authorization token',
                { execution_id: executionId, hasAuthHeader: true, tokenValid: false }
            )

            log('error', 'Authorization failed: Invalid token', {
                execution_id: executionId,
                hasAuthHeader: true,
                tokenValid: false
            })

            return new Response(
                JSON.stringify(errorResponse),
                {
                    status: getHttpStatusForError('AUTH_FAILED'),
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        log('info', 'Authorization successful', {
            execution_id: executionId
        })

        /**
         * Subtask 7.3: Implement Supabase client initialization
         * - Create Supabase client with service role key
         * - Configure client for Edge Function environment
         * - Disable session persistence
         */
        log('info', 'Initializing Supabase client', {
            execution_id: executionId
        })

        const supabaseUrl = Deno.env.get('SUPABASE_URL')

        if (!supabaseUrl || !serviceRoleKey) {
            const errorResponse = formatErrorResponse(
                'DB_CONNECTION_FAILED',
                'Missing Supabase configuration',
                { execution_id: executionId, hasUrl: !!supabaseUrl, hasKey: !!serviceRoleKey }
            )

            return new Response(
                JSON.stringify(errorResponse),
                {
                    status: getHttpStatusForError('DB_CONNECTION_FAILED'),
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        })

        log('info', 'Supabase client initialized successfully', {
            execution_id: executionId,
            supabase_url: supabaseUrl
        })

        // Execute archival workflow
        log('info', 'Starting archival workflow', {
            execution_id: executionId
        })

        const archivalResult = await archiveOldSnapshots(supabase)

        const executionTimeMs = Date.now() - startTime

        /**
         * Subtask 7.4: Implement response formatting
         * - Format success responses with archival metrics
         * - Format error responses with proper error codes
         * - Include execution time in all responses
         */
        const result = {
            snapshots_archived: archivalResult.snapshots_archived,
            oldest_date: archivalResult.oldest_date,
            remaining_old_snapshots: archivalResult.remaining_old_snapshots,
            total_in_archive: archivalResult.total_in_archive,
            batches_processed: archivalResult.batches_processed,
            execution_time_ms: executionTimeMs,
            timestamp: new Date().toISOString(),
            errors: archivalResult.errors.length > 0 ? archivalResult.errors : undefined
        }

        log('info', 'HPP Data Archival completed successfully', {
            execution_id: executionId,
            execution_time_ms: executionTimeMs,
            snapshots_archived: result.snapshots_archived,
            batches_processed: result.batches_processed,
            error_count: archivalResult.errors.length
        })

        return new Response(
            JSON.stringify({
                success: true,
                data: result
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )

    } catch (error: any) {
        const executionTimeMs = Date.now() - startTime

        logError('Fatal error in HPP Data Archival execution', error, {
            execution_id: executionId,
            execution_time_ms: executionTimeMs
        })

        const errorResponse = formatErrorResponse(
            'UNKNOWN_ERROR',
            error.message || 'An unexpected error occurred',
            {
                execution_id: executionId,
                execution_time_ms: executionTimeMs,
                error_name: error.name
            }
        )

        return new Response(
            JSON.stringify(errorResponse),
            {
                status: getHttpStatusForError('UNKNOWN_ERROR'),
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
