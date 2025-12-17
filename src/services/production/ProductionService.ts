import { apiLogger } from '@/lib/logger'
import { VALID_PRODUCTION_STATUS_TRANSITIONS } from '@/lib/validations/domains/production'
import { BaseService, type ServiceContext } from '@/services/base'

import type { ProductionBatchInsert, ProductionBatchUpdate } from '@/types/database'

type ProductionBatchRow = {
  actual_cost: number | null
  batch_number: string
  completed_at: string | null
  created_at: string | null
  id: string
  notes: string | null
  planned_date: string
  quantity: number
  recipe_id: string
  started_at: string | null
  status: string | null
  unit: string
  updated_at: string | null
  user_id: string
}

type ProductionBatchWithRecipe = ProductionBatchRow & { recipes?: { name: string } | null }

export interface ProductionBatch {
  id: string
  recipe_id: string
  recipe_name: string
  batch_number: string
  planned_quantity: number
  quantity: number
  actual_quantity?: number | undefined
  status: string
  planned_date: string
  planned_start_time?: string | undefined
  actual_start_time?: string | undefined
  planned_end_time?: string | undefined
  actual_end_time?: string | undefined
  unit: string
  actual_cost?: number | undefined
  notes?: string | undefined
  started_at?: string | null | undefined
  completed_at?: string | null | undefined
  created_at: string
  updated_at: string
}

export interface ProductionBatchWithDetails extends ProductionBatch {
  labor_cost?: number | undefined
  overhead_cost?: number | undefined
  total_cost?: number | undefined
  efficiency?: number | undefined
  yield_percentage?: number | undefined
  waste_quantity?: number | undefined
}

export interface ProductionBatchCreateData {
  recipe_id: string
  quantity: number
  planned_date?: string
  notes?: string | null
}

export interface ProductionBatchUpdateData {
  status?: string
  actual_quantity?: number
  actual_start_time?: string
  actual_end_time?: string
  labor_cost?: number
  overhead_cost?: number
  notes?: string | null
}

export interface ProductionBatchesList {
  data: ProductionBatch[]
  total: number
  page: number
  limit: number
}

