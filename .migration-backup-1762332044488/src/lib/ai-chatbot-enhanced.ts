
/**
 * AI Chatbot - Legacy Export (Backward Compatibility)
 * 
 * This file re-exports from modular chatbot architecture.
 * New code should import from '@/lib/ai-chatbot/*' directly.
 * 
 * @deprecated Use individual modules from '@/lib/ai-chatbot/*' instead
 * 
 * @example
 * // Old way (still works)
 * import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced'
 * 
 * // New way (recommended)
 * import { ContextAwareAI } from '@/lib/ai-chatbot'
 */

// Re-export everything from new modular structure
export * from './ai-chatbot'

// Legacy exports for backward compatibility
export { ContextAwareAI } from './ai-chatbot/chatbot'
export { ContextManager } from './ai-chatbot/context-manager'
export { ChatbotPromptBuilder } from './ai-chatbot/prompt-builder'

// Re-export types
export type {
  ChatContext,
  AIResponse,
  BusinessData
} from './ai-chatbot/types'
