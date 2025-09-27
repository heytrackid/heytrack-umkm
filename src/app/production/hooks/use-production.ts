// Production service hooks for Indonesian bakery operations
'use client'

import { useMemo } from 'react'
import { useSupabaseCRUD } from '@/hooks/useSupabaseCRUD'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import { 
  ProductionBatch,
  IngredientAllocation,
  QualityCheck,
  ProductionEquipment,
  ProductionStaff,
  ProductionLog,
  CreateBatchData,
  UpdateBatchData,
  ProductionFilters,
  ProductionAnalytics,
  ProductionStatus,
  BatchPriority,
  QualityStatus,
  ProductionCapacity,
  BatchSchedule,
  ProductionNotification,
  TemperatureLog
} from '../types/production.types'
import { 
  DEFAULT_PRODUCTION_CONFIG,
  calculateProductionTimeline,
  type ProductionModuleConfig
} from '../config/production.config'
import { formatCurrency } from '@/shared/utils/currency'

// Main production batches hook
export function useProductionBatches(filters?: ProductionFilters) {
  const { 
    data: batches, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<ProductionBatch, CreateBatchData, UpdateBatchData>({
    table: 'production_batches',
    relationConfig: {
      quality_checks: {
        table: 'quality_checks',
        foreignKey: 'batch_id'
      },
      ingredient_allocations: {
        table: 'ingredient_allocations',
        foreignKey: 'batch_id'
      },
      production_logs: {
        table: 'production_logs',
        foreignKey: 'batch_id'
      },
      temperature_logs: {
        table: 'temperature_logs',
        foreignKey: 'batch_id'
      }
    },
    orderBy: [{ column: 'scheduled_start', ascending: true }]
  })

  // Filter batches based on criteria
  const filteredBatches = useMemo(() => {
    if (!batches || !filters) return batches

    return batches.filter(batch => {
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
  }, [batches, filters])

  return {
    batches: filteredBatches,
    allBatches: batches,
    loading,
    error,
    createBatch: create,
    updateBatch: update,
    deleteBatch: remove,
    refreshBatches: refresh
  }
}

// Quality checks management
export function useQualityChecks(batchId: string) {
  const { 
    data: checks, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<QualityCheck>({
    table: 'quality_checks',
    filter: [{ column: 'batch_id', operator: 'eq', value: batchId }],
    orderBy: [{ column: 'checked_at', ascending: true }]
  })

  return {
    checks: checks || [],
    loading,
    error,
    addCheck: create,
    updateCheck: update,
    removeCheck: remove,
    refreshChecks: refresh
  }
}

// Equipment management
export function useProductionEquipment(filters?: { type?: string, status?: string }) {
  const { 
    data: equipment, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<ProductionEquipment>({
    table: 'production_equipment',
    filter: filters ? [
      ...(filters.type ? [{ column: 'type', operator: 'eq', value: filters.type }] : []),
      ...(filters.status ? [{ column: 'status', operator: 'eq', value: filters.status }] : [])
    ] : undefined,
    orderBy: [{ column: 'name', ascending: true }]
  })

  return {
    equipment: equipment || [],
    loading,
    error,
    addEquipment: create,
    updateEquipment: update,
    removeEquipment: remove,
    refreshEquipment: refresh
  }
}

// Staff management
export function useProductionStaff(filters?: { role?: string, active?: boolean }) {
  const { 
    data: staff, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<ProductionStaff>({
    table: 'production_staff',
    filter: filters ? [
      ...(filters.role ? [{ column: 'role', operator: 'eq', value: filters.role }] : []),
      ...(filters.active !== undefined ? [{ column: 'active', operator: 'eq', value: filters.active }] : [])
    ] : undefined,
    orderBy: [{ column: 'name', ascending: true }]
  })

  return {
    staff: staff || [],
    loading,
    error,
    addStaff: create,
    updateStaff: update,
    removeStaff: remove,
    refreshStaff: refresh
  }
}

// Ingredient allocations for a batch
export function useIngredientAllocations(batchId: string) {
  const { 
    data: allocations, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<IngredientAllocation>({
    table: 'ingredient_allocations',
    filter: [{ column: 'batch_id', operator: 'eq', value: batchId }],
    orderBy: [{ column: 'allocated_at', ascending: true }]
  })

  return {
    allocations: allocations || [],
    loading,
    error,
    addAllocation: create,
    updateAllocation: update,
    removeAllocation: remove,
    refreshAllocations: refresh
  }
}

// Production batch scheduling
export function useBatchScheduling(config: ProductionModuleConfig = DEFAULT_PRODUCTION_CONFIG) {
  const { batches } = useProductionBatches({ status: ['planned', 'ingredients_ready', 'in_progress'] })

  const generateSchedule = (newBatchData: CreateBatchData): BatchSchedule => {
    const currentQueue = batches?.length || 0
    
    const timeline = calculateProductionTimeline(
      newBatchData.recipe_id,
      newBatchData.batch_size || config.batch.default_size,
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
  error: any
} {
  const { batches, loading, error } = useProductionBatches({
    scheduled_date_from: date,
    scheduled_date_to: date
  })
  const { equipment } = useProductionEquipment({ status: 'available' })
  const { staff } = useProductionStaff({ active: true })

  const capacity = useMemo((): ProductionCapacity | null => {
    if (!batches || !equipment || !staff) return null

    const totalEquipmentCapacity = equipment.reduce((sum, eq) => sum + eq.capacity, 0)
    const totalStaffCapacity = staff.reduce((sum, s) => sum + s.max_concurrent_batches, 0)
    const total_capacity = Math.min(totalEquipmentCapacity, totalStaffCapacity)

    const used_capacity = batches.length
    const available_capacity = total_capacity - used_capacity

    const equipment_utilization: Record<string, number> = {}
    equipment.forEach(eq => {
      const usedBatches = batches.filter(b => 
        b.assigned_equipment_ids?.includes(eq.id)
      ).length
      equipment_utilization[eq.id] = eq.capacity > 0 ? (usedBatches / eq.capacity) * 100 : 0
    })

    const staff_workload: Record<string, number> = {}
    staff.forEach(s => {
      const assignedBatches = batches.filter(b => 
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
      scheduled_batches: batches.length,
      equipment_utilization,
      staff_workload
    }
  }, [batches, equipment, staff, date])

  return { capacity, loading, error }
}

// Batch status management
export function useBatchStatus(batchId: string) {
  const { updateBatch } = useProductionBatches()

  const updateStatus = async (newStatus: ProductionStatus, reason?: string) => {
    try {
      const updateData: UpdateBatchData = { 
        status: newStatus,
        internal_notes: reason ? `Status changed to ${newStatus}: ${reason}` : undefined
      }

      // Add timestamps for specific status changes
      const now = new Date().toISOString()
      if (newStatus === 'in_progress') {
        updateData.actual_start = now
      } else if (newStatus === 'completed') {
        updateData.actual_completion = now
      }

      await updateBatch(batchId, updateData)
    } catch (error) {
      throw new Error(`Failed to update batch status: ${error}`)
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
  error: any
} {
  const { batches, loading, error } = useProductionBatches(filters)

  const analytics = useMemo((): ProductionAnalytics | null => {
    if (!batches) return null

    const completedBatches = batches.filter(b => b.status === 'completed')
    const totalBatches = batches.length

    // Efficiency metrics
    const efficiencyBatches = completedBatches.filter(b => 
      b.actual_duration_minutes && b.estimated_duration_minutes
    )
    const average_batch_efficiency = efficiencyBatches.length > 0 
      ? efficiencyBatches.reduce((sum, b) => 
          sum + ((b.estimated_duration_minutes! / b.actual_duration_minutes!) * 100), 0
        ) / efficiencyBatches.length
      : 0

    const on_time_completion_rate = completedBatches.length > 0
      ? (completedBatches.filter(b => 
          b.actual_completion && b.scheduled_completion && 
          b.actual_completion <= b.scheduled_completion
        ).length / completedBatches.length) * 100
      : 0

    const qualityBatches = batches.filter(b => b.quality_score !== undefined)
    const quality_pass_rate = qualityBatches.length > 0
      ? (qualityBatches.filter(b => b.quality_status === 'passed').length / qualityBatches.length) * 100
      : 0

    // Cost analysis
    const costBatches = completedBatches.filter(b => b.actual_cost)
    const total_production_cost = costBatches.reduce((sum, b) => sum + (b.actual_cost || 0), 0)
    const total_units = costBatches.reduce((sum, b) => sum + (b.actual_quantity || b.planned_quantity), 0)
    const cost_per_unit = total_units > 0 ? total_production_cost / total_units : 0

    // Quality metrics
    const overall_quality_score = qualityBatches.length > 0
      ? qualityBatches.reduce((sum, b) => sum + (b.quality_score || 0), 0) / qualityBatches.length
      : 0

    const failed_batches = batches.filter(b => b.status === 'failed').length
    const defect_rate = totalBatches > 0 ? (failed_batches / totalBatches) * 100 : 0

    // Production volume
    const total_units_produced = completedBatches.reduce((sum, b) => 
      sum + (b.actual_quantity || b.planned_quantity), 0
    )

    const production_by_recipe: Record<string, { batches: number, units: number, revenue: number }> = {}
    completedBatches.forEach(batch => {
      if (!production_by_recipe[batch.recipe_id]) {
        production_by_recipe[batch.recipe_id] = { batches: 0, units: 0, revenue: 0 }
      }
      production_by_recipe[batch.recipe_id].batches++
      production_by_recipe[batch.recipe_id].units += (batch.actual_quantity || batch.planned_quantity)
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
        quality_by_stage: {}, // Would need quality check details
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
  const { 
    data: notifications, 
    loading, 
    error, 
    update,
    refresh
  } = useSupabaseData<ProductionNotification>({
    table: 'production_notifications',
    orderBy: [{ column: 'created_at', ascending: false }]
  })

  const markAsRead = async (notificationId: string) => {
    try {
      await update(notificationId, { read: true })
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error}`)
    }
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  return {
    notifications: notifications || [],
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications: refresh
  }
}

// Temperature monitoring
export function useTemperatureMonitoring(batchId: string) {
  const { 
    data: logs, 
    loading, 
    error, 
    create, 
    refresh
  } = useSupabaseCRUD<TemperatureLog>({
    table: 'temperature_logs',
    filter: [{ column: 'batch_id', operator: 'eq', value: batchId }],
    orderBy: [{ column: 'recorded_at', ascending: true }]
  })

  const addTemperatureReading = async (reading: Omit<TemperatureLog, 'id' | 'batch_id'>) => {
    try {
      await create({
        ...reading,
        batch_id: batchId
      })
    } catch (error) {
      throw new Error(`Failed to add temperature reading: ${error}`)
    }
  }

  return {
    temperatureLogs: logs || [],
    loading,
    error,
    addReading: addTemperatureReading,
    refreshLogs: refresh
  }
}

// Currency formatting for production costs
export function useProductionCurrency(currency?: string) {
  const defaultCurrency = DEFAULT_PRODUCTION_CONFIG.regional.currency

  const formatCost = (amount: number, options?: {
    showSymbol?: boolean
    showCode?: boolean
  }) => {
    return formatCurrency(amount, currency || defaultCurrency, options)
  }

  return {
    currency: currency || defaultCurrency,
    formatCost
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