/**
 * Advanced NLP Processor for HeyTrack AI Chatbot
 * Supports intent recognition, entity extraction, and contextual understanding
 */

export interface NLPIntent {
  intent: string
  confidence: number
  entities: Record<string, any>
}

export interface NLPAnalysis {
  intents: NLPIntent[]
  primaryIntent: string
  entities: Record<string, any>
  sentiment: 'positive' | 'negative' | 'neutral'
  complexity: 'simple' | 'medium' | 'complex'
  context: string[]
}

export interface PromptTemplate {
  systemPrompt: string
  userPrompt: string
  contextPrompt?: string
  examples?: string[]
}

// Keywords mapping untuk intent recognition
const INTENT_KEYWORDS = {
  inventory: [
    'stok', 'stock', 'bahan', 'material', 'inventory', 'tersedia', 'habis',
    'kurang', 'low stock', 'reorder', 'restock', 'persediaan', 'supply'
  ],
  recipe: [
    'resep', 'recipe', 'produksi', 'production', 'bakar', 'bake', 'masak',
    'cook', 'menu', 'product', 'item', 'roti', 'cake', 'kue', 'makanan'
  ],
  financial: [
    'uang', 'money', 'keuangan', 'financial', 'profit', 'laba', 'pendapatan',
    'revenue', 'biaya', 'cost', 'harga', 'price', 'margin', 'pendapatan',
    'pengeluaran', 'expense', 'cash flow', 'arus kas'
  ],
  orders: [
    'pesanan', 'order', 'customer', 'pelanggan', 'penjualan', 'sales',
    'transaksi', 'transaction', 'delivery', 'pengiriman', 'status'
  ],
  strategy: [
    'strategi', 'strategy', 'bisnis', 'business', 'rencana', 'plan',
    'pengembangan', 'development', 'growth', 'pertumbuhan', 'optimasi',
    'optimization', 'efisiensi', 'efficiency', 'kompetitor', 'competitor'
  ],
  analytics: [
    'analisis', 'analysis', 'laporan', 'report', 'tren', 'trend', 'statistik',
    'statistics', 'dashboard', 'overview', 'ringkasan', 'summary', 'insight'
  ],
  help: [
    'bantuan', 'help', 'cara', 'how', 'panduan', 'guide', 'tutorial',
    'menggunakan', 'use', 'fitur', 'feature', 'fungsi', 'function'
  ]
}

// Entity patterns
const ENTITY_PATTERNS = {
  numbers: /\b(\d+(?:\.\d+)?)\b/g,
  dates: /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g,
  currencies: /\b(?:rp|rupiah|idr)\s*(\d+(?:[.,]\d+)*)/gi,
  products: /\b(?:roti|kue|cake|bread|pastry|cookies?|donut|croissant)\b/gi,
  ingredients: /\b(?:tepung|gula|susu|butter|telur|ragi|vanilla|chocolate|coklat)\b/gi
}

export class NLPProcessor {
  static analyzeQuery(query: string): NLPAnalysis {
    const lowerQuery = query.toLowerCase()
    const intents: NLPIntent[] = []

    // Calculate intent scores
    for (const [intentName, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0
      let matches = 0

      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          score += keyword.length > 3 ? 2 : 1 // Longer keywords get higher weight
          matches++
        }
      }

      // Boost score for multiple matches
      if (matches > 1) score *= 1.5

      // Add intent if score is above threshold
      if (score > 0) {
        intents.push({
          intent: intentName,
          confidence: Math.min(score / 10, 1), // Normalize to 0-1
          entities: this.extractEntities(query, intentName)
        })
      }
    }

    // Sort by confidence
    intents.sort((a, b) => b.confidence - a.confidence)

    // Determine primary intent
    const primaryIntent = intents.length > 0 ? intents[0].intent : 'general'

    // Extract all entities
    const allEntities = intents.reduce((acc, intent) => ({
      ...acc,
      ...intent.entities
    }), this.extractGeneralEntities(query))

    // Determine sentiment
    const sentiment = this.analyzeSentiment(query)

    // Determine complexity
    const complexity = this.analyzeComplexity(query)

    // Extract context keywords
    const context = this.extractContext(query)

