// Production module configuration for Indonesian bakery operations
import { REGIONAL_DEFAULTS, DEFAULT_CURRENCY } from '@/shared/utils/currency'

export interface ProductionModuleConfig {
  // Batch management settings
  batch: {
    default_size: number // Default batch size
    min_batch_size: number
    max_batch_size: number
    auto_sizing: boolean // Auto calculate optimal batch size
    batch_number_format: string // e.g.,"BATCH-{YYYY}{MM}{DD}-{###}"
    allow_partial_batches: boolean
    quality_check_required: boolean
  }
  
  // Production scheduling
  scheduling: {
    default_lead_time_hours: number // Default production time
    buffer_time_hours: number // Safety buffer for delays
    max_concurrent_batches: number
    working_hours: {
      start: string //"06:00"
      end: string //"18:00"
      break_duration_minutes: number
      working_days: number[] // [1,2,3,4,5,6] = Mon-Sat
    }
    auto_schedule: boolean // Auto schedule based on orders
    priority_scheduling: boolean // High priority orders first
  }
  
  // Quality control
  quality: {
    inspection_points: QualityCheckPoint[]
    required_checks: string[] // Mandatory quality checks
    default_inspector_id?: string
    auto_pass_threshold: number // Auto pass if score >= threshold
    batch_sampling_percentage: number // % of batch to inspect
    temperature_monitoring: boolean
    expiry_tracking: boolean
  }
  
  // Resource management
  resources: {
    equipment: {
      track_usage: boolean
      maintenance_alerts: boolean
      capacity_planning: boolean
    }
    staff: {
      skill_matching: boolean // Match staff skills to recipes
      workload_balancing: boolean
      shift_management: boolean
    }
    utilities: {
      track_energy_usage: boolean
      track_water_usage: boolean
      cost_allocation: boolean
    }
  }
  
  // Costing and efficiency
  costing: {
    include_labor_cost: boolean
    include_utility_cost: boolean
    include_overhead: boolean
    efficiency_tracking: boolean
    waste_tracking: boolean
    yield_optimization: boolean
  }
  
  // Notifications and alerts
  notifications: {
    batch_completion: boolean
    quality_failures: boolean
    schedule_delays: boolean
    equipment_issues: boolean
    ingredient_shortages: boolean
    expiry_warnings: boolean
  }
  
  // Integration settings
  integration: {
    auto_update_inventory: boolean // Update stock after production
    create_stock_transactions: boolean
    sync_with_orders: boolean // Auto create batches from orders
    update_recipe_costs: boolean // Update HPP based on actual costs
  }
  
  // Regional settings
  regional: {
    currency: string
    temperature_unit: 'celsius' | 'fahrenheit'
    weight_unit: 'kg' | 'lb'
    time_format: '24h' | '12h'
    date_format: string
    local_regulations: string[]
  }
}

export type ProductionStatus = 
  | 'planned'        // Production planned
  | 'ingredients_ready' // Ingredients allocated
  | 'in_progress'    // Currently being produced
  | 'quality_check'  // Under quality inspection
  | 'completed'      // Production completed
  | 'on_hold'        // Temporarily stopped
  | 'cancelled'      // Production cancelled
  | 'failed'         // Production failed quality

export type BatchPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'rush'           // Emergency production

export type QualityCheckPoint = 
  | 'ingredient_prep'
  | 'mixing'
  | 'baking'
  | 'cooling'
  | 'packaging'
  | 'final_inspection'

export type QualityStatus = 
  | 'pending'
  | 'passed'
  | 'failed'
  | 'conditional'    // Passed with notes
  | 'retesting'