export class ProductionService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  async getProductionBatches(
    filters: {
      status?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<ProductionBatchesList> {
    const { status, limit = 50, offset = 0 } = filters

    try {
      let query = this.context.supabase
        .from('production_batches')
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `, { count: 'exact' })
        .eq('user_id', this.context.userId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        apiLogger.error({ error, userId: this.context.userId, filters }, 'Failed to fetch production batches')
        throw error
      }

      const batches: ProductionBatch[] = (data as ProductionBatchWithRecipe[] || []).map((batch) => ({
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        batch_number: batch.batch_number,
        planned_quantity: batch.quantity,
        quantity: batch.quantity,
        status: batch.status || '',
        planned_date: batch.planned_date,
        planned_start_time: batch.planned_date,
        unit: batch.unit,
        actual_cost: batch.actual_cost ?? undefined,
        started_at: batch.started_at,
        completed_at: batch.completed_at,
        ...(batch.started_at && { actual_start_time: batch.started_at }),
        ...(batch.completed_at && { actual_end_time: batch.completed_at }),
        ...(batch.notes && { notes: batch.notes }),
        created_at: batch.created_at || '',
        updated_at: batch.updated_at || ''
      }))

      return {
        data: batches,
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit
      }
    } catch (error) {
      apiLogger.error({ error, userId: this.context.userId, filters }, 'Failed to get production batches')
      throw error
    }
  }

  async getProductionBatch(batchId: string): Promise<ProductionBatchWithDetails> {
    try {
      const { data, error } = await this.context.supabase
        .from('production_batches')
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `)
        .eq('id', batchId)
        .eq('user_id', this.context.userId)
        .single()

      if (error || !data) {
        apiLogger.error({ error, userId: this.context.userId, batchId }, 'Failed to fetch production batch')
        throw new Error('Production batch not found')
      }

      const batch = data as ProductionBatchWithRecipe
      
      // Calculate yield percentage if we have actual quantity
      let yieldPercentage: number | undefined
      let wasteQuantity: number | undefined
      
      // Calculate yield using actual_quantity from the new schema field
      const actualQuantity = (batch as unknown as { actual_quantity?: number }).actual_quantity
      if (actualQuantity && batch.quantity > 0) {
        yieldPercentage = (actualQuantity / batch.quantity) * 100
        wasteQuantity = Math.max(0, batch.quantity - actualQuantity)
      }
      
      return {
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        batch_number: batch.batch_number,
        planned_quantity: batch.quantity,
        quantity: batch.quantity,
        status: batch.status || '',
        planned_date: batch.planned_date,
        planned_start_time: batch.planned_date,
        unit: batch.unit,
        actual_cost: batch.actual_cost ?? undefined,
        started_at: batch.started_at,
        completed_at: batch.completed_at,
        ...(batch.started_at && { actual_start_time: batch.started_at }),
        ...(batch.completed_at && { actual_end_time: batch.completed_at }),
        ...(batch.notes && { notes: batch.notes }),
        ...(batch.actual_cost && { labor_cost: batch.actual_cost as number, total_cost: batch.actual_cost as number }),
        ...(yieldPercentage !== undefined && { yield_percentage: yieldPercentage }),
        ...(wasteQuantity !== undefined && { waste_quantity: wasteQuantity }),
        created_at: batch.created_at || '',
        updated_at: batch.updated_at || ''
      }
    } catch (error) {
      apiLogger.error({ error, userId: this.context.userId, batchId }, 'Failed to get production batch')
      throw error
    }
  }

  async createProductionBatch(batchData: ProductionBatchCreateData): Promise<ProductionBatch> {
    return this.executeWithAudit(
      async () => {
        try {
          // Generate batch number
          const batchNumber = `PB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

          const plannedDate = (batchData.planned_date ?? new Date().toISOString().split('T')[0]) as string
          const insertData: ProductionBatchInsert = {
            batch_number: batchNumber,
            recipe_id: batchData.recipe_id,
            quantity: batchData.quantity,
            unit: 'batch', // Default unit
            planned_date: plannedDate,
            status: 'PLANNED',
            user_id: this.context.userId,
            ...(batchData.notes && { notes: batchData.notes })
          }

          const { data, error } = await this.context.supabase
        .from('production_batches')
        .insert(insertData as never)
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `)
        .single()

          if (error) {
            apiLogger.error({ error, userId: this.context.userId, batchData }, 'Failed to create production batch')
            throw error
          }

          const typedData = data as ProductionBatchWithRecipe
          const batch: ProductionBatch = {
            id: typedData.id,
            recipe_id: typedData.recipe_id,
            recipe_name: typedData.recipes?.name || 'Unknown Recipe',
            batch_number: typedData.batch_number,
            planned_quantity: typedData.quantity,
            quantity: typedData.quantity,
            status: typedData.status || '',
            planned_date: typedData.planned_date,
            planned_start_time: typedData.planned_date,
            unit: typedData.unit,
            actual_cost: typedData.actual_cost ?? undefined,
            started_at: typedData.started_at,
            completed_at: typedData.completed_at,
            ...(typedData.notes && { notes: typedData.notes }),
            created_at: typedData.created_at || '',
            updated_at: typedData.updated_at || '',
          }

          apiLogger.info({ userId: this.context.userId, batchId: batch.id, recipeId: batch.recipe_id }, 'Production batch created successfully')

          return batch
        } catch (error) {
          apiLogger.error({ error, userId: this.context.userId, batchData }, 'Failed to create production batch')
          throw error
        }
      },
      'CREATE',
      'PRODUCTION_BATCH',
      undefined,
      { batchData }
    )
  }

  async updateProductionBatch(
    batchId: string,
    updateData: ProductionBatchUpdateData
  ): Promise<ProductionBatchWithDetails> {
    return this.executeWithAudit(
      async () => {
        try {
          // Validate status transition if status is being updated
          if (updateData.status) {
            const currentBatch = await this.getProductionBatch(batchId)
        const validTransitions = VALID_PRODUCTION_STATUS_TRANSITIONS[currentBatch.status] || []

        if (!validTransitions.includes(updateData.status)) {
          throw new Error(`Invalid status transition from ${currentBatch.status} to ${updateData.status}`)
        }
      }

          const { data, error } = await this.context.supabase
            .from('production_batches')
            .update(updateData as ProductionBatchUpdate)
            .eq('id', batchId)
            .eq('user_id', this.context.userId)
            .select(`
              *,
              recipes (
                id,
                name,
                category
              )
            `)
            .single()

          if (error) {
            apiLogger.error({ error, userId: this.context.userId, batchId, updateData }, 'Failed to update production batch')
            throw error
          }

      const batch = data as ProductionBatchWithRecipe
      const updatedBatch: ProductionBatchWithDetails = {
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        batch_number: batch.batch_number,
        planned_quantity: batch.quantity,
        quantity: batch.quantity,
        status: batch.status || '',
        planned_date: batch.planned_date,
        planned_start_time: batch.planned_date,
        unit: batch.unit,
        actual_cost: batch.actual_cost ?? undefined,
        started_at: batch.started_at,
        completed_at: batch.completed_at,
        ...(batch.started_at && { actual_start_time: batch.started_at }),
        ...(batch.completed_at && { actual_end_time: batch.completed_at }),
        ...(batch.notes && { notes: batch.notes }),
        ...(batch.actual_cost && { labor_cost: batch.actual_cost }),
        ...(batch.actual_cost && { total_cost: batch.actual_cost }),
        created_at: batch.created_at || '',
        updated_at: batch.updated_at || ''
      }

          // Status change logging
          if (updateData.status) {
            apiLogger.info({ batchId, oldStatus: batch['status'], newStatus: updateData.status }, 'Production batch status changed')
          }

          apiLogger.info({ userId: this.context.userId, batchId, status: updateData.status }, 'Production batch updated successfully')

          return updatedBatch
        } catch (error) {
          apiLogger.error({ error, userId: this.context.userId, batchId, updateData }, 'Failed to update production batch')
          throw error
        }
      },
      'UPDATE',
      'PRODUCTION_BATCH',
      batchId,
      { updateData }
    )
  }

  async deleteProductionBatch(batchId: string): Promise<void> {
    return this.executeWithAudit(
      async () => {
        try {
          // Check if batch can be deleted (only planned or cancelled batches)
          const batch = await this.getProductionBatch(batchId)

      if (!['PLANNED', 'CANCELLED'].includes(batch.status)) {
        throw new Error('Only planned or cancelled batches can be deleted')
      }

          const { error } = await this.context.supabase
            .from('production_batches')
            .delete()
            .eq('id', batchId)
            .eq('user_id', this.context.userId)

          if (error) {
            apiLogger.error({ error, userId: this.context.userId, batchId }, 'Failed to delete production batch')
            throw error
          }

          apiLogger.info({ userId: this.context.userId, batchId }, 'Production batch deleted successfully')
        } catch (error) {
          apiLogger.error({ error, userId: this.context.userId, batchId }, 'Failed to delete production batch')
          throw error
        }
      },
      'DELETE',
      'PRODUCTION_BATCH',
      batchId
    )
  }
}