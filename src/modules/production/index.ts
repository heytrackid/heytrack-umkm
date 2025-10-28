// Production module - use generated Supabase types
import type { Database } from '@/types/supabase-generated'

// Base types from generated schema
export type Production = Database['public']['Tables']['productions']['Row']
export type ProductionInsert = Database['public']['Tables']['productions']['Insert']
export type ProductionUpdate = Database['public']['Tables']['productions']['Update']
export type ProductionStatus = Database['public']['Enums']['production_status']

// Backward compatibility aliases
export type ProductionBatch = Production
export type ProductionBatchInsert = ProductionInsert
export type ProductionBatchUpdate = ProductionUpdate

// Extended types for UI
export interface ProductionSchedule {
  id: string
  date: string
  batches: ProductionBatch[]
  capacity_used: number
  capacity_available: number
}

// Placeholder exports to resolve module imports
import { uiLogger } from '@/lib/logger'

export const ProductionModule = {
  scheduleBatch: (batchData: Partial<ProductionBatch>) => {
    uiLogger.debug({ batchData }, 'Batch scheduling not implemented yet')
    return null
  }
}

export default ProductionModule