// Default configuration for Indonesian bakery
export const DEFAULT_PRODUCTION_CONFIG: ProductionModuleConfig = {
  batch: {
    default_size: 50, // 50 units per batch
    min_batch_size: 10,
    max_batch_size: 500,
    auto_sizing: true,
    batch_number_format: 'BATCH-{YYYY}{MM}{DD}-{###}',
    allow_partial_batches: true,
    quality_check_required: true
  },
  
  scheduling: {
    default_lead_time_hours: 4, // 4 hours for most bakery items
    buffer_time_hours: 1, // 1 hour buffer
    max_concurrent_batches: 5,
    working_hours: {
      start: '04:00', // Early morning start for fresh bread
      end: '20:00', // 8 PM end
      break_duration_minutes: 60, // 1 hour total breaks
      working_days: [1, 2, 3, 4, 5, 6] // Monday to Saturday
    },
    auto_schedule: true,
    priority_scheduling: true
  },
  
  quality: {
    inspection_points: [
      'ingredient_prep',
      'mixing',
      'baking',
      'cooling',
      'final_inspection'
    ],
    required_checks: ['temperature', 'texture', 'appearance'],
    auto_pass_threshold: 85, // 85% score auto-passes
    batch_sampling_percentage: 10, // Check 10% of batch
    temperature_monitoring: true,
    expiry_tracking: true
  },
  
  resources: {
    equipment: {
      track_usage: true,
      maintenance_alerts: true,
      capacity_planning: true
    },
    staff: {
      skill_matching: true,
      workload_balancing: true,
      shift_management: false // Simple setup initially
    },
    utilities: {
      track_energy_usage: false, // Can be enabled later
      track_water_usage: false,
      cost_allocation: false
    }
  },
  
  costing: {
    include_labor_cost: true,
    include_utility_cost: false, // Simplified initially
    include_overhead: true,
    efficiency_tracking: true,
    waste_tracking: true,
    yield_optimization: true
  },
  
  notifications: {
    batch_completion: true,
    quality_failures: true,
    schedule_delays: true,
    equipment_issues: true,
    ingredient_shortages: true,
    expiry_warnings: true
  },
  
  integration: {
    auto_update_inventory: true,
    create_stock_transactions: true,
    sync_with_orders: true,
    update_recipe_costs: false // Keep manual control initially
  },
  
  regional: {
    currency: DEFAULT_CURRENCY,
    temperature_unit: 'celsius',
    weight_unit: 'kg',
    time_format: '24h',
    date_format: 'DD/MM/YYYY',
    local_regulations: ['HALAL', 'BPOM', 'SNI'] // Indonesian food safety standards
  }
}

// Status color mappings for UI
export const PRODUCTION_STATUS_COLORS: Record<ProductionStatus, string> = {
  planned: 'blue',
  ingredients_ready: 'cyan',
  in_progress: 'orange',
  quality_check: 'purple',
  completed: 'green',
  on_hold: 'yellow',
  cancelled: 'gray',
  failed: 'red'
}

// Status icons
export const PRODUCTION_STATUS_ICONS: Record<ProductionStatus, string> = {
  planned: 'Calendar',
  ingredients_ready: 'Package',
  in_progress: 'ChefHat',
  quality_check: 'Search',
  completed: 'CheckCircle2',
  on_hold: 'Pause',
  cancelled: 'X',
  failed: 'AlertTriangle'
}

// Priority colors
export const BATCH_PRIORITY_COLORS: Record<BatchPriority, string> = {
  low: 'gray',
  normal: 'blue',
  high: 'orange',
  urgent: 'red',
  rush: 'pink'
}

// Quality check point details
export const QUALITY_CHECK_DETAILS: Record<QualityCheckPoint, {
  name: string
  description: string
  typical_checks: string[]
  critical: boolean
}> = {
  ingredient_prep: {
    name: 'Ingredient Preparation',
    description: 'Check ingredient quality and preparation',
    typical_checks: ['freshness', 'quantity', 'temperature'],
    critical: true
  },
  mixing: {
    name: 'Mixing Process',
    description: 'Check mixing consistency and timing',
    typical_checks: ['consistency', 'mixing_time', 'temperature'],
    critical: true
  },
  baking: {
    name: 'Baking Process',
    description: 'Monitor baking temperature and time',
    typical_checks: ['temperature', 'baking_time', 'color'],
    critical: true
  },
  cooling: {
    name: 'Cooling Process',
    description: 'Monitor cooling process and temperature',
    typical_checks: ['cooling_time', 'final_temperature', 'texture'],
    critical: false
  },
  packaging: {
    name: 'Packaging',
    description: 'Check packaging quality and labeling',
    typical_checks: ['packaging_integrity', 'labeling', 'weight'],
    critical: false
  },
  final_inspection: {
    name: 'Final Inspection',
    description: 'Final quality check before release',
    typical_checks: ['overall_quality', 'appearance', 'taste'],
    critical: true
  }
}

