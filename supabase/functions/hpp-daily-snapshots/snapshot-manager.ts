/**
 * Snapshot Manager Module for Edge Functions
 * 
 * Manages creation of HPP snapshots for recipes.
 * Handles batch processing, error recovery, and metrics tracking.
 * 
 * @see .kiro/specs/hpp-edge-function-migration/design.md
 */

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { calculateHPP } from './hpp-calculator.ts'
import type {
    ExecutionMetrics,
    SnapshotCreationResult,
    SnapshotData,
    UserProcessingResult
} from './types.ts'
import {
    createProcessingError,
    logError,
    logInfo,
    processBatch,
    validateSnapshotData
} from './utils.ts'

/**
 * Create a single HPP snapshot for a recipe
 * 
 * @param recipeId - Recipe UUID
 * @param userId - User UUID
 * @param supabase - Supabase client instance
 * @param sellingPrice - Optional selling price for margin calculation
 * @returns Snapshot creation result
 */
export async function createSnapshot(
    recipeId: string,
    userId: string,
    supabase: SupabaseClient,
    sellingPrice?: number
): Promise<SnapshotCreationResult> {
    try {
        // Calculate current HPP
        const hppResult = await calculateHPP(recipeId, userId, supabase)

        // Calculate margin if selling price is provided
        let marginPercentage: number | null = null
        if (sellingPrice && sellingPrice > 0) {
            marginPercentage = ((sellingPrice - hppResult.total_hpp) / sellingPrice) * 100
        }

        // Prepare snapshot data
        const snapshotData: SnapshotData = {
            recipe_id: recipeId,
            user_id: userId,
            snapshot_date: new Date().toISOString(),
            hpp_value: hppResult.total_hpp,
            material_cost: hppResult.material_cost,
            operational_cost: hppResult.operational_cost,
            cost_breakdown: hppResult.breakdown,
            selling_price: sellingPrice || null,
            margin_percentage: marginPercentage
        }

        // Validate snapshot data
        const validation = validateSnapshotData(snapshotData)
        if (!validation.valid) {
            throw new Error(`Invalid snapshot data: ${validation.errors.join(', ')}`)
        }

        // Insert snapshot into database
        const { data, error } = await supabase
            .from('hpp_snapshots')
            .insert(snapshotData)
            .select('id')
            .single()

        if (error) {
            throw new Error(`Failed to insert snapshot: ${error.message}`)
        }

        logInfo('Snapshot created successfully', {
            recipe_id: recipeId,
            snapshot_id: data.id,
            hpp_value: hppResult.total_hpp
        })

        return {
            success: true,
            recipe_id: recipeId,
            snapshot_id: data.id
        }

    } catch (error) {
        logError('Failed to create snapshot', {
            recipe_id: recipeId,
            user_id: userId,
            error: error instanceof Error ? error.message : String(error)
        })

        return {
            success: false,
            recipe_id: recipeId,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Create snapshots for all active recipes of a user
 * 
 * @param userId - User UUID
 * @param supabase - Supabase client instance
 * @returns User processing result with metrics
 */
export async function createSnapshotsForUser(
    userId: string,
    supabase: SupabaseClient
): Promise<UserProcessingResult> {
    logInfo('Processing user snapshots', { user_id: userId })

    const result: UserProcessingResult = {
        user_id: userId,
        recipes_processed: 0,
        snapshots_created: 0,
        snapshots_failed: 0,
        errors: []
    }

    try {
        // Fetch all active recipes for the user
        const { data: recipes, error: recipesError } = await supabase
            .from('recipes')
            .select('id, selling_price')
            .eq('user_id', userId)
            .eq('is_active', true)

        if (recipesError) {
            throw new Error(`Failed to fetch recipes: ${recipesError.message}`)
        }

        if (!recipes || recipes.length === 0) {
            logInfo('No active recipes found for user', { user_id: userId })
            return result
        }

        result.recipes_processed = recipes.length

        // Create snapshots for each recipe
        for (const recipe of recipes) {
            const snapshotResult = await createSnapshot(
                recipe.id,
                userId,
                supabase,
                recipe.selling_price
            )

            if (snapshotResult.success) {
                result.snapshots_created++
            } else {
                result.snapshots_failed++
                result.errors.push(
                    createProcessingError(snapshotResult.error, {
                        user_id: userId,
                        recipe_id: recipe.id
                    })
                )
            }
        }

        logInfo('User snapshot processing complete', {
            user_id: userId,
            recipes_processed: result.recipes_processed,
            snapshots_created: result.snapshots_created,
            snapshots_failed: result.snapshots_failed
        })

        return result

    } catch (error) {
        logError('Failed to process user snapshots', {
            user_id: userId,
            error: error instanceof Error ? error.message : String(error)
        })

        result.errors.push(
            createProcessingError(error, { user_id: userId })
        )

        return result
    }
}

/**
 * Create snapshots for all users with active recipes
 * Main orchestration function for the Edge Function
 * 
 * @param supabase - Supabase client instance
 * @param options - Processing options
 * @returns Execution metrics
 */
export async function createSnapshotsForAllUsers(
    supabase: SupabaseClient,
    options: {
        batchSize?: number
        delayMs?: number
    } = {}
): Promise<ExecutionMetrics> {
    const { batchSize = 10, delayMs = 100 } = options

    logInfo('Starting snapshot creation for all users')

    const metrics: ExecutionMetrics = {
        total_users: 0,
        total_recipes: 0,
        snapshots_created: 0,
        snapshots_failed: 0,
        errors: [],
        start_time: Date.now()
    }

    try {
        // Fetch all users with active recipes
        const { data: users, error: usersError } = await supabase
            .from('recipes')
            .select('user_id')
            .eq('is_active', true)

        if (usersError) {
            throw new Error(`Failed to fetch users: ${usersError.message}`)
        }

        if (!users || users.length === 0) {
            logInfo('No active users with recipes found')
            metrics.end_time = Date.now()
            return metrics
        }

        // Get unique user IDs
        const uniqueUserIds = [...new Set(users.map(u => u.user_id))]
        metrics.total_users = uniqueUserIds.length

        logInfo(`Found ${metrics.total_users} users to process`)

        // Process users in batches
        const { successes, errors } = await processBatch(
            uniqueUserIds,
            async (userId: string) => {
                return await createSnapshotsForUser(userId, supabase)
            },
            {
                batchSize,
                delayMs,
                onError: (error, userId) => {
                    logError('User processing failed', {
                        user_id: userId,
                        error: error instanceof Error ? error.message : String(error)
                    })
                }
            }
        )

        // Aggregate metrics from all user results
        for (const userResult of successes) {
            metrics.total_recipes += userResult.recipes_processed
            metrics.snapshots_created += userResult.snapshots_created
            metrics.snapshots_failed += userResult.snapshots_failed
            metrics.errors.push(...userResult.errors)
        }

        // Add batch processing errors
        for (const error of errors) {
            metrics.errors.push(
                createProcessingError(error)
            )
        }

        metrics.end_time = Date.now()

        logInfo('Snapshot creation complete', {
            total_users: metrics.total_users,
            total_recipes: metrics.total_recipes,
            snapshots_created: metrics.snapshots_created,
            snapshots_failed: metrics.snapshots_failed,
            execution_time_ms: metrics.end_time - metrics.start_time
        })

        return metrics

    } catch (error) {
        metrics.end_time = Date.now()

        logError('Snapshot creation failed', {
            error: error instanceof Error ? error.message : String(error),
            execution_time_ms: metrics.end_time - metrics.start_time
        })

        metrics.errors.push(createProcessingError(error))

        return metrics
    }
}