    return {
      intents,
      primaryIntent,
      entities: allEntities,
      sentiment,
      complexity,
      context
    }
  }

  static extractEntities(query: string, intent: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Intent-specific entity extraction
    switch (intent) {
      case 'inventory':
        // Extract ingredient names
        const ingredients = query.match(ENTITY_PATTERNS.ingredients)
        if (ingredients) entities.ingredients = ingredients

        // Extract quantities
        const quantities = query.match(ENTITY_PATTERNS.numbers)
        if (quantities) entities.quantities = quantities.map(q => parseFloat(q))
        break

      case 'financial':
        // Extract amounts
        const amounts = query.match(ENTITY_PATTERNS.currencies)
        if (amounts) entities.amounts = amounts

        // Extract time periods
        if (query.includes('bulan') || query.includes('month')) entities.period = 'month'
        if (query.includes('minggu') || query.includes('week')) entities.period = 'week'
        if (query.includes('tahun') || query.includes('year')) entities.period = 'year'
        break

      case 'recipe':
        // Extract product names
        const products = query.match(ENTITY_PATTERNS.products)
        if (products) entities.products = products

        // Extract quantities
        const recipeQuantities = query.match(ENTITY_PATTERNS.numbers)
        if (recipeQuantities) entities.quantities = recipeQuantities.map(q => parseFloat(q))
        break
    }

    return entities
  }

  static extractGeneralEntities(query: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract numbers
    const numbers = query.match(ENTITY_PATTERNS.numbers)
    if (numbers) entities.numbers = numbers.map(n => parseFloat(n))

    // Extract dates
    const dates = query.match(ENTITY_PATTERNS.dates)
    if (dates) entities.dates = dates

    // Extract currencies
    const currencies = query.match(ENTITY_PATTERNS.currencies)
    if (currencies) entities.currencies = currencies

    return entities
  }

  static analyzeSentiment(query: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bagus', 'baik', 'sukses', 'profit', 'naik', 'tambah', 'meningkat', 'good', 'great', 'excellent']
    const negativeWords = ['buruk', 'jelek', 'rugi', 'turun', 'kurang', 'menurun', 'bad', 'poor', 'terrible']

    const lowerQuery = query.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerQuery.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerQuery.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  static analyzeComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const words = query.split(' ').length
    const hasMultipleIntents = query.split(/[,.!?]+/).length > 2
    const hasTechnicalTerms = /\b(analisis|optimasi|strategi|efisiensi|kompetitor|market|segmentasi)\b/i.test(query)

    if (words < 5 && !hasTechnicalTerms) return 'simple'
    if (words < 15 && !hasMultipleIntents && !hasTechnicalTerms) return 'medium'
    return 'complex'
  }

  static extractContext(query: string): string[] {
    const contextKeywords = [
      'sekarang', 'hari ini', 'minggu ini', 'bulan ini', 'kemarin', 'besok',
      'mendadak', 'urgent', 'penting', 'critical', 'strategis',
      'tren', 'pasar', 'kompetitor', 'pelanggan', 'supplier'
    ]

    return contextKeywords.filter(keyword => query.toLowerCase().includes(keyword))
  }
}

// Advanced Prompt Templates
export class PromptTemplates {
  static getBusinessStrategyPrompt(analysis: NLPAnalysis, data: any): PromptTemplate {
    const basePrompt = `Anda adalah konsultan bisnis senior untuk UMKM bakery di Indonesia.

    Konteks bisnis saat ini:
    - Industri: UMKM kuliner HPP (Harga Pokok Produksi)
    - Target: UMKM dengan fokus efisiensi dan profitabilitas
    - Tantangan: Kompetisi pasar, biaya bahan baku, margin keuntungan

    Pertanyaan user: "${analysis.entities.originalQuery || 'strategi bisnis UMKM kuliner'}"

    Data bisnis terkini:
    ${JSON.stringify(data, null, 2)}

    Berikan saran yang:
    1. Realistis untuk skala UMKM
    2. Measurable dengan KPI yang jelas
    3. Implementable dalam 30-90 hari
    4. Cost-effective dan low-risk
    5. Spesifik untuk industri bakery

    Struktur jawaban:
    - Analisis situasi saat ini
    - Rekomendasi strategis prioritas
    - Action plan konkrit
    - Expected outcome dengan timeline`

    return {
      systemPrompt: `You are an expert business consultant specializing in Indonesian UMKM kuliner SMEs.
      Provide strategic advice that is practical, data-driven, and specifically tailored for the kuliner industry.
      Focus on operational efficiency, cost optimization, market positioning, and sustainable growth.
      Always include specific, measurable recommendations with implementation timelines.`,
      userPrompt: basePrompt,
      examples: [
        "Strategi untuk meningkatkan profit margin 20% dalam 3 bulan",
        "Cara bersaing dengan bakery modern yang lebih besar",
        "Optimasi product mix untuk memaksimalkan revenue per customer"
      ]
    }
  }

