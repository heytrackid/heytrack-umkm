// Production Orders Integration Configuration
import type { ProductionOrdersIntegrationConfig } from './production-orders-integration-types'
import type { OrderPriority, BatchPriority } from './production-orders-integration-types'

export const DEFAULT_INTEGRATION_CONFIG: ProductionOrdersIntegrationConfig = {
  auto_schedule_enabled: true,
  schedule_buffer_hours: 4, // 4 hours buffer before delivery
  max_batches_per_day: 8,
  preferred_start_time: '04:00',

  batch_size_strategy: 'optimal',
  default_batch_size: 50,
  min_batch_efficiency: 70,

  priority_mapping: {
    'low': 'low',
    'normal': 'normal',
    'high': 'high',
    'urgent': 'urgent'
  },
  rush_order_threshold_hours: 12,

  auto_allocate_ingredients: true,
  check_ingredient_availability: true,
  auto_create_purchase_orders: false, // Manual approval required

  require_quality_approval: true,
  auto_assign_quality_inspector: true,
  track_delivery_deadlines: true,

  notify_production_team: true,
  notify_customer_updates: true,
  alert_capacity_issues: true
}
