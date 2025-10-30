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
   * Call OpenRouter API (primary method)
   */
  static async callAI(
    prompt: string,
    systemPrompt: string,
    model = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<string> {
    return await this.callOpenRouter(prompt, systemPrompt, model)
  }

  /**
   * Call OpenRouter API with enhanced security
   */
  static async callOpenRouter(
    prompt: string,
    systemPrompt: string,
    model = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<string> {
    const apiKey = process.env['OPENROUTER_API_KEY']

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your .env file')
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
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: { message: errorText } }
        }
        
        apiLogger.error({ 
          status: response.status, 
          error: errorData,
          model,
          hasApiKey: !!apiKey 
        }, 'OpenRouter API Error')
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('No content in OpenRouter response')
      }
      
      return content
      
    } catch (err) {
      apiLogger.error({ error: err, model, hasApiKey: !!apiKey }, 'OpenRouter Client Error')
      throw err
    }
  }

  /**
   * Call OpenAI API as fallback
   */
  static async callOpenAI(
    prompt: string,
    systemPrompt: string,
    model = 'gpt-3.5-turbo'
  ): Promise<string> {
    const apiKey = process.env['OPENAI_API_KEY']

    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
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
    currentData?: Record<string, unknown>
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
  static buildAnalysisPrompt(data: Record<string, unknown>, analysisType: string): string {
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

    // Call AI service using AIClient with fallback
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
  questionType?: string | null
  hasQuestion?: boolean
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
   * Classify user intent with confidence scoring
   */
  static classifyIntent(query: string): { intent: string; confidence: number; category: string } {
    const lowerQuery = query.toLowerCase()
    
    // Intent patterns with confidence scores
    const intentPatterns = [
      // Inventory & Stock
      { pattern: /stok|persediaan|inventory|sisa|tersedia/i, intent: 'check_inventory', confidence: 0.95, category: 'inventory' },
      { pattern: /restock|isi ulang|beli bahan/i, intent: 'restock_planning', confidence: 0.9, category: 'inventory' },
      
      // HPP & Costing
      { pattern: /hpp|harga pokok|biaya produksi|cost of goods/i, intent: 'analyze_hpp', confidence: 0.95, category: 'costing' },
      { pattern: /biaya|cost|pengeluaran|expense/i, intent: 'cost_analysis', confidence: 0.85, category: 'costing' },
      
      // Profitability
      { pattern: /profit|untung|laba|margin|keuntungan/i, intent: 'analyze_profit', confidence: 0.95, category: 'financial' },
      { pattern: /rugi|loss|merugi/i, intent: 'loss_analysis', confidence: 0.9, category: 'financial' },
      { pattern: /revenue|pendapatan|pemasukan|omzet/i, intent: 'revenue_analysis', confidence: 0.9, category: 'financial' },
      
      // Pricing Strategy
      { pattern: /harga jual|pricing|tentukan harga|harga yang pas/i, intent: 'pricing_strategy', confidence: 0.95, category: 'strategy' },
      { pattern: /naik.*harga|turun.*harga|ubah.*harga/i, intent: 'price_adjustment', confidence: 0.9, category: 'strategy' },
      
      // Marketing & Sales
      { pattern: /marketing|promosi|promo|iklan|advertis/i, intent: 'marketing_strategy', confidence: 0.95, category: 'marketing' },
      { pattern: /penjualan|jualan|sales|laku|terjual/i, intent: 'sales_analysis', confidence: 0.9, category: 'marketing' },
      { pattern: /ningkatin|boost|tingkatkan|naikin.*penjualan/i, intent: 'sales_boost', confidence: 0.95, category: 'marketing' },
      { pattern: /customer|pelanggan|pembeli/i, intent: 'customer_management', confidence: 0.85, category: 'marketing' },
      
      // Recipe & Product
      { pattern: /resep|recipe|formula/i, intent: 'recipe_query', confidence: 0.9, category: 'product' },
      { pattern: /produk|product|menu/i, intent: 'product_query', confidence: 0.85, category: 'product' },
      { pattern: /menguntungkan|paling cuan|profitable/i, intent: 'profitability_ranking', confidence: 0.95, category: 'product' },
      
      // Orders
      { pattern: /pesanan|order|orderan/i, intent: 'order_management', confidence: 0.9, category: 'operations' },
      { pattern: /produksi|production|batch/i, intent: 'production_planning', confidence: 0.9, category: 'operations' },
      
      // Strategy & Advice
      { pattern: /strategi|strategy|cara|tips|saran|rekomendasi|advice/i, intent: 'strategy_advice', confidence: 0.9, category: 'strategy' },
      { pattern: /gimana|bagaimana|how to/i, intent: 'how_to_question', confidence: 0.85, category: 'strategy' },
      { pattern: /kenapa|why|penyebab|alasan/i, intent: 'root_cause_analysis', confidence: 0.9, category: 'strategy' },
      
      // Comparison
      { pattern: /bandingkan|compare|vs|versus|lebih baik/i, intent: 'comparison', confidence: 0.9, category: 'analysis' },
      { pattern: /mana yang|which|pilih/i, intent: 'recommendation_request', confidence: 0.85, category: 'analysis' },
      
      // Reporting
      { pattern: /laporan|report|analisis|analysis/i, intent: 'report_request', confidence: 0.85, category: 'reporting' },
      { pattern: /trend|tren|perkembangan/i, intent: 'trend_analysis', confidence: 0.9, category: 'reporting' },
    ]
    
    // Find matching patterns
    for (const { pattern, intent, confidence, category } of intentPatterns) {
      if (pattern.test(lowerQuery)) {
        return { intent, confidence, category }
      }
    }
    
    // Default fallback
    return { 
      intent: 'general_question', 
      confidence: 0.6, 
      category: 'general' 
    }
  }

  /**
   * Extract business entities from query
   */
  static extractEntities(query: string): {
    products: string[]
    ingredients: string[]
    numbers: number[]
    currencies: string[]
    dates: string[]
    percentages: number[]
    timeframes: string[]
  } {
    const lowerQuery = query.toLowerCase()
    
    // Extract numbers
    const numbers = (query.match(/\d+/g) || []).map(n => parseInt(n))
    
    // Extract currencies
    const currencies = query.match(/rp\.?\s*\d+[\d.,]*/gi) || []
    
    // Extract percentages
    const percentages = (query.match(/\d+%/g) || []).map(p => parseInt(p))
    
    // Extract dates (simple patterns)
    const dates = query.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|hari ini|kemarin|besok|minggu ini|bulan ini/gi) || []
    
    // Extract timeframes
    const timeframes = []
    if (/hari ini|today/i.test(query)) {timeframes.push('today')}
    if (/kemarin|yesterday/i.test(query)) {timeframes.push('yesterday')}
    if (/minggu ini|this week/i.test(query)) {timeframes.push('this_week')}
    if (/bulan ini|this month/i.test(query)) {timeframes.push('this_month')}
    if (/tahun ini|this year/i.test(query)) {timeframes.push('this_year')}
    
    // Common product names (can be expanded)
    const productKeywords = ['brownies', 'cookies', 'cake', 'kue', 'roti', 'pastry']
    const products = productKeywords.filter(p => lowerQuery.includes(p))
    
    // Common ingredient names (can be expanded)
    const ingredientKeywords = ['tepung', 'gula', 'telur', 'mentega', 'coklat', 'susu', 'flour', 'sugar', 'butter', 'chocolate']
    const ingredients = ingredientKeywords.filter(i => lowerQuery.includes(i))
    
    return {
      products,
      ingredients,
      numbers,
      currencies,
      dates,
      percentages,
      timeframes
    }
  }

  /**
   * Detect sentiment with nuanced scoring
   */
  static analyzeSentiment(query: string): {
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number // -1 to 1
    confidence: number
  } {
    const lowerQuery = query.toLowerCase()
    
    // Sentiment lexicon
    const positiveWords = [
      'bagus', 'baik', 'untung', 'naik', 'meningkat', 'sukses', 'berhasil', 
      'mantap', 'oke', 'sip', 'hebat', 'luar biasa', 'sempurna', 'excellent',
      'profit', 'laba', 'cuan', 'laris', 'ramai', 'banyak'
    ]
    
    const negativeWords = [
      'buruk', 'jelek', 'rugi', 'turun', 'menurun', 'gagal', 'masalah', 
      'susah', 'sulit', 'sepi', 'sedikit', 'kurang', 'loss', 'merugi',
      'mahal', 'boros', 'waste', 'habis', 'kosong'
    ]
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (lowerQuery.includes(word)) {positiveCount++}
    })
    
    negativeWords.forEach(word => {
      if (lowerQuery.includes(word)) {negativeCount++}
    })
    
    // Calculate score
    const totalWords = positiveCount + negativeCount
    let score = 0
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let confidence = 0.5
    
    if (totalWords > 0) {
      score = (positiveCount - negativeCount) / totalWords
      confidence = Math.min(totalWords / 3, 1) // More words = higher confidence
      
      if (score > 0.2) {sentiment = 'positive'}
      else if (score < -0.2) {sentiment = 'negative'}
    }
    
    return { sentiment, score, confidence }
  }

  /**
   * Fallback analysis when AI processing fails - ENHANCED NLP
   */
  private static fallbackAnalysis(query: string): NLPAnalysis {
    const lowerQuery = query.toLowerCase()
    
    // Extract numbers
    const numbers = query.match(/\d+/g)?.map(n => parseInt(n)) || []
    
    // Extract currencies (Rupiah)
    const currencies = query.match(/rp\.?\s*\d+[\d.,]*/gi) || []
    
    // Detect question words
    const questionWords = {
      'apa': 'what',
      'bagaimana': 'how',
      'gimana': 'how',
      'kenapa': 'why',
      'kapan': 'when',
      'dimana': 'where',
      'siapa': 'who',
      'berapa': 'how_much'
    }
    
    let questionType = null
    for (const [indo, eng] of Object.entries(questionWords)) {
      if (lowerQuery.includes(indo)) {
        questionType = eng
        break
      }
    }
    
    // Intent detection with confidence scoring
    const intents = []
    
    // Business intents
    if (/stok|persediaan|inventory/i.test(query)) {
      intents.push({ intent: 'check_inventory', confidence: 0.9, entities: { numbers } })
    }
    if (/hpp|biaya|cost|harga pokok/i.test(query)) {
      intents.push({ intent: 'analyze_hpp', confidence: 0.9, entities: { numbers } })
    }
    if (/profit|untung|laba|rugi/i.test(query)) {
      intents.push({ intent: 'analyze_profit', confidence: 0.9, entities: { numbers } })
    }
    if (/resep|recipe|produk/i.test(query)) {
      intents.push({ intent: 'recipe_query', confidence: 0.85, entities: { numbers } })
    }
    if (/harga|price|pricing/i.test(query)) {
      intents.push({ intent: 'pricing_strategy', confidence: 0.85, entities: { currencies } })
    }
    if (/strategi|cara|tips|saran|rekomendasi/i.test(query)) {
      intents.push({ intent: 'strategy_advice', confidence: 0.8, entities: {} })
    }
    if (/marketing|promosi|promo|jualan|penjualan/i.test(query)) {
      intents.push({ intent: 'marketing_strategy', confidence: 0.85, entities: {} })
    }
    if (/pesanan|order|orderan/i.test(query)) {
      intents.push({ intent: 'order_management', confidence: 0.85, entities: { numbers } })
    }
    if (/bahan|ingredient/i.test(query)) {
      intents.push({ intent: 'ingredient_query', confidence: 0.85, entities: { numbers } })
    }
    if (/laporan|report|analisis/i.test(query)) {
      intents.push({ intent: 'report_request', confidence: 0.8, entities: {} })
    }
    
    // Action intents
    if (/tambah|buat|create|add/i.test(query)) {
      intents.push({ intent: 'create_action', confidence: 0.75, entities: {} })
    }
    if (/ubah|edit|update|ganti/i.test(query)) {
      intents.push({ intent: 'update_action', confidence: 0.75, entities: {} })
    }
    if (/hapus|delete|remove/i.test(query)) {
      intents.push({ intent: 'delete_action', confidence: 0.75, entities: {} })
    }
    
    // Sentiment analysis
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    const positiveWords = ['bagus', 'baik', 'untung', 'naik', 'meningkat', 'sukses', 'berhasil', 'mantap', 'oke', 'sip']
    const negativeWords = ['buruk', 'jelek', 'rugi', 'turun', 'menurun', 'gagal', 'masalah', 'susah', 'sulit']
    
    const hasPositive = positiveWords.some(word => lowerQuery.includes(word))
    const hasNegative = negativeWords.some(word => lowerQuery.includes(word))
    
    if (hasPositive && !hasNegative) {sentiment = 'positive'}
    else if (hasNegative && !hasPositive) {sentiment = 'negative'}
    
    // Complexity detection
    let complexity: 'simple' | 'medium' | 'complex' = 'simple'
    if (intents.length > 2) {complexity = 'complex'}
    else if (intents.length === 2 || numbers.length > 2) {complexity = 'medium'}
    
    // Context detection
    const contexts = []
    if (/resep|recipe/i.test(query)) {contexts.push('recipes')}
    if (/bahan|ingredient/i.test(query)) {contexts.push('ingredients')}
    if (/hpp|cost/i.test(query)) {contexts.push('hpp')}
    if (/pesanan|order/i.test(query)) {contexts.push('orders')}
    if (/profit|laba/i.test(query)) {contexts.push('financial')}
    if (/marketing|promosi/i.test(query)) {contexts.push('marketing')}
    if (/strategi|strategy/i.test(query)) {contexts.push('strategy')}
    if (contexts.length === 0) {contexts.push('general')}
    
    // Primary intent (highest confidence)
    const primaryIntent = intents.length > 0 
      ? intents.sort((a, b) => b.confidence - a.confidence)[0].intent
      : (questionType ? 'question' : 'statement')
    
    return {
      intents: intents.length > 0 ? intents : [{
        intent: questionType ? 'question' : 'statement',
        confidence: 0.7,
        entities: { originalQuery: query, numbers, questionType }
      }],
      primaryIntent,
      entities: { 
        originalQuery: query, 
        numbers,
        currencies,
        questionType,
        hasQuestion: !!questionType
      },
      sentiment,
      complexity,
      context: contexts
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
  static async getBusinessInsights(data: Record<string, unknown>): Promise<string> {
    try {
      // Extract key information from the data
      const { query, intent, entities, userId } = data
      
      // Build context-aware prompt based on intent
      let contextualPrompt = ''
      
      if (typeof intent === 'string') {
        switch (intent) {
          case 'check_inventory':
            contextualPrompt = `User bertanya tentang stok inventory: "${query}". Berikan informasi tentang cara mengecek stok, tips manajemen inventory, dan saran untuk optimasi stok bahan baku.`
            break
          case 'analyze_hpp':
            contextualPrompt = `User bertanya tentang HPP (Harga Pokok Produksi): "${query}". Jelaskan cara menghitung HPP, faktor-faktor yang mempengaruhi, dan tips untuk mengoptimalkan biaya produksi.`
            break
          case 'analyze_profit':
            contextualPrompt = `User bertanya tentang profit/keuntungan: "${query}". Berikan analisis tentang cara meningkatkan profit margin, strategi pricing, dan tips bisnis kuliner.`
            break
          case 'recipe_query':
            contextualPrompt = `User bertanya tentang resep: "${query}". Berikan saran tentang manajemen resep, optimasi bahan, dan tips produksi yang efisien.`
            break
          case 'pricing_strategy':
            contextualPrompt = `User bertanya tentang strategi harga: "${query}". Berikan saran tentang penetapan harga yang kompetitif, analisis margin, dan strategi pricing untuk UMKM kuliner.`
            break
          case 'marketing_strategy':
            contextualPrompt = `User bertanya tentang marketing: "${query}". Berikan tips marketing untuk UMKM kuliner, strategi promosi, dan cara meningkatkan penjualan.`
            break
          case 'order_management':
            contextualPrompt = `User bertanya tentang manajemen pesanan: "${query}". Berikan tips untuk mengelola pesanan, optimasi workflow, dan meningkatkan efisiensi operasional.`
            break
          default:
            contextualPrompt = `User bertanya: "${query}". Berikan jawaban yang membantu terkait bisnis kuliner UMKM di Indonesia.`
        }
      } else {
        contextualPrompt = `User bertanya: "${query}". Berikan jawaban yang membantu terkait bisnis kuliner UMKM di Indonesia.`
      }

      const systemPrompt = `Anda adalah asisten AI HeyTrack yang ahli dalam bisnis kuliner UMKM Indonesia. 

KONTEKS:
- HeyTrack adalah sistem manajemen bisnis untuk UMKM kuliner
- User menggunakan sistem untuk tracking HPP, inventory, resep, dan profit
- Fokus pada solusi praktis dan actionable untuk bisnis kuliner

GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang ramah dan profesional
- Berikan jawaban yang spesifik dan actionable
- Sertakan contoh praktis jika relevan
- Gunakan format yang mudah dibaca (bullet points, numbering)
- Fokus pada solusi bisnis yang realistis untuk UMKM

BATASAN:
- Hanya jawab pertanyaan terkait bisnis kuliner dan manajemen
- Jangan berikan informasi yang tidak akurat
- Jika tidak yakin, arahkan user ke fitur yang relevan di HeyTrack`

      const response = await AIService.callOpenRouter(contextualPrompt, systemPrompt)
      return response
      
    } catch (error) {
      apiLogger.error({ error, data }, 'Error generating business insights')
      
      // Enhanced fallback based on query content
      const query = data.query as string || ''
      const lowerQuery = query.toLowerCase()
      
      if (lowerQuery.includes('stok') || lowerQuery.includes('inventory')) {
        return `📦 **Manajemen Stok Bahan Baku**

Untuk mengelola stok dengan baik:

1. **Cek Stok Reguler** - Pantau stok harian di halaman Inventory
2. **Set Minimum Stock** - Atur batas minimum untuk alert otomatis  
3. **Tracking Penggunaan** - Catat penggunaan bahan per produksi
4. **Supplier Backup** - Siapkan supplier alternatif

💡 **Tips**: Gunakan fitur reorder alert di HeyTrack untuk menghindari kehabisan stok.

Akses: Dashboard → Inventory → Kelola Stok`
      }
      
      if (lowerQuery.includes('hpp') || lowerQuery.includes('biaya')) {
        return `💰 **Analisis HPP (Harga Pokok Produksi)**

HPP yang akurat penting untuk profit:

1. **Hitung Biaya Bahan** - Semua ingredient + packaging
2. **Biaya Operasional** - Listrik, gas, tenaga kerja
3. **Overhead** - Sewa, depresiasi alat
4. **Margin Keuntungan** - Minimal 30-50% untuk sustainability

📊 **Formula**: HPP + Margin = Harga Jual

Akses: Dashboard → HPP Calculator → Analisis Biaya`
      }
      
      if (lowerQuery.includes('profit') || lowerQuery.includes('untung')) {
        return `📈 **Optimasi Profit Margin**

Strategi meningkatkan keuntungan:

1. **Efisiensi Bahan** - Kurangi waste, optimasi porsi
2. **Pricing Strategy** - Review harga secara berkala
3. **Volume Sales** - Fokus pada produk high-margin
4. **Cost Control** - Monitor biaya operasional

🎯 **Target**: Margin 35-50% untuk produk makanan

Akses: Dashboard → Reports → Profit Analysis`
      }
      
      return `🤖 **Asisten AI HeyTrack**

Saya bisa membantu Anda dengan:

• 📦 **Manajemen Inventory** - Stok, reorder, supplier
• 💰 **Analisis HPP** - Kalkulasi biaya produksi  
• 📊 **Profit Analysis** - Margin, pricing strategy
• 🍳 **Manajemen Resep** - Optimasi bahan, costing
• 📋 **Tracking Pesanan** - Workflow, customer management

Coba tanyakan hal spesifik seperti:
- "Bagaimana cara menghitung HPP brownies?"
- "Tips mengoptimalkan stok bahan baku"
- "Strategi pricing untuk produk baru"`
    }
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
export async function trainNLPModel(data: Record<string, unknown>): Promise<boolean> {
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
export async function generateAIInsights(data: Record<string, unknown>): Promise<string> {
  return BusinessAI.getBusinessInsights(data)
}
