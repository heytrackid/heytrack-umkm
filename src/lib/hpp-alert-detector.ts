import type { Database } from '@/types'
import type { AffectedComponents, ComponentChange, CostBreakdown, IngredientCost, OperationalCost } from '@/types/hpp-tracking'
import { formatCurrency } from './hpp-calculator'
import { createSupabaseClient } from './supabase'
import { dbLogger } from '@/lib/logger'

type HPPSnapshotRow = Database['public']['Tables']['hpp_snapshots']['Row']
type HPPAlertInsert = Database['public']['Tables']['hpp_alerts']['Insert']

export interface AlertDetectionResult {
    alerts: HPPAlertInsert[]
    snapshots_analyzed: number
}

/**
 * Detect HPP alerts for a recipe or all recipes
 * Analyzes recent snapshots and generates alerts based on predefined rules
 */
export async function detectHPPAlerts(userId: string, recipeId?: string): Promise<AlertDetectionResult> {
    const supabase = createSupabaseClient()
    const alerts: HPPAlertInsert[] = []

    // Get recipes to analyze
    let recipesQuery = supabase
        .from('recipes')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true)

    if (recipeId) {
        recipesQuery = recipesQuery.eq('id', recipeId)
    }

    const { data: recipes, error: recipesError } = await recipesQuery

    if (recipesError || !recipes || recipes.length === 0) {
        return { alerts: [], snapshots_analyzed: 0 }
    }

    // Analyze each recipe
    for (const recipe of recipes) {
        // Get last 2 snapshots (current and previous)
        const { data: snapshots, error: snapshotsError } = await supabase
            .from('hpp_snapshots')
            .select('*')
            .eq('recipe_id', recipe.id)
            .eq('user_id', userId)
            .order('snapshot_date', { ascending: false })
            .limit(2)

        if (snapshotsError || !snapshots || snapshots.length < 2) {
            continue // Need at least 2 snapshots to compare
        }

        const current = snapshots[0] as HPPSnapshotRow
        const previous = snapshots[1] as HPPSnapshotRow
        const changePercentage = ((current.hpp_value - previous.hpp_value) / previous.hpp_value) * 100

        // Alert Rule 1: HPP increase > 10%
        if (changePercentage > 10) {
            alerts.push({
                recipe_id: recipe.id,
                alert_type: 'hpp_increase',
                severity: changePercentage > 20 ? 'high' : 'medium',
                title: `HPP ${recipe.name} naik ${changePercentage.toFixed(1)}%`,
                message: `HPP meningkat dari ${formatCurrency(previous.hpp_value)} menjadi ${formatCurrency(current.hpp_value)}`,
                old_value: previous.hpp_value,
                new_value: current.hpp_value,
                change_percentage: changePercentage,
                affected_components: analyzeAffectedComponents(current, previous) as unknown as Database['public']['Tables']['hpp_alerts']['Row']['affected_components'],
                is_read: false,
                is_dismissed: false,
                user_id: userId
            })
        }

        // Alert Rule 2: Margin below 15%
        if (current.margin_percentage !== null && current.margin_percentage < 15) {
            alerts.push({
                recipe_id: recipe.id,
                alert_type: 'margin_low',
                severity: current.margin_percentage < 10 ? 'critical' : 'high',
                title: `Margin ${recipe.name} rendah (${current.margin_percentage.toFixed(1)}%)`,
                message: `Margin profit di bawah target minimum 15%`,
                old_value: previous.margin_percentage || 0,
                new_value: current.margin_percentage,
                change_percentage: 0,
                is_read: false,
                is_dismissed: false,
                user_id: userId
            })
        }

        // Alert Rule 3: Specific ingredient cost spike > 15%
        const ingredientSpikes = detectIngredientSpikes(current, previous)
        if (ingredientSpikes.length > 0) {
            const materialCostChange = ((current.material_cost - previous.material_cost) / previous.material_cost) * 100

            alerts.push({
                recipe_id: recipe.id,
                alert_type: 'cost_spike',
                severity: 'medium',
                title: `Lonjakan biaya bahan ${recipe.name}`,
                message: `${ingredientSpikes.length} bahan mengalami kenaikan harga signifikan`,
                old_value: previous.material_cost,
                new_value: current.material_cost,
                change_percentage: materialCostChange,
                affected_components: { ingredients: ingredientSpikes } as unknown as Database['public']['Tables']['hpp_alerts']['Row']['affected_components'],
                is_read: false,
                is_dismissed: false,
                user_id: userId
            })
        }
    }

    return {
        alerts,
        snapshots_analyzed: recipes.length
    }
}

