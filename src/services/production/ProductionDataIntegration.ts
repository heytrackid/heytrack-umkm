/**
 * Production Data Integration Service
 * Integrates production data with inventory and orders
 */

import { apiLogger } from '@/lib/logger'
import type { ProductionBatch } from './BatchSchedulingService'

export interface ProductionMetrics {
  total_batches: number
  completed_batches: number
  in_progress_batches: number
  total_quantity_produced: number
  average_completion_time: number
}

export class ProductionDataIntegration {
  /**
   * Get production metrics
   */
  static async getProductionMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<ProductionMetrics> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(`/api/production/metrics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch metrics')
      
      return await response.json()
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching production metrics')
      return {
        total_batches: 0,
        completed_batches: 0,
        in_progress_batches: 0,
        total_quantity_produced: 0,
        average_completion_time: 0
      }
    }
  }

  /**
   * Sync production with inventory
   */
  static async syncWithInventory(batchId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/production/batches/${batchId}/sync-inventory`, {
        method: 'POST'
      })
      return response.ok
    } catch (error) {
      apiLogger.error({ error }, 'Error syncing with inventory')
      return false
    }
  }

  /**
   * Link production batch to order
   */
  static async linkToOrder(batchId: string, orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/production/batches/${batchId}/link-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      })
      return response.ok
    } catch (error) {
      apiLogger.error({ error }, 'Error linking batch to order')
      return false
    }
  }
}
