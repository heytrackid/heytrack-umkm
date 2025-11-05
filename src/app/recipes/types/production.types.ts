import type { Row, ProductionStatus as DBProductionStatus } from '@/types/database'

// Production module types and interfaces for Indonesian UMKM operations

export interface ProductionBatch {
  id: string
  batch_number: string
  recipe_id: string
  recipe_name: string
  status: ProductionStatus
  priority: BatchPriority
  
  // Batch details
  planned_quantity: number
  actual_quantity?: number
  batch_size: number
  yield_percentage?: number
  
  // Scheduling
  scheduled_start: string
  actual_start?: string
  scheduled_completion: string
  actual_completion?: string
  estimated_duration_minutes: number
  actual_duration_minutes?: number
  
  // Assignment
  assigned_staff_ids?: string[]
  assigned_equipment_ids?: string[]
  supervisor_id?: string
  
  // Financial tracking
  planned_cost: number
  actual_cost?: number
  labor_cost?: number
  utility_cost?: number
  overhead_cost?: number
  cost_per_unit?: number
  currency: string
  
  // Quality and compliance
  quality_checks: QualityCheck[]
  quality_score?: number
  quality_status: QualityStatus
  temperature_logs?: TemperatureLog[]
  compliance_notes?: string[]
  
  // Integration
  order_ids?: string[] // Associated orders
  ingredient_allocations: IngredientAllocation[]
  stock_transactions?: string[] // Created stock transaction IDs
  
  // Metadata
  notes?: string
  internal_notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
  
  // Relations
  recipe?: Row<'recipes'> // Recipe data type
  quality_inspector?: Row<'user_profiles'> // Staff member
  production_logs?: ProductionLog[]
}

export interface IngredientAllocation {
  id: string
  batch_id: string
  ingredient_id: string
  ingredient_name: string
  planned_quantity: number
  actual_quantity?: number
  unit: string
  allocated_at: string
  consumed_at?: string
  waste_quantity?: number
  waste_reason?: string
  cost_per_unit: number
  total_cost: number
  currency: string
}

export interface QualityCheck {
  id: string
  batch_id: string
  check_point: QualityCheckPoint
  status: QualityStatus
  score?: number // 0-100
  inspector_id?: string
  inspector_name?: string
  
  // Check details
  temperature?: number
  ph_level?: number
  moisture_content?: number
  weight?: number
  appearance_score?: number
  texture_score?: number
  taste_score?: number
  
  // Results
  passed: boolean
  critical_issues?: string[]
  recommendations?: string[]
  corrective_actions?: string[]
  
  // Compliance
  batch_sample_size?: number
  test_method?: string
  equipment_used?: string[]
  
  notes?: string
  checked_at: string
  created_at: string
}

export interface TemperatureLog {
  id: string
  batch_id: string
  stage: QualityCheckPoint
  temperature: number
  target_temperature?: number
  tolerance_range?: { min: number, max: number }
  within_range: boolean
  recorded_at: string
  equipment_id?: string
  notes?: string
}

export interface ProductionLog {
  id: string
  batch_id: string
  log_type: ProductionLogType
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  stage?: QualityCheckPoint
  user_id?: string
  user_name?: string
  data?: Record<string, unknown> // Additional structured data
  created_at: string
}

export interface ProductionEquipment {
  id: string
  name: string
  type: EquipmentType
  status: EquipmentStatus
  capacity: number
  unit: string
  
  // Maintenance
  last_maintenance?: string
  next_maintenance?: string
  maintenance_interval_days: number
  maintenance_alerts: boolean
  
  // Usage tracking
  total_usage_hours?: number
  current_batch_id?: string
  utilization_percentage?: number
  
  // Specifications
  specifications: Record<string, unknown>
  operating_temperature_range?: { min: number, max: number }
  power_consumption?: number // watts
  
  location?: string
  purchase_date?: string
  warranty_expiry?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductionStaff {
  id: string
  name: string
  role: StaffRole
  skills: ProductionSkill[]
  certifications?: string[]
  
  // Scheduling
  shift_start?: string
  shift_end?: string
  max_concurrent_batches: number
  current_workload: number
  
  // Performance
  efficiency_rating?: number // 0-100
  quality_score?: number // 0-100
  total_batches_completed?: number
  
  // Contact
  email?: string
  phone?: string
  employee_id?: string
  
  active: boolean
  created_at: string
  updated_at: string
}

// Enums and types from config
// Use database enum for production status
export type ProductionStatus = DBProductionStatus

export type BatchPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'rush'

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
  | 'conditional'
  | 'retesting'

export type ProductionLogType = 
  | 'status_change'
  | 'quality_check'
  | 'equipment_issue'
  | 'ingredient_issue'
  | 'staff_assignment'
  | 'schedule_change'
  | 'cost_update'
  | 'completion'
  | 'error'

export type EquipmentType = 
  | 'oven'
  | 'mixer'
  | 'proofer'
  | 'refrigerator'
  | 'freezer'
  | 'scale'
  | 'thermometer'
  | 'packaging_machine'
  | 'other'

export type EquipmentStatus = 
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'broken'
  | 'reserved'

export type StaffRole = 
  | 'head_baker'
  | 'baker'
  | 'assistant_baker'
  | 'quality_inspector'
  | 'supervisor'
  | 'packaging_operator'
  | 'maintenance_tech'

export type ProductionSkill = 
  | 'bread_baking'
  | 'cake_making'
  | 'pastry_work'
  | 'decoration'
  | 'quality_control'
  | 'equipment_maintenance'
  | 'food_safety'
  | 'inventory_management'

// Creation and update interfaces
export interface CreateBatchData {
  recipe_id: string
  planned_quantity: number
  batch_size?: number
  priority?: BatchPriority
  scheduled_start?: string
  scheduled_completion?: string
  
