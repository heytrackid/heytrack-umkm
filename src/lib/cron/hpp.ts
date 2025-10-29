/**
 * HPP Cron Jobs
 * Scheduled tasks for HPP calculations
 */

import { cronLogger } from '@/lib/logger'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

// Result type for individual HPP calculation
export interface HppCalculationResult {
  success: boolean
  message: string
  error?: string
  data?: {
    recipeId: string
    totalHpp?: number
    duration: number
  }
}

export class HPPCronJobs {
  /**
   * Recalculate HPP for specific recipe
   */
  static async recalculateRecipeHPP(recipeId: string, userId: string): Promise<HppCalculationResult> {
    const startTime = Date.now()
    cronLogger.info({ recipeId, userId }, 'Starting HPP recalculation for recipe')

    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const calculatorService = new HppCalculatorService()
      const result = await calculatorService.calculateRecipeHpp(supabase, recipeId, userId)
      
      const duration = Date.now() - startTime
      
      cronLogger.info({
        recipeId,
        duration,
        status: 'success',
        totalHpp: result.total_hpp
      }, 'HPP recalculation completed')

      return {
        success: true,
        message: 'HPP recalculated successfully',
        data: {
          recipeId,
          totalHpp: result.total_hpp,
          duration
        }
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime
      cronLogger.error({ error, recipeId, duration }, 'Failed to recalculate HPP')

      return {
        success: false,
        message: 'Failed to recalculate HPP',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: { recipeId, duration }
      }
    }
  }
}
