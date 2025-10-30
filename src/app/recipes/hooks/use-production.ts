// Production service hooks for Indonesian UMKM operations
'use client'
import { useMemo } from 'react'
import { useSupabaseCRUD, useSupabaseQuery } from '@/hooks'
import type {
  ProductionBatch,
  IngredientAllocation,
  QualityCheck,
  ProductionEquipment,
  ProductionStaff,
  CreateBatchData,
  UpdateBatchData,
  ProductionFilters,
  ProductionAnalytics,
  ProductionStatus,
  ProductionCapacity,
  BatchSchedule,
  TemperatureLog,
  BatchPriority
} from '@/app/recipes/types/production.types'
import { PRODUCTION_CONFIG } from '@/app/recipes/config/production.config'
import { formatCurrency, DEFAULT_CURRENCY, currencies } from '@/lib/currency'
import type { Currency } from '@/lib/currency'

// Main production batches hook
export function useProductionBatches(filters?: ProductionFilters) {
  const {
    data: batchesData,
    loading,
    error,
    refetch: refetchBatches
  } = useSupabaseQuery('production_batches' as any, {
    select:
      '*, quality_checks(*), ingredient_allocations(*), production_logs(*), temperature_logs(*)',
    orderBy: { column: 'scheduled_start', ascending: true }
  })
  const {
    create: createBatchRecord,
    update: updateBatchRecord,
    delete: deleteBatchRecord
  } = useSupabaseCRUD('production_batches' as any)

  // Filter batches based on criteria
  const filteredBatches = useMemo((): ProductionBatch[] | undefined => {
    const castBatches = batchesData as ProductionBatch[] | undefined

    if (!castBatches || !filters) {return castBatches}

    return castBatches.filter((batch: ProductionBatch) => {
      // Status filter
      if (filters.status?.length && !filters.status.includes(batch.status)) {
        return false
      }

      // Priority filter
      if (filters.priority?.length && !filters.priority.includes(batch.priority)) {
        return false
      }

      // Recipe filter
      if (filters.recipe_ids?.length && !filters.recipe_ids.includes(batch.recipe_id)) {
        return false
      }

      // Staff assignment filter
      if (filters.assigned_staff_ids?.length && batch.assigned_staff_ids &&
          !filters.assigned_staff_ids.some(staffId => batch.assigned_staff_ids!.includes(staffId))) {
        return false
      }

      // Quality status filter
      if (filters.quality_status?.length && !filters.quality_status.includes(batch.quality_status)) {
        return false
      }

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

      // Tags filter
      if (filters.tags?.length && batch.tags && 
          !filters.tags.some(tag => batch.tags!.includes(tag))) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = [
          batch.batch_number,
          batch.recipe_name,
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
    allBatches: (batchesData as ProductionBatch[] | undefined) ?? [],
    loading,
    error,
    createBatch: createBatchRecord,
    updateBatch: updateBatchRecord,
    deleteBatch: deleteBatchRecord,
    refreshBatches: refetchBatches
  }
}

// Quality checks management
export function useQualityChecks(batchId: string) {
  const {
    data: checksData,
    loading,
    error,
    refetch: refetchChecks
  } = useSupabaseQuery('quality_checks' as any, {
    filter: { batch_id: batchId },
    orderBy: { column: 'checked_at', ascending: true }
  })
  const {
    create: createCheck,
    update: updateCheckRecord,
    delete: deleteCheck
  } = useSupabaseCRUD('quality_checks' as any)

  return {
    checks: (checksData as QualityCheck[] | undefined) ?? [],
    loading,
    error,
    addCheck: createCheck,
    updateCheck: updateCheckRecord,
    removeCheck: deleteCheck,
    refreshChecks: refetchChecks
  }
}

// Equipment management
export function useProductionEquipment(filters?: { type?: string; status?: string }) {
  const queryFilter: Record<string, unknown> | undefined = filters
    ? {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.status ? { status: filters.status } : {})
      }
    : undefined

  const {
    data: equipmentData,
    loading,
    error,
    refetch: refetchEquipment
  } = useSupabaseQuery('production_equipment' as any, {
    filter: queryFilter,
    orderBy: { column: 'name', ascending: true }
  })
  const {
    create: createEquipment,
    update: updateEquipmentRecord,
    delete: deleteEquipment
  } = useSupabaseCRUD('production_equipment' as any)

  return {
    equipment: (equipmentData as ProductionEquipment[] | undefined) ?? [],
    loading,
    error,
    addEquipment: createEquipment,
    updateEquipment: updateEquipmentRecord,
    removeEquipment: deleteEquipment,
    refreshEquipment: refetchEquipment
  }
}

// Staff management
export function useProductionStaff(filters?: { role?: string; active?: boolean }) {
  const queryFilter: Record<string, unknown> | undefined = filters
    ? {
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {})
      }
    : undefined

  const {
    data: staffData,
    loading,
    error,
    refetch: refetchStaff
  } = useSupabaseQuery('production_staff' as any, {
    filter: queryFilter,
    orderBy: { column: 'name', ascending: true }
  })
  const {
    create: createStaff,
    update: updateStaffRecord,
    delete: deleteStaff
  } = useSupabaseCRUD('production_staff' as any)

  return {
    staff: (staffData as ProductionStaff[] | undefined) ?? [],
    loading,
    error,
    addStaff: createStaff,
    updateStaff: updateStaffRecord,
    removeStaff: deleteStaff,
    refreshStaff: refetchStaff
  }
}

// Ingredient allocations for a batch
export function useIngredientAllocations(batchId: string) {
  const {
    data: allocationsData,
    loading,
    error,
    refetch: refetchAllocations
  } = useSupabaseQuery('ingredient_allocations' as any, {
    filter: { batch_id: batchId },
    orderBy: { column: 'allocated_at', ascending: true }
  })
  const {
    create: createAllocation,
    update: updateAllocationRecord,
    delete: deleteAllocation
  } = useSupabaseCRUD('ingredient_allocations' as any)

  return {
    allocations: (allocationsData as IngredientAllocation[] | undefined) ?? [],
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
  const { batches } = useProductionBatches({ status: ['planned', 'ingredients_ready', 'in_progress'] })

  const generateSchedule = (newBatchData: CreateBatchData): BatchSchedule => {
    const currentQueue = batches?.length || 0

    const timeline = calculateProductionTimeline(
      newBatchData.recipe_id,
      newBatchData.batch_size || config.DEFAULT_BATCH_SIZE,
      config,
      {
        priority: newBatchData.priority,
        current_queue_length: currentQueue
      }
    )

    return {
      batch_id: '', // Will be assigned after creation
      recipe_name: '', // Would come from recipe lookup
      planned_quantity: newBatchData.planned_quantity,
      priority: newBatchData.priority || 'normal',
      scheduled_start: timeline.estimated_start,
      scheduled_completion: timeline.estimated_completion,
      estimated_duration: timeline.total_time_minutes,
      assigned_equipment: newBatchData.assigned_equipment_ids || [],
      assigned_staff: newBatchData.assigned_staff_ids || []
    }
  }

  return {
    generateSchedule,
    currentQueue: batches?.length || 0
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

    const eqArray = equipment as ProductionEquipment[]
    const staffArray = staff as ProductionStaff[]
    const batchArray = batches
    const totalEquipmentCapacity = eqArray.reduce((sum: number, eq: ProductionEquipment) => sum + eq.capacity, 0)
    const totalStaffCapacity = staffArray.reduce((sum: number, s: ProductionStaff) => sum + s.max_concurrent_batches, 0)
    const total_capacity = Math.min(totalEquipmentCapacity, totalStaffCapacity)

    const used_capacity = batchArray.length
    const available_capacity = total_capacity - used_capacity

    const equipment_utilization: Record<string, number> = {}
    eqArray.forEach((eq: ProductionEquipment) => {
      const usedBatches = batchArray.filter((b: ProductionBatch) => 
        b.assigned_equipment_ids?.includes(eq.id)
      ).length
      equipment_utilization[eq.id] = eq.capacity > 0 ? (usedBatches / eq.capacity) * 100 : 0
    })

    const staff_workload: Record<string, number> = {}
    staffArray.forEach((s: ProductionStaff) => {
      const assignedBatches = batchArray.filter((b: ProductionBatch) => 
        b.assigned_staff_ids?.includes(s.id)
      ).length
      staff_workload[s.id] = s.max_concurrent_batches > 0 ? 
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
      const updateData: UpdateBatchData = { 
        status: newStatus
      }

      // Add timestamps for specific status changes
      const now = new Date().toISOString()
      if (newStatus === 'in_progress') {
        updateData.actual_start = now
      } else if (newStatus === 'completed') {
        updateData.actual_completion = now
      }

      await updateBatch(batchId, updateData)
    } catch (error: unknown) {
      throw new Error(`Failed to update batch status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const canTransitionTo = (currentStatus: ProductionStatus, targetStatus: ProductionStatus): boolean => {
    const transitions: Record<ProductionStatus, ProductionStatus[]> = {
      planned: ['ingredients_ready', 'cancelled'],
      ingredients_ready: ['in_progress', 'on_hold', 'cancelled'],
      in_progress: ['quality_check', 'on_hold', 'cancelled'],
      quality_check: ['completed', 'failed', 'in_progress'],
      completed: [],
      on_hold: ['in_progress', 'cancelled'],
      cancelled: [],
      failed: ['in_progress'] // Allow retry
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
    const completedBatches = batchArray.filter((b: ProductionBatch) => b.status === 'completed')
    const totalBatches = batchArray.length

    // Efficiency metrics
    const efficiencyBatches = completedBatches.filter((b: ProductionBatch) => 
      b.actual_duration_minutes && b.estimated_duration_minutes
    )
    const average_batch_efficiency: number = efficiencyBatches.length > 0 
      ? efficiencyBatches.reduce((sum: number, b: ProductionBatch) => 
          sum + ((b.estimated_duration_minutes / b.actual_duration_minutes!) * 100), 0
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
    const total_production_cost: number = costBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.actual_cost || 0), 0)
    const total_units: number = costBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.actual_quantity || b.planned_quantity), 0)
    const cost_per_unit = total_units > 0 ? total_production_cost / total_units : 0

    // Quality metrics
    const overall_quality_score = qualityBatches.length > 0
      ? qualityBatches.reduce((sum: number, b: ProductionBatch) => sum + (b.quality_score || 0), 0) / qualityBatches.length
      : 0

    const failed_batches = batchArray.filter((b: ProductionBatch) => b.status === 'failed').length
    const defect_rate = totalBatches > 0 ? (failed_batches / totalBatches) * 100 : 0

    // Production volume
    const total_units_produced = completedBatches.reduce((sum: number, b: ProductionBatch) => 
      sum + (b.actual_quantity || b.planned_quantity), 0
    )

    const production_by_recipe: Record<string, { batches: number, units: number, revenue: number }> = {}
    completedBatches.forEach((batch: ProductionBatch) => {
      if (!production_by_recipe[batch.recipe_id]) {
        production_by_recipe[batch.recipe_id] = { batches: 0, units: 0, revenue: 0 }
      }
      const recipeData = production_by_recipe[batch.recipe_id]
      if (recipeData) {
        recipeData.batches++
        recipeData.units += (batch.actual_quantity || batch.planned_quantity)
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
  type Notification = {
    id: string
    title: string
    message: string
    type: string
    priority: string
    batch_id?: string
    recipe_id?: string
    created_at: string
    read?: boolean
    user_id?: string
  }
  
  const {
    data: notificationsData,
    loading,
    error,
    refetch: refetchNotifications
  } = useSupabaseQuery('production_notifications' as any, {
    orderBy: { column: 'created_at', ascending: false }
  })
  const { update: updateNotification } = useSupabaseCRUD('production_notifications' as any)

  const markAsRead = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { read: true })
    } catch (err: unknown) {
      throw new Error(`Failed to mark notification as read: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const unreadCount = (notificationsData as Notification[] | undefined)?.filter((n) => {
    const notif = n as Notification
    return !notif.read
  }).length || 0

  return {
    notifications: notificationsData || [],
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications: refetchNotifications
  }
}

// Temperature monitoring
export function useTemperatureMonitoring(batchId: string) {
  const {
    data: logsData,
    loading,
    error,
    refetch: refetchLogs
  } = useSupabaseQuery('temperature_logs' as any, {
    filter: { batch_id: batchId },
    orderBy: { column: 'recorded_at', ascending: true }
  })
  const { create: createTemperatureLog } = useSupabaseCRUD('temperature_logs' as any)

  const addTemperatureReading = async (reading: Omit<TemperatureLog, 'id' | 'batch_id'>) => {
    try {
      await createTemperatureLog({
        ...reading,
        batch_id: batchId
      })
    } catch (err: unknown) {
      throw new Error(`Failed to add temperature reading: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return {
    temperatureLogs: (logsData as TemperatureLog[] | undefined) ?? [],
    loading,
    error,
    addReading: addTemperatureReading,
    refreshLogs: refetchLogs
  }
}

// Currency formatting for production costs
export function useProductionCurrency(currency?: string | Currency) {
  const resolvedCurrency: Currency = typeof currency === 'string'
    ? currencies.find(curr => curr.code === currency) ?? DEFAULT_CURRENCY
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
