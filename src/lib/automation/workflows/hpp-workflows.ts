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
        total_hpp: calculation.total_hpp
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
}
