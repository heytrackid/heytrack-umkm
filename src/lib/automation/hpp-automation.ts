import { automationLogger } from '@/lib/logger'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

import type { Database } from '@/types/database'


import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * HPP Automation Service
 * Handles automatic HPP recalculations when upstream data changes
 */
export class HppAutomation {
  private readonly calculator = new HppCalculatorService()

  constructor() {}

  async recalculateRecipe(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ) {
    automationLogger.info({ recipeId, userId }, 'Starting automated HPP recalculation')
    const result = await this.calculator.calculateRecipeHpp(supabase, recipeId, userId)
    automationLogger.info({ recipeId, total_hpp: result.total_hpp }, 'HPP recalculation completed')
    return result
  }

  async recalculateMultiple(
    supabase: SupabaseClient<Database>,
    recipeIds: string[],
    userId: string
  ) {
    const uniqueIds = Array.from(new Set(recipeIds.filter(Boolean)))
    const results = []

    for (const recipeId of uniqueIds) {
      try {
        const calculation = await this.recalculateRecipe(supabase, recipeId, userId)
        results.push({ recipeId, success: true, calculation })
      } catch (error) {
        automationLogger.error({ recipeId, error }, 'Failed to recalculate HPP for recipe')
        results.push({ recipeId, success: false, error })
      }
    }

    return results
  }
}
