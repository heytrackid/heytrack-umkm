/**
 * AI Service Integration with OpenRouter
 * Provides intelligent insights for Indonesian F&B businesses
 */

import { formatCurrency } from '@/shared/utils/currency'

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface AIInsightRequest {
  type: 'pricing' | 'inventory' | 'production' | 'customer' | 'financial' | 'forecast'
  data: any
  context: {
    businessType: 'bakery' | 'restaurant' | 'cafe'
    location: string
    targetMarket: 'premium' | 'mid-market' | 'budget'
  }
}

export class AIService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found. AI features will be disabled.')
    }
  }

  /**
   * 🧠 Smart Pricing Analysis
   * Analyzes market conditions and suggests optimal pricing
   */
  async analyzePricing(data: {
    productName: string
    ingredients: Array<{ name: string; cost: number; quantity: number }>
    currentPrice?: number
    competitorPrices?: number[]
    location: string
    targetMarket: 'premium' | 'mid-market' | 'budget'
  }) {
    const prompt = `
    Sebagai konsultan bisnis F&B Indonesia yang berpengalaman, analisis pricing untuk produk bakery berikut:

    PRODUK: ${data.productName}
    LOKASI: ${data.location}
    TARGET MARKET: ${data.targetMarket}
    
    COST BREAKDOWN:
    ${data.ingredients.map(ing => `- ${ing.name}: ${formatCurrency(ing.cost)} (${ing.quantity} unit)`).join('\n')}
    
    Total Cost: ${formatCurrency(data.ingredients.reduce((sum, ing) => sum + ing.cost, 0))}
    ${data.currentPrice ? `Current Price: ${formatCurrency(data.currentPrice)}` : ''}
    ${data.competitorPrices?.length ? `Competitor Prices: ${data.competitorPrices.map(p => formatCurrency(p)).join(', ')}` : ''}

    Berikan analisis dalam format JSON:
    {
     "recommendedPrice": {
       "min": number,
       "optimal": number, 
       "max": number
      },
     "marginAnalysis": {
       "currentMargin": number,
       "optimalMargin": number,
       "industryAverage": number
      },
     "marketPositioning":"premium|mid-market|budget",
     "competitiveAdvantage":"string",
     "risks": ["string"],
     "opportunities": ["string"],
     "seasonalFactors": ["string"],
     "actionItems": ["string"]
    }

    Fokus pada konteks bisnis Indonesia, daya beli masyarakat, dan tren pasar F&B lokal.
    `

    return this.callAI(prompt, 'pricing-analysis')
  }

  /**
   * 📦 Smart Inventory Optimization
   * Predicts demand and optimizes stock levels
   */
  async optimizeInventory(data: {
    ingredients: Array<{
      name: string
      currentStock: number
      minStock: number
      usagePerWeek: number
      price: number
      supplier: string
      leadTime: number
    }>
    seasonality: 'high' | 'normal' | 'low'
    upcomingEvents?: string[]
    weatherForecast?: string
  }) {
    const prompt = `
    Sebagai ahli supply chain untuk bisnis F&B Indonesia, optimasi inventory untuk bahan baku berikut:

    KONDISI SAAT INI:
    ${data.ingredients.map(ing => `
    - ${ing.name}:
      * Stok: ${ing.currentStock} unit
      * Min Stock: ${ing.minStock} unit  
      * Pemakaian/minggu: ${ing.usagePerWeek} unit
      * Harga: ${formatCurrency(ing.price)}
      * Supplier: ${ing.supplier}
      * Lead Time: ${ing.leadTime} hari
    `).join('\n')}

    FAKTOR EKSTERNAL:
    - Seasonality: ${data.seasonality}
    - Upcoming Events: ${data.upcomingEvents?.join(', ') || 'None'}
    - Weather: ${data.weatherForecast || 'Normal'}

    Berikan rekomendasi dalam format JSON:
    {
     "criticalItems": [
        {
         "ingredient":"string",
         "urgencyLevel":"critical|high|medium",
         "recommendedOrder": number,
         "estimatedCost": number,
         "reason":"string"
        }
      ],
     "optimizations": [
        {
         "ingredient":"string", 
         "currentEOQ": number,
         "optimizedEOQ": number,
         "savings": number,
         "rationale":"string"
        }
      ],
     "demandForecast": {
       "nextWeek": number,
       "nextMonth": number,
       "confidence": number
      },
     "riskAssessment": {
       "stockoutRisk": ["string"],
       "overstockRisk": ["string"],
       "supplierRisks": ["string"]
      },
     "actionPlan": ["string"],
     "costImpact": {
       "currentValue": number,
       "optimizedValue": number,
       "savings": number
      }
    }

    Pertimbangkan faktor lokal Indonesia seperti: hari raya, musim hujan, inflasi, dan kebiasaan belanja konsumen.
    `

    return this.callAI(prompt, 'inventory-optimization')
  }

  /**
   * 🏭 Smart Production Planning
   * Optimizes production schedules and batch sizes
   */
  async optimizeProduction(data: {
    orders: Array<{
      productName: string
      quantity: number
      deliveryDate: string
      priority: string
    }>
    capacity: {
      maxBatchesPerDay: number
      workingHours: number
      equipment: string[]
      staff: number
    }
    currentProduction: Array<{
      product: string
      status: string
      completionDate: string
    }>
  }) {
    const prompt = `
    Sebagai production planner untuk bakery Indonesia, optimasi jadwal produksi berikut:

    PESANAN PENDING:
    ${data.orders.map((order, i) => `
    ${i+1}. ${order.productName}
       - Quantity: ${order.quantity} unit
       - Delivery: ${order.deliveryDate}
       - Priority: ${order.priority}
    `).join('\n')}

    KAPASITAS PRODUKSI:
    - Max Batch/Hari: ${data.capacity.maxBatchesPerDay}
    - Jam Kerja: ${data.capacity.workingHours} jam/hari
    - Equipment: ${data.capacity.equipment.join(', ')}
    - Staff: ${data.capacity.staff} orang

    PRODUKSI BERLANGSUNG:
    ${data.currentProduction.map(prod => `- ${prod.product} (${prod.status}) - selesai: ${prod.completionDate}`).join('\n')}

    Berikan optimasi dalam format JSON:
    {
     "productionSchedule": [
        {
         "date":"YYYY-MM-DD",
         "batches": [
            {
             "product":"string",
             "batchSize": number,
             "startTime":"HH:MM",
             "endTime":"HH:MM", 
             "assignedStaff": ["string"],
             "equipment": ["string"]
            }
          ]
        }
      ],
     "efficiencyMetrics": {
       "capacityUtilization": number,
       "onTimeDeliveryRate": number,
       "resourceOptimization": number
      },
     "bottlenecks": [
        {
         "type":"equipment|staff|time",
         "description":"string",
         "impact":"high|medium|low",
         "solution":"string"
        }
      ],
     "recommendations": [
        {
         "category":"scheduling|capacity|workflow",
         "priority":"high|medium|low",
         "description":"string",
         "expectedBenefit":"string"
        }
      ],
     "riskAnalysis": {
       "delayRisk": ["string"],
       "qualityRisk": ["string"],
       "costRisk": ["string"]
      }
    }

    Pertimbangkan jam kerja bakery Indonesia (mulai subuh), tradisi local, dan efisiensi operasional UMKM.
    `

    return this.callAI(prompt, 'production-optimization')
  }

  /**
   * 👥 Smart Customer Analytics
   * Analyzes customer behavior and provides insights
   */
  async analyzeCustomerBehavior(data: {
    customers: Array<{
      id: string
      name: string
      totalOrders: number
      totalSpent: number
      lastOrderDate: string
      averageOrderValue: number
      preferredProducts: string[]
    }>
    salesData: Array<{
      date: string
      amount: number
      customerType: string
    }>
    marketConditions: {
      season: string
      competition: 'high' | 'medium' | 'low'
      economicCondition: 'good' | 'fair' | 'challenging'
    }
  }) {
    const prompt = `
    Sebagai customer analytics specialist untuk bisnis F&B Indonesia, analisis perilaku customer berikut:

    DATA CUSTOMER:
    ${data.customers.slice(0, 10).map((customer, i) => `
    ${i+1}. ${customer.name}
       - Total Orders: ${customer.totalOrders}
       - Total Spent: ${formatCurrency(customer.totalSpent)}
       - Last Order: ${customer.lastOrderDate}
       - AOV: ${formatCurrency(customer.averageOrderValue)}
       - Favorites: ${customer.preferredProducts.join(', ')}
    `).join('\n')}

    KONDISI PASAR:
    - Season: ${data.marketConditions.season}
    - Competition: ${data.marketConditions.competition}
    - Economic: ${data.marketConditions.economicCondition}

    SALES TREND (Last 30 days):
    ${data.salesData.slice(-7).map(sale => `- ${sale.date}: ${formatCurrency(sale.amount)}`).join('\n')}

    Berikan insights dalam format JSON:
    {
     "customerSegmentation": [
        {
         "segment":"string",
         "count": number,
         "characteristics": ["string"],
         "averageValue": number,
         "retentionRate": number
        }
      ],
     "behaviorPatterns": {
       "peakOrderTimes": ["string"],
       "seasonalTrends": ["string"],
       "productPreferences": ["string"],
       "pricesensitivity":"high|medium|low"
      },
     "churnRisk": [
        {
         "customerId":"string",
         "riskLevel":"high|medium|low",
         "lastInteraction":"string",
         "retentionStrategy":"string"
        }
      ],
     "growthOpportunities": [
        {
         "opportunity":"string",
         "targetSegment":"string",
         "estimatedRevenue": number,
         "implementation":"string"
        }
      ],
     "recommendations": {
       "retention": ["string"],
       "acquisition": ["string"],
       "upselling": ["string"],
       "crossSelling": ["string"]
      },
     "marketingInsights": {
       "bestChannels": ["string"],
       "optimalTiming": ["string"],
       "messageRecommendations": ["string"]
      }
    }

    Fokus pada perilaku konsumen Indonesia, budaya lokal, dan strategi marketing yang efektif untuk UMKM.
    `

    return this.callAI(prompt, 'customer-analytics')
  }

  /**
   * 💰 Smart Financial Analysis
   * Provides financial health insights and recommendations
   */
  async analyzeFinancialHealth(data: {
    revenue: Array<{ date: string; amount: number }>
    expenses: Array<{ date: string; category: string; amount: number }>
    inventory: { totalValue: number; turnoverRate: number }
    cashFlow: { current: number; projected30Days: number }
    businessMetrics: {
      grossMargin: number
      netMargin: number
      customerCount: number
      averageOrderValue: number
    }
  }) {
    const prompt = `
    Sebagai financial consultant untuk UMKM F&B Indonesia, analisis kesehatan finansial berikut:

    REVENUE (30 hari terakhir):
    Total: ${formatCurrency(data.revenue.reduce((sum, r) => sum + r.amount, 0))}
    Average daily: ${formatCurrency((data.revenue.reduce((sum, r) => sum + r.amount, 0) / 30).toFixed(0))}

    EXPENSES by Category:
    ${Object.entries(data.expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})).map(([cat, amount]) => `- ${cat}: ${formatCurrency((amount as number))}`).join('\n')}

    KEY METRICS:
    - Gross Margin: ${data.businessMetrics.grossMargin}%
    - Net Margin: ${data.businessMetrics.netMargin}%
    - Customer Count: ${data.businessMetrics.customerCount}
    - AOV: ${formatCurrency(data.businessMetrics.averageOrderValue)}
    - Inventory Value: ${formatCurrency(data.inventory.totalValue)}
    - Inventory Turnover: ${data.inventory.turnoverRate}x/month
    - Current Cash Flow: ${formatCurrency(data.cashFlow.current)}
    - 30-day Projection: ${formatCurrency(data.cashFlow.projected30Days)}

    Berikan analisis dalam format JSON:
    {
     "healthScore": {
       "overall": number,
       "profitability": number,
       "liquidity": number,
       "efficiency": number,
       "growth": number
      },
     "keyInsights": [
        {
         "category":"strength|concern|opportunity",
         "metric":"string",
         "description":"string",
         "impact":"high|medium|low"
        }
      ],
     "cashFlowForecast": {
       "next30Days": number,
       "next90Days": number,
       "confidence": number,
       "assumptions": ["string"]
      },
     "riskFactors": [
        {
         "risk":"string",
         "probability":"high|medium|low",
         "impact":"high|medium|low",
         "mitigation":"string"
        }
      ],
     "optimizationOpportunities": [
        {
         "area":"string",
         "currentValue": number,
         "potentialValue": number,
         "effort":"low|medium|high",
         "timeframe":"string"
        }
      ],
     "actionPlan": {
       "immediate": ["string"],
       "shortTerm": ["string"],
       "longTerm": ["string"]
      },
     "benchmarks": {
       "industryAverage": {
         "grossMargin": number,
         "netMargin": number,
         "inventoryTurnover": number
        },
       "performanceGap":"string"
      }
    }

    Pertimbangkan kondisi ekonomi Indonesia, regulasi UMKM, dan best practices untuk bisnis F&B lokal.
    `

    return this.callAI(prompt, 'financial-analysis')
  }

  /**
   * 📊 Smart Business Forecast
   * Predicts business performance and trends
   */
  async generateBusinessForecast(data: {
    historicalSales: Array<{ date: string; amount: number; orderCount: number }>
    seasonality: any
    marketTrends: string[]
    businessEvents: Array<{ date: string; event: string; expectedImpact: string }>
  }) {
    const prompt = `
    Sebagai business intelligence analyst untuk F&B Indonesia, buat forecasting berdasarkan data berikut:

    HISTORICAL SALES (6 bulan terakhir):
    ${data.historicalSales.slice(-12).map(sale => `${sale.date}: ${formatCurrency(sale.amount)} (${sale.orderCount} orders)`).join('\n')}

    MARKET TRENDS:
    ${data.marketTrends.map(trend => `- ${trend}`).join('\n')}

    UPCOMING EVENTS:
    ${data.businessEvents.map(event => `- ${event.date}: ${event.event} (${event.expectedImpact})`).join('\n')}

    Berikan forecast dalam format JSON:
    {
     "salesForecast": {
       "next30Days": {
         "revenue": number,
         "orderCount": number,
         "confidence": number
        },
       "next90Days": {
         "revenue": number,
         "orderCount": number,
         "confidence": number
        },
       "yearEnd": {
         "revenue": number,
         "growth": number,
         "confidence": number
        }
      },
     "trendAnalysis": {
       "growthRate": number,
       "seasonalityImpact": number,
       "marketSentiment":"positive|neutral|negative",
       "keyDrivers": ["string"]
      },
     "opportunityWindows": [
        {
         "period":"string",
         "opportunity":"string",
         "estimatedUplift": number,
         "requirements": ["string"]
        }
      ],
     "riskPeriods": [
        {
         "period":"string",
         "risk":"string",
         "estimatedImpact": number,
         "mitigation":"string"
        }
      ],
     "strategicRecommendations": {
       "inventory": ["string"],
       "marketing": ["string"],
       "operations": ["string"],
       "pricing": ["string"]
      },
     "scenarioAnalysis": {
       "optimistic": {"revenue": number,"probability": number },
       "realistic": {"revenue": number,"probability": number },
       "pessimistic": {"revenue": number,"probability": number }
      }
    }

    Fokus pada kondisi pasar Indonesia, faktor musiman lokal, dan tren konsumsi F&B.
    `

    return this.callAI(prompt, 'business-forecast')
  }

  /**
   * 💰 Financial Analysis & Forecasting
   * Analyzes financial records and provides insights
   */
  async analyzeFinancial(data: {
    records: Array<{
      type: 'income' | 'expense'
      amount: number
      category: string
      date: string
      description?: string
    }>
    period: string
    businessType: string
  }) {
    const totalIncome = data.records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = data.records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
    const netProfit = totalIncome - totalExpenses
    
    const prompt = `
    Sebagai financial analyst untuk UMKM Indonesia, analisis kondisi keuangan berikut:
    
    PERIODE ANALISIS: ${data.period}
    TIPE BISNIS: ${data.businessType}
    
    RINGKASAN KEUANGAN:
    - Total Pendapatan: ${formatCurrency(totalIncome)}
    - Total Pengeluaran: ${formatCurrency(totalExpenses)}
    - Net Profit: ${formatCurrency(netProfit)}
    
    TRANSAKSI DETAIL:
    ${data.records.slice(0, 20).map(record => `
    - ${record.type.toUpperCase()}: ${record.category}
      Amount: ${formatCurrency(record.amount)}
      Date: ${record.date}
      ${record.description ? `Desc: ${record.description}` : ''}
    `).join('\n')}
    
    Berikan analisis dalam format JSON:
    {
     "insights": [
        {
         "category":"profitability|cashflow|expenses|revenue",
         "title":"string",
         "description":"string",
         "severity":"critical|high|medium|low",
         "actionRequired": boolean
        }
      ],
     "summary":"string",
     "healthScore": number,
     "trends": {
       "revenue":"increasing|stable|decreasing",
       "expenses":"increasing|stable|decreasing",
       "profitability":"improving|stable|declining"
      },
     "recommendations": [
        {
         "priority":"high|medium|low",
         "category":"cost-reduction|revenue-growth|cashflow|efficiency",
         "action":"string",
         "expectedImpact":"string",
         "timeframe":"immediate|1-month|3-months|6-months"
        }
      ],
     "forecasting": {
       "nextMonthRevenue": number,
       "nextMonthExpenses": number,
       "confidence": number
      },
     "alerts": [
        {
         "type":"cashflow|expense-spike|revenue-drop|margin-decline",
         "message":"string",
         "urgency":"high|medium|low"
        }
      ]
    }
    
    Fokus pada konteks UMKM Indonesia: arus kas, efisiensi operasional, dan strategi pertumbuhan berkelanjutan.
    `
    
    return this.callAI(prompt, 'financial-analysis')
  }
  
  /**
   * 👥 Customer Analytics & Segmentation
   * Analyzes customer behavior and provides insights
   */
  async analyzeCustomer(data: {
    customers: Array<{
      id: string
      name: string
      totalOrders: number
      totalSpent: number
      lastOrderDate?: string
      acquisitionDate?: string
    }>
    orders: Array<{
      customerId: string
      amount: number
      date: string
      products?: string[]
    }>
    period: string
  }) {
    const totalCustomers = data.customers.length
    const totalRevenue = data.orders.reduce((sum, o) => sum + o.amount, 0)
    const avgOrderValue = totalRevenue / data.orders.length || 0
    const avgCustomerValue = totalRevenue / totalCustomers || 0
    
    const prompt = `
    Sebagai customer analytics expert untuk bisnis F&B Indonesia, analisis perilaku pelanggan berikut:
    
    PERIODE ANALISIS: ${data.period}
    
    OVERVIEW:
    - Total Pelanggan: ${totalCustomers}
    - Total Transaksi: ${data.orders.length}
    - Total Revenue: ${formatCurrency(totalRevenue)}
    - Average Order Value: ${formatCurrency(avgOrderValue)}
    - Customer Lifetime Value: ${formatCurrency(avgCustomerValue)}
    
    CUSTOMER DATA:
    ${data.customers.slice(0, 10).map(customer => `
    - ${customer.name}:
      * Total Orders: ${customer.totalOrders}
      * Total Spent: ${formatCurrency(customer.totalSpent)}
      * Last Order: ${customer.lastOrderDate || 'N/A'}
    `).join('\n')}
    
    ORDER PATTERNS:
    ${data.orders.slice(0, 15).map(order => `
    - Customer ${order.customerId}: ${formatCurrency(order.amount)} on ${order.date}
    `).join('\n')}
    
    Berikan analisis dalam format JSON:
    {
     "insights": [
        {
         "category":"retention|acquisition|value|behavior",
         "title":"string",
         "description":"string",
         "impact":"high|medium|low"
        }
      ],
     "summary":"string",
     "customerSegments": [
        {
         "name":"string",
         "description":"string",
         "percentage": number,
         "avgValue": number,
         "characteristics": ["string"]
        }
      ],
     "loyaltyAnalysis": {
       "repeatCustomers": number,
       "churnRisk": number,
       "loyaltyScore": number,
       "retentionRate": number
      },
     "recommendations": [
        {
         "type":"retention|acquisition|upselling|engagement",
         "priority":"high|medium|low",
         "strategy":"string",
         "expectedResult":"string",
         "implementation":"string"
        }
      ],
     "opportunities": [
        {
         "segment":"string",
         "potential":"string",
         "action":"string",
         "estimatedRevenue": number
        }
      ]
    }
    
    Pertimbangkan preferensi konsumen Indonesia, pola belanja lokal, dan strategi marketing yang sesuai budaya.
    `
    
    return this.callAI(prompt, 'customer-analytics')
  }

  /**
   * Generic AI API call handler
   */
  private async callAI(prompt: string, type: string): Promise<any> {
    if (!this.apiKey) {
      console.warn(`AI ${type} disabled - no API key`)
      return null
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bakery-management.com',
          'X-Title': 'Bakery Management AI Assistant'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4-fast:free', // Free high-performance model with 2M context
          messages: [
            {
              role: 'system',
              content: 'You are an expert business consultant specializing in Indonesian F&B businesses, particularly bakeries and UMKM. You have deep knowledge of local market conditions, Indonesian business culture, and UMKM operational challenges. Provide practical, data-driven insights that consider: 1) Indonesian pricing strategies and purchasing power, 2) Local seasonal factors (Ramadan, Lebaran, regional holidays), 3) UMKM resource constraints and opportunities, 4) Traditional Indonesian business practices. Always respond in valid, well-structured JSON format exactly as requested. Be concise but comprehensive in your analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2, // Even lower temperature for Grok consistency
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const result: OpenRouterResponse = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw new Error('Empty response from AI')
      }

      // Parse JSON response
      try {
        return JSON.parse(content)
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', content)
        return { error: 'Failed to parse AI response', rawResponse: content }
      }

    } catch (error) {
      console.error(`AI ${type} error:`, error)
      return { error: error instanceof Error ? error.message : 'Unknown AI error' }
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false
    
    try {
      const response = await this.callAI(
        'Respond with JSON: {"status":"healthy","message":"AI service is working"}',
        'health-check'
      )
      return response?.status === 'healthy'
    } catch {
      return false
    }
  }
}

export const aiService = new AIService()