import { AIClient, NLPProcessor } from '@/lib/ai'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')
import { ContextManager } from './context-manager'
import { ChatbotPromptBuilder } from './prompt-builder'

import type { AIResponse } from './types'

/**
 * Context-Aware AI Chatbot
 * Main chatbot implementation
 */


export class ContextAwareAI {
  private readonly contextManager: ContextManager

  constructor(userId: string, sessionId?: string) {
    this.contextManager = new ContextManager(userId, sessionId)
  }

  /**
   * Initialize chatbot session
   */
  initializeSession(): Promise<void> {
    return this.contextManager.initializeSession()
  }

  /**
   * Process user query with context
   */
  async processQuery(
    query: string,
    businessContext?: Record<string, unknown>
  ): Promise<AIResponse> {
    try {
      // Add user query to history
      this.contextManager.addUserMessage(query)

      // Update business context if provided
      if (businessContext) {
        this.contextManager.updateBusinessContext(businessContext)
      }

      // Process query with NLP (for future use)
      await NLPProcessor.processChatbotQuery(query)

      // Build system prompt with context
      const context = this.contextManager.getContext()
      const systemPrompt = ChatbotPromptBuilder.buildSystemPrompt(context)

      // Get AI response
      const responseContent = await AIClient.callOpenRouter(query, systemPrompt)

      // Add assistant response to history
      this.contextManager.addAssistantMessage(responseContent)

      return {
        content: responseContent,
        context: this.contextManager.getContext(),
        metadata: {
          confidence: 0.85,
          sources: ['business-ai', 'context-aware'],
          timestamp: new Date()
        }
      }
    } catch (error) {
      logger.error({ error, query }, 'Error processing AI query')
      throw error
    }
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.contextManager.getHistory()
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.contextManager.clearHistory()
  }

  /**
   * Get current context
   */
  getContext() {
    return this.contextManager.getContext()
  }
}
