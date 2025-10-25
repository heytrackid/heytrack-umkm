import type { AffectedComponents, ComponentChange, HPPSnapshot } from './types'
import { calculatePercentageChange } from './utils'

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

    const currentBreakdown = current.cost_breakdown
    const previousBreakdown = previous.cost_breakdown

    // Validate breakdown structure
    if (!currentBreakdown?.ingredients || !previousBreakdown?.ingredients) {
        return changes
    }

    const currentIngredients = currentBreakdown.ingredients
    const previousIngredients = previousBreakdown.ingredients

    // Compare each ingredient
    for (const currentIng of currentIngredients) {
        const previousIng = previousIngredients.find(p => p.id === currentIng.id)

        if (previousIng && previousIng.total_cost > 0) {
            const change = calculatePercentageChange(currentIng.total_cost, previousIng.total_cost)

            // Only include if change is significant (> 5%)
            if (Math.abs(change) > 5) {
                changes.push({
                    name: currentIng.name,
                    old: previousIng.total_cost,
                    new: currentIng.total_cost,
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

    const currentBreakdown = current.cost_breakdown
    const previousBreakdown = previous.cost_breakdown

    // Validate breakdown structure
    if (!currentBreakdown?.operational_costs) {
        return changes
    }
    if (!previousBreakdown?.operational_costs) {
        return changes
    }

    // Handle operational_costs field
    const currentOps = currentBreakdown.operational_costs
    const previousOps = previousBreakdown.operational_costs

    // Compare each operational cost
    for (const currentOp of currentOps) {
        // Match by name field
        const previousOp = previousOps.find(p =>
            p.name === currentOp.name
        )

        if (previousOp) {
            const previousCost = previousOp.cost
            const currentCost = currentOp.cost

            if (previousCost > 0) {
                const change = calculatePercentageChange(currentCost, previousCost)

                // Only include if change is significant (> 5%)
                if (Math.abs(change) > 5) {
                    changes.push({
                        name: currentOp.name,
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

    const currentBreakdown = current.cost_breakdown
    const previousBreakdown = previous.cost_breakdown

    // Validate breakdown structure
    if (!currentBreakdown?.ingredients || !previousBreakdown?.ingredients) {
        return spikes
    }

    const currentIngredients = currentBreakdown.ingredients
    const previousIngredients = previousBreakdown.ingredients

    // Check each ingredient for spikes
    for (const currentIng of currentIngredients) {
        const previousIng = previousIngredients.find(p => p.id === currentIng.id)

        if (previousIng && previousIng.total_cost > 0) {
            const change = calculatePercentageChange(currentIng.total_cost, previousIng.total_cost)

            // Detect spikes > 15%
            if (change > 15) {
                spikes.push({
                    name: currentIng.name,
                    old: previousIng.total_cost,
                    new: currentIng.total_cost,
                    change: change
                })
            }
        }
    }

    return spikes
}