// Production efficiency metrics
export interface ProductionMetrics {
  batch_efficiency: number // Actual vs planned time
  yield_percentage: number // Actual vs expected output
  quality_pass_rate: number // % batches passing quality
  resource_utilization: number // Equipment/staff utilization
  waste_percentage: number // % of ingredients wasted
  cost_per_unit: number // Actual production cost per unit
}

/**
 * Calculate production timeline based on recipe and batch size
 */
export function calculateProductionTimeline(
  recipeId: string,
  batchSize: number,
  config: ProductionModuleConfig,
  options: {
    priority?: BatchPriority
    rush_order?: boolean
    current_queue_length?: number
  } = {}
): {
  prep_time_minutes: number
  production_time_minutes: number
  quality_check_minutes: number
  total_time_minutes: number
  estimated_start: Date
  estimated_completion: Date
} {
  const { priority = 'normal', rush_order = false, current_queue_length = 0 } = options
  
  // Base times (these would normally come from recipe data)
  const base_prep_time = 30 // 30 minutes prep
  const base_production_time = config.scheduling.default_lead_time_hours * 60 // Convert to minutes
  const base_quality_time = 15 // 15 minutes quality check
  
  // Adjust for batch size (larger batches take more time)
  const size_multiplier = Math.max(1, batchSize / config.batch.default_size)
  
  const prep_time_minutes = base_prep_time * size_multiplier
  const production_time_minutes = base_production_time * size_multiplier
  const quality_check_minutes = config.batch.quality_check_required ? base_quality_time : 0
  
  // Add buffer time
  const buffer_minutes = config.scheduling.buffer_time_hours * 60
  const total_time_minutes = prep_time_minutes + production_time_minutes + quality_check_minutes + buffer_minutes
  
  // Calculate start time based on queue and priority
  const now = new Date()
  let queue_delay_minutes = current_queue_length * 60 // Assume 1 hour per batch in queue
  
  // Rush orders and high priority get reduced queue time
  if (rush_order || priority === 'urgent' || priority === 'rush') {
    queue_delay_minutes = Math.floor(queue_delay_minutes * 0.25) // Jump most of queue
  } else if (priority === 'high') {
    queue_delay_minutes = Math.floor(queue_delay_minutes * 0.5) // Jump half queue
  }
  
  const estimated_start = new Date(now.getTime() + queue_delay_minutes * 60000)
  const estimated_completion = new Date(estimated_start.getTime() + total_time_minutes * 60000)
  
  return {
    prep_time_minutes,
    production_time_minutes,
    quality_check_minutes,
    total_time_minutes,
    estimated_start,
    estimated_completion
  }
}

/**
 * Validate production configuration
 */
export function validateProductionConfig(config: Partial<ProductionModuleConfig>): string[] {
  const errors: string[] = []
  
  if (config.batch?.min_batch_size && config.batch?.max_batch_size &&
      config.batch.min_batch_size >= config.batch.max_batch_size) {
    errors.push('Minimum batch size must be less than maximum batch size')
  }
  
  if (config.quality?.auto_pass_threshold && 
      (config.quality.auto_pass_threshold < 0 || config.quality.auto_pass_threshold > 100)) {
    errors.push('Auto pass threshold must be between 0 and 100')
  }
  
  if (config.scheduling?.working_hours) {
    const start = config.scheduling.working_hours.start
    const end = config.scheduling.working_hours.end
    if (start && end && start >= end) {
      errors.push('Working hours start must be before end time')
    }
  }
  
  return errors
}

/**
 * Create region-specific production configuration
 */
export function createRegionalProductionConfig(countryCode: string): ProductionModuleConfig {
  const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS['ID']
  
  return {
    ...DEFAULT_PRODUCTION_CONFIG,
    regional: {
      ...DEFAULT_PRODUCTION_CONFIG.regional,
      currency: regional.currency
    }
  }
}

export default DEFAULT_PRODUCTION_CONFIG