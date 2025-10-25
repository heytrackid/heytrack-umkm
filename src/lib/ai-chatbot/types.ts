/**
 * AI Chatbot Types
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ChatbotContext {
  userId?: string
  sessionId: string
  history: ChatMessage[]
}

export interface ChatbotResponse {
  message: string
  suggestions?: string[]
  data?: any
}

export interface ChatbotIntent {
  type: 'query' | 'command' | 'help'
  confidence: number
  entities?: Record<string, any>
}

export interface ChatAction {
  type: string
  payload?: any
  callback?: () => void
}
