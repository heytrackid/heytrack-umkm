/**
 * AI Module - Legacy Export (Backward Compatibility)
 * 
 * This file re-exports from modular AI architecture for backward compatibility.
 * New code should import from '@/lib/ai/*' directly.
 * 
 * @deprecated Use individual modules from '@/lib/ai/*' instead
 * 
 * @example
 * // Old way (still works)
 * import { AIClient, NLPProcessor } from '@/lib/ai'
 * 
 * // New way (recommended)
 * import { AIClient } from '@/lib/ai/client'
 * import { NLPProcessor } from '@/lib/ai/nlp-processor'
 */

// Re-export everything from new modular structure
export * from './ai/index'

// Legacy class exports for backward compatibility
export { AIClient } from './ai/client'
export { AISecurity } from './ai/security'
export { PromptBuilder } from './ai/prompt-builder'
export { AIService } from './ai/service'
export { NLPProcessor } from './ai/nlp-processor'
export { BusinessAI } from './ai/business'

// Re-export types
export type {
  NLPIntent,
  NLPAnalysis,
  NLPEntities
} from './ai/nlp-processor'

export type {
  PricingData,
  InventoryData,
  ProductionData
} from './ai/business'