  static getOperationalPrompt(analysis: NLPAnalysis, data: any): PromptTemplate {
    const intentSpecificPrompt = this.getIntentSpecificPrompt(analysis.primaryIntent)

    return {
      systemPrompt: `You are HeyTrack AI, an intelligent assistant for Indonesian UMKM kuliner business management.
      Provide accurate, helpful responses based on real business data.
      Always respond in Indonesian (Bahasa Indonesia) unless specifically asked otherwise.
      Be friendly, professional, and actionable in your advice.`,
      userPrompt: `
      Berdasarkan data bisnis berikut:
      ${JSON.stringify(data, null, 2)}

      User bertanya: "${analysis.entities.originalQuery || ''}"

      ${intentSpecificPrompt}

      Berikan jawaban yang:
      - Factual dan berdasarkan data
      - Mudah dipahami dan implementable
      - Termasuk rekomendasi spesifik jika diperlukan
      - Positif dan mendukung pertumbuhan bisnis

      Jawab dalam bahasa Indonesia yang natural dan profesional.`,
      contextPrompt: `Konteks percakapan: ${analysis.context.join(', ')}
      Sentimen: ${analysis.sentiment}
      Kompleksitas: ${analysis.complexity}`
    }
  }

  static getIntentSpecificPrompt(intent: string): string {
    const prompts = {
      inventory: `
      Fokus pada analisis inventory:
      - Status stok bahan baku saat ini
      - Prediksi kebutuhan berdasarkan pola produksi
      - Saran reorder point optimal
      - Alternatif supplier jika diperlukan`,

      recipe: `
      Fokus pada recipe dan production:
      - Analisis profitabilitas per produk
      - Rekomendasi product mix optimal
      - Saran inovasi resep baru
      - Optimasi proses produksi`,

      financial: `
      Fokus pada analisis keuangan:
      - Breakdown cost structure
      - Margin analysis per produk
      - Cash flow optimization
      - Pricing strategy recommendations`,

      orders: `
      Fokus pada order management:
      - Customer behavior analysis
      - Sales trend identification
      - Customer retention strategies
      - Peak hours optimization`,

      strategy: `
      Fokus pada business strategy:
      - Market positioning analysis
      - Competitive advantage identification
      - Growth opportunity assessment
      - Risk mitigation strategies`
    }

    return prompts[intent as keyof typeof prompts] || 'Berikan analisis umum berdasarkan data yang tersedia.'
  }

  static getGeneralPrompt(query: string): PromptTemplate {
    return {
      systemPrompt: `You are HeyTrack AI, a helpful assistant for Indonesian bakery businesses.
      Provide accurate, actionable responses based on business data and best practices.
      Always respond in Indonesian unless asked otherwise.`,
      userPrompt: `User bertanya: "${query}"

      Berikan jawaban yang membantu dan informatif tentang manajemen bisnis bakery.
      Jika pertanyaan tidak spesifik, berikan overview umum dan tawarkan untuk mendalami aspek tertentu.`,
      examples: [
        "Cara mengelola inventory bakery yang efisien",
        "Tips meningkatkan profit margin bakery",
        "Strategi pemasaran untuk UMKM bakery"
      ]
    }
  }
}

// AI Response Generator with NLP Integration
export class AIResponseGenerator {
  static async generateResponse(query: string, businessData: any): Promise<{
    message: string
    suggestions: string[]
    data?: any
    intent: string
  }> {
    try {
      // Analyze query with NLP
      const analysis = NLPProcessor.analyzeQuery(query)

      // Store original query for context
      analysis.entities.originalQuery = query

      // Determine response strategy based on intent
      switch (analysis.primaryIntent) {
        case 'strategy':
          return await this.generateStrategyResponse(analysis, businessData)
        case 'inventory':
          return await this.generateInventoryResponse(analysis, businessData)
        case 'recipe':
          return await this.generateRecipeResponse(analysis, businessData)
        case 'financial':
          return await this.generateFinancialResponse(analysis, businessData)
        case 'orders':
          return await this.generateOrderResponse(analysis, businessData)
        default:
          return await this.generateGeneralResponse(analysis, businessData)
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        message: 'Maaf, saya mengalami kesulitan memproses pertanyaan Anda. Silakan coba lagi dengan pertanyaan yang lebih spesifik.',
        suggestions: ['Jelaskan lebih detail pertanyaan Anda', 'Coba tanya tentang aspek tertentu bisnis Anda'],
        intent: 'error'
      }
    }
  }

