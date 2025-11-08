

/**
 * Business Services Types
 * Type definitions for business service operations
 */



export interface ProductionBatch {
  id: string
  status: 'completed' | 'failed' | 'in_progress' | 'pending'
  recipe_id: string
  quantity: number
  scheduled_date: string
  completed_date?: string
  notes?: string
}

export interface ReorderSummary {
  items: Array<{
    id: string
    name: string
    current_stock: number
    min_stock: number
    reorder_quantity: number
    urgency: 'high' | 'low' | 'medium'
  }>
  totalItems: number
  criticalItems: number
}
