// ============================================================================
// Alert Types
// ============================================================================

export type AlertType = 'hpp_increase' | 'margin_low' | 'cost_spike'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface HPPAlert {
    recipe_id: string
    user_id: string
    alert_type: AlertType
    severity: AlertSeverity
    title: string
    message: string
    old_value?: number
    new_value?: number
    change_percentage?: number
    affected_components?: AffectedComponents
    is_read: boolean
    is_dismissed: boolean
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

// ============================================================================
// Snapshot Types
// ============================================================================

export interface HPPSnapshot {
    id: string
    recipe_id: string
    user_id: string
    snapshot_date: string
    hpp_value: number
    material_cost: number
    operational_cost: number
    cost_breakdown: CostBreakdown
    selling_price?: number
    margin_percentage?: number
    created_at: string
    updated_at: string
}

export interface CostBreakdown {
    ingredients: IngredientCost[]
    operational_costs: OperationalCost[]
    total_material_cost: number
    total_operational_cost: number
    total_hpp: number
}

export interface IngredientCost {
    id: string
    name: string
    quantity: number
    unit: string
    unit_cost: number
    total_cost: number
}

export interface OperationalCost {
    id: string
    name: string
    cost: number
    allocation_method: string
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface Recipe {
    id: string
    user_id: string
    name: string
    description?: string
    selling_price?: number
    created_at: string
    updated_at: string
}

export interface UserWithRecipes {
    id: string
    recipes: Recipe[]
}

// ============================================================================
// Response Types
// ============================================================================

export interface AlertDetectionData {
    total_users: number
    total_recipes: number
    alerts_generated: number
    snapshots_analyzed: number
    execution_time_ms: number
    timestamp: string
    errors?: Array<{
        user_id?: string
        recipe_id?: string
        error: string
    }>
}

export interface AlertDetectionResponse {
    success: boolean
    data: AlertDetectionData
}

export interface ErrorResponse {
    success: false
    error: string
    details: {
        code: string
        message: string
        [key: string]: any
    }
}

// ============================================================================
// Error Codes
// ============================================================================

export type AlertErrorCode =
    | 'AUTH_FAILED'
    | 'DB_CONNECTION_FAILED'
    | 'FETCH_USERS_FAILED'
    | 'FETCH_SNAPSHOTS_FAILED'
    | 'ALERT_GENERATION_FAILED'
    | 'SAVE_ALERTS_FAILED'
    | 'ALERT_DETECTION_FAILED'

// ============================================================================
// Alert Detection Result Types
// ============================================================================

export interface AlertDetectionResult {
    alerts: HPPAlert[]
    snapshots_analyzed: number
    errors: Array<{
        user_id?: string
        recipe_id?: string
        error: string
    }>
}
