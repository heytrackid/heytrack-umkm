
import { productionLogger } from '@/lib/logger'
import { isIngredient } from '@/lib/type-guards'

import type { ProductionBatch } from '@/lib/business-services/types'



/**
 * Production Services
 * Service for production management operations
 */






export class ProductionServices {
  private static instance: ProductionServices

  private constructor() {}

  static getInstance(): ProductionServices {
    if (!ProductionServices.instance) {
      ProductionServices.instance = new ProductionServices()
    }
    return ProductionServices.instance
  }

  async scheduleProductionBatch(batch: Omit<ProductionBatch, 'id' | 'status'>): Promise<ProductionBatch> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()

      // Validate recipe exists and is active
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('id, name, user_id, is_active')
        .eq('id', batch.recipe_id)
        .eq('is_active', true)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found or inactive: ${batch.recipe_id}`)
      }

      // Check if we have enough ingredients for production
      const canProduce = await this.checkProductionFeasibility(batch.recipe_id, batch.quantity)
      if (!canProduce.feasible) {
        throw new Error(`Insufficient ingredients: ${canProduce.insufficientIngredients.join(', ')}`)
      }

      // Generate batch ID
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newBatch: ProductionBatch = {
        ...batch,
        id: batchId,
        status: 'pending',
        scheduled_date: batch.scheduled_date || new Date().toISOString(),
        notes: batch.notes ?? `Production batch for ${recipe.name}`
      }

      // Save to production_batches table
      const { createClient: createClientForBatch } = await import('@/utils/supabase/server')
      const batchSupabase = await createClientForBatch()

      const batchData = {
        batch_no: batchId,
        recipe_id: batch.recipe_id,
        planned_quantity: batch.quantity,
        produced_quantity: 0,
        status: 'planned',
        notes: newBatch.notes,
        created_by: recipe.user_id,
        user_id: recipe.user_id
      }

      const { error: insertError } = await supabase
        .from('production_batches')
        .insert(batchData as never)

      if (insertError) {
        productionLogger.error({ insertError, batchData }, 'Failed to save production batch')
        throw insertError
      }

      // Reserve ingredients for production
      await this.reserveIngredientsForProduction(batch.recipe_id, batch.quantity)

      productionLogger.info({ batchId, recipeId: batch.recipe_id, quantity: batch.quantity }, 'Production batch scheduled successfully')
      return newBatch
    } catch (error) {
      productionLogger.error({ error, recipeId: batch.recipe_id }, 'Error in scheduleProductionBatch')
      throw error
    }
  }

  async checkProductionFeasibility(recipeId: string, quantity: number): Promise<{
    feasible: boolean
    insufficientIngredients: string[]
    requiredIngredients: Array<{
      ingredient_id: string
      ingredient_name: string
      required_quantity: number
      available_quantity: number
      unit: string
    }>
  }> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()

      // Get recipe with ingredients
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            ingredient_id,
            quantity_needed,
            ingredients (
              id,
              name,
              current_stock,
              unit
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`_Recipe not found: ${recipeId}`)
      }

      const recipeIngredients = (recipe as unknown as { recipe_ingredients: Array<{ ingredient_id: string; quantity_needed: number; ingredients: unknown }> }).recipe_ingredients ?? []
      const insufficientIngredients: string[] = []
      const requiredIngredients: Array<{
        ingredient_id: string
        ingredient_name: string
        required_quantity: number
        available_quantity: number
        unit: string
      }> = []

      let feasible = true

      for (const ri of recipeIngredients) {
        if (!ri.ingredients) {
          productionLogger.warn({ recipeId, ingredientId: ri.ingredient_id }, 'Missing ingredient data for recipe ingredient')
          continue
        }
        
        // Use type guard to validate ingredient data
        if (!isIngredient(ri.ingredients)) {
          productionLogger.warn({ recipeId, ingredientId: ri.ingredient_id }, 'Invalid ingredient data structure')
          continue
        }
        
        const ingredient = ri.ingredients
        const requiredQuantity = ri.quantity_needed * quantity
        const availableQuantity = ingredient.current_stock ?? 0

        requiredIngredients.push({
          ingredient_id: ingredient['id'],
          ingredient_name: ingredient.name,
          required_quantity: requiredQuantity,
          available_quantity: availableQuantity,
          unit: ingredient.unit ?? 'pcs'
        })

        if (availableQuantity < requiredQuantity) {
          feasible = false
          insufficientIngredients.push(`${ingredient.name} (butuh: ${requiredQuantity}, tersedia: ${availableQuantity})`)
        }
      }

      return {
        feasible,
        insufficientIngredients,
        requiredIngredients
      }
    } catch (error) {
      productionLogger.error({ error, recipeId, quantity }, 'Error in checkProductionFeasibility')
      return {
        feasible: false,
        insufficientIngredients: ['Error checking feasibility'],
        requiredIngredients: []
      }
    }
  }

  private async reserveIngredientsForProduction(recipeId: string, quantity: number): Promise<void> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()

      // Get recipe ingredients
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('ingredients')
        .eq('id', recipeId)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }

      // Reserve each ingredient
      for (const ingredient of (recipe as unknown as { recipe_ingredients: unknown[] }).recipe_ingredients || []) {
        const ing = ingredient as { ingredient_id: string; quantity: number; ingredients: { name: string; current_stock: number; unit: string } }
        const requiredAmount = ing.quantity * quantity

        // Create reservation record
        const { error: reservationError } = await supabase
          .from('stock_reservations')
          .insert({
            ingredient_id: ing.ingredient_id,
            recipe_id: recipeId,
            quantity: requiredAmount,
            status: 'reserved',
            created_at: new Date().toISOString()
          } as never)

        if (reservationError) {
          productionLogger.error({ reservationError, ingredient: ing.ingredient_id }, 'Failed to reserve ingredient')
          throw reservationError
        }
      }

      productionLogger.info({ recipeId, quantity }, 'Ingredients reserved for production')
    } catch (error) {
      productionLogger.error({ error, recipeId }, 'Error reserving ingredients')
      throw error
    }
  }

  async updateBatchStatus(batchId: string, status: ProductionBatch['status']): Promise<void> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const normalizedStatus = status === 'pending' ? 'planned' : status

      const { error } = await supabase
        .from('production_batches')
        .update({
          status: normalizedStatus,
          updated_at: new Date().toISOString(),
          completed_at: normalizedStatus === 'completed' ? new Date().toISOString() : null
        } as never)
        .eq('id', batchId)

      if (error) {
        throw error
      }

      productionLogger.info({ batchId, status: normalizedStatus }, 'Production batch status updated')
    } catch (error) {
      productionLogger.error({ error, batchId, status }, 'Error in updateBatchStatus')
      throw error
    }
  }

  async getActiveBatches(): Promise<ProductionBatch[]> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('production_batches')
        .select('id, status, recipe_id, quantity, planned_date, completed_at, notes')
        .in('status', ['planned', 'in_progress'])
        .order('planned_date', { ascending: true })

      if (error) {
        throw error
      }

      return (data ?? []) as unknown as ProductionBatch[]
    } catch (error) {
      productionLogger.error({ error }, 'Error in getActiveBatches')
      return []
    }
  }

  async cancelProductionBatch(batchId: string): Promise<void> {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const { data: batch, error } = await supabase
        .from('production_batches')
        .select('id, recipe_id, quantity, status')
        .eq('id', batchId)
        .single()

      if (error || !batch) {
        throw error ?? new Error('Batch not found')
      }

      if ((batch as { status: string }).status === 'cancelled') {
        productionLogger.info({ batchId }, 'Production batch already cancelled')
        return
      }

      // Release reserved ingredients
      const { error: releaseError } = await supabase
        .from('stock_reservations')
        .update({ status: 'released', updated_at: new Date().toISOString() } as never)
        .eq('recipe_id', (batch as { recipe_id: string }).recipe_id)
        .eq('status', 'reserved')

      if (releaseError) {
        productionLogger.error({ releaseError, batchId }, 'Failed to release ingredient reservations')
        // Don't throw here - continue with batch cancellation
      }

      const { error: updateError } = await supabase
        .from('production_batches')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', batchId)

      if (updateError) {
        throw updateError
      }

      productionLogger.info({ batchId }, 'Production batch cancelled and ingredients restored')
    } catch (error) {
      productionLogger.error({ error, batchId }, 'Error in cancelProductionBatch')
      throw error
    }
  }

  async getProductionCapacity(recipeId: string): Promise<{
    maxBatchesPerDay: number
    estimatedProductionTime: number // in hours
    limitingFactor: string
  }> {
    try {
      // Simple capacity calculation based on available ingredients
      // checkProductionFeasibility will validate recipe existence
      const feasibility = await this.checkProductionFeasibility(recipeId, 1)

      if (!feasibility.feasible) {
        return {
          maxBatchesPerDay: 0,
          estimatedProductionTime: 0,
          limitingFactor: 'Insufficient ingredients'
        }
      }

      // Find the limiting ingredient
      const limitingIngredient = feasibility.requiredIngredients
        .map(ing => ({
          name: ing['ingredient_name'],
          availableBatches: Math.floor(ing.available_quantity / ing.required_quantity)
        }))
        .sort((a, b) => a.availableBatches - b.availableBatches)[0]

      // Estimate production time (simplified - 2 hours per batch)
      const estimatedTimePerBatch = 2 // hours
      const maxBatches = limitingIngredient?.availableBatches || 0

      return {
        maxBatchesPerDay: Math.min(maxBatches, 10), // Cap at 10 batches per day
        estimatedProductionTime: estimatedTimePerBatch,
        limitingFactor: limitingIngredient?.name ?? 'Unknown'
      }
    } catch (error) {
      productionLogger.error({ error, recipeId }, 'Error in getProductionCapacity')
      return {
        maxBatchesPerDay: 0,
        estimatedProductionTime: 0,
        limitingFactor: 'Error calculating capacity'
      }
    }
  }
}
