import type { Json } from './common'
import type { UserRole, BusinessUnit } from './index'

// Database functions
export interface DatabaseFunctions {
  analyze_inventory_needs: {
    Args: Record<PropertyKey, never>
    Returns: Array<{
      cost_impact: number
      current_stock: number
      days_until_stockout: number
      ingredient_id: string
      ingredient_name: string
      reorder_point: number
      suggested_order_quantity: number
      urgency_level: string
    }>
  }
  calculate_recipe_hpp: {
    Args: { recipe_uuid: string }
    Returns: Array<{
      can_produce: boolean
      cost_per_serving: number
      margin_at_current_price: number
      max_possible_batches: number
      recipe_id: string
      suggested_selling_price: number
      total_ingredient_cost: number
    }>
  }
  get_sync_dashboard_data: {
    Args: Record<PropertyKey, never>
    Returns: Json
  }
  get_user_role: {
    Args: { user_uuid?: string }
    Returns: UserRole
  }
  optimize_production_schedule: {
    Args: { max_duration_hours?: number; target_date: string }
    Returns: Array<{
      estimated_duration: number
      ingredient_availability: boolean
      priority_score: number
      profit_potential: number
      recipe_id: string
      recipe_name: string
      suggested_quantity: number
    }>
  }
  test_confirm_order: {
    Args: { p_order_id: string }
    Returns: Json
  }
  test_create_order: {
    Args: { p_customer_name?: string; p_customer_phone?: string }
    Returns: Json
  }
  user_has_business_unit_access: {
    Args: {
      unit: BusinessUnit
      user_uuid?: string
    }
    Returns: boolean
  }
  user_has_permission: {
    Args: { permission_name: string; user_uuid?: string }
    Returns: boolean
  }
}
