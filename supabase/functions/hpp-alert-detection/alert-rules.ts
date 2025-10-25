import { analyzeAffectedComponents, detectIngredientSpikes } from './component-analysis'
import type { AlertSeverity, AlertType, HPPAlert, HPPSnapshot } from './types'
import { calculatePercentageChange, formatCurrency } from './utils'

/**
 * Alert rule definition interface
 */
interface AlertRule {
    type: AlertType
    condition: (current: HPPSnapshot, previous: HPPSnapshot) => boolean
    severity: (current: HPPSnapshot, previous: HPPSnapshot) => AlertSeverity
    message: (current: HPPSnapshot, previous: HPPSnapshot, recipeName: string) => { title: string; message: string }
    values: (current: HPPSnapshot, previous: HPPSnapshot) => { old_value?: number; new_value?: number; change_percentage?: number }
}

/**
 * Rule 1: HPP Increase > 10%
 * Detects when HPP increases by more than 10%
 */
const hppIncreaseRule: AlertRule = {
    type: 'hpp_increase',

    condition: (current, previous) => {
        const change = calculatePercentageChange(current.hpp_value, previous.hpp_value)
        return change > 10
    },

    severity: (current, previous) => {
        const change = calculatePercentageChange(current.hpp_value, previous.hpp_value)
        return change > 20 ? 'high' : 'medium'
    },

    message: (current, previous, recipeName) => {
        const change = calculatePercentageChange(current.hpp_value, previous.hpp_value)
        return {
            title: `HPP ${recipeName} naik ${change.toFixed(1)}%`,
            message: `HPP meningkat dari ${formatCurrency(previous.hpp_value)} menjadi ${formatCurrency(current.hpp_value)}`
        }
    },

    values: (current, previous) => ({
        old_value: previous.hpp_value,
        new_value: current.hpp_value,
        change_percentage: calculatePercentageChange(current.hpp_value, previous.hpp_value)
    })
}

/**
 * Rule 2: Margin Below 15%
 * Detects when profit margin falls below the minimum target of 15%
 */
const marginLowRule: AlertRule = {
    type: 'margin_low',

    condition: (current, previous) => {
        return current.margin_percentage !== null &&
            current.margin_percentage !== undefined &&
            current.margin_percentage < 15
    },

    severity: (current, previous) => {
        if (current.margin_percentage === null || current.margin_percentage === undefined) {
            return 'medium'
        }
        return current.margin_percentage < 10 ? 'critical' : 'high'
    },

    message: (current, previous, recipeName) => {
        const margin = current.margin_percentage ?? 0
        return {
            title: `Margin ${recipeName} rendah (${margin.toFixed(1)}%)`,
            message: `Margin profit di bawah target minimum 15%`
        }
    },

    values: (current, previous) => ({
        old_value: previous.margin_percentage ?? 0,
        new_value: current.margin_percentage ?? 0,
        change_percentage: 0
    })
}

/**
 * Rule 3: Ingredient Cost Spike > 15%
 * Detects when one or more ingredients experience significant price increases
 */
const costSpikeRule: AlertRule = {
    type: 'cost_spike',

    condition: (current, previous) => {
        const spikes = detectIngredientSpikes(current, previous)
        return spikes.length > 0
    },

    severity: (current, previous) => {
        return 'medium'
    },

    message: (current, previous, recipeName) => {
        const spikes = detectIngredientSpikes(current, previous)
        return {
            title: `Lonjakan biaya bahan ${recipeName}`,
            message: `${spikes.length} bahan mengalami kenaikan harga signifikan`
        }
    },

    values: (current, previous) => {
        const materialCostChange = calculatePercentageChange(
            current.material_cost,
            previous.material_cost
        )
        return {
            old_value: previous.material_cost,
            new_value: current.material_cost,
            change_percentage: materialCostChange
        }
    }
}

/**
 * All alert rules to be evaluated
 */
const alertRules: AlertRule[] = [
    hppIncreaseRule,
    marginLowRule,
    costSpikeRule
]

/**
 * Apply all alert rules to a pair of snapshots
 * Returns array of alerts that match the conditions
 */
export function applyAlertRules(
    current: HPPSnapshot,
    previous: HPPSnapshot,
    recipeName: string,
    userId: string
): HPPAlert[] {
    const alerts: HPPAlert[] = []

    for (const rule of alertRules) {
        try {
            // Check if rule condition is met
            if (rule.condition(current, previous)) {
                const severity = rule.severity(current, previous)
                const { title, message } = rule.message(current, previous, recipeName)
                const values = rule.values(current, previous)

                // Build alert object
                const alert: HPPAlert = {
                    recipe_id: current.recipe_id,
                    user_id: userId,
                    alert_type: rule.type,
                    severity,
                    title,
                    message,
                    old_value: values.old_value,
                    new_value: values.new_value,
                    change_percentage: values.change_percentage,
                    is_read: false,
                    is_dismissed: false
                }

                // Add affected components for specific alert types
                if (rule.type === 'hpp_increase') {
                    alert.affected_components = analyzeAffectedComponents(current, previous)
                } else if (rule.type === 'cost_spike') {
                    const ingredientSpikes = detectIngredientSpikes(current, previous)
                    alert.affected_components = { ingredients: ingredientSpikes }
                }

                alerts.push(alert)
            }
        } catch (error: unknown) {
            // Log error but continue processing other rules
            console.error(`Error applying rule ${rule.type}:`, error)
        }
    }

    return alerts
}
