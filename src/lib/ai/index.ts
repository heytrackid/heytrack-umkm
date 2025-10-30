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
import { NLPProcessor } from './nlp-processor'
import { BusinessAI } from './business'
import { apiLogger } from '@/lib/logger'

export async function processChatbotQuery(query: string) {
  return NLPProcessor.processChatbotQuery(query)
}

export async function trainNLPModel(data: Record<string, unknown>): Promise<boolean> {
  apiLogger.info({ data }, 'NLP Model training requested (placeholder)')
  return true
}

export async function parseNaturalLanguage(text: string) {
  return NLPProcessor.parseNaturalLanguage(text)
}

export async function generateAIInsights(data: Record<string, unknown>): Promise<string> {
  return BusinessAI.getBusinessInsights(data)
}