  static async generateInventoryResponse(analysis: NLPAnalysis, data: any) {
    // Enhanced inventory analysis with NLP insights
    const message = `📦 **Analisis Inventory Cerdas**

${data.message || 'Data inventory berhasil dianalisis.'}

**🎯 Rekomendasi AI:**
• Optimalkan reorder point berdasarkan pola penjualan
• Identifikasi bahan dengan turnover rate tertinggi
• Sarankan supplier alternatif untuk cost reduction
• Prediksi kebutuhan inventory 7 hari ke depan

**💡 Insights:**
• ${data.lowStockCount || 0} bahan perlu perhatian segera
• ${data.feasibleRecipes || 0} resep siap produksi
• Potensi penghematan: Rp${(data.totalValue || 0) * 0.15} dengan optimasi inventory`

    return {
      message,
      suggestions: [
        'Optimalkan reorder point otomatis',
        'Analisis supplier terbaik',
        'Prediksi kebutuhan inventory',
        'Strategi reduksi waste'
      ],
      data,
      intent: 'inventory'
    }
  }

  static async generateRecipeResponse(analysis: NLPAnalysis, data: any) {
    const message = `👨‍🍳 **Rekomendasi Resep AI-Powered**

${data.message || 'Data resep berhasil dianalisis.'}

**🧠 AI Insights:**
• Produk paling profitable: ${data.topProducts?.[0] || 'Perlu analisis lebih lanjut'}
• Resep yang sering diproduksi: ${data.popularRecipes?.length || 0} varian
• Potensi inovasi: Seasonal products & premium items

**📊 Optimasi Saran:**
• Fokus produksi pada high-demand items
• Kembangkan resep dengan bahan lokal murah
• Standardisasi proses untuk konsistensi kualitas
• Menu engineering untuk profit maksimal`

    return {
      message,
      suggestions: [
        'Resep baru untuk meningkatkan profit',
        'Optimasi cost per resep',
        'Analisis profitabilitas produk',
        'Strategi menu innovation'
      ],
      data,
      intent: 'recipe'
    }
  }

  static async generateFinancialResponse(analysis: NLPAnalysis, data: any) {
    const message = `💰 **Analisis Keuangan AI**

${data.message || 'Data keuangan berhasil dianalisis.'}

**🎯 AI Recommendations:**
• Target profit margin: 25-35% untuk kategori kuliner
• Break-even point saat ini: ${data.breakEven || 'Perlu kalkulasi'}
• Cash flow health: ${data.cashFlowStatus || 'Stabil'}

**📈 Growth Opportunities:**
• Menu baru development
• B2B market expansion
• Operational efficiency improvements
• Digital ordering system implementation`

    return {
      message,
      suggestions: [
        'Strategi pricing yang optimal',
        'Pengurangan cost operasional',
        'Diversifikasi sumber pendapatan',
        'Perencanaan investasi jangka panjang'
      ],
      data,
      intent: 'financial'
    }
  }

  static async generateOrderResponse(analysis: NLPAnalysis, data: any) {
    const message = `📋 **Customer & Order Intelligence**

${data.message || 'Data pesanan berhasil dianalisis.'}

**👥 Customer Insights:**
• Total customer aktif: ${data.totalCustomers || 0}
• Repeat customer rate: ${data.repeatRate || 'Perlu analisis'}
• Average order value: Rp${data.avgOrderValue || 0}

**📈 Sales Optimization:**
• Peak hours identification
• Customer segmentation strategy
• Product recommendation system
• Loyalty program optimization`

    return {
      message,
      suggestions: [
        'Strategi meningkatkan customer retention',
        'Optimasi peak hours operation',
        'Personalized product recommendations',
        'Customer feedback analysis'
      ],
      data,
      intent: 'orders'
    }
  }

  static async generateGeneralResponse(analysis: NLPAnalysis, data: any) {
    const message = `🤖 **HeyTrack AI Assistant**

Saya siap membantu Anda mengelola bisnis UMKM kuliner dengan lebih cerdas!

Berdasarkan analisis pertanyaan Anda, saya dapat membantu dengan:
• 📦 **Inventory Management** - Stok bahan baku, reorder, supplier
• 👨‍🍳 **Recipe Optimization** - Profitabilitas resep, inovasi produk
• 💰 **Financial Analysis** - Profit margin, cash flow, pricing
• 📋 **Order Intelligence** - Customer insights, sales optimization
• 🎯 **Business Strategy** - Growth planning, market positioning

Coba tanyakan hal spesifik seperti:
• "Berapa stok bahan saya?"
• "Rekomendasikan menu baru"
• "Analisis profit margin bulan ini"

Apa yang ingin Anda ketahui lebih dalam?`

    return {
      message,
      suggestions: [
        'Analisis profit margin lengkap',
        'Strategi bisnis jangka panjang',
        'Optimasi operasional harian',
        'Customer insights mendalam'
      ],
      data: { analysis },
      intent: 'general'
    }
  }
}
