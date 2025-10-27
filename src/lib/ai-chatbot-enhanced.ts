/** 
 * Context-Aware AI Chatbot Implementation
 */

import { AIClient, NLPProcessor, BusinessAI } from './ai'
import { apiLogger } from './logger'

export interface ChatContext {
  userId: string
  sessionId?: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  businessData?: any
  preferences?: Record<string, any>
}

export interface AIResponse {
  content: string
  context: ChatContext
  metadata: {
    confidence: number
    sources: string[]
    timestamp: Date
  }
}

export class ContextAwareAI {
  private context: ChatContext
  private userId: string
  private sessionId?: string

  constructor(userId: string, sessionId?: string) {
    this.userId = userId
    this.sessionId = sessionId
    this.context = {
      userId,
      sessionId,
      conversationHistory: [],
      businessData: {},
      preferences: {}
    }
  }

  async initializeSession(): Promise<void> {
    try {
      // Initialize session context with business data
      this.context.conversationHistory = []
      
      // Optionally fetch user preferences and business context here
      // For now, we'll just log the initialization
      apiLogger.info({ userId: this.userId, sessionId: this.sessionId }, 'AI session initialized')
    } catch (err) {
      apiLogger.error({ err }, 'Error initializing AI session')
      throw err
    }
  }

  async processQuery(query: string): Promise<AIResponse> {
    try {
      // Add user query to conversation history
      this.context.conversationHistory?.push({
        role: 'user',
        content: query,
        timestamp: new Date()
      })

      // Process the query using NLP to understand intent
      const nlpAnalysis = await NLPProcessor.processChatbotQuery(query)
      
      // Build system prompt with context
      const systemPrompt = `
        You are an AI assistant for a food business management system called HeyTrack.
        You have access to business context and user history to provide personalized responses.
        
        Current user: ${this.userId}
        Business context: ${JSON.stringify(this.context.businessData || {})}
        
        Conversation history: ${JSON.stringify(this.context.conversationHistory || [])}
        
        Please provide helpful, accurate, and contextual responses based on Indonesian food business practices.
      `

      // Get response from AI service
      const responseContent = await AIClient.callOpenRouter(
        query,
        systemPrompt
      )

      // Add assistant response to conversation history
      this.context.conversationHistory?.push({
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      })

      return {
        content: responseContent,
        context: this.context,
        metadata: {
          confidence: 0.85,
          sources: ['business-ai', 'context-aware'],
          timestamp: new Date()
        }
      }
    } catch (error) {
      apiLogger.error({ error, query }, 'Error processing AI query')
      throw error
    }
  }

  async getConversationSessions(): Promise<any[]> {
    try {
      // In a real implementation, this would fetch conversation history
      // For now, returning an empty array as placeholder
      return []
    } catch (err) {
      apiLogger.error({ err }, 'Error getting conversation sessions')
      throw err
    }
  }
}