import { apiLogger } from '@/lib/logger'
import type { ChatContext } from './types'

/**
 * Context Manager
 * Manages conversation context and history
 */


export class ContextManager {
  private context: ChatContext

  constructor(userId: string, sessionId?: string) {
    this.context = {
      userId,
      sessionId,
      conversationHistory: [],
      businessData: {},
      preferences: {}
    }
  }

  /**
   * Initialize session context
   */
  async initializeSession(): Promise<void> {
    try {
      this.context.conversationHistory = []
      apiLogger.info(
        { userId: this.context.userId, sessionId: this.context.sessionId },
        'AI session initialized'
      )
    } catch (err) {
      apiLogger.error({ err }, 'Error initializing AI session')
      throw err
    }
  }

  /**
   * Add user message to history
   */
  addUserMessage(content: string): void {
    this.context.conversationHistory?.push({
      role: 'user',
      content,
      timestamp: new Date()
    })
  }

  /**
   * Add assistant message to history
   */
  addAssistantMessage(content: string): void {
    this.context.conversationHistory?.push({
      role: 'assistant',
      content,
      timestamp: new Date()
    })
  }

  /**
   * Update business context
   */
  updateBusinessContext(businessData: Record<string, unknown>): void {
    this.context.businessData = {
      ...this.context.businessData,
      ...businessData
    }
  }

  /**
   * Get current context
   */
  getContext(): ChatContext {
    return this.context
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.context.conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.context.conversationHistory || []
  }
}
