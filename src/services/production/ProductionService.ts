import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'
import { VALID_PRODUCTION_STATUS_TRANSITIONS } from '@/lib/validations/domains/production'

import type { Database, ProductionBatchInsert, ProductionBatchUpdate } from '@/types/database'

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
  planned_quantity: number
  actual_quantity?: number
  status: string
  planned_start_time?: string
  actual_start_time?: string
  planned_end_time?: string
  actual_end_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductionBatchWithDetails extends ProductionBatch {
  labor_cost?: number
  overhead_cost?: number
  total_cost?: number
  efficiency?: number
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

export class ProductionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getProductionBatches(
    userId: string,
    filters: {
      status?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<ProductionBatchesList> {
    const { status, limit = 50, offset = 0 } = filters

    try {
      let query = this.supabase
        .from('production_batches')
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        apiLogger.error({ error, userId, filters }, 'Failed to fetch production batches')
        throw error
      }

      const batches: ProductionBatch[] = (data as ProductionBatchWithRecipe[] || []).map((batch) => ({
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        planned_quantity: batch.quantity,
        status: batch.status || '',
        planned_start_time: batch.planned_date,
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
      apiLogger.error({ error, userId, filters }, 'Failed to get production batches')
      throw error
    }
  }

  async getProductionBatch(userId: string, batchId: string): Promise<ProductionBatchWithDetails> {
    try {
      const { data, error } = await this.supabase
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
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        apiLogger.error({ error, userId, batchId }, 'Failed to fetch production batch')
        throw new Error('Production batch not found')
      }

      const batch = data as ProductionBatchWithRecipe
      return {
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        planned_quantity: batch.quantity,
        status: batch.status || '',
        planned_start_time: batch.planned_date,
        ...(batch.started_at && { actual_start_time: batch.started_at }),
        ...(batch.completed_at && { actual_end_time: batch.completed_at }),
        ...(batch.notes && { notes: batch.notes }),
        ...(batch.actual_cost && { labor_cost: batch.actual_cost as number, total_cost: batch.actual_cost as number }),
        created_at: batch.created_at || '',
        updated_at: batch.updated_at || ''
      }
    } catch (error) {
      apiLogger.error({ error, userId, batchId }, 'Failed to get production batch')
      throw error
    }
  }

  async createProductionBatch(userId: string, batchData: ProductionBatchCreateData): Promise<ProductionBatch> {
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
        user_id: userId,
        ...(batchData.notes && { notes: batchData.notes })
      }

      const { data, error } = await this.supabase
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
        apiLogger.error({ error, userId, batchData }, 'Failed to create production batch')
        throw error
      }

      const typedData = data as ProductionBatchWithRecipe
      const batch: ProductionBatch = {
        id: typedData.id,
        recipe_id: typedData.recipe_id,
        recipe_name: typedData.recipes?.name || 'Unknown Recipe',
        planned_quantity: typedData.quantity,
        status: typedData.status || '',
        planned_start_time: typedData.planned_date,
        ...(typedData.notes && { notes: typedData.notes }),
        created_at: typedData.created_at || '',
        updated_at: typedData.updated_at || '',
      }

      apiLogger.info({ userId, batchId: batch.id, recipeId: batch.recipe_id }, 'Production batch created successfully')

      return batch
    } catch (error) {
      apiLogger.error({ error, userId, batchData }, 'Failed to create production batch')
      throw error
    }
  }

  async updateProductionBatch(
    userId: string,
    batchId: string,
    updateData: ProductionBatchUpdateData
  ): Promise<ProductionBatchWithDetails> {
    try {
      // Validate status transition if status is being updated
      if (updateData.status) {
        const currentBatch = await this.getProductionBatch(userId, batchId)
        const validTransitions = VALID_PRODUCTION_STATUS_TRANSITIONS[currentBatch.status] || []

        if (!validTransitions.includes(updateData.status)) {
          throw new Error(`Invalid status transition from ${currentBatch.status} to ${updateData.status}`)
        }
      }

      const { data, error } = await this.supabase
        .from('production_batches')
        .update(updateData as ProductionBatchUpdate)
        .eq('id', batchId)
        .eq('user_id', userId)
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
        apiLogger.error({ error, userId, batchId, updateData }, 'Failed to update production batch')
        throw error
      }

      const batch = data as ProductionBatchWithRecipe
      const updatedBatch = {
        id: batch.id,
        recipe_id: batch.recipe_id,
        recipe_name: batch.recipes?.name || 'Unknown Recipe',
        planned_quantity: batch.quantity,

        status: batch.status || '',
        planned_start_time: batch.planned_date,
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

      apiLogger.info({ userId, batchId, status: updateData.status }, 'Production batch updated successfully')

      return updatedBatch
    } catch (error) {
      apiLogger.error({ error, userId, batchId, updateData }, 'Failed to update production batch')
      throw error
    }
  }

  async deleteProductionBatch(userId: string, batchId: string): Promise<void> {
    try {
      // Check if batch can be deleted (only planned or cancelled batches)
      const batch = await this.getProductionBatch(userId, batchId)

      if (!['PLANNED', 'CANCELLED'].includes(batch.status)) {
        throw new Error('Only planned or cancelled batches can be deleted')
      }

      const { error } = await this.supabase
        .from('production_batches')
        .delete()
        .eq('id', batchId)
        .eq('user_id', userId)

      if (error) {
        apiLogger.error({ error, userId, batchId }, 'Failed to delete production batch')
        throw error
      }

      apiLogger.info({ userId, batchId }, 'Production batch deleted successfully')
    } catch (error) {
      apiLogger.error({ error, userId, batchId }, 'Failed to delete production batch')
      throw error
    }
  }
}