/**
 * Automation Engine - Modular Workflow System
 * Re-exports from modular automation system for backward compatibility
 * NOTE: These services contain server-side operations and should only be called from server contexts
 */



// Re-export from modular system
export * from './automation/index'
export * from './automation/workflows'

// Re-export types
export type { AutomationConfig } from './automation/types'
export type { WorkflowEvent, WorkflowEventData } from './automation/types'

// Import for backward compatibility
import { getWorkflowAutomation } from './automation/workflows'

// Export the default instance for backwards compatibility
export const automationEngine = getWorkflowAutomation()

// Legacy exports for backward compatibility
export const WorkflowAutomation = getWorkflowAutomation().constructor as any
export const workflowAutomation = getWorkflowAutomation()