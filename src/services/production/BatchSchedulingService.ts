import { apiLogger } from '@/lib/logger'
import { isArrayOf, isProductionBatch, getErrorMessage } from '@/lib/type-guards'

import type { Row, Insert, ProductionStatus } from '@/types/database'


/**
 * Batch Scheduling Service
 * Manages production batch scheduling and execution
 */


// Use generated types
export type ProductionBatch = Row<'productions'>
export type ProductionBatchInsert = Insert<'productions'>

// Extended type for UI components that need joined data
export interface ProductionBatchWithDetails extends ProductionBatch {
  // Joined fields from recipes table
  recipe_name?: string
  
  // Computed fields that should be provided by the API
  priority?: number
  estimated_duration?: number
  
  // Mapped fields from the API response
  batch_number?: string
  planned_date?: string
  scheduled_start?: string
  scheduled_end?: string
  actual_cost?: number
  unit?: string
}

// Production capacity tracking
export interface ProductionCapacity {
  batches: ProductionBatch[]
  total_capacity: number
  available_capacity: number
}
// Timeline and scheduling types
export interface TimelineSlot {
  batch_id: string
  resource_type: 'decorator' | 'mixer' | 'oven' | 'packaging'
  resource_id: string
  start_time: string
  end_time: string
  status: 'available' | 'blocked' | 'occupied'
}

export interface SchedulingResult {
  schedule: ProductionBatchWithDetails[]
  timeline: TimelineSlot[]
  resource_utilization: {
    oven_utilization: number
    mixer_utilization: number
    decorator_utilization: number
    packaging_utilization: number
  }
  warnings: string[]
  optimization_suggestions: string[]
}

export interface ProductionConstraints {
  oven_capacity: number
  mixing_stations: number
  decorating_stations: number
  packaging_capacity: number
  bakers_available: number
  decorators_available: number
  shift_start: string
  shift_end: string
  break_times: Array<{ start: string; end: string }>
  setup_time_minutes: number
  cleanup_time_minutes: number
}

export class BatchSchedulingService {
  /**
   * Get all scheduled batches
   */
  static async getScheduledBatches(): Promise<ProductionBatchWithDetails[]> {
    try {
      const response = await fetch('/api/production/batches', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch batches: ${errorText}`)
      }
      const data = await response.json()

      // Validate the data structure with type guards
      if (Array.isArray(data)) {
        // If the API returns an array directly
        if (isArrayOf(data, isProductionBatch)) {
          return data
        }
      } else if (data && typeof data === 'object') {
        // If the API returns an object with batches property
        if (Array.isArray(data.batches) && isArrayOf(data.batches, isProductionBatch)) {
          return data.batches
        }
        // Or if it returns other properties
        if (isArrayOf(data, isProductionBatch)) {
          return data
        }
      }
      
      apiLogger.warn({ data }, 'API returned unexpected format for batches')
      return []
    } catch (error) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Error fetching scheduled batches')
      return []
    }
  }

  /**
   * Create a new batch
   */
  static async createBatch(batch: Partial<ProductionBatchInsert>): Promise<ProductionBatchWithDetails | null> {
    try {
      const response = await fetch('/api/production/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create batch: ${errorText}`)
      }
      const data = await response.json()

      // Validate the response with type guards
      if (isProductionBatch(data)) {
        return data
      }

      apiLogger.warn({ data }, 'API returned unexpected format for created batch')
      return null
    } catch (error) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Error creating batch')
      return null
    }
  }

  /**
   * Update batch status
   */
  static async updateBatchStatus(
    batchId: string,
    status: ProductionStatus
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/production/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include', // Include cookies for authentication
      })
      return response.ok
    } catch (error) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Error updating batch status')
      return false
    }
  }

  /**
   * Calculate production capacity
   */
  static calculateCapacity(batches: ProductionBatch[]): number {
    return batches.reduce((total, batch) => {
      if (batch['status'] !== 'CANCELLED') {
        return total + (batch.quantity || 0)
      }
      return total
    }, 0)
  }

  /**
   * Get production capacity constraints
   */
  static async getProductionCapacity(): Promise<ProductionConstraints> {
    try {
      const response = await fetch('/api/production/capacity', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch production capacity')
      }
      const data = await response.json()
      return data as ProductionConstraints
    } catch (error) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Error fetching production capacity')
      // Return default constraints
      return {
        oven_capacity: 4,
        mixing_stations: 2,
        decorating_stations: 1,
        packaging_capacity: 50,
        bakers_available: 2,
        decorators_available: 1,
        shift_start: "06:00",
        shift_end: "18:00",
        break_times: [
          { start: "10:00", end: "10:15" },
          { start: "14:00", end: "14:30" }
        ],
        setup_time_minutes: 15,
        cleanup_time_minutes: 10
      }
    }
  }

  /**
   * Update production capacity constraints
   */
  static async updateProductionConstraints(constraints: ProductionConstraints): Promise<boolean> {
    try {
      const response = await fetch('/api/production/capacity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
        credentials: 'include', // Include cookies for authentication
      })
      return response.ok
    } catch (error) {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Error updating production constraints')
      return false
    }
  }
}

// Export singleton instance
export const batchSchedulingService = BatchSchedulingService