/**
 * Analyze which components (ingredients or operational costs) changed significantly
 */
function analyzeAffectedComponents(
    current: HPPSnapshotRow,
    previous: HPPSnapshotRow
): AffectedComponents {
    const affectedComponents: AffectedComponents = {}

    // Analyze ingredient changes
    const ingredientChanges: ComponentChange[] = []

    const currentBreakdown = current.cost_breakdown as CostBreakdown
    const previousBreakdown = previous.cost_breakdown as CostBreakdown

    if (currentBreakdown?.ingredients && previousBreakdown?.ingredients) {
        const currentIngredients = currentBreakdown.ingredients
        const previousIngredients = previousBreakdown.ingredients

        for (const currentIng of currentIngredients) {
            const previousIng = previousIngredients.find((p: IngredientCost) => p.id === currentIng.id)

            if (previousIng && previousIng.cost > 0) {
                const change = ((currentIng.cost - previousIng.cost) / previousIng.cost) * 100

                // Only include if change is significant (> 5%)
                if (Math.abs(change) > 5) {
                    ingredientChanges.push({
                        name: currentIng.name,
                        old: previousIng.cost,
                        new: currentIng.cost,
                        change: change
                    })
                }
            }
        }
    }

    if (ingredientChanges.length > 0) {
        affectedComponents.ingredients = ingredientChanges
    }

    // Analyze operational cost changes
    const operationalChanges: ComponentChange[] = []

    if (currentBreakdown?.operational && previousBreakdown?.operational) {
        const currentOps = currentBreakdown.operational
        const previousOps = previousBreakdown.operational

        for (const currentOp of currentOps) {
            const previousOp = previousOps.find((p: OperationalCost) => p.category === currentOp.category)

            if (previousOp && previousOp.cost > 0) {
                const change = ((currentOp.cost - previousOp.cost) / previousOp.cost) * 100

                // Only include if change is significant (> 5%)
                if (Math.abs(change) > 5) {
                    operationalChanges.push({
                        name: currentOp.category,
                        old: previousOp.cost,
                        new: currentOp.cost,
                        change: change
                    })
                }
            }
        }
    }

    if (operationalChanges.length > 0) {
        affectedComponents.operational = operationalChanges
    }

    return affectedComponents
}

/**
 * Detect ingredient cost spikes > 15%
 */
function detectIngredientSpikes(
    current: HPPSnapshotRow,
    previous: HPPSnapshotRow
): ComponentChange[] {
    const spikes: ComponentChange[] = []

    const currentBreakdown = current.cost_breakdown as CostBreakdown
    const previousBreakdown = previous.cost_breakdown as CostBreakdown

    if (!currentBreakdown?.ingredients || !previousBreakdown?.ingredients) {
        return spikes
    }

    const currentIngredients = currentBreakdown.ingredients
    const previousIngredients = previousBreakdown.ingredients

    for (const currentIng of currentIngredients) {
        const previousIng = previousIngredients.find((p: IngredientCost) => p.id === currentIng.id)

        if (previousIng && previousIng.cost > 0) {
            const change = ((currentIng.cost - previousIng.cost) / previousIng.cost) * 100

            // Detect spikes > 15%
            if (change > 15) {
                spikes.push({
                    name: currentIng.name,
                    old: previousIng.cost,
                    new: currentIng.cost,
                    change: change
                })
            }
        }
    }

    return spikes
}

/**
 * Save alerts to database
 */
export async function saveAlerts(alerts: HPPAlertInsert[]): Promise<void> {
    if (alerts.length === 0) return

    const supabase = createSupabaseClient()

    const { error } = await supabase
        .from('hpp_alerts')
        .insert(alerts)

    if (error) {
        dbLogger.error({ err: error }, 'Failed to save alerts')
        throw new Error(`Failed to save alerts: ${error.message}`)
    }
}
