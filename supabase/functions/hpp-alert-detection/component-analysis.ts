import type { AffectedComponents, ComponentChange, HPPSnapshot } from './types.ts'
import { calculatePercentageChange } from './utils.ts'

/**
 * Analyze which components (ingredients or operational costs) changed significantly
 * Returns components with changes > 5%
 */
export function analyzeAffectedComponents(
    current: HPPSnapshot,
    previous: HPPSnapshot
): AffectedComponents {
    const affectedComponents: AffectedComponents = {}

    // Analyze ingredient changes
    const ingredientChanges = analyzeIngredientChanges(current, previous)
    if (ingredientChanges.length > 0) {
        affectedComponents.ingredients = ingredientChanges
    }

    // Analyze operational cost changes
    const operationalChanges = analyzeOperationalChanges(current, previous)
    if (operationalChanges.length > 0) {
        affectedComponents.operational = operationalChanges
    }

    return affectedComponents
}

/**
 * Analyze ingredient cost changes
 * Returns ingredients with changes > 5%
 */
function analyzeIngredientChanges(
    current: HPPSnapshot,
    previous: HPPSnapshot
): ComponentChange[] {
    const changes: ComponentChange[] = []

    const currentBreakdown = current.cost_breakdown as any
    const previousBreakdown = previous.cost_breakdown as any

    // Validate breakdown structure
    if (!currentBreakdown?.ingredients || !previousBreakdown?.ingredients) {
        return changes
    }

    const currentIngredients = currentBreakdown.ingredients
    const previousIngredients = previousBreakdown.ingredients

    // Compare each ingredient
    for (const currentIng of currentIngredients) {
        const previousIng = previousIngredients.find((p: any) => p.id === currentIng.id)

        if (previousIng && previousIng.cost > 0) {
            const change = calculatePercentageChange(currentIng.cost, previousIng.cost)

            // Only include if change is significant (> 5%)
            if (Math.abs(change) > 5) {
                changes.push({
                    name: currentIng.name,
                    old: previousIng.cost,
                    new: currentIng.cost,
                    change: change
                })
            }
        }
    }

    return changes
}

/**
 * Analyze operational cost changes
 * Returns operational costs with changes > 5%
 */
function analyzeOperationalChanges(
    current: HPPSnapshot,
    previous: HPPSnapshot
): ComponentChange[] {
    const changes: ComponentChange[] = []

    const currentBreakdown = current.cost_breakdown as any
    const previousBreakdown = previous.cost_breakdown as any

    // Validate breakdown structure
    if (!currentBreakdown?.operational && !currentBreakdown?.operational_costs) {
        return changes
    }
    if (!previousBreakdown?.operational && !previousBreakdown?.operational_costs) {
        return changes
    }

    // Handle both 'operational' and 'operational_costs' field names
    const currentOps = currentBreakdown.operational || currentBreakdown.operational_costs || []
    const previousOps = previousBreakdown.operational || previousBreakdown.operational_costs || []

    // Compare each operational cost
    for (const currentOp of currentOps) {
        // Match by category or name field
        const categoryKey = currentOp.category || currentOp.name
        const previousOp = previousOps.find((p: any) =>
            (p.category === categoryKey) || (p.name === categoryKey)
        )

        if (previousOp) {
            const previousCost = previousOp.cost || 0
            const currentCost = currentOp.cost || 0

            if (previousCost > 0) {
                const change = calculatePercentageChange(currentCost, previousCost)

                // Only include if change is significant (> 5%)
                if (Math.abs(change) > 5) {
                    changes.push({
                        name: categoryKey,
                        old: previousCost,
                        new: currentCost,
                        change: change
                    })
                }
            }
        }
    }

    return changes
}

/**
 * Detect ingredient cost spikes > 15%
 * Returns ingredients with price increases exceeding 15%
 */
export function detectIngredientSpikes(
    current: HPPSnapshot,
    previous: HPPSnapshot
): ComponentChange[] {
    const spikes: ComponentChange[] = []

    const currentBreakdown = current.cost_breakdown as any
    const previousBreakdown = previous.cost_breakdown as any

    // Validate breakdown structure
    if (!currentBreakdown?.ingredients || !previousBreakdown?.ingredients) {
        return spikes
    }

    const currentIngredients = currentBreakdown.ingredients
    const previousIngredients = previousBreakdown.ingredients

    // Check each ingredient for spikes
    for (const currentIng of currentIngredients) {
        const previousIng = previousIngredients.find((p: any) => p.id === currentIng.id)

        if (previousIng && previousIng.cost > 0) {
            const change = calculatePercentageChange(currentIng.cost, previousIng.cost)

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
