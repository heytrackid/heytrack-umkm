// Production module - basic exports for now
export interface ProductionBatch {
  id: string
  batch_number: string
  recipe_id: string
  recipe_name: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  quantity: number
  scheduled_start: string
  scheduled_completion: string
  actual_start?: string
  actual_completion?: string
  created_at: string
  updated_at: string
}

export interface ProductionSchedule {
  id: string
  date: string
  batches: ProductionBatch[]
  capacity_used: number
  capacity_available: number
}

// Placeholder exports to resolve module imports
export const ProductionModule = {
  scheduleBatch: (batchData: Partial<ProductionBatch>) => {
    console.log('Batch scheduling not implemented yet')
    return null
  }
}

export default ProductionModule