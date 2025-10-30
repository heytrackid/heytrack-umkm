/**
 * AI Service Module
 * Core AI service with security and prompt building
 */

import { apiLogger } from '@/lib/logger'
import { AIClient } from './client'
import { AISecurity } from './security'
import { PromptBuilder } from './prompt-builder'

export class AIService {
  /**
   * Enhanced call to OpenRouter with security and prompt building
   */
  static async callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
    const safePrompt = AISecurity.sanitizeInput(prompt)
    const safeSystemPrompt = AISecurity.sanitizeInput(systemPrompt)

    if (!AISecurity.validateInput(safePrompt)) {
      apiLogger.warn({ prompt: safePrompt }, 'Potential prompt injection detected')
      throw new Error('Invalid input detected')
    }

    const secureSystemPrompt = PromptBuilder.buildSystemPrompt(safeSystemPrompt)
    return await AIClient.callAI(safePrompt, secureSystemPrompt)
  }

  /**
   * Generate AI insights for business data
   */
  static async getPredictions(data: Record<string, unknown>): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'sales forecasting and trend analysis')
    const systemPrompt = 'You are a business intelligence analyst specializing in Indonesian food businesses.'
    return await this.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize inventory using AI
   */
  static async optimizeInventory(inventoryData: Record<string, unknown>): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(inventoryData, 'inventory optimization and demand forecasting')
    const systemPrompt = 'You are an inventory management expert for food businesses.'
    return await this.callOpenRouter(prompt, systemPrompt)
  }
}
