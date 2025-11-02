import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isRecord, hasKeys } from '@/lib/type-guards'


/**
 * Production Data Integration Service
 * Integrates production data with inventory and orders
 */


// Extended types for metrics
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
      if (startDate) {params.append('start_date', startDate)}
      if (endDate) {params.append('end_date', endDate)}

      const response = await fetch(`/api/production/metrics?${params}`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch metrics: ${errorText}`)
      }
      
      const data = await response.json()
      
      // Validate the response with type guards
      if (isRecord(data) && hasKeys(data, [
        'total_batches', 
        'completed_batches', 
        'in_progress_batches', 
        'total_quantity_produced', 
        'average_completion_time'
      ])) {
        return {
          total_batches: typeof data.total_batches === 'number' ? data.total_batches : 0,
          completed_batches: typeof data.completed_batches === 'number' ? data.completed_batches : 0,
          in_progress_batches: typeof data.in_progress_batches === 'number' ? data.in_progress_batches : 0,
          total_quantity_produced: typeof data.total_quantity_produced === 'number' ? data.total_quantity_produced : 0,
          average_completion_time: typeof data.average_completion_time === 'number' ? data.average_completion_time : 0
        }
      }
      
      apiLogger.warn({ data }, 'API returned unexpected format for production metrics')
      return {
        total_batches: 0,
        completed_batches: 0,
        in_progress_batches: 0,
        total_quantity_produced: 0,
        average_completion_time: 0
      }
    } catch (err) {
      const message = getErrorMessage(err)
      apiLogger.error({ error: message }, 'Error fetching production metrics')
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
    } catch (err) {
      const message = getErrorMessage(err)
      apiLogger.error({ error: message }, 'Error syncing with inventory')
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
    } catch (err) {
      const message = getErrorMessage(err)
      apiLogger.error({ error: message }, 'Error linking batch to order')
      return false
    }
  }
}
