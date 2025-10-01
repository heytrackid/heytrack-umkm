/**
 * Pricing AI Service
 * Smart pricing analysis and recommendations for F&B products
 */

import { formatCurrency } from '@/shared/utils/currency';

interface PricingData {
  productName: string;
  ingredients: Array<{ name: string; cost: number; quantity: number }>;
  currentPrice?: number;
  competitorPrices?: number[];
  location: string;
  targetMarket: 'premium' | 'mid-market' | 'budget';
}

interface PricingAnalysis {
  recommendedPrice: {
    min: number;
    optimal: number;
    max: number;
  };
  marginAnalysis: {
    currentMargin: number;
    optimalMargin: number;
    industryAverage: number;
  };
  marketPositioning: 'premium' | 'mid-market' | 'budget';
  competitiveAdvantage: string;
  risks: string[];
  opportunities: string[];
  seasonalFactors: string[];
  actionItems: string[];
}

export class PricingAIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found. Pricing AI features will be disabled.');
    }
  }

  /**
   * Analyze pricing and provide recommendations
   */
  async analyzePricing(data: PricingData): Promise<PricingAnalysis> {
    const totalCost = data.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
    
    const prompt = `
Sebagai konsultan bisnis F&B Indonesia yang berpengalaman, analisis pricing untuk produk bakery berikut:

PRODUK: ${data.productName}
LOKASI: ${data.location}
TARGET MARKET: ${data.targetMarket}

COST BREAKDOWN:
${data.ingredients.map(ing => `- ${ing.name}: ${formatCurrency(ing.cost)} (${ing.quantity} unit)`).join('\n')}

Total Cost: ${formatCurrency(totalCost)}
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
  "marketPositioning": "premium|mid-market|budget",
  "competitiveAdvantage": "string",
  "risks": ["string"],
  "opportunities": ["string"],
  "seasonalFactors": ["string"],
  "actionItems": ["string"]
}

Fokus pada konteks bisnis Indonesia, daya beli masyarakat, dan tren pasar F&B lokal.
`;

    try {
      const response = await this.callAI(prompt, 'pricing-analysis');
      return JSON.parse(response);
    } catch (error) {
      console.error('Pricing analysis error:', error);
      // Return fallback analysis
      return this.generateFallbackPricing(data, totalCost);
    }
  }

  /**
   * Calculate optimal markup based on target market
   */
  calculateOptimalMarkup(
    cost: number,
    targetMarket: 'premium' | 'mid-market' | 'budget'
  ): { min: number; optimal: number; max: number } {
    const markupRanges = {
      premium: { min: 2.5, optimal: 3.0, max: 4.0 },
      'mid-market': { min: 2.0, optimal: 2.5, max: 3.0 },
      budget: { min: 1.5, optimal: 2.0, max: 2.5 }
    };

    const range = markupRanges[targetMarket];
    return {
      min: Math.round(cost * range.min),
      optimal: Math.round(cost * range.optimal),
      max: Math.round(cost * range.max)
    };
  }

  /**
   * Analyze competitor pricing
   */
  analyzeCompetitorPricing(
    yourPrice: number,
    competitorPrices: number[]
  ): {
    position: 'lower' | 'competitive' | 'higher';
    advantage: string;
    recommendation: string;
  } {
    if (competitorPrices.length === 0) {
      return {
        position: 'competitive',
        advantage: 'No competitor data available',
        recommendation: 'Monitor competitor pricing regularly'
      };
    }

    const avgCompetitor = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    const priceDiff = ((yourPrice - avgCompetitor) / avgCompetitor) * 100;

    if (priceDiff < -10) {
      return {
        position: 'lower',
        advantage: 'Price advantage of ' + Math.abs(priceDiff).toFixed(1) + '%',
        recommendation: 'Consider raising price slightly to improve margins while maintaining competitiveness'
      };
    } else if (priceDiff > 10) {
      return {
        position: 'higher',
        advantage: 'Premium positioning with ' + priceDiff.toFixed(1) + '% premium',
        recommendation: 'Emphasize quality and unique value proposition to justify premium'
      };
    } else {
      return {
        position: 'competitive',
        advantage: 'Well-positioned within market range',
        recommendation: 'Maintain current pricing strategy and focus on value delivery'
      };
    }
  }

  /**
   * Generate seasonal pricing recommendations
   */
  getSeasonalPricingStrategy(month: number): {
    season: string;
    strategy: string;
    adjustmentRange: { min: number; max: number };
  } {
    // Indonesian context: Ramadan, Lebaran, Christmas, New Year
    const seasonalStrategies = [
      { months: [1], season: 'Post-Holiday', strategy: 'Maintain steady prices, focus on value', adjustment: { min: -5, max: 0 } },
      { months: [2, 3], season: 'Pre-Ramadan', strategy: 'Prepare for high season, introduce bundles', adjustment: { min: 0, max: 5 } },
      { months: [4, 5], season: 'Ramadan', strategy: 'Premium seasonal products, bundle deals', adjustment: { min: 5, max: 15 } },
      { months: [6, 7], season: 'Post-Lebaran', strategy: 'Normalize prices, clear inventory', adjustment: { min: -10, max: 0 } },
      { months: [8, 9, 10], season: 'Regular Season', strategy: 'Competitive pricing, loyalty focus', adjustment: { min: 0, max: 5 } },
      { months: [11, 12], season: 'Christmas/New Year', strategy: 'Holiday specials, gift sets', adjustment: { min: 5, max: 10 } }
    ];

    const current = seasonalStrategies.find(s => s.months.includes(month)) || seasonalStrategies[0];
    return {
      season: current.season,
      strategy: current.strategy,
      adjustmentRange: current.adjustment
    };
  }

  /**
   * Call OpenRouter AI
   */
  private async callAI(prompt: string, type: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'HeyTrack UMKM'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah konsultan bisnis F&B Indonesia yang ahli dalam pricing strategy, market analysis, dan UMKM growth.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Generate fallback pricing when AI fails
   */
  private generateFallbackPricing(data: PricingData, totalCost: number): PricingAnalysis {
    const recommendedPrice = this.calculateOptimalMarkup(totalCost, data.targetMarket);
    const currentMargin = data.currentPrice 
      ? ((data.currentPrice - totalCost) / data.currentPrice) * 100 
      : 0;

    return {
      recommendedPrice,
      marginAnalysis: {
        currentMargin,
        optimalMargin: ((recommendedPrice.optimal - totalCost) / recommendedPrice.optimal) * 100,
        industryAverage: data.targetMarket === 'premium' ? 40 : data.targetMarket === 'mid-market' ? 30 : 25
      },
      marketPositioning: data.targetMarket,
      competitiveAdvantage: 'Focus on quality and consistency',
      risks: ['Market competition', 'Ingredient cost fluctuation'],
      opportunities: ['Seasonal promotions', 'Bundle deals', 'Loyalty programs'],
      seasonalFactors: ['Ramadan/Lebaran', 'Christmas/New Year'],
      actionItems: [
        'Monitor competitor prices monthly',
        'Review ingredient costs quarterly',
        'Test pricing with customer surveys'
      ]
    };
  }
}

// Export singleton instance
export const pricingAI = new PricingAIService();
