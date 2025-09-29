import { supabase } from '@/lib/supabase'

/**
 * Service for calculating production time estimates for orders
 */
export class ProductionTimeService {
  /**
   * Calculate production time estimate for order
   */
  static async calculateProductionTime(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    total_prep_time: number
    total_cook_time: number
    estimated_completion: string
    parallel_processing_time: number
  }> {
    try {
      const recipeIds = items.map(item => item.recipe_id)
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, prep_time, cook_time, difficulty')
        .in('id', recipeIds)

      if (error) throw error

      let total_prep_time = 0
      let total_cook_time = 0
      let max_single_recipe_time = 0

      items.forEach(item => {
        const recipe = recipes?.find(r => r.id === item.recipe_id)
        if (recipe) {
          const prep_time = (recipe.prep_time || 0) * item.quantity
          const cook_time = (recipe.cook_time || 0) * item.quantity

          total_prep_time += prep_time
          total_cook_time += cook_time

          // Track longest single recipe for parallel processing estimate
          const single_recipe_time = prep_time + cook_time
          max_single_recipe_time = Math.max(max_single_recipe_time, single_recipe_time)
        }
      })

      // Estimate parallel processing (assuming some overlap)
      const parallel_processing_time = Math.max(
        max_single_recipe_time,
        (total_prep_time + total_cook_time) * 0.7 // 30% time saving from parallel work
      )

      const estimated_completion = new Date(
        Date.now() + parallel_processing_time * 60 * 1000
      ).toISOString()

      return {
        total_prep_time,
        total_cook_time,
        estimated_completion,
        parallel_processing_time
      }
    } catch (error) {
      console.error('Error calculating production time:', error)
      return {
        total_prep_time: 0,
        total_cook_time: 0,
        estimated_completion: new Date().toISOString(),
        parallel_processing_time: 0
      }
    }
  }
}
