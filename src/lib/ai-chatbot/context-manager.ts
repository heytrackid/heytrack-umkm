import type { ChatContext } from '@/lib/ai-chatbot/types'
import { createClientLogger } from '@/lib/client-logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

const logger = createClientLogger('ClientFile')

/**
 * Context Manager
 * Manages conversation context and history
 */


export class ContextManager {
  private readonly context: ChatContext

  constructor(userId: string, sessionId?: string) {
    this['context'] = {
      userId,
      ...(sessionId !== undefined && { sessionId }),
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
      this['context'].conversationHistory = []

      // Load existing conversation history if session exists
      if (this['context'].sessionId) {
        try {
          // Note: This needs supabase client - should be passed from caller
          // For now, assuming it's called from client with browser client
          const supabase = createClient()
          const chatService = new ChatSessionService({ 
            userId: this['context'].userId, 
            supabase: supabase as unknown as SupabaseClient<Database> 
          })
          const messages = await chatService.getMessages(
            this['context'].sessionId,
            100 // Load last 100 messages for context (increased limit)
          )

          // Convert to internal format
          this['context'].conversationHistory = messages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(msg.created_at),
            metadata: msg.metadata
          }))

          logger.info(
            {
              userId: this['context'].userId,
              sessionId: this['context'].sessionId,
              messageCount: messages.length
            },
            'Loaded conversation history for AI context'
          )
        } catch (error) {
          logger.warn(
            { error, userId: this['context'].userId, sessionId: this['context'].sessionId },
            'Failed to load conversation history, starting fresh'
          )
          // Continue without history - don't fail the session
        }
      }

      logger.info(
        { userId: this['context']['userId'], sessionId: this['context'].sessionId },
        'AI session initialized'
      )
    } catch (error) {
      logger.error({ error }, 'Error initializing AI session')
      throw error
    }
  }

  /**
   * Add user message to history
   */
  addUserMessage(content: string): void {
    this['context'].conversationHistory?.push({
      role: 'user',
      content,
      timestamp: new Date()
    })
  }

  /**
   * Add assistant message to history
   */
  addAssistantMessage(content: string): void {
    this['context'].conversationHistory?.push({
      role: 'assistant',
      content,
      timestamp: new Date()
    })
  }

  /**
   * Update business context
   */
  updateBusinessContext(businessData: Record<string, unknown>): void {
    this['context'].businessData = {
      ...this['context'].businessData,
      ...businessData
    }
  }

  /**
   * Get current context
   */
  getContext(): ChatContext {
    return this['context']
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this['context'].conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this['context'].conversationHistory ?? []
  }
}
