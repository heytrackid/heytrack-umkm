import { HppAutomation } from '@/lib/automation/hpp-automation'
import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { WorkflowContext, WorkflowResult } from '@/types/features/automation'

export class HPPWorkflowHandlers {
  static async handleHppRecalculation(context: WorkflowContext): Promise<WorkflowResult> {
    const { supabase, event, logger } = context

    if (!supabase) {
      return {
        success: false,
        message: 'Supabase client is not available in workflow context',
        error: 'Missing Supabase client'
      }
    }

    const recipeId = event.entityId
    const userId = (event.data?.['userId'] as string) ?? (event.data?.['user_id'] as string)
    const affectedRecipeIds = event.data?.['affectedRecipeIds'] as string[]
    const operationalCostChange = event.data?.['operationalCostChange'] as number

    // If we have multiple recipes to recalculate (batch processing)
    if (affectedRecipeIds && affectedRecipeIds.length > 1) {
      return this.handleBatchHppRecalculation(context, affectedRecipeIds, userId)
    }

    // Single recipe recalculation
    if (!recipeId || !userId) {
      return {
        success: false,
        message: 'HPP recalculation requires recipeId and userId',
        error: 'Missing identifiers'
      }
    }

    try {
      const automation = new HppAutomation()
      const calculation = await automation.recalculateRecipe(supabase, recipeId, userId)

      logger.info('HPP recalculated via workflow', {
        recipeId,
        total_hpp: calculation.total_hpp,
        operationalCostChange
      })

      return {
        success: true,
        message: 'HPP recalculated successfully',
        data: calculation
      }
    } catch (error) {
      automationLogger.error({ recipeId, error: getErrorMessage(error) }, 'Failed to recalculate HPP')
      return {
        success: false,
        message: 'Failed to recalculate HPP',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Handle batch HPP recalculation for multiple recipes
   * ✅ ENHANCED: Batch processing for large recipe sets
   */
  static async handleBatchHppRecalculation(
    context: WorkflowContext,
    recipeIds: string[],
    userId: string
  ): Promise<WorkflowResult> {
    const { supabase, logger } = context

    if (!supabase) {
      return {
        success: false,
        message: 'Supabase client is not available in workflow context',
        error: 'Missing Supabase client'
      }
    }

    logger.info('Starting batch HPP recalculation', {
      recipeCount: recipeIds.length,
      userId
    })

    const automation = new HppAutomation()
    const results: Array<{ recipeId: string; success: boolean; total_hpp?: number; error?: string }> = []
    const errors: Array<{ recipeId: string; error: string }> = []
    let successCount = 0

    // Process recipes in batches of 10 to avoid overwhelming the system
    const batchSize = 10
    for (let i = 0; i < recipeIds.length; i += batchSize) {
      const batch = recipeIds.slice(i, i + batchSize)

      logger.info(`Processing HPP batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipeIds.length / batchSize)}`, {
        batchSize: batch.length
      })

      // Process batch concurrently
      const batchPromises = batch.map(async (recipeId) => {
        try {
          const calculation = await automation.recalculateRecipe(supabase, recipeId, userId)
          successCount++
          return {
            recipeId,
            success: true,
            total_hpp: calculation.total_hpp
          }
        } catch (error) {
          const errorMsg = getErrorMessage(error)
          errors.push({ recipeId, error: errorMsg })
          automationLogger.error({ recipeId, error: errorMsg }, 'Failed to recalculate HPP in batch')
          return {
            recipeId,
            success: false,
            error: errorMsg
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Small delay between batches to prevent overwhelming
      if (i + batchSize < recipeIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const summary = {
      totalRecipes: recipeIds.length,
      successfulRecalculations: successCount,
      failedRecalculations: errors.length,
      results,
      errors
    }

    logger.info('Batch HPP recalculation completed', summary)

    return {
      success: successCount > 0,
      message: `Batch HPP recalculation: ${successCount}/${recipeIds.length} recipes processed successfully`,
      data: summary
    }
  }
}
