/**
 * Batch Scheduling Service
 * Manages production batch scheduling and execution
 */

import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

// Use generated types
export type ProductionBatch = Database['public']['Tables']['productions']['Row']
export type ProductionBatchInsert = Database['public']['Tables']['productions']['Insert']

// Extended types for UI
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
      if (!response.ok) {throw new Error('Failed to fetch batches')}
      const data = await response.json()
      return data.batches || []
    } catch (err) {
      apiLogger.error({ err }, 'Error fetching scheduled batches')
      return []
    }
  }

  /**
   * Create a new batch
   */
  static async createBatch(batch: Partial<ProductionBatchInsert>): Promise<ProductionBatch | null> {
    try {
      const response = await fetch('/api/production/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      })
      if (!response.ok) {throw new Error('Failed to create batch')}
      return await response.json()
    } catch (err) {
      apiLogger.error({ err }, 'Error creating batch')
      return null
    }
  }

  /**
   * Update batch status
   */
  static async updateBatchStatus(
    batchId: string,
    status: Database['public']['Enums']['production_status']
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/production/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return response.ok
    } catch (err) {
      apiLogger.error({ err }, 'Error updating batch status')
      return false
    }
  }

  /**
   * Calculate production capacity
   */
  static calculateCapacity(batches: ProductionBatch[]): number {
    return batches.reduce((total, batch) => {
      if (batch.status !== 'CANCELLED') {
        return total + (batch.quantity || 0)
      }
      return total
    }, 0)
  }
}
