import { BaseWorkflowAutomation } from '@/lib/automation/base-workflow'
import { automationLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'

import type { AutomationConfig, WorkflowEventData, WorkflowResult } from '@/types/features/automation'

import { FinancialWorkflowHandlers } from '@/lib/automation/workflows/financial-workflows'
import { HPPWorkflowHandlers } from '@/lib/automation/workflows/hpp-workflows'
import { InventoryWorkflowHandlers } from '@/lib/automation/workflows/inventory-workflows'
import { OrderWorkflowHandlers } from '@/lib/automation/workflows/order-workflows'
import { ProductionWorkflowHandlers } from '@/lib/automation/workflows/production-workflows'


/**
 * Workflow Automation System
 * Main workflow automation orchestrator
 */




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

    // Set up Supabase client in context
    context.supabase = await createClient()

    switch (event.event) {
      // Order events
      case 'order.completed':
        return OrderWorkflowHandlers.handleOrderCompleted(context)
      case 'order.cancelled':
        return OrderWorkflowHandlers.handleOrderCancelled(context)
      case 'order.status_changed':
        return OrderWorkflowHandlers.handleOrderStatusChanged(context)

      // Inventory events
      case 'inventory.low_stock':
        return InventoryWorkflowHandlers.handleLowStock(context)
      case 'inventory.out_of_stock':
        return InventoryWorkflowHandlers.handleOutOfStock(context)
      case 'purchase.completed':
        return InventoryWorkflowHandlers.handlePurchaseCompleted(context)

      // Production events
      case 'production.completed':
        return ProductionWorkflowHandlers.handleProductionCompleted(context)

      // Financial events
      case 'ingredient.price_changed':
        return FinancialWorkflowHandlers.handleIngredientPriceChanged(context)
      case 'operational_cost.changed':
        return FinancialWorkflowHandlers.handleOperationalCostChanged(context)
      case 'hpp.recalculation_needed':
        return HPPWorkflowHandlers.handleHppRecalculation(context)

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
  workflowAutomationInstance ??= new WorkflowAutomation(config)
  return workflowAutomationInstance
}

// Convenience function for triggering workflows
export async function triggerWorkflow(
  event: Parameters<WorkflowAutomation['triggerEvent']>[0]['event'],
  entityId: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  if (!event) return

  const automation = getWorkflowAutomation()
  await automation.triggerEvent({
    event,
    entityId,
    data
  })
}

// Export singleton instance for backward compatibility
export const workflowAutomation = getWorkflowAutomation()
