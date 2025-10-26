/**
 * AI Chatbot Types
 * Type definitions for AI chatbot functionality
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface ChatContext {
  userId?: string
  sessionId?: string
  conversationHistory: ChatMessage[]
  currentPage?: string
  userPreferences?: Record<string, unknown>
}

export interface ChatbotConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  actions?: ChatAction[]
  metadata?: Record<string, unknown>
}

export interface ChatAction {
  type: 'navigate' | 'execute' | 'display'
  label: string
  payload: unknown
}

export interface NLPAnalysis {
  intent: string
  entities: Record<string, unknown>
  confidence: number
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface ChatbotState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  context: ChatContext
}