  // Assignment
  assigned_staff_ids?: string[]
  assigned_equipment_ids?: string[]
  supervisor_id?: string
  
  // Financial
  currency?: string
  planned_cost?: number
  
  // Integration
  order_ids?: string[]
  
  notes?: string
  tags?: string[]
}

export interface UpdateBatchData extends Partial<CreateBatchData> {
  status?: ProductionStatus
  actual_quantity?: number
  actual_start?: string
  actual_completion?: string
  actual_cost?: number
  yield_percentage?: number
  quality_score?: number
  quality_status?: QualityStatus
}

// Batch scheduling and planning
export interface BatchSchedule {
  batch_id: string
  recipe_name: string
  planned_quantity: number
  priority: BatchPriority
  scheduled_start: Date
  scheduled_completion: Date
  estimated_duration: number
  assigned_equipment: string[]
  assigned_staff: string[]
  dependencies?: string[] // Other batch IDs this depends on
}

export interface ProductionCapacity {
  date: string
  total_capacity: number
  used_capacity: number
  available_capacity: number
  scheduled_batches: number
  equipment_utilization: Record<string, number>
  staff_workload: Record<string, number>
}

// Analytics and reporting
export interface ProductionAnalytics {
  efficiency_metrics: {
    average_batch_efficiency: number
    on_time_completion_rate: number
    quality_pass_rate: number
    resource_utilization: number
    waste_percentage: number
  }
  
  cost_analysis: {
    total_production_cost: number
    cost_per_unit: number
    cost_by_category: Record<string, number>
    cost_trend: Array<{
      date: string
      total_cost: number
      cost_per_unit: number
    }>
  }
  
  quality_metrics: {
    overall_quality_score: number
    quality_by_stage: Record<QualityCheckPoint, number>
    defect_rate: number
    rework_rate: number
    customer_complaints: number
  }
  
  production_volume: {
    total_batches: number
    total_units_produced: number
    production_by_recipe: Record<string, {
      batches: number
      units: number
      revenue: number
    }>
    capacity_utilization: number
  }
}

// Filtering and search
export interface ProductionFilters {
  status?: ProductionStatus[]
  priority?: BatchPriority[]
  recipe_ids?: string[]
  assigned_staff_ids?: string[]
  quality_status?: QualityStatus[]
  scheduled_date_from?: string
  scheduled_date_to?: string
  actual_date_from?: string
  actual_date_to?: string
  tags?: string[]
  search?: string
}

// Validation and errors
export interface ProductionValidationError {
  field: string
  message: string
  code: string
}

// Export and reporting
export type ProductionExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

export interface ProductionExportOptions {
  format: ProductionExportFormat
  filters?: ProductionFilters
  include_quality_data?: boolean
  include_cost_data?: boolean
  include_logs?: boolean
  include_temperature_data?: boolean
  date_range?: {
    start: string
    end: string
  }
}

// Real-time updates
export interface ProductionRealtimeUpdate {
  batch_id: string
  update_type: 'status' | 'progress' | 'quality' | 'equipment' | 'alert'
  data: unknown
  timestamp: string
}

// Notifications
export interface ProductionNotification {
  id: string
  type: 'batch_completion' | 'quality_failure' | 'schedule_delay' | 'equipment_issue' | 'ingredient_shortage'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  batch_id?: string
  equipment_id?: string
  ingredient_id?: string
  read: boolean
  created_at: string
}

// Integration interfaces
export interface RecipeProductionData {
  recipe_id: string
  prep_time_minutes: number
  production_time_minutes: number
  cooling_time_minutes?: number
  quality_check_time_minutes: number
  typical_batch_size: number
  optimal_temperature?: number
  required_equipment: EquipmentType[]
  required_skills: ProductionSkill[]
  special_instructions?: string[]
}

// Automation and scheduling
export interface AutoScheduleOptions {
  orders: Array<{
    id: string
    recipe_id: string
    quantity: number
    priority: BatchPriority
    delivery_date: string
  }>
  available_equipment: ProductionEquipment[]
  available_staff: ProductionStaff[]
  working_hours: {
    start: string
    end: string
    working_days: number[]
  }
  max_concurrent_batches: number
  buffer_time_hours: number
}