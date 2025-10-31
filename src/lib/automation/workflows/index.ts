// @ts-nocheck
/**
 * Workflow Automation System
 * Main workflow automation orchestrator
 */



import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { BaseWorkflowAutomation } from '@/lib/automation/base-workflow'
import { OrderWorkflowHandlers } from './order-workflows'
import { InventoryWorkflowHandlers } from './inventory-workflows'
import { FinancialWorkflowHandlers } from './financial-workflows'
import type { WorkflowEventData, WorkflowResult, AutomationConfig } from '@/lib/automation/types'

export class WorkflowAutomation extends BaseWorkflowAutomation {
  constructor(config?: Partial<AutomationConfig>) {
    super(config)
  }

  /**
   * Handle workflow events
   */
  protected async handleEvent(event: WorkflowEventData): Promise<WorkflowResult> {
    // Ensure this is only run server-side
    if (typeof window !== 'undefined') {
      automationLogger.error({ event }, 'Workflow automation attempted in client context')
      return {
        success: false,
        message: 'Workflow automation can only run in server contexts',
        error: 'Client context error'
      }
    }

    const context = this.createContext(event)

    // Set up Supabase client in context using client-safe wrapper
    // This will use server client when in server context, throw error if called from client
    const { createServerClient } = await import('@/utils/supabase/client-safe')
    context.supabase = await createServerClient()

    switch (event.event) {
      // Order events
      case 'order.completed':
        return OrderWorkflowHandlers.handleOrderCompleted(context)
      case 'order.cancelled':
        return OrderWorkflowHandlers.handleOrderCancelled(context)

      // Inventory events
      case 'inventory.low_stock':
        return InventoryWorkflowHandlers.handleLowStock(context)
      case 'inventory.out_of_stock':
        return InventoryWorkflowHandlers.handleOutOfStock(context)

      // Financial events
      case 'ingredient.price_changed':
        return FinancialWorkflowHandlers.handleIngredientPriceChanged(context)
      case 'operational_cost.changed':
        return FinancialWorkflowHandlers.handleOperationalCostChanged(context)
      case 'hpp.recalculation_needed':
        return FinancialWorkflowHandlers.handleHPPRecalculationNeeded(context)

      default:
        automationLogger.warn({ event: event.event }, 'No handler found for workflow event')
        return {
          success: false,
          message: `No handler found for event: ${event.event}`,
          error: 'Unsupported event type'
        }
    }
  }
}

// Singleton instance
let workflowAutomationInstance: WorkflowAutomation | null = null

export function getWorkflowAutomation(config?: Partial<AutomationConfig>): WorkflowAutomation {
  if (!workflowAutomationInstance) {
    workflowAutomationInstance = new WorkflowAutomation(config)
  }
  return workflowAutomationInstance
}

// Convenience function for triggering workflows
export async function triggerWorkflow(
  event: Parameters<WorkflowAutomation['triggerEvent']>[0]['event'],
  entityId: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const automation = getWorkflowAutomation()
  await automation.triggerEvent({
    event,
    entityId,
    data
  })
}

// Export singleton instance for backward compatibility
export const workflowAutomation = getWorkflowAutomation()
