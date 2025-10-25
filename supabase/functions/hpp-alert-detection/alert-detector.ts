import type { SupabaseClient } from '@supabase/supabase-js'
import { applyAlertRules } from './alert-rules'
import type { AlertDetectionResult, HPPAlert, HPPSnapshot } from './types'
import { log } from './utils'

/**
 * Detect HPP alerts for all users with active recipes
 * Main entry point for alert detection workflow
 */
export async function detectAlertsForAllUsers(
    supabase: SupabaseClient,
    executionId?: string
): Promise<AlertDetectionResult> {
    const alerts: HPPAlert[] = []
    const errors: Array<{ user_id?: string; recipe_id?: string; error: string }> = []
    let totalSnapshots = 0

    log('info', 'Starting detectAlertsForAllUsers', {
        execution_id: executionId
    })

    try {
        // Fetch all users with active recipes
        log('info', 'Fetching users with active recipes', {
            execution_id: executionId
        })

        const { data: users, error: usersError } = await supabase
            .from('recipes')
            .select('user_id')
            .eq('is_active', true)
            .not('user_id', 'is', null)

        if (usersError) {
            log('error', 'Failed to fetch users from database', {
                execution_id: executionId,
                error: usersError.message,
                error_code: usersError.code,
                error_details: usersError.details
            })
            throw new Error(`Failed to fetch users: ${usersError.message}`)
        }

        if (!users || users.length === 0) {
            log('info', 'No users with active recipes found', {
                execution_id: executionId
            })
            return { alerts: [], snapshots_analyzed: 0, errors: [] }
        }

        // Get unique user IDs
        const uniqueUserIds = [...new Set(users.map(u => u.user_id))]

        log('info', `Found ${uniqueUserIds.length} unique users to process`, {
            execution_id: executionId,
            user_count: uniqueUserIds.length,
            total_recipes: users.length
        })

        // Process each user
        let processedUsers = 0
        for (const userId of uniqueUserIds) {
            if (!userId) continue

            processedUsers++
            log('info', `Processing user ${processedUsers}/${uniqueUserIds.length}`, {
                execution_id: executionId,
                user_id: userId,
                progress_percentage: Math.round((processedUsers / uniqueUserIds.length) * 100)
            })

            try {
                const userResult = await detectAlertsForUser(userId, supabase, executionId)
                alerts.push(...userResult.alerts)
                totalSnapshots += userResult.snapshots_analyzed
                errors.push(...userResult.errors)

                log('info', `Completed processing user ${userId}`, {
                    execution_id: executionId,
                    user_id: userId,
                    alerts_generated: userResult.alerts.length,
                    snapshots_analyzed: userResult.snapshots_analyzed,
                    errors_encountered: userResult.errors.length
                })
            } catch (error: unknown) {
                log('error', `Error processing user ${userId}`, {
                    execution_id: executionId,
                    user_id: userId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    error_stack: error instanceof Error ? error.stack : undefined
                })
                errors.push({
                    user_id: userId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        // Save all alerts in batch
        if (alerts.length > 0) {
            log('info', `Saving ${alerts.length} alerts to database`, {
                execution_id: executionId,
                alert_count: alerts.length
            })

            await saveAlerts(alerts, supabase, executionId)

            log('info', `Successfully saved ${alerts.length} alerts to database`, {
                execution_id: executionId,
                alert_count: alerts.length
            })
        } else {
            log('info', 'No alerts generated, skipping database save', {
                execution_id: executionId
            })
        }

        log('info', 'Completed detectAlertsForAllUsers', {
            execution_id: executionId,
            total_alerts: alerts.length,
            total_snapshots: totalSnapshots,
            total_errors: errors.length,
            users_processed: processedUsers
        })

        return {
            alerts,
            snapshots_analyzed: totalSnapshots,
            errors
        }

    } catch (error: unknown) {
        log('error', 'Fatal error in detectAlertsForAllUsers', {
            execution_id: executionId,
            error: error instanceof Error ? error.message : 'Unknown error',
            error_stack: error instanceof Error ? error.stack : undefined
        })
        throw error
    }
}

/**
 * Detect alerts for a single user
 * Analyzes all active recipes for the user
 */
export async function detectAlertsForUser(
    userId: string,
    supabase: SupabaseClient,
    executionId?: string
): Promise<AlertDetectionResult> {
    const alerts: HPPAlert[] = []
    const errors: Array<{ user_id?: string; recipe_id?: string; error: string }> = []
    let snapshotsAnalyzed = 0

    log('info', `Starting detectAlertsForUser`, {
        execution_id: executionId,
        user_id: userId
    })

    try {
        // Get user's active recipes
        log('info', `Fetching active recipes for user`, {
            execution_id: executionId,
            user_id: userId
        })

        const { data: recipes, error: recipesError } = await supabase
            .from('recipes')
            .select('id, name')
            .eq('user_id', userId)
            .eq('is_active', true)

        if (recipesError) {
            log('error', `Failed to fetch recipes for user`, {
                execution_id: executionId,
                user_id: userId,
                error: recipesError.message,
                error_code: recipesError.code,
                error_details: recipesError.details
            })
            throw new Error(`Failed to fetch recipes: ${recipesError.message}`)
        }

        if (!recipes || recipes.length === 0) {
            log('info', `No active recipes found for user`, {
                execution_id: executionId,
                user_id: userId
            })
            return { alerts: [], snapshots_analyzed: 0, errors: [] }
        }

        log('info', `Found ${recipes.length} active recipes for user`, {
            execution_id: executionId,
            user_id: userId,
            recipe_count: recipes.length
        })

        // Process each recipe
        let processedRecipes = 0
        for (const recipe of recipes) {
            processedRecipes++
            log('info', `Processing recipe ${processedRecipes}/${recipes.length}`, {
                execution_id: executionId,
                user_id: userId,
                recipe_id: recipe.id,
                recipe_name: recipe.name
            })

            try {
                const recipeAlerts = await detectAlertsForRecipe(
                    recipe.id,
                    recipe.name,
                    userId,
                    supabase,
                    executionId
                )
                alerts.push(...recipeAlerts)
                snapshotsAnalyzed += recipeAlerts.length > 0 ? 2 : 0 // 2 snapshots compared if alerts generated

                if (recipeAlerts.length > 0) {
                    log('info', `Generated ${recipeAlerts.length} alerts for recipe`, {
                        execution_id: executionId,
                        user_id: userId,
                        recipe_id: recipe.id,
                        recipe_name: recipe.name,
                        alert_count: recipeAlerts.length
                    })
                }
            } catch (error: unknown) {
                log('error', `Error processing recipe`, {
                    execution_id: executionId,
                    user_id: userId,
                    recipe_id: recipe.id,
                    recipe_name: recipe.name,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    error_stack: error instanceof Error ? error.stack : undefined
                })
                errors.push({
                    user_id: userId,
                    recipe_id: recipe.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        log('info', `Completed detectAlertsForUser`, {
            execution_id: executionId,
            user_id: userId,
            recipes_processed: processedRecipes,
            alerts_generated: alerts.length,
            snapshots_analyzed: snapshotsAnalyzed,
            errors_encountered: errors.length
        })

        return {
            alerts,
            snapshots_analyzed: snapshotsAnalyzed,
            errors
        }

    } catch (error: unknown) {
        log('error', `Fatal error in detectAlertsForUser`, {
            execution_id: executionId,
            user_id: userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            error_stack: error instanceof Error ? error.stack : undefined
        })
        throw error
    }
}

/**
 * Detect alerts for a single recipe
 * Compares last 2 snapshots and applies alert rules
 */
export async function detectAlertsForRecipe(
    recipeId: string,
    recipeName: string,
    userId: string,
    supabase: SupabaseClient,
    executionId?: string
): Promise<HPPAlert[]> {
    try {
        // Get last 2 snapshots (current and previous)
        log('info', `Fetching snapshots for recipe`, {
            execution_id: executionId,
            user_id: userId,
            recipe_id: recipeId,
            recipe_name: recipeName
        })

        const { data: snapshots, error: snapshotsError } = await supabase
            .from('hpp_snapshots')
            .select('*')
            .eq('recipe_id', recipeId)
            .eq('user_id', userId)
            .order('snapshot_date', { ascending: false })
            .limit(2)

        if (snapshotsError) {
            log('error', `Failed to fetch snapshots for recipe`, {
                execution_id: executionId,
                user_id: userId,
                recipe_id: recipeId,
                recipe_name: recipeName,
                error: snapshotsError.message,
                error_code: snapshotsError.code,
                error_details: snapshotsError.details
            })
            throw new Error(`Failed to fetch snapshots: ${snapshotsError.message}`)
        }

        // Need at least 2 snapshots to compare
        if (!snapshots || snapshots.length < 2) {
            log('info', `Insufficient snapshots for comparison`, {
                execution_id: executionId,
                user_id: userId,
                recipe_id: recipeId,
                recipe_name: recipeName,
                snapshot_count: snapshots?.length || 0
            })
            return []
        }

        const [current, previous] = snapshots as HPPSnapshot[]

        log('info', `Applying alert rules to recipe snapshots`, {
            execution_id: executionId,
            user_id: userId,
            recipe_id: recipeId,
            recipe_name: recipeName,
            current_snapshot_date: current.snapshot_date,
            previous_snapshot_date: previous.snapshot_date,
            current_hpp: current.hpp_value,
            previous_hpp: previous.hpp_value
        })

        // Apply alert rules to generate alerts
        const alerts = applyAlertRules(current, previous, recipeName, userId)

        if (alerts.length > 0) {
            log('info', `Alert rules generated ${alerts.length} alerts`, {
                execution_id: executionId,
                user_id: userId,
                recipe_id: recipeId,
                recipe_name: recipeName,
                alert_count: alerts.length,
                alert_types: alerts.map(a => a.alert_type)
            })
        } else {
            log('info', `No alerts generated for recipe`, {
                execution_id: executionId,
                user_id: userId,
                recipe_id: recipeId,
                recipe_name: recipeName
            })
        }

        return alerts

    } catch (error: unknown) {
        log('error', `Error in detectAlertsForRecipe`, {
            execution_id: executionId,
            user_id: userId,
            recipe_id: recipeId,
            recipe_name: recipeName,
            error: error instanceof Error ? error.message : 'Unknown error',
            error_stack: error instanceof Error ? error.stack : undefined
        })
        throw error
    }
}

/**
 * Save alerts to database in batch
 * Handles database errors gracefully
 */
export async function saveAlerts(
    alerts: HPPAlert[],
    supabase: SupabaseClient,
    executionId?: string
): Promise<void> {
    if (alerts.length === 0) {
        log('info', 'No alerts to save', {
            execution_id: executionId
        })
        return
    }

    log('info', `Attempting to save ${alerts.length} alerts to database`, {
        execution_id: executionId,
        alert_count: alerts.length,
        alert_types: alerts.reduce((acc, alert) => {
            acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    })

    try {
        const { error } = await supabase
            .from('hpp_alerts')
            .insert(alerts)

        if (error) {
            log('error', 'Database error while saving alerts', {
                execution_id: executionId,
                alert_count: alerts.length,
                error: error.message,
                error_code: error.code,
                error_details: error.details,
                error_hint: error.hint
            })
            throw new Error(`Failed to save alerts: ${error.message}`)
        }

        log('info', `Successfully saved ${alerts.length} alerts to database`, {
            execution_id: executionId,
            alert_count: alerts.length
        })

    } catch (error: unknown) {
        log('error', 'Error saving alerts to database', {
            execution_id: executionId,
            alert_count: alerts.length,
            error: error instanceof Error ? error.message : 'Unknown error',
            error_stack: error instanceof Error ? error.stack : undefined
        })
        throw error
    }
}
