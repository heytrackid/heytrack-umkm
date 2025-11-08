
/**
 * AI Chatbot Types
 * Type definitions for chatbot functionality
 */

export interface ChatMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  content: string
  timestamp: Date
}

export interface ChatAction {
  type: 'create' | 'delete' | 'navigate' | 'search' | 'update'
  label?: string
  target?: string
  data?: Record<string, unknown>
}

export interface ChatContext {
  userId: string
  sessionId?: string
  conversationHistory?: Array<{
    role: 'assistant' | 'user'
    content: string
    timestamp: Date
  }>
  businessData?: Record<string, unknown>
  preferences?: Record<string, unknown>
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

export interface BusinessData {
  recipes?: Array<{ name: string; hpp: number }>
  ingredients?: Array<{ name: string; stock: number; unit: string; low_stock: boolean }>
  hpp?: { average_hpp: number; trend: string; alerts_count: number }
  financial?: { total_revenue: number; total_costs: number; profit: number; period: string }
  currentPage?: string
}
