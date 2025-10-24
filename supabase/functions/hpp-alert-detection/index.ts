import { createClient } from 'jsr:@supabase/supabase-js@2'
import { detectAlertsForAllUsers } from './alert-detector.ts'
import type { AlertDetectionResponse } from './types.ts'
import { formatErrorResponse, formatSuccessResponse, log } from './utils.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const startTime = Date.now()
    const executionId = crypto.randomUUID()

    log('info', 'Alert detection execution started', {
        execution_id: executionId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    })

    try {
        // Validate authorization
        const authHeader = req.headers.get('Authorization')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!authHeader) {
            log('error', 'Authorization failed: Missing authorization header', {
                execution_id: executionId,
                hasAuthHeader: false
            })

            return new Response(
                JSON.stringify(formatErrorResponse('AUTH_FAILED', 'Missing authorization header')),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        if (authHeader !== `Bearer ${serviceRoleKey}`) {
            log('error', 'Authorization failed: Invalid token', {
                execution_id: executionId,
                hasAuthHeader: true,
                tokenValid: false
            })

            return new Response(
                JSON.stringify(formatErrorResponse('AUTH_FAILED', 'Invalid authorization token')),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        log('info', 'Authorization successful', {
            execution_id: executionId
        })

        log('info', 'Initializing Supabase client', {
            execution_id: executionId
        })

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabase = createClient(supabaseUrl, serviceRoleKey!, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        })

        log('info', 'Supabase client initialized successfully', {
            execution_id: executionId,
            supabase_url: supabaseUrl
        })

        // Execute alert detection
        log('info', 'Starting alert detection workflow', {
            execution_id: executionId
        })

        const detectionResult = await detectAlertsForAllUsers(supabase, executionId)

        // Count unique users and recipes
        const uniqueUserIds = new Set(detectionResult.alerts.map(a => a.user_id))
        const uniqueRecipeIds = new Set(detectionResult.alerts.map(a => a.recipe_id))

        const executionTimeMs = Date.now() - startTime

        const result: AlertDetectionResponse = {
            success: true,
            data: {
                total_users: uniqueUserIds.size,
                total_recipes: uniqueRecipeIds.size,
                alerts_generated: detectionResult.alerts.length,
                snapshots_analyzed: detectionResult.snapshots_analyzed,
                execution_time_ms: executionTimeMs,
                timestamp: new Date().toISOString(),
                errors: detectionResult.errors.length > 0 ? detectionResult.errors : undefined
            }
        }

        log('info', 'Alert detection completed successfully', {
            execution_id: executionId,
            execution_time_ms: executionTimeMs,
            total_users: result.data.total_users,
            total_recipes: result.data.total_recipes,
            alerts_generated: result.data.alerts_generated,
            snapshots_analyzed: result.data.snapshots_analyzed,
            error_count: detectionResult.errors.length
        })

        return new Response(
            JSON.stringify(formatSuccessResponse(result.data)),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )

    } catch (error: any) {
        const executionTimeMs = Date.now() - startTime

        log('error', 'Fatal error in alert detection execution', {
            execution_id: executionId,
            error: error.message,
            error_name: error.name,
            stack: error.stack,
            execution_time_ms: executionTimeMs
        })

        return new Response(
            JSON.stringify(formatErrorResponse('ALERT_DETECTION_FAILED', error.message, {
                execution_id: executionId,
                execution_time_ms: executionTimeMs,
                error_name: error.name
            })),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
