import { apiLogger } from '@/lib/logger'

import { BusinessAI } from '@/lib/ai/business'
import { NLPProcessor } from '@/lib/ai/nlp-processor'

/**
 * AI Module - Main Export
 * Consolidated AI functionality with modular architecture
 */

// Core modules
export { AIClient } from './client'
export { AISecurity } from './security'
export { PromptBuilder } from './prompt-builder'
export { AIService } from './service'
export { NLPProcessor } from './nlp-processor'
export { BusinessAI } from './business'

// Types
export type {
  NLPIntent,
  NLPAnalysis,
  NLPEntities
} from './nlp-processor'

export type {
  PricingData,
  InventoryData,
  ProductionData
} from './business'

// Convenience functions

export function processChatbotQuery(query: string) {
  return NLPProcessor.processChatbotQuery(query)
}

export function trainNLPModel(data: Record<string, unknown>): boolean {
  apiLogger.info({ data }, 'NLP Model training requested (placeholder)')
  return true
}

export function parseNaturalLanguage(text: string) {
  return NLPProcessor.parseNaturalLanguage(text)
}

export function generateAIInsights(data: Record<string, unknown>): Promise<string> {
  return BusinessAI.getBusinessInsights(data)
}
