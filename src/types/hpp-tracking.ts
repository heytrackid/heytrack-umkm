// HPP Historical Tracking Types

export interface HPPSnapshot {
    id: string
    recipe_id: string
    snapshot_date: string
    hpp_value: number
    material_cost: number
    operational_cost: number
    cost_breakdown: CostBreakdown
    selling_price?: number
    margin_percentage?: number
    created_at: string
    user_id: string
}

export interface CostBreakdown {
    ingredients: IngredientCost[]
    operational?: OperationalCost[]
    operational_costs?: OperationalCost[] // Alternative field name used in some contexts
}

export interface IngredientCost {
    id: string
    name: string
    cost: number
    percentage: number
}

export interface OperationalCost {
    category: string
    cost: number
    percentage: number
}

export interface HPPAlert {
    id: string
    recipe_id: string
    alert_type: 'hpp_increase' | 'hpp_decrease' | 'margin_low' | 'cost_spike'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    old_value: number
    new_value: number
    change_percentage: number
    affected_components?: AffectedComponents
    is_read: boolean
    is_dismissed: boolean
    read_at?: string
    dismissed_at?: string
    created_at: string
    updated_at: string
    user_id: string
}

export interface AffectedComponents {
    ingredients?: ComponentChange[]
    operational?: ComponentChange[]
}

export interface ComponentChange {
    name: string
    old: number
    new: number
    change: number
}

export interface HPPTrendData {
    date: string
    hpp: number
    material_cost: number
    operational_cost: number
}

export interface HPPComparison {
    current_period: {
        avg_hpp: number
        min_hpp: number
        max_hpp: number
        start_date: string
        end_date: string
    }
    previous_period: {
        avg_hpp: number
        min_hpp: number
        max_hpp: number
        start_date: string
        end_date: string
    }
    change: {
        absolute: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
    }
}

export interface HPPRecommendation {
    type: 'supplier_review' | 'ingredient_alternative' | 'operational_efficiency' | 'price_adjustment'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    potential_savings?: number
    action_items: string[]
}

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all'

export interface HPPExportData {
    recipe_name: string
    period: TimePeriod
    snapshots: HPPSnapshot[]
    summary: {
        min: number
        max: number
        avg: number
        trend: 'up' | 'down' | 'stable'
        total_change: number
    }
}
