/**
 * Production Services
 * Service for production management operations
 */



import type { ProductionBatch } from './types'
import type { Database } from '@/types/supabase-generated'
import { productionLogger } from '@/lib/logger'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

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
        notes: batch.notes || `Production batch for ${recipe.name}`
      }

      // TODO: Save to production_batches table when it's implemented
      // For now, we'll just return the batch object and update inventory

      // Reserve ingredients for production
      await this.reserveIngredientsForProduction(batch.recipe_id, batch.quantity)

      productionLogger.info({ batchId, recipeId: batch.recipe_id, quantity: batch.quantity }, 'Production batch scheduled successfully')
      return newBatch
    } catch (err) {
      productionLogger.error({ err, recipeId: batch.recipe_id }, 'Error in scheduleProductionBatch')
      throw err
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
        throw new Error(`Recipe not found: ${recipeId}`)
      }

      const recipeIngredients = (recipe).recipe_ingredients || []
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
        const ingredient = ri.ingredients as Ingredient
        const requiredQuantity = ri.quantity_needed * quantity
        const availableQuantity = ingredient.current_stock || 0

        requiredIngredients.push({
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          required_quantity: requiredQuantity,
          available_quantity: availableQuantity,
          unit: ingredient.unit || 'pcs'
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
    } catch (err) {
      productionLogger.error({ err, recipeId, quantity }, 'Error in checkProductionFeasibility')
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
        throw err
      }

      // Update stock levels for each ingredient
      for (const ri of recipeIngredients || []) {
        const ingredient = ri.ingredients as unknown as Ingredient
        const requiredQuantity = ri.quantity_needed * quantity
        const newStock = Math.max(0, (ingredient.current_stock || 0) - requiredQuantity)

        const { error: updateError } = await supabase
          .from('ingredients')
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredient.id)

        if (updateError) {
          productionLogger.error({ error: updateError, ingredientId: ingredient.id, recipeId, quantity }, 'Error reserving stock for ingredient')
          throw updateError
        }
      }

      productionLogger.info({ recipeId, quantity }, 'Reserved ingredients for production batch')
    } catch (error) {
      productionLogger.error({ error, recipeId, quantity }, 'Error in reserveIngredientsForProduction')
      throw error
    }
  }

  async getProductionQueue(): Promise<ProductionBatch[]> {
    try {
      // TODO: Implement when production_batches table is created
      // For now, return empty array
      return []
    } catch (err) {
      productionLogger.error({ err }, 'Error in getProductionQueue')
      return []
    }
  }

  async updateBatchStatus(batchId: string, status: ProductionBatch['status']): Promise<void> {
    try {
      // TODO: Implement when production_batches table is created
      productionLogger.info({ batchId, status }, 'Updating production batch status')
    } catch (err) {
      productionLogger.error({ err, batchId, status }, 'Error in updateBatchStatus')
      throw err
    }
  }

  async getActiveBatches(): Promise<ProductionBatch[]> {
    try {
      // TODO: Implement when production_batches table is created
      return []
    } catch (err) {
      productionLogger.error({ err }, 'Error in getActiveBatches')
      return []
    }
  }

  async cancelProductionBatch(batchId: string): Promise<void> {
    try {
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // TODO: Implement batch cancellation logic
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
        throw new Error(`Recipe not found: ${recipeId}`)
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
          name: ing.ingredient_name,
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
