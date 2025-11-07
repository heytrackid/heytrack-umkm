
import { productionLogger } from '@/lib/logger'
import { isIngredient } from '@/lib/type-guards'

import type { ProductionBatch } from './types'


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
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // Validate recipe exists and is active
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', batch.recipe_id)
        .eq('is_active', true)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`_Recipe not found or inactive: ${batch.recipe_id}`)
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
      const { createServerClient: createClientForBatch } = await import('@/utils/supabase/client-safe')
      const batchSupabase = await createClientForBatch()

      const { data: { user }, error: authError } = await batchSupabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      const batchData = {
        batch_no: batchId,
        recipe_id: batch.recipe_id,
        planned_quantity: batch.quantity,
        produced_quantity: 0,
        status: 'planned',
        notes: newBatch.notes,
        created_by: user['id'],
        user_id: user['id']
      }

      const { error: insertError } = await batchSupabase
        .from('production_batches')
        .insert(batchData)

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
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

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

      const recipeIngredients = (recipe).recipe_ingredients ?? []
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
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // Get recipe ingredients
      const { data: recipeIngredients, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          quantity_needed,
          ingredients (
            id,
            current_stock
          )
        `)
        .eq('recipe_id', recipeId)

      if (error) {
        throw error
      }

      // Update stock levels for each ingredient
      for (const ri of recipeIngredients ?? []) {
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
        const newStock = Math.max(0, (ingredient.current_stock ?? 0) - requiredQuantity)

        const { error: updateError } = await supabase
          .from('ingredients')
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredient['id'])

        if (updateError) {
          productionLogger.error({ error: updateError, ingredientId: ingredient['id'], recipeId, quantity }, 'Error reserving stock for ingredient')
          throw updateError
        }
      }

      productionLogger.info({ recipeId, quantity }, 'Reserved ingredients for production batch')
    } catch (error) {
      productionLogger.error({ error, recipeId, quantity }, 'Error in reserveIngredientsForProduction')
      throw error
    }
  }

  getProductionQueue(): ProductionBatch[] {
    try {
      // TODO: Implement when production_batches table is created
      // For now, return empty array
      return []
    } catch (error) {
      productionLogger.error({ error }, 'Error in getProductionQueue')
      return []
    }
  }

  updateBatchStatus(batchId: string, status: ProductionBatch['status']): void {
    try {
      // TODO: Implement when production_batches table is created
      productionLogger.info({ batchId, status }, 'Updating production batch status')
    } catch (error) {
      productionLogger.error({ error, batchId, status }, 'Error in updateBatchStatus')
      throw error
    }
  }

  getActiveBatches(): ProductionBatch[] {
    try {
      // TODO: Implement when production_batches table is created
      return []
    } catch (error) {
      productionLogger.error({ error }, 'Error in getActiveBatches')
      return []
    }
  }

  cancelProductionBatch(batchId: string): void {
    try {
      // TODO: Implement batch cancellation logic
      // const { createServerClient } = await import('@/utils/supabase/client-safe')
      // const supabase = await createServerClient()
      // This would involve:
      // 1. Finding the batch
      // 2. Returning reserved ingredients to stock
      // 3. Updating batch status

      productionLogger.info({ batchId }, 'Cancelling production batch')
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
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // Get recipe information
      const { data: recipe, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (error || !recipe) {
        throw new Error(`_Recipe not found: ${recipeId}`)
      }

      // Simple capacity calculation based on available ingredients
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
        limitingFactor: limitingIngredient?.name || 'Unknown'
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
