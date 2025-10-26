/**
 * Batch Scheduling Service
 * Manages production batch scheduling and execution
 */

import { apiLogger } from '@/lib/logger'

export interface ProductionBatch {
  id: string
  recipe_id: string
  recipe_name: string
  quantity: number
  scheduled_date: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  estimated_duration: number
  actual_duration?: number
  created_at: string
  updated_at: string
}

export interface BatchSchedule {
  batches: ProductionBatch[]
  total_capacity: number
  available_capacity: number
}

export class BatchSchedulingService {
  /**
   * Get all scheduled batches
   */
  static async getScheduledBatches(): Promise<ProductionBatch[]> {
    try {
      const response = await fetch('/api/production/batches')
      if (!response.ok) throw new Error('Failed to fetch batches')
      const data = await response.json()
      return data.batches || []
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching scheduled batches')
      return []
    }
  }

  /**
   * Create a new batch
   */
  static async createBatch(batch: Partial<ProductionBatch>): Promise<ProductionBatch | null> {
    try {
      const response = await fetch('/api/production/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      })
      if (!response.ok) throw new Error('Failed to create batch')
      return await response.json()
    } catch (error) {
      apiLogger.error({ error }, 'Error creating batch')
      return null
    }
  }

  /**
   * Update batch status
   */
  static async updateBatchStatus(
    batchId: string,
    status: ProductionBatch['status']
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/production/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return response.ok
    } catch (error) {
      apiLogger.error({ error }, 'Error updating batch status')
      return false
    }
  }

  /**
   * Calculate production capacity
   */
  static calculateCapacity(batches: ProductionBatch[]): number {
    return batches.reduce((total, batch) => {
      if (batch.status !== 'CANCELLED') {
        return total + batch.quantity
      }
      return total
    }, 0)
  }
}
