import { uiLogger } from '@/lib/logger'
import type {

  ProductionsTable,
  ProductionsInsert,
  ProductionsUpdate,
  ProductionStatus as ProductionStatusEnum
} from '@/types/database'

// Production module - use generated Supabase types

// Base types from generated schema
export type Production = ProductionsTable
export type ProductionInsert = ProductionsInsert
export type ProductionUpdate = ProductionsUpdate
export type ProductionStatus = ProductionStatusEnum

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

export const ProductionModule = {
  scheduleBatch: (batchData: Partial<ProductionBatch>) => {
    uiLogger.debug({ batchData }, 'Batch scheduling not implemented yet')
    return null
  }
}

export default ProductionModule
