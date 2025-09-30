/**
 * AI Pricing Analysis Service
 * Split from main AI service for better code organization
 */

import { formatCurrency } from '@/shared/utils/currency'

interface PricingData {
  productName: string
  ingredients: Array<{ name: string; cost: number; quantity: number }>
  currentPrice?: number
  competitorPrices?: number[]
  location: string
  targetMarket: 'premium' | 'mid-market' | 'budget'
}

interface PricingAnalysis {
  recommendedPrice: {
    min: number
    optimal: number
    max: number
  }
  marginAnalysis: {
    currentMargin: number
    optimalMargin: number
    industryAverage: number
  }
  marketPositioning: string
  competitiveAdvantage: string
  risks: string[]
  opportunities: string[]
  seasonalFactors: string[]
  actionItems: string[]
}

export class PricingAIService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
  }

  /**
   * 🧠 Smart Pricing Analysis
   * Analyzes market conditions and suggests optimal pricing
   */
  async analyzePricing(data: PricingData): Promise<PricingAnalysis | null> {
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found. Using fallback analysis.')
      return this.getFallbackPricingAnalysis(data)
    }

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

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4-fast:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error('AI API error')
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) {
        return this.getFallbackPricingAnalysis(data)
      }

      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return this.getFallbackPricingAnalysis(data)
    } catch (error) {
      console.error('Pricing AI error:', error)
      return this.getFallbackPricingAnalysis(data)
    }
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  private getFallbackPricingAnalysis(data: PricingData): PricingAnalysis {
    const totalCost = data.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
    const baseMargin = data.targetMarket === 'premium' ? 60 : 
                      data.targetMarket === 'mid-market' ? 45 : 35
    
    const optimalPrice = totalCost / (1 - baseMargin / 100)
    const minPrice = totalCost / (1 - 25 / 100) // Minimum 25% margin
    const maxPrice = optimalPrice * 1.2 // 20% above optimal

    return {
      recommendedPrice: {
        min: Math.round(minPrice),
        optimal: Math.round(optimalPrice),
        max: Math.round(maxPrice)
      },
      marginAnalysis: {
        currentMargin: data.currentPrice ? 
          ((data.currentPrice - totalCost) / data.currentPrice) * 100 : 0,
        optimalMargin: baseMargin,
        industryAverage: 40
      },
      marketPositioning: data.targetMarket,
      competitiveAdvantage: 'Kualitas produk dan layanan yang konsisten',
      risks: ['Persaingan harga', 'Kenaikan harga bahan baku'],
      opportunities: ['Program loyalitas', 'Paket bundling', 'Seasonal specials'],
      seasonalFactors: ['Ramadan - demand tinggi', 'Libur sekolah - target keluarga'],
      actionItems: [
        'Review pricing setiap 3 bulan',
        'Monitor harga kompetitor',
        'Uji coba promo terbatas'
      ]
    }
  }

  /**
   * Get pricing recommendations for multiple products
   */
  async batchAnalyzePricing(products: PricingData[]): Promise<Array<PricingAnalysis | null>> {
    return Promise.all(products.map(product => this.analyzePricing(product)))
  }
}
