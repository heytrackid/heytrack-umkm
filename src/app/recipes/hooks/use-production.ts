'use client'

import { useMemo } from 'react'

import { PRODUCTION_CONFIG } from '@/app/recipes/config/production.config'
import { useSupabaseCRUD, useSupabaseQuery } from '@/hooks'
import { formatCurrency, DEFAULT_CURRENCY, currencies, type Currency } from '@/lib/currency'
import { isRecord } from '@/types/shared/guards'

import type {
  ProductionBatch,
  CreateBatchData,
  UpdateBatchData,
  ProductionFilters,
  ProductionAnalytics,
  ProductionStatus,
  ProductionCapacity,
  BatchSchedule,
  TemperatureLog,
  BatchPriority,
  QualityStatus
} from '@/app/recipes/types/production.types'
import type { Row } from '@/types/database'

// Production service hooks for Indonesian UMKM operations

// Main production batches hook
export function useProductionBatches(filters?: ProductionFilters) {
  const {
    data: batchesData,
    loading,
    error,
    refetch: refetchBatches
  } = useSupabaseQuery('production_batches', {
    select: '*',
    orderBy: { column: 'created_at', ascending: true }
  })
  const {
    create: createBatchRecord,
    update: updateBatchRecord,
    delete: deleteBatchRecord
  } = useSupabaseCRUD('production_batches')

  // Filter batches based on criteria
  const filteredBatches = useMemo((): ProductionBatch[] | undefined => {
    // Cast data to proper Supabase table type
    const productionBatches = batchesData as Array<Row<'production_batches'>> | undefined

    // Transform to the ProductionBatch type with required fields
    const castBatches = productionBatches?.map(batch => ({
      id: batch['id'],
      batch_number: batch.batch_number,
      recipe_id: batch.recipe_id,
      recipe_name: '', // Would need to be populated from recipe lookup
      status: batch['status'] as ProductionStatus, // Cast database enum to our type
      priority: 'normal' as BatchPriority,
      planned_quantity: batch.quantity,
      batch_size: batch.quantity,
       scheduled_start: batch.planned_date,
       scheduled_completion: batch.completed_at ?? batch.planned_date,
       ...(batch.started_at && { actual_start: batch.started_at }),
       ...(batch.completed_at && { actual_completion: batch.completed_at }),
      estimated_duration_minutes: 0,
      actual_duration_minutes: 0,
       assigned_staff_ids: [],
       assigned_equipment_ids: [],
       planned_cost: batch.actual_cost ?? 0,
       ...(batch.actual_cost && { actual_cost: batch.actual_cost }),
      currency: DEFAULT_CURRENCY['code'],
       quality_checks: [],
       quality_status: 'pending' as QualityStatus,
      temperature_logs: [],
      compliance_notes: [],
      order_ids: [],
      ingredient_allocations: [],
      stock_transactions: [],
       ...(batch.notes && { notes: batch.notes }),
       tags: [],
       created_at: batch.created_at ?? new Date().toISOString(),
       updated_at: batch.updated_at ?? new Date().toISOString(),
       production_logs: []
    }))

    if (!castBatches || !filters) {return castBatches}

    return (castBatches as ProductionBatch[]).filter((batch) => {
      // Status filter - Compare with database enum values directly
      if (filters['status']?.length) {
        const batchStatus = isRecord(batch) && 'status' in batch
          ? batch['status']
          : undefined

        if (batchStatus && !filters['status'].includes(batchStatus)) {
          return false
        }
      }

      // Priority filter - commented out since priority is not in the database type
      // if (filters.priority?.length && !filters.priority.includes(batch.priority)) {
      //   return false
      // }

      // Recipe filter
      if (filters.recipe_ids?.length && !filters.recipe_ids.includes(batch.recipe_id)) {
        return false
      }

      // Staff assignment filter - commented out since assigned_staff_ids is not in the database type
      // if (filters.assigned_staff_ids?.length && batch.assigned_staff_ids &&
      //     !filters.assigned_staff_ids.some(staffId => batch.assigned_staff_ids!.includes(staffId))) {
      //   return false
      // }

      // Quality status filter - commented out since quality_status is not in the database type
      // if (filters.quality_status?.length && !filters.quality_status.includes(batch.quality_status)) {
      //   return false
      // }

      // Scheduled date range filter
      if (filters.scheduled_date_from && batch.scheduled_start < filters.scheduled_date_from) {
        return false
      }
      if (filters.scheduled_date_to && batch.scheduled_start > filters.scheduled_date_to) {
        return false
      }

      // Actual date range filter
      if (filters.actual_date_from && batch.actual_start && 
          batch.actual_start < filters.actual_date_from) {
        return false
      }
      if (filters.actual_date_to && batch.actual_start && 
          batch.actual_start > filters.actual_date_to) {
        return false
      }

      // Tags filter - commented out since tags is not in the database type
      // if (filters.tags?.length && batch.tags && 
      //     !filters.tags.some(tag => batch.tags!.includes(tag))) {
      //   return false
      // }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = [
          batch.batch_number,
          batch['recipe_name'],
          batch.notes,
          batch.internal_notes
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [batchesData, filters])

  return {
    batches: filteredBatches,
    allBatches: filteredBatches ?? [],
    loading,
    error,
    createBatch: createBatchRecord,
    updateBatch: updateBatchRecord,
    deleteBatch: deleteBatchRecord,
    refreshBatches: refetchBatches
  }
}

// Quality checks management - using existing table
export function useQualityChecks(batchId: string) {
  // Using app_settings as placeholder since there's no quality_checks table in schema
  const {
    data: checksData,
    loading,
    error,
    refetch: refetchChecks
  } = useSupabaseQuery('app_settings', {
    filter: { user_id: batchId }, // Using user_id as placeholder filter
    orderBy: { column: 'created_at', ascending: true }
  })
  const {
    create: createCheck,
    update: updateCheckRecord,
    delete: deleteCheck
  } = useSupabaseCRUD('app_settings')

  // Transform to expected type
  const checks = (checksData as Array<Row<'app_settings'>> | undefined)?.map(setting => ({
    id: setting['id'],
    batch_id: setting.user_id,
    check_point: 'final', // Placeholder
    status: 'passed', // Placeholder
    passed: true, // Placeholder
    checked_at: setting.updated_at,
    notes: setting.settings_data ? JSON.stringify(setting.settings_data) : '',
    inspector: setting.user_id,
    parameters: {}, // Placeholder
    batch_number: 'N/A', // Placeholder
    recipe_name: 'N/A', // Placeholder
    quality_score: 100, // Placeholder
    temperature: null // Placeholder
  })) ?? []

  return {
    checks,
    loading,
    error,
    addCheck: createCheck,
    updateCheck: updateCheckRecord,
    removeCheck: deleteCheck,
    refreshChecks: refetchChecks
  }
}

// Equipment management - using existing table
export function useProductionEquipment(filters?: { type?: string; status?: string }) {
  // Using app_settings as placeholder since there's no production_equipment table in schema
  const queryFilter: Partial<Record<string, boolean | number | string | null>> | undefined = filters
    ? {
        ...(filters['type'] ? { type: filters['type'] } : {}),
        ...(filters['status'] ? { status: filters['status'] } : {})
      }
    : undefined

  const {
    data: equipmentData,
    loading,
    error,
    refetch: refetchEquipment
   } = useSupabaseQuery('app_settings', {
     ...(queryFilter && { filter: queryFilter }),
     orderBy: { column: 'updated_at', ascending: true }
   })
   const {
     create: createEquipment,
    update: updateEquipmentRecord,
    delete: deleteEquipment
  } = useSupabaseCRUD('app_settings')

  // Transform to expected type
  const equipment = (equipmentData as Array<Row<'app_settings'>> | undefined)?.map(setting => ({
    id: setting['id'],
    name: setting['id'], // Using id as name
    type: 'oven', // Placeholder
    status: 'available', // Placeholder
    capacity: 10, // Placeholder
    unit: 'kg', // Placeholder
    last_maintenance: setting.updated_at, // Placeholder
    next_maintenance: setting.updated_at, // Placeholder
    maintenance_interval: 30, // Placeholder
    operating_hours: 8, // Placeholder
    efficiency: 95, // Placeholder
    location: 'main facility', // Placeholder
    operator: setting.user_id // Placeholder
  })) ?? []

  return {
    equipment,
    loading,
    error,
    addEquipment: createEquipment,
    updateEquipment: updateEquipmentRecord,
    removeEquipment: deleteEquipment,
    refreshEquipment: refetchEquipment
  }
}

// Staff management - using existing table
export function useProductionStaff(filters?: { role?: string; active?: boolean }) {
  // Using app_settings as placeholder since there's no production_staff table in schema
  const queryFilter: Partial<Record<string, boolean | number | string | null>> | undefined = filters
    ? {
        ...(filters.role ? { type: filters.role } : {}), // Using 'type' as placeholder for role
        ...(filters.active !== undefined ? { is_active: filters.active } : {})
      }
    : undefined

  const {
    data: staffData,
    loading,
    error,
    refetch: refetchStaff
   } = useSupabaseQuery('app_settings', {
     ...(queryFilter && { filter: queryFilter }),
     orderBy: { column: 'updated_at', ascending: true }
   })
   const {
     create: createStaff,
    update: updateStaffRecord,
    delete: deleteStaff
  } = useSupabaseCRUD('app_settings')

  // Transform to expected type
  const staff = (staffData as Array<Row<'app_settings'>> | undefined)?.map(setting => ({
    id: setting['id'],
    name: setting['id'], // Using id as name
    role: 'operator', // Placeholder
    skills: ['general'], // Placeholder
    max_concurrent_batches: 2, // Placeholder
    current_workload: 1, // Placeholder
    active: true, // Placeholder
    last_shift: setting.updated_at, // Placeholder
    shift_schedule: 'day', // Placeholder
    certifications: ['food safety'] // Placeholder
  })) ?? []

  return {
    staff,
    loading,
    error,
    addStaff: createStaff,
    updateStaff: updateStaffRecord,
    removeStaff: deleteStaff,
    refreshStaff: refetchStaff
  }
}

// Ingredient allocations for a batch - using existing table
export function useIngredientAllocations(batchId: string) {
  // Using stock_transactions as closest match since there's no ingredient_allocations table in schema
  const {
    data: allocationsData,
    loading,
    error,
    refetch: refetchAllocations
  } = useSupabaseQuery('stock_transactions', {
    filter: { ingredient_id: batchId }, // Using as placeholder
    orderBy: { column: 'created_at', ascending: true }
  })
  const {
    create: createAllocation,
    update: updateAllocationRecord,
    delete: deleteAllocation
  } = useSupabaseCRUD('stock_transactions')

  // Transform to expected type
  const allocations = (allocationsData as Array<Row<'stock_transactions'>> | undefined)?.map(transaction => ({
    id: transaction['id'],
    batch_id: transaction.ingredient_id, // Using ingredient_id as batch_id
    ingredient_id: transaction.ingredient_id,
    ingredient_name: 'Unknown', // Would need to be populated from ingredients table
    planned_quantity: transaction.quantity,
    allocated_quantity: transaction.quantity,
    allocated_at: transaction.created_at,
    allocated_by: transaction.user_id,
    notes: transaction.notes,
    status: 'allocated' as const, // Literal type
    unit: 'kg' // Placeholder
  })) ?? []

  return {
    allocations,
    loading,
    error,
    addAllocation: createAllocation,
    updateAllocation: updateAllocationRecord,
    removeAllocation: deleteAllocation,
    refreshAllocations: refetchAllocations
  }
}

// Production batch scheduling
export function useBatchScheduling(config = PRODUCTION_CONFIG) {
  const { batches } = useProductionBatches({ status: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] }) // Using valid database enum values only

  const generateSchedule = (newBatchData: CreateBatchData): BatchSchedule => {
    const currentQueue = batches?.length ?? 0

    const timeline = calculateProductionTimeline(
      newBatchData.recipe_id,
      newBatchData.batch_size ?? config.DEFAULT_BATCH_SIZE,
      config,
       {
         priority: newBatchData.priority ?? 'normal',
         current_queue_length: currentQueue
       }
    )

    return {
      batch_id: '', // Will be assigned after creation
      recipe_name: '', // Would come from recipe lookup
      planned_quantity: newBatchData.planned_quantity,
      priority: newBatchData.priority ?? 'normal',
      scheduled_start: timeline.estimated_start,
      scheduled_completion: timeline.estimated_completion,
      estimated_duration: timeline.total_time_minutes,
      assigned_equipment: newBatchData.assigned_equipment_ids ?? [],
      assigned_staff: newBatchData.assigned_staff_ids ?? []
    }
  }

  return {
    generateSchedule,
    currentQueue: batches?.length ?? 0
  }
}

// Production capacity analysis
export function useProductionCapacity(date: string): {
  capacity: ProductionCapacity | null
  loading: boolean
  error: unknown
} {
  const { batches, loading, error } = useProductionBatches({
    scheduled_date_from: date,
    scheduled_date_to: date
  })
  const { equipment } = useProductionEquipment()
  const { staff } = useProductionStaff({ active: true })

  const capacity = useMemo((): ProductionCapacity | null => {
    if (!batches || !equipment || !staff) {return null}

    const eqArray = equipment
    const staffArray = staff
    const batchArray = batches
    const totalEquipmentCapacity = eqArray.reduce((sum, eq) => sum + (eq.capacity || 0), 0)
    const totalStaffCapacity = staffArray.reduce((sum, s) => sum + (s.max_concurrent_batches || 0), 0)
    const total_capacity = Math.min(totalEquipmentCapacity, totalStaffCapacity)

    const used_capacity = batchArray.length
    const available_capacity = total_capacity - used_capacity

    const equipment_utilization: Record<string, number> = {}
    eqArray.forEach((eq) => {
      const usedBatches = batchArray.filter((b: ProductionBatch) => 
        b.assigned_equipment_ids?.includes(eq['id'])
      ).length
      equipment_utilization[eq['id']] = eq.capacity > 0 ? (usedBatches / eq.capacity) * 100 : 0
    })

    const staff_workload: Record<string, number> = {}
    staffArray.forEach((s) => {
      const assignedBatches = batchArray.filter((b: ProductionBatch) => 
        b.assigned_staff_ids?.includes(s['id'])
      ).length
      staff_workload[s['id']] = s.max_concurrent_batches > 0 ? 
        (assignedBatches / s.max_concurrent_batches) * 100 : 0
    })

    return {
      date,
      total_capacity,
      used_capacity,
      available_capacity,
      scheduled_batches: batchArray.length,
      equipment_utilization,
      staff_workload
    }
  }, [batches, equipment, staff, date])

  return { capacity, loading, error }
}

// Batch status management
export function useBatchStatus(batchId: string) {
  const { updateBatch } = useProductionBatches()

  const updateStatus = async (newStatus: ProductionStatus, _reason?: string) => {
    try {
      // Use the status value directly as it matches the database enum type
      const updateData: UpdateBatchData = { 
        status: newStatus
      }

      // Add timestamps for specific status changes
      const now = new Date().toISOString()
      if (newStatus === 'IN_PROGRESS') {
        updateData.actual_start = now
      } else if (newStatus === 'COMPLETED') {
        updateData.actual_completion = now
      }

      await updateBatch(batchId, updateData)
    } catch (error: unknown) {
      throw new Error(`Failed to update batch status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const canTransitionTo = (currentStatus: ProductionStatus, targetStatus: ProductionStatus): boolean => {
    // Define valid transitions using the actual database enum values
    const transitions: Record<ProductionStatus, ProductionStatus[]> = {
      PLANNED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    }

    return transitions[currentStatus]?.includes(targetStatus) || false
  }

  return {
    updateStatus,
    canTransitionTo
  }
}

// Production analytics
export function useProductionAnalytics(filters?: ProductionFilters): {
  analytics: ProductionAnalytics | null
  loading: boolean
  error: unknown
} {
  const { batches, loading, error } = useProductionBatches(filters)

  const analytics = useMemo((): ProductionAnalytics | null => {
    if (!batches) {return null}

    const batchArray = batches
    const completedBatches = batchArray.filter((b: ProductionBatch) => b['status'] === 'COMPLETED')
    const totalBatches = batchArray.length

    // Efficiency metrics
    const efficiencyBatches = completedBatches.filter((b: ProductionBatch) => 
      b.actual_duration_minutes && b.estimated_duration_minutes
    )
    const average_batch_efficiency: number = efficiencyBatches.length > 0 
      ? efficiencyBatches.reduce((sum: number, b: ProductionBatch) => 
          sum + ((b.estimated_duration_minutes / (b.actual_duration_minutes ?? 1)) * 100), 0
        ) / efficiencyBatches.length
      : 0

    const on_time_completion_rate = completedBatches.length > 0
      ? (completedBatches.filter((b: ProductionBatch) => 
          b.actual_completion && b.scheduled_completion && 
          b.actual_completion <= b.scheduled_completion
        ).length / completedBatches.length) * 100
      : 0

    const qualityBatches = batchArray.filter((b: ProductionBatch) => b.quality_score !== undefined)
    const quality_pass_rate = qualityBatches.length > 0
      ? (qualityBatches.filter((b: ProductionBatch) => b.quality_status === 'passed').length / qualityBatches.length) * 100
      : 0

    // Cost analysis
    const costBatches = completedBatches.filter((b: ProductionBatch) => b.actual_cost)
    const total_production_cost: number = costBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.actual_cost ?? 0), 0)
    const total_units: number = costBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.actual_quantity ?? b.planned_quantity), 0)
    const cost_per_unit = total_units > 0 ? total_production_cost / total_units : 0

    // Quality metrics
    const overall_quality_score = qualityBatches.length > 0
      ? qualityBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.quality_score ?? 0), 0) / qualityBatches.length
      : 0

    const failed_batches = batchArray.filter((b: ProductionBatch) => b['status'] === 'CANCELLED').length
    const defect_rate = totalBatches > 0 ? (failed_batches / totalBatches) * 100 : 0

    // Production volume
    const total_units_produced = completedBatches.reduce((sum: number, b: ProductionBatch) => 
      sum + (b.actual_quantity ?? b.planned_quantity), 0
    )

    const production_by_recipe: Record<string, { batches: number, units: number, revenue: number }> = {}
    completedBatches.forEach((batch: ProductionBatch) => {
      production_by_recipe[batch.recipe_id] ??= { batches: 0, units: 0, revenue: 0 }
      const recipeData = production_by_recipe[batch.recipe_id]
      if (recipeData) {
        recipeData.batches++
        recipeData.units += (batch.actual_quantity ?? batch.planned_quantity)
      }
      // Revenue would need to be calculated based on selling price
    })

    return {
      efficiency_metrics: {
        average_batch_efficiency,
        on_time_completion_rate,
        quality_pass_rate,
        resource_utilization: 0, // Would need equipment/staff data
        waste_percentage: 0 // Would need waste tracking data
      },
      cost_analysis: {
        total_production_cost,
        cost_per_unit,
        cost_by_category: {}, // Would need detailed cost breakdown
        cost_trend: [] // Would need historical data
      },
      quality_metrics: {
        overall_quality_score,
        quality_by_stage: {
          ingredient_prep: 0,
          mixing: 0,
          baking: 0,
          cooling: 0,
          packaging: 0,
          final_inspection: 0
        }, // Would need quality check details
        defect_rate,
        rework_rate: 0, // Would need rework tracking
        customer_complaints: 0 // Would need customer feedback integration
      },
      production_volume: {
        total_batches: totalBatches,
        total_units_produced,
        production_by_recipe,
        capacity_utilization: 0 // Would need capacity data
      }
    }
  }, [batches])

  return { analytics, loading, error }
}

// Production notifications
export function useProductionNotifications() {
  // interface ProductionNotification {
  //   id: string
  //   title: string
  //   message: string
  //   type: string
  //   priority: string
  //   batch_id?: string
  //   recipe_id?: string
  //   created_at: string
  //   read?: boolean
  //   user_id?: string
  // }
  
  const {
    data: notificationsData,
    loading,
    error,
    refetch: refetchNotifications
  } = useSupabaseQuery('notifications', {
    orderBy: { column: 'created_at', ascending: false }
  })
  const { update: updateNotification } = useSupabaseCRUD('notifications')

  const markAsRead = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { is_read: true })
     } catch (error) {
       throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`)
     }
  }

  const unreadCount = (notificationsData as Array<Row<'notifications'>> | undefined)?.filter((n) => {
    const notif = n
    return !notif.is_read
  }).length ?? 0

  // Transform to expected format
  const notifications = (notificationsData as Array<Row<'notifications'>> | undefined)?.map(notification => ({
    id: notification['id'],
    title: notification.title,
    message: notification.message,
    type: notification['type'],
    priority: notification.priority ?? 'medium',
    batch_id: undefined, // Would need to be stored in the metadata
    recipe_id: undefined, // Would need to be stored in the metadata
    created_at: notification.created_at,
    read: notification.is_read,
    user_id: notification.user_id
  })) ?? []

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications: refetchNotifications
  }
}

// Temperature monitoring - using existing table
export function useTemperatureMonitoring(batchId: string) {
  // Using app_settings as placeholder since there's no temperature_logs table in schema
  const {
    data: logsData,
    loading,
    error,
    refetch: refetchLogs
  } = useSupabaseQuery('app_settings', {
    filter: { user_id: batchId }, // Using user_id as placeholder filter
    orderBy: { column: 'created_at', ascending: true }
  })
  const { create: createTemperatureLog } = useSupabaseCRUD('app_settings')

  const addTemperatureReading = async (reading: Omit<TemperatureLog, 'batch_id' | 'id'>) => {
    try {
      await createTemperatureLog({
        user_id: batchId,
        settings_data: { temperature: reading.temperature, stage: reading.stage } // Store as JSON
      })
     } catch (error) {
       throw new Error(`Failed to add temperature reading: ${error instanceof Error ? error.message : 'Unknown error'}`)
     }
  }

  // Transform to expected type
  const temperatureLogs = (logsData as Array<Row<'app_settings'>> | undefined)?.map(setting => ({
    id: setting['id'],
    batch_id: batchId, // Use the passed batchId
    stage: setting.settings_data && typeof setting.settings_data === 'object' && 'stage' in setting.settings_data 
      ? (setting.settings_data as { stage?: string }).stage ?? 'general'
      : 'general',
    temperature: setting.settings_data && typeof setting.settings_data === 'object' && 'temperature' in setting.settings_data 
      ? (setting.settings_data as { temperature?: number }).temperature 
      : null,
    within_range: true, // Placeholder
    recorded_at: setting.updated_at,
    notes: '',
    operator: setting.user_id
  })) ?? []

  return {
    temperatureLogs,
    loading,
    error,
    addReading: addTemperatureReading,
    refreshLogs: refetchLogs
  }
}

// Currency formatting for production costs
export function useProductionCurrency(currency?: Currency | string) {
  const resolvedCurrency: Currency = typeof currency === 'string'
    ? currencies.find(curr => curr['code'] === currency) ?? DEFAULT_CURRENCY
    : currency ?? DEFAULT_CURRENCY

  const formatCost = (amount: number, _options?: {
    showSymbol?: boolean
    showCode?: boolean
  }) => formatCurrency(amount, resolvedCurrency)

  return {
    currency: resolvedCurrency,
    formatCost
  }
}

interface ProductionTimelineContext {
  priority?: BatchPriority
  current_queue_length?: number
  rush_order?: boolean
}

interface ProductionTimelineResult {
  estimated_start: Date
  estimated_completion: Date
  total_time_minutes: number
}

function calculateProductionTimeline(
  _recipeId: string,
  batchSize: number,
  config: typeof PRODUCTION_CONFIG,
  context: ProductionTimelineContext = {}
): ProductionTimelineResult {
  const now = new Date()
  const queueDelay = (context.current_queue_length ?? 0) * config.DEFAULT_COOK_TIME
  const priorityMultiplier = context.priority === 'urgent' || context.rush_order ? 0.75 : 1

  const prepTime = config.DEFAULT_PREP_TIME
  const cookTime = config.DEFAULT_COOK_TIME * priorityMultiplier
  const buffer = config.BUFFER_TIME

  const totalTime = Math.round((prepTime + cookTime + buffer) * Math.max(batchSize / config.DEFAULT_BATCH_SIZE, 1))
  const estimatedStart = new Date(now.getTime() + queueDelay * 60 * 1000)
  const estimatedCompletion = new Date(estimatedStart.getTime() + totalTime * 60 * 1000)

  return {
    estimated_start: estimatedStart,
    estimated_completion: estimatedCompletion,
    total_time_minutes: totalTime
  }
}

// Batch validation
export function useBatchValidation() {
  const validateBatch = (batchData: CreateBatchData): string[] => {
    const errors: string[] = []

    // Basic validation
    if (!batchData.recipe_id) {
      errors.push('Recipe is required')
    }

    if (!batchData.planned_quantity || batchData.planned_quantity <= 0) {
      errors.push('Planned quantity must be greater than 0')
    }

    if (batchData.batch_size && batchData.batch_size <= 0) {
      errors.push('Batch size must be greater than 0')
    }

    // Scheduled time validation
    if (batchData.scheduled_start && batchData.scheduled_completion) {
      const start = new Date(batchData.scheduled_start)
      const completion = new Date(batchData.scheduled_completion)
      if (start >= completion) {
        errors.push('Scheduled completion must be after scheduled start')
      }
    }

    return errors
  }

  return { validateBatch }
}