import { apiLogger } from '@/lib/logger'

import { AISecurity } from '@/lib/ai/security'
import { AIService } from '@/lib/ai/service'

/**
 * NLP Processor Module
 * Natural Language Processing for chatbot queries
 */


export interface NLPIntent {
  intent: string
  confidence: number
  entities: NLPEntities
}

export interface NLPAnalysis {
  intents: NLPIntent[]
  primaryIntent: string
  entities: NLPEntities
  sentiment: 'negative' | 'neutral' | 'positive'
  complexity: 'complex' | 'medium' | 'simple'
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

      try {
        const analysis = JSON.parse(response) as NLPAnalysis
        return analysis
      } catch {
        return this.fallbackAnalysis(safeQuery)
      }
    } catch (error) {
      apiLogger.error({ error }, 'NLP Processing Error')
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
    
    const intentPatterns = [
      { pattern: /stok|persediaan|inventory|sisa|tersedia/i, intent: 'check_inventory', confidence: 0.95, category: 'inventory' },
      { pattern: /restock|isi ulang|beli bahan/i, intent: 'restock_planning', confidence: 0.9, category: 'inventory' },
      { pattern: /hpp|harga pokok|biaya produksi|cost of goods/i, intent: 'analyze_hpp', confidence: 0.95, category: 'costing' },
      { pattern: /biaya|cost|pengeluaran|expense/i, intent: 'cost_analysis', confidence: 0.85, category: 'costing' },
      { pattern: /profit|untung|laba|margin|keuntungan/i, intent: 'analyze_profit', confidence: 0.95, category: 'financial' },
      { pattern: /rugi|loss|merugi/i, intent: 'loss_analysis', confidence: 0.9, category: 'financial' },
      { pattern: /revenue|pendapatan|pemasukan|omzet/i, intent: 'revenue_analysis', confidence: 0.9, category: 'financial' },
      { pattern: /harga jual|pricing|tentukan harga|harga yang pas/i, intent: 'pricing_strategy', confidence: 0.95, category: 'strategy' },
      { pattern: /naik.*harga|turun.*harga|ubah.*harga/i, intent: 'price_adjustment', confidence: 0.9, category: 'strategy' },
      { pattern: /marketing|promosi|promo|iklan|advertis/i, intent: 'marketing_strategy', confidence: 0.95, category: 'marketing' },
      { pattern: /penjualan|jualan|sales|laku|terjual/i, intent: 'sales_analysis', confidence: 0.9, category: 'marketing' },
      { pattern: /ningkatin|boost|tingkatkan|naikin.*penjualan/i, intent: 'sales_boost', confidence: 0.95, category: 'marketing' },
      { pattern: /customer|pelanggan|pembeli/i, intent: 'customer_management', confidence: 0.85, category: 'marketing' },
      { pattern: /resep|recipe|formula/i, intent: 'recipe_query', confidence: 0.9, category: 'product' },
      { pattern: /produk|product|menu/i, intent: 'product_query', confidence: 0.85, category: 'product' },
      { pattern: /menguntungkan|paling cuan|profitable/i, intent: 'profitability_ranking', confidence: 0.95, category: 'product' },
      { pattern: /pesanan|order|orderan/i, intent: 'order_management', confidence: 0.9, category: 'operations' },
      { pattern: /produksi|production|batch/i, intent: 'production_planning', confidence: 0.9, category: 'operations' },
      { pattern: /strategi|strategy|cara|tips|saran|rekomendasi|advice/i, intent: 'strategy_advice', confidence: 0.9, category: 'strategy' },
      { pattern: /gimana|bagaimana|how to/i, intent: 'how_to_question', confidence: 0.85, category: 'strategy' },
      { pattern: /kenapa|why|penyebab|alasan/i, intent: 'root_cause_analysis', confidence: 0.9, category: 'strategy' },
      { pattern: /bandingkan|compare|vs|versus|lebih baik/i, intent: 'comparison', confidence: 0.9, category: 'analysis' },
      { pattern: /mana yang|which|pilih/i, intent: 'recommendation_request', confidence: 0.85, category: 'analysis' },
      { pattern: /laporan|report|analisis|analysis/i, intent: 'report_request', confidence: 0.85, category: 'reporting' },
      { pattern: /trend|tren|perkembangan/i, intent: 'trend_analysis', confidence: 0.9, category: 'reporting' },
    ]
    
    for (const { pattern, intent, confidence, category } of intentPatterns) {
      if (pattern.test(lowerQuery)) {
        return { intent, confidence, category }
      }
    }
    
    return { intent: 'general_question', confidence: 0.6, category: 'general' }
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
    
    const numbers = (query.match(/\d+/g) ?? []).map(n => parseInt(n))
    const currencies = query.match(/rp\.?\s*\d+[\d.,]*/gi) ?? []
    const percentages = (query.match(/\d+%/g) ?? []).map(p => parseInt(p))
    const dates = query.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|hari ini|kemarin|besok|minggu ini|bulan ini/gi) ?? []
    
    const timeframes: string[] = []
    if (/hari ini|today/i.test(query)) {timeframes.push('today')}
    if (/kemarin|yesterday/i.test(query)) {timeframes.push('yesterday')}
    if (/minggu ini|this week/i.test(query)) {timeframes.push('this_week')}
    if (/bulan ini|this month/i.test(query)) {timeframes.push('this_month')}
    if (/tahun ini|this year/i.test(query)) {timeframes.push('this_year')}
    
    const productKeywords = ['brownies', 'cookies', 'cake', 'kue', 'roti', 'pastry']
    const products = productKeywords.filter(p => lowerQuery.includes(p))
    
    const ingredientKeywords = ['tepung', 'gula', 'telur', 'mentega', 'coklat', 'susu', 'flour', 'sugar', 'butter', 'chocolate']
    const ingredients = ingredientKeywords.filter(i => lowerQuery.includes(i))
    
    return { products, ingredients, numbers, currencies, dates, percentages, timeframes }
  }

  /**
   * Detect sentiment with nuanced scoring
   */
  static analyzeSentiment(query: string): {
    sentiment: 'negative' | 'neutral' | 'positive'
    score: number
    confidence: number
  } {
    const lowerQuery = query.toLowerCase()
    
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
    
    const totalWords = positiveCount + negativeCount
    let score = 0
    let sentiment: 'negative' | 'neutral' | 'positive' = 'neutral'
    let confidence = 0.5
    
    if (totalWords > 0) {
      score = (positiveCount - negativeCount) / totalWords
      confidence = Math.min(totalWords / 3, 1)
      
      if (score > 0.2) {sentiment = 'positive'}
      else if (score < -0.2) {sentiment = 'negative'}
    }
    
    return { sentiment, score, confidence }
  }

  /**
   * Fallback analysis when AI processing fails
   */
  private static fallbackAnalysis(query: string): NLPAnalysis {
    const lowerQuery = query.toLowerCase()
    const numbers = query.match(/\d+/g)?.map(n => parseInt(n)) ?? []
    const currencies = query.match(/rp\.?\s*\d+[\d.,]*/gi) ?? []
    
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
    
    let questionType: string | null = null
    for (const [indo, eng] of Object.entries(questionWords)) {
      if (lowerQuery.includes(indo)) {
        questionType = eng
        break
      }
    }
    
    const intents: Array<{ intent: string; confidence: number; entities: { numbers: number[] } }> = []
    
    if (/stok|persediaan|inventory/i.test(query)) {
      intents.push({ intent: 'check_inventory', confidence: 0.9, entities: { numbers } })
    }
    if (/hpp|biaya|cost|harga pokok/i.test(query)) {
      intents.push({ intent: 'analyze_hpp', confidence: 0.9, entities: { numbers } })
    }
    if (/profit|untung|laba|rugi/i.test(query)) {
      intents.push({ intent: 'analyze_profit', confidence: 0.9, entities: { numbers } })
    }
    
    let sentiment: 'negative' | 'neutral' | 'positive' = 'neutral'
    const positiveWords = ['bagus', 'baik', 'untung', 'naik', 'meningkat']
    const negativeWords = ['buruk', 'jelek', 'rugi', 'turun', 'menurun']
    
    const hasPositive = positiveWords.some(word => lowerQuery.includes(word))
    const hasNegative = negativeWords.some(word => lowerQuery.includes(word))
    
    if (hasPositive && !hasNegative) {sentiment = 'positive'}
    else if (hasNegative && !hasPositive) {sentiment = 'negative'}
    
    let complexity: 'complex' | 'medium' | 'simple' = 'simple'
    if (intents.length > 2) {complexity = 'complex'}
    else if (intents.length === 2 || numbers.length > 2) {complexity = 'medium'}
    
    const contexts: string[] = []
    if (/resep|recipe/i.test(query)) {contexts.push('recipes')}
    if (/bahan|ingredient/i.test(query)) {contexts.push('ingredients')}
    if (/hpp|cost/i.test(query)) {contexts.push('hpp')}
    if (contexts.length === 0) {contexts.push('general')}
    
    let primaryIntent: string
    if (intents.length > 0) {
      const sortedIntents = [...intents].sort((a, b) => b.confidence - a.confidence)
      primaryIntent = sortedIntents[0]?.intent ?? (questionType ? 'question' : 'statement')
    } else {
      primaryIntent = questionType ? 'question' : 'statement'
    }
    
    return {
      intents: intents.length > 0 ? intents : [{
        intent: questionType ? 'question' : 'statement',
        confidence: 0.7,
        entities: { originalQuery: query, numbers, questionType }
      }],
      primaryIntent,
      entities: { originalQuery: query, numbers, currencies, questionType, hasQuestion: Boolean(questionType) },
      sentiment,
      complexity,
      context: contexts
    }
  }
}
