// Production Orders Integration Types
import type { ProductionBatch, BatchPriority } from '../types/production.types'
import type { Order, OrderPriority } from '../../orders/types/orders.types'

export interface ProductionOrdersIntegrationConfig {
  // Scheduling preferences
  auto_schedule_enabled: boolean
  schedule_buffer_hours: number
  max_batches_per_day: number
  preferred_start_time: string //"04:00"

  // Order-to-batch mapping
  batch_size_strategy: 'fixed' | 'optimal' | 'order_based'
  default_batch_size: number
  min_batch_efficiency: number // minimum 70%

  // Priority mapping
  priority_mapping: Record<OrderPriority, BatchPriority>
  rush_order_threshold_hours: number // if delivery < X hours, mark as rush

  // Inventory integration
  auto_allocate_ingredients: boolean
  check_ingredient_availability: boolean
  auto_create_purchase_orders: boolean

  // Quality and compliance
  require_quality_approval: boolean
  auto_assign_quality_inspector: boolean
  track_delivery_deadlines: boolean

  // Notifications
  notify_production_team: boolean
  notify_customer_updates: boolean
  alert_capacity_issues: boolean
}

export interface SchedulingResult {
  success: boolean
  created_batches: ProductionBatch[]
  skipped_orders: Array<{
    order: Order
    reason: string
    suggested_action: string
  }>
  ingredient_issues: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortage: number
  }>
  capacity_warnings: string[]
  estimated_completion: Date
  total_cost: number
}

export interface IngredientAvailability {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  allocated_stock: number
  available_stock: number
  unit: string
  reorder_point: number
  lead_time_days: number
}

export interface DeliveryTimeline {
  order_id: string
  estimated_ready_date: Date
  estimated_delivery_date: Date
  production_batch_id: string
  on_time_probability: number
}

// Re-export types from related modules
export type {
  ProductionBatch,
  CreateBatchData,
  BatchPriority,
  ProductionStatus,
  IngredientAllocation,
  AutoScheduleOptions,
  BatchSchedule
} from '../types/production.types'

export type {
  Order,
  OrderStatus,
  OrderPriority
} from '../../orders/types/orders.types'

export { DEFAULT_INTEGRATION_CONFIG } from './production-orders-integration-config'
