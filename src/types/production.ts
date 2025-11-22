/**
 * Production-related types
 * Moved from BatchSchedulingService to centralized types
 */

export interface ProductionBatch {
  id: string
  recipe_id: string
  quantity: number
  status: string
  scheduled_date: string
  started_at?: string | null
  completed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface ProductionBatchWithDetails extends ProductionBatch {
  recipe?: {
    id: string
    name: string
    servings?: number
  }
  recipe_name?: string
  priority?: string
  estimated_duration?: number
}

export interface ProductionConstraints {
  max_daily_batches: number
  max_batch_size: number
  min_batch_size: number
  production_hours_per_day: number
  oven_capacity?: number
  mixing_stations?: number
  decorating_stations?: number
  packaging_capacity?: number
  setup_time_minutes?: number
  cleanup_time_minutes?: number
  bakers_available?: number
  decorators_available?: number
  shift_start?: string
  shift_end?: string
  break_times?: Array<{ start: string; end: string; duration: number }>
}

export interface BatchExecutionState {
  batchId: string
  status: 'idle' | 'in_progress' | 'completed' | 'failed'
  progress: number
  currentStep?: string
  error?: string
}
