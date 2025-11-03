import { automationLogger } from '@/lib/logger'
import type { WorkflowEventData, WorkflowContext, WorkflowResult, AutomationConfig } from '@/types/features/automation'

/**
 * Base Workflow Automation
 * Core workflow automation system with event processing
 */


export abstract class BaseWorkflowAutomation {
  protected config: AutomationConfig = {
    enabled: true,
    maxConcurrentJobs: 5,
    retryAttempts: 3,
    notificationEnabled: true,
    defaultProfitMargin: 0.3,
    minimumProfitMargin: 0.15,
    maximumProfitMargin: 0.6,
    autoReorderDays: 7,
    safetyStockMultiplier: 1.5,
    productionLeadTime: 2,
    batchOptimizationThreshold: 10,
    lowProfitabilityThreshold: 0.2,
    cashFlowWarningDays: 30
  }

  private eventQueue: WorkflowEventData[] = []
  private isProcessing = false

  constructor(config?: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Trigger workflow automation event
   */
  async triggerEvent(eventData: Partial<WorkflowEventData>) {
    if (!eventData.event || !eventData.entityId) {
      throw new Error('Event and entityId are required')
    }
    
    const event: WorkflowEventData = {
      event: eventData.event,
      entityId: eventData.entityId,
      data: eventData.data ?? {},
      timestamp: new Date().toISOString()
    }

    automationLogger.info({
      event: event.event,
      entityId: event.entityId
    }, 'Workflow event triggered')

    // Add to queue for processing
    this.eventQueue.push(event)

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  /**
   * Process event queue
   */
  private async processEventQueue() {
    if (this.eventQueue.length === 0 || this.isProcessing) {return}

    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      if (event) {
        await this.processEvent(event)
      }
    }

    this.isProcessing = false
  }

  /**
   * Process single workflow event
   */
  private async processEvent(event: WorkflowEventData) {
    automationLogger.debug({ event: event.event }, 'Processing workflow event')

    try {
      const result = await this.handleEvent(event)

      if (result.success) {
        automationLogger.info({
          event: event.event,
          entityId: event.entityId,
          message: result.message
        }, 'Workflow event processed successfully')
      } else {
        automationLogger.error({
          event: event.event,
          entityId: event.entityId,
          error: result.error ?? result.message
        }, 'Workflow event processing failed')
      }

    } catch (err: unknown) {
      automationLogger.error({
        event: event.event,
        error: err instanceof Error ? err.message : String(err)
      }, 'Error processing workflow event')
    }
  }

  /**
   * Handle specific workflow event
   * Must be implemented by subclasses
   */
  protected abstract handleEvent(event: WorkflowEventData): Promise<WorkflowResult>

  /**
   * Create workflow context
   */
  protected createContext(event: WorkflowEventData): WorkflowContext {
    return {
      event,
      supabase: null, // Will be set by caller
      logger: automationLogger,
      config: this.config
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      config: this.config
    }
  }

  /**
   * Clear event queue
   */
  clearQueue() {
    this.eventQueue = []
    automationLogger.info({}, 'Workflow event queue cleared')
  }
}
