import 'server-only'
import { FinancialAutomation } from './financial-automation'
import { InventoryAutomation } from './inventory-automation'
import { NotificationSystem } from './notification-system'
import { PricingAutomation } from './pricing-automation'
import { ProductionAutomation } from './production-automation'




/**
 * Workflow Automation - Central workflow management
 * Aggregates all automation workflows
 */


// Import all workflow modules

/**
 * Workflow Automation Class
 * Manages all automation workflows
 */
export class WorkflowAutomation {
  private static instance: WorkflowAutomation

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): WorkflowAutomation {
    if (!WorkflowAutomation.instance) {
      WorkflowAutomation.instance = new WorkflowAutomation()
    }
    return WorkflowAutomation.instance
  }

  // Financial workflows
  get financial() {
    return FinancialAutomation
  }

  // Inventory workflows
  get inventory() {
    return InventoryAutomation
  }

  // Production workflows
  get production() {
    return ProductionAutomation
  }

  // Pricing workflows
  get pricing() {
    return PricingAutomation
  }

  // Notification workflows
  get notifications() {
    return NotificationSystem
  }
}

/**
 * Get workflow automation instance
 */
export function getWorkflowAutomation(): WorkflowAutomation {
  return WorkflowAutomation.getInstance()
}

// Export default instance
export const workflowAutomation = getWorkflowAutomation()
