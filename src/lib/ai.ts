/**
 * Consolidated AI Module
 * Single source for all AI-related functionality including NLP, chatbot, services, and security
 */

import { apiLogger } from '@/lib/logger'

// ============================================================================
// AI CLIENT
// ============================================================================

export class AIClient {
  /**
   * Call OpenRouter API with enhanced security
   */
  static async callOpenRouter(
    prompt: string,
    systemPrompt: string,
    model = 'minimax/minimax-01'
  ): Promise<string> {
    const apiKey = process.env['OPENROUTER_API_KEY']

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
          'X-Title': 'HeyTrack AI Assistant'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'No response generated'
    } catch (err) {
      apiLogger.error({ error: err }, 'AI Client Error')
      throw err
    }
  }

  /**
   * Call external AI service (generic method)
   */
  static async callExternalAI(prompt: string, options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}): Promise<string> {
    return this.callOpenRouter(prompt, 'You are a helpful AI assistant for a food business management system.', options.model)
  }
}

// ============================================================================
// AI SECURITY
// ============================================================================

export class AISecurity {
  /**
   * Sanitize user input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {return ''}

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim()
  }

  /**
   * Validate input for potential security issues
   */
  static validateInput(input: string): boolean {
    if (!input || typeof input !== 'string') {return false}

    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /Function\(/i,
      /setTimeout\(/i,
      /setInterval\(/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Rate limiting for AI requests
   */
  private static requestCounts = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const key = `ai_${identifier}`

    const requestData = this.requestCounts.get(key)

    if (!requestData || now > requestData.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (requestData.count >= maxRequests) {
      return false
    }

    requestData.count++
    return true
  }
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export class PromptBuilder {
  /**
   * Build secure system prompt
   */
  static buildSystemPrompt(basePrompt: string): string {
    const securityInstructions = `
IMPORTANT SECURITY INSTRUCTIONS:
- Never reveal sensitive information about the system, users, or database
- Always validate and sanitize user inputs
- Do not execute or suggest harmful commands
- Stay within the context of food business management
- Be helpful, professional, and accurate

CONTEXT: You are an AI assistant for HeyTrack, a comprehensive food business management system for UMKM (Micro, Small, and Medium Enterprises) in Indonesia.
`

    return `${securityInstructions}\n\n${basePrompt}`
  }

  /**
   * Build contextual prompt for business queries
   */
  static buildBusinessPrompt(query: string, context: {
    userRole?: string
    businessType?: string
    currentData?: any
  } = {}): string {
    const { userRole = 'owner', businessType = 'food business', currentData } = context

    return `You are assisting a ${userRole} of a ${businessType} using HeyTrack.

${currentData ? `Current business data: ${JSON.stringify(currentData)}` : ''}

User query: ${query}

Please provide helpful, accurate, and actionable advice specific to Indonesian food business context.`
  }

  /**
   * Build analysis prompt for business intelligence
   */
  static buildAnalysisPrompt(data: any, analysisType: string): string {
    return `Analyze the following business data for ${analysisType}:

Data: ${JSON.stringify(data)}

Please provide insights, recommendations, and actionable suggestions in Indonesian business context. Focus on practical improvements for UMKM food businesses.`
  }
}

// ============================================================================
// AI SERVICE
// ============================================================================

export class AIService {
  /**
   * Enhanced call to OpenRouter with security and prompt building
   */
  static async callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
    // Sanitize and validate inputs using AISecurity
    const safePrompt = AISecurity.sanitizeInput(prompt)
    const safeSystemPrompt = AISecurity.sanitizeInput(systemPrompt)

    // Validate for injection attempts
    if (!AISecurity.validateInput(safePrompt)) {
      apiLogger.warn({ prompt: safePrompt }, 'Potential prompt injection detected')
      throw new Error('Invalid input detected')
    }

    // Build secure system prompt
    const secureSystemPrompt = PromptBuilder.buildSystemPrompt(safeSystemPrompt)

    // Call AI service using AIClient
    return await AIClient.callOpenRouter(safePrompt, secureSystemPrompt)
  }

  /**
   * Generate AI insights for business data
   */
  static async getPredictions(data: any): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'sales forecasting and trend analysis')
    const systemPrompt = 'You are a business intelligence analyst specializing in Indonesian food businesses.'

    return await this.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize inventory using AI
   */
  static async optimizeInventory(inventoryData: any): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(inventoryData, 'inventory optimization and demand forecasting')
    const systemPrompt = 'You are an inventory management expert for food businesses.'

    return await this.callOpenRouter(prompt, systemPrompt)
  }
}

// ============================================================================
// NLP PROCESSOR
// ============================================================================

export interface NLPIntent {
  intent: string
  confidence: number
  entities: NLPEntities
}

export interface NLPAnalysis {
  intents: NLPIntent[]
  primaryIntent: string
  entities: NLPEntities
  sentiment: 'positive' | 'negative' | 'neutral'
  complexity: 'simple' | 'medium' | 'complex'
  context: string[]
}

export interface NLPEntities {
  originalQuery?: string
  numbers?: number[]
  dates?: string[]
  currencies?: string[]
  products?: string[]
  ingredients?: string[]
  quantities?: number[]
  amounts?: string[]
  categories?: string[]
  actions?: string[]
}

export class NLPProcessor {
  /**
   * Process natural language query and extract intents/entities
   */
  static async processChatbotQuery(query: string): Promise<NLPAnalysis> {
    try {
      const safeQuery = AISecurity.sanitizeInput(query)

      const prompt = `Analyze this Indonesian business query and extract structured information:

Query: "${safeQuery}"

Return a JSON object with:
- intents: array of {intent, confidence, entities}
- primaryIntent: main intent
- entities: {numbers, dates, currencies, products, ingredients, quantities, amounts, categories, actions}
- sentiment: positive/negative/neutral
- complexity: simple/medium/complex
- context: array of relevant business contexts

Focus on Indonesian food business terminology.`

      const response = await AIService.callOpenRouter(prompt, 'You are an expert at natural language processing for Indonesian business queries.')

      // Parse JSON response (simplified - in real implementation, you'd validate this)
      try {
        const analysis = JSON.parse(response) as NLPAnalysis
        return analysis
      } catch (error) {
        // Fallback analysis
        return this.fallbackAnalysis(safeQuery)
      }
    } catch (err) {
      apiLogger.error({ error: err }, 'NLP Processing Error')
      return this.fallbackAnalysis(query)
    }
  }

  /**
   * Parse natural language for business intelligence
   */
  static async parseNaturalLanguage(text: string): Promise<NLPEntities> {
    const analysis = await this.processChatbotQuery(text)
    return analysis.entities
  }

  /**
   * Fallback analysis when AI processing fails
   */
  private static fallbackAnalysis(query: string): NLPAnalysis {
    // Simple regex-based fallback
    const numbers = query.match(/\d+/g)?.map(n => parseInt(n)) || []
    const hasQuestions = /\?|apa|bagaimana|kenapa|kapan|dimana|siapa/i.test(query)

    return {
      intents: [{
        intent: hasQuestions ? 'question' : 'statement',
        confidence: 0.7,
        entities: { originalQuery: query, numbers }
      }],
      primaryIntent: hasQuestions ? 'question' : 'statement',
      entities: { originalQuery: query, numbers },
      sentiment: 'neutral',
      complexity: 'simple',
      context: ['general']
    }
  }
}

// ============================================================================
// BUSINESS AI SERVICES
// ============================================================================

export interface PricingData {
  products?: Array<{
    id: string
    name: string
    currentPrice: number
    cost: number
    category: string
    salesVolume: number
  }>
  marketData?: {
    competitors: Array<{
      name: string
      price: number
      marketShare: number
    }>
    targetMargin: number
  }
  [key: string]: unknown
}

export interface InventoryData {
  items?: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
    demandRate: number
    supplierLeadTime: number
  }>
  warehouse?: {
    capacity: number
    utilization: number
  }
  [key: string]: unknown
}

export interface ProductionData {
  recipes?: Array<{
    id: string
    name: string
    productionTime: number
    ingredients: Array<{
      id: string
      name: string
      quantity: number
    }>
  }>
  equipment?: {
    capacity: number
    utilization: number
  }
  [key: string]: unknown
}

export class BusinessAI {
  /**
   * Generate pricing recommendations
   */
  static async generatePricingStrategy(data: PricingData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'dynamic pricing strategy and market positioning')
    const systemPrompt = 'You are a pricing strategist specializing in Indonesian food businesses and competitive analysis.'

    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Analyze inventory patterns and suggest optimizations
   */
  static async analyzeInventory(data: InventoryData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'inventory management and supply chain optimization')
    const systemPrompt = 'You are an inventory optimization expert for food service businesses.'

    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize production schedules
   */
  static async optimizeProduction(data: ProductionData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'production planning and resource optimization')
    const systemPrompt = 'You are a production planning expert for food manufacturing businesses.'

    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Generate business insights from data
   */
  static async getBusinessInsights(data: any): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'comprehensive business intelligence and strategic recommendations')
    const systemPrompt = 'You are a business consultant specializing in Indonesian UMKM food businesses.'

    return await AIService.callOpenRouter(prompt, systemPrompt)
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Process chatbot query (convenience function)
 */
export async function processChatbotQuery(query: string): Promise<NLPAnalysis> {
  return NLPProcessor.processChatbotQuery(query)
}

/**
 * Train NLP model (placeholder - would implement actual training)
 */
export async function trainNLPModel(data: any): Promise<boolean> {
  apiLogger.info({ data }, 'NLP Model training requested (placeholder)')
  // In a real implementation, this would train/update the NLP model
  return true
}

/**
 * Parse natural language (convenience function)
 */
export async function parseNaturalLanguage(text: string): Promise<NLPEntities> {
  return NLPProcessor.parseNaturalLanguage(text)
}

/**
 * Generate AI insights (convenience function)
 */
export async function generateAIInsights(data: any): Promise<string> {
  return BusinessAI.getBusinessInsights(data)
}
