import { apiLogger } from '@/lib/logger'

import { AIClient } from '@/lib/ai/client'
import { PromptBuilder } from '@/lib/ai/prompt-builder'
import { AISecurity } from '@/lib/ai/security'

/**
 * AI Service Module
 * Core AI service with security and prompt building
 */


export class AIService {
  /**
   * Enhanced call to OpenRouter with security and prompt building
   */
  static callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
    const safePrompt = AISecurity.sanitizeInput(prompt)
    const safeSystemPrompt = AISecurity.sanitizeInput(systemPrompt)

    if (!AISecurity.validateInput(safePrompt)) {
      apiLogger.warn({ prompt: safePrompt }, 'Potential prompt injection detected')
      throw new Error('Invalid input detected')
    }

    const secureSystemPrompt = PromptBuilder.buildSystemPrompt(safeSystemPrompt)
    return AIClient.callAI(safePrompt, secureSystemPrompt)
  }

  /**
   * Generate AI insights for business data
   */
  static getPredictions(data: Record<string, unknown>): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'sales forecasting and trend analysis')
    const systemPrompt = 'You are a business intelligence analyst specializing in Indonesian food businesses.'
    return this.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize inventory using AI
   */
  static optimizeInventory(inventoryData: Record<string, unknown>): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(inventoryData, 'inventory optimization and demand forecasting')
    const systemPrompt = 'You are an inventory management expert for food businesses.'
    return this.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Generate AI-powered pricing recommendations
   */
  static generatePricingRecommendation(pricingData: {
    recipeName: string
    currentHpp: number
    currentPrice: number
    currentMargin: number
    category: string
    ingredients: Array<{
      name: string
      cost: number
      category: string
    }>
    marketData?: {
      competitorPrices?: number[]
      marketDemand?: 'high' | 'medium' | 'low'
      seasonality?: string
    }
  }): Promise<{
    recommendedPrice: number
    reasoning: string[]
    confidence: number
    alternatives: Array<{
      price: number
      margin: number
      rationale: string
    }>
  }> {
    const prompt = `Analyze this recipe pricing data and provide intelligent pricing recommendations:

Recipe: ${pricingData.recipeName}
Category: ${pricingData.category}
Current HPP: ${pricingData.currentHpp.toLocaleString('id-ID')} IDR
Current Selling Price: ${pricingData.currentPrice.toLocaleString('id-ID')} IDR
Current Margin: ${pricingData.currentMargin.toFixed(1)}%

Ingredients Breakdown:
${pricingData.ingredients.map(ing =>
  `- ${ing.name} (${ing.category}): ${ing.cost.toLocaleString('id-ID')} IDR`
).join('\n')}

${pricingData.marketData ? `
Market Context:
- Competitor Prices: ${pricingData.marketData.competitorPrices?.join(', ') || 'Not available'}
- Market Demand: ${pricingData.marketData.marketDemand || 'Unknown'}
- Seasonality: ${pricingData.marketData.seasonality || 'Not specified'}
` : ''}

Please provide:
1. Recommended selling price with detailed reasoning
2. Confidence level (0-100%)
3. 2-3 alternative pricing strategies
4. Key factors influencing the recommendation

Consider Indonesian market conditions, typical food business margins (20-40%), and competitive positioning.`

    const systemPrompt = `You are a pricing strategist specializing in Indonesian food businesses. You understand:
- Typical profit margins for different food categories
- Indonesian consumer behavior and price sensitivity
- Cost-plus pricing, value-based pricing, and competitive pricing strategies
- Impact of seasonality and market demand on pricing
- Psychological pricing principles

Always provide data-driven recommendations with clear reasoning. Format responses as JSON with this structure:
{
  "recommendedPrice": number,
  "reasoning": ["string"],
  "confidence": number,
  "alternatives": [
    {
      "price": number,
      "margin": number,
      "rationale": "string"
    }
  ]
}`

    return this.callOpenRouter(prompt, systemPrompt).then(response => {
      try {
        // Parse JSON response from AI
        const parsed = JSON.parse(response.trim()) as {
          recommendedPrice?: unknown
          reasoning?: unknown
          confidence?: unknown
          alternatives?: unknown[]
        }

        return {
          recommendedPrice: Number(parsed.recommendedPrice) || pricingData.currentHpp * 1.35,
          reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : ['AI analysis completed'],
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
          alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.map((alt: unknown) => {
            const altObj = alt as { price?: unknown; margin?: unknown; rationale?: unknown }
            return {
              price: Number(altObj.price) || 0,
              margin: Number(altObj.margin) || 0,
              rationale: typeof altObj.rationale === 'string' ? altObj.rationale : 'Alternative pricing strategy'
            }
          }) : []
        }
      } catch (error) {
        apiLogger.warn({ error, response }, 'Failed to parse AI pricing response, using fallback')
        // Fallback to simple calculation
        const recommendedPrice = pricingData.currentHpp * 1.35 // 35% margin
        return {
          recommendedPrice,
          reasoning: [
            'AI analysis unavailable, using standard 35% margin recommendation',
            `HPP: ${pricingData.currentHpp.toLocaleString('id-ID')} IDR`,
            `Recommended: ${recommendedPrice.toLocaleString('id-ID')} IDR`
          ],
          confidence: 60,
          alternatives: [
            {
              price: pricingData.currentHpp * 1.25,
              margin: 25,
              rationale: 'Conservative 25% margin for price-sensitive market'
            },
            {
              price: pricingData.currentHpp * 1.5,
              margin: 50,
              rationale: 'Premium 50% margin for high-value positioning'
            }
          ]
        }
      }
    })
  }
}
