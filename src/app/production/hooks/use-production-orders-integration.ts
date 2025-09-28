// React hook for production-orders integration
'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ProductionOrdersIntegrationService,
  type SchedulingResult,
  type IngredientAvailability,
  type ProductionOrdersIntegrationConfig,
  DEFAULT_INTEGRATION_CONFIG 
} from '../services/production-orders-integration'
import { useSupabaseCRUD } from '@/hooks/useSupabaseCRUD'
import { useRealtimeData } from '@/hooks/useSupabaseData'
import type { ProductionBatch } from '../types/production.types'
import type { Order } from '../../orders/types/orders.types'

export interface UseProductionOrdersIntegrationOptions {
  autoScheduleEnabled?: boolean
  config?: Partial<ProductionOrdersIntegrationConfig>
}

export interface IntegrationState {
  isScheduling: boolean
  schedulingResult: SchedulingResult | null
  lastScheduledAt: string | null
  error: string | null
  pendingOrders: Order[]
  availableIngredients: IngredientAvailability[]
}

export function useProductionOrdersIntegration(
  options: UseProductionOrdersIntegrationOptions = {}
) {
  const { autoScheduleEnabled = true, config = {} } = options

  // Combine default config with user overrides
  const integrationConfig: ProductionOrdersIntegrationConfig = {
    ...DEFAULT_INTEGRATION_CONFIG,
    auto_schedule_enabled: autoScheduleEnabled,
    ...config
  }

  // Initialize integration service
  const [integrationService] = useState(
    () => new ProductionOrdersIntegrationService(
      undefined, // Use default production config
      undefined, // Use default orders config
      integrationConfig
    )
  )

  // State management
  const [state, setState] = useState<IntegrationState>({
    isScheduling: false,
    schedulingResult: null,
    lastScheduledAt: null,
    error: null,
    pendingOrders: [],
    availableIngredients: []
  })

  // Data hooks  
  const { 
    data: orders, 
    loading: ordersLoading,
    error: ordersError 
  } = useRealtimeData('orders', [])

  const { 
    data: batches, 
    loading: batchesLoading 
  } = useRealtimeData('productions', [])

  const { 
    data: ingredients,
    loading: ingredientsLoading 
  } = useRealtimeData('ingredients', [])

  const { 
    data: recipes,
    loading: recipesLoading 
  } = useRealtimeData('recipes', [])

  // CRUD operations for batches
  const batchCRUD = useSupabaseCRUD<ProductionBatch>('production_batches')

  // Transform ingredient data to availability format
  const transformIngredientsToAvailability = useCallback(
    (ingredientsData: any[]): IngredientAvailability[] => {
      return ingredientsData.map(ingredient => ({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        current_stock: ingredient.current_stock || 0,
        allocated_stock: ingredient.allocated_stock || 0,
        available_stock: Math.max(0, (ingredient.current_stock || 0) - (ingredient.allocated_stock || 0)),
        unit: ingredient.unit || 'unit',
        reorder_point: ingredient.reorder_point || 10,
        lead_time_days: ingredient.lead_time_days || 3
      }))
    },
    []
  )

  // Filter orders that need production scheduling
  const filterPendingOrders = useCallback((ordersList: Order[]): Order[] => {
    if (!ordersList) return []

    return ordersList.filter(order => {
      // Only include orders that don't have production batches yet
      const hasProductionBatch = batches?.some((batch: any) => 
        batch.order_ids?.includes(order.id)
      )
      return !hasProductionBatch
    })
  }, [batches])

  // Update state when data changes
  useEffect(() => {
    if (orders && ingredients) {
      const pendingOrders = filterPendingOrders(orders)
      const availableIngredients = transformIngredientsToAvailability(ingredients)

      setState(prev => ({
        ...prev,
        pendingOrders,
        availableIngredients,
        error: ordersError || null
      }))
    }
  }, [orders, ingredients, ordersError, filterPendingOrders, transformIngredientsToAvailability])

  // Schedule production from orders
  const scheduleProduction = useCallback(async (
    selectedOrders?: Order[]
  ): Promise<SchedulingResult | null> => {
    if (!orders || !batches || !recipes) {
      setState(prev => ({
        ...prev,
        error: 'Required data not loaded yet'
      }))
      return null
    }

    setState(prev => ({ ...prev, isScheduling: true, error: null }))

    try {
      const ordersToSchedule = selectedOrders || state.pendingOrders
      
      if (ordersToSchedule.length === 0) {
        setState(prev => ({
          ...prev,
          error: 'No orders available for scheduling',
          isScheduling: false
        }))
        return null
      }

      const result = await integrationService.scheduleProductionFromOrders(
        ordersToSchedule,
        batches,
        state.availableIngredients,
        recipes
      )

      // Create batches in database
      const createdBatches: ProductionBatch[] = []
      for (const batch of result.created_batches) {
        try {
          const createdBatch = await batchCRUD.create(batch)
          if (createdBatch) {
            createdBatches.push(createdBatch)
          }
        } catch (error) {
          console.error('Failed to create batch:', error)
        }
      }

      const finalResult: SchedulingResult = {
        ...result,
        created_batches: createdBatches,
        success: createdBatches.length > 0
      }

      setState(prev => ({
        ...prev,
        schedulingResult: finalResult,
        lastScheduledAt: new Date().toISOString(),
        isScheduling: false,
        error: finalResult.success ? null : 'Failed to create production batches'
      }))

      return finalResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isScheduling: false
      }))
      return null
    }
  }, [orders, batches, recipes, state.pendingOrders, state.availableIngredients, integrationService, batchCRUD])

  // Auto-schedule on data changes (if enabled)
  useEffect(() => {
    if (
      integrationConfig.auto_schedule_enabled &&
      state.pendingOrders.length > 0 &&
      !state.isScheduling &&
      !ordersLoading &&
      !batchesLoading &&
      !ingredientsLoading &&
      !recipesLoading
    ) {
      // Debounce auto-scheduling
      const timeoutId = setTimeout(() => {
        scheduleProduction()
      }, 2000) // 2 second delay

      return () => clearTimeout(timeoutId)
    }
  }, [
    state.pendingOrders.length,
    state.isScheduling,
    ordersLoading,
    batchesLoading,
    ingredientsLoading,
    recipesLoading,
    integrationConfig.auto_schedule_enabled,
    scheduleProduction
  ])

  // Calculate delivery timelines
  const calculateDeliveryTimelines = useCallback(() => {
    if (!batches || !orders) return []

    return integrationService.calculateDeliveryTimeline(batches, orders)
  }, [batches, orders, integrationService])

  // Get integration statistics
  const getIntegrationStats = useCallback(() => {
    const deliveryTimelines = calculateDeliveryTimelines()
    
    const stats = {
      totalPendingOrders: state.pendingOrders.length,
      totalActiveBatches: batches?.length || 0,
      ingredientShortages: state.availableIngredients.filter(
        ingredient => ingredient.available_stock <= ingredient.reorder_point
      ).length,
      onTimeDeliveries: deliveryTimelines.filter(
        timeline => timeline.on_time_probability > 0.8
      ).length,
      atRiskDeliveries: deliveryTimelines.filter(
        timeline => timeline.on_time_probability < 0.5
      ).length,
      lastSchedulingSuccess: state.schedulingResult?.success || false,
      totalScheduledBatches: state.schedulingResult?.created_batches.length || 0,
      totalSkippedOrders: state.schedulingResult?.skipped_orders.length || 0
    }

    return stats
  }, [state, batches, calculateDeliveryTimelines])

  // Check if auto-scheduling is due
  const isAutoScheduleDue = useCallback(() => {
    if (!integrationConfig.auto_schedule_enabled) return false
    if (state.pendingOrders.length === 0) return false
    
    // Check if there are new orders since last scheduling
    if (!state.lastScheduledAt) return true
    
    const lastScheduled = new Date(state.lastScheduledAt)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    return lastScheduled < oneHourAgo
  }, [integrationConfig.auto_schedule_enabled, state.pendingOrders.length, state.lastScheduledAt])

  // Manual scheduling trigger
  const triggerManualScheduling = useCallback(async (orderIds?: string[]) => {
    const selectedOrders = orderIds 
      ? state.pendingOrders.filter(order => orderIds.includes(order.id))
      : undefined

    return await scheduleProduction(selectedOrders)
  }, [state.pendingOrders, scheduleProduction])

  // Clear scheduling results
  const clearSchedulingResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      schedulingResult: null,
      error: null
    }))
  }, [])

  // Update integration configuration
  const updateConfig = useCallback((newConfig: Partial<ProductionOrdersIntegrationConfig>) => {
    const updatedConfig = { ...integrationConfig, ...newConfig }
    integrationService['integrationConfig'] = updatedConfig
  }, [integrationConfig, integrationService])

  return {
    // State
    ...state,
    isLoading: ordersLoading || batchesLoading || ingredientsLoading || recipesLoading,
    
    // Data
    orders: orders || [],
    batches: batches || [],
    ingredients: ingredients || [],
    recipes: recipes || [],
    
    // Actions
    scheduleProduction: triggerManualScheduling,
    clearSchedulingResult,
    updateConfig,
    
    // Computed values
    deliveryTimelines: calculateDeliveryTimelines(),
    integrationStats: getIntegrationStats(),
    isAutoScheduleDue: isAutoScheduleDue(),
    
    // Configuration
    config: integrationConfig
  }
}

export type UseProductionOrdersIntegrationReturn = ReturnType<typeof useProductionOrdersIntegration>