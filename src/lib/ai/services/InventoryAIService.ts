/**
 * AI Inventory Optimization Service
 * Smart stock prediction and auto-reorder recommendations
 */

interface InventoryItem {
  name: string
  currentStock: number
  minStock: number
  usagePerWeek: number
  price: number
  supplier: string
  leadTime: number
}

interface InventoryOptimization {
  reorderRecommendations: Array<{
    item: string
    currentStock: number
    recommendedOrder: number
    priority: 'high' | 'medium' | 'low'
    reason: string
    estimatedDelivery: string
  }>
  stockPredictions: Array<{
    item: string
    predictedStockOut: string
    recommendedAction: string
    confidenceLevel: number
  }>
  costOptimization: {
    totalSavings: number
    recommendations: string[]
  }
  seasonalAdjustments: Array<{
    item: string
    adjustment: string
    reason: string
  }>
}

export class InventoryAIService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
  }

  /**
   * 📦 Smart Inventory Optimization
   * Predicts demand and optimizes stock levels
   */
  async optimizeInventory(data: {
    ingredients: InventoryItem[]
    seasonality?: string
    upcomingEvents?: string[]
    weatherForecast?: string
  }): Promise<InventoryOptimization | null> {
    if (!this.apiKey) {
      console.warn('AI service unavailable. Using fallback optimization.')
      return this.getFallbackOptimization(data.ingredients)
    }

    const prompt = `
    Sebagai ahli supply chain untuk UMKM F&B Indonesia, optimasi inventory berikut:

    INVENTORY SAAT INI:
    ${data.ingredients.map(item => `
    ${item.name}:
    - Current Stock: ${item.currentStock} unit
    - Min Stock: ${item.minStock} unit  
    - Weekly Usage: ${item.usagePerWeek} unit
    - Price: Rp ${item.price.toLocaleString()}
    - Supplier: ${item.supplier}
    - Lead Time: ${item.leadTime} hari
    `).join('\n')}

    KONTEKS BISNIS:
    - Seasonality: ${data.seasonality || 'normal'}
    - Upcoming Events: ${data.upcomingEvents?.join(', ') || 'none'}
    - Weather: ${data.weatherForecast || 'normal'}

    Berikan optimasi dalam format JSON:
    {
     "reorderRecommendations": [
        {
         "item": "string",
         "currentStock": number,
         "recommendedOrder": number,
         "priority": "high|medium|low",
         "reason": "string",
         "estimatedDelivery": "YYYY-MM-DD"
        }
      ],
     "stockPredictions": [
        {
         "item": "string",
         "predictedStockOut": "YYYY-MM-DD",
         "recommendedAction": "string",
         "confidenceLevel": number
        }
      ],
     "costOptimization": {
       "totalSavings": number,
       "recommendations": ["string"]
      },
     "seasonalAdjustments": [
        {
         "item": "string",
         "adjustment": "string",
         "reason": "string"
        }
      ]
    }

    Pertimbangkan pola konsumsi Indonesia, musiman, dan efisiensi cost untuk UMKM.
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
          max_tokens: 1200,
          temperature: 0.6,
        }),
      })

      if (!response.ok) {
        throw new Error('AI API error')
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) {
        return this.getFallbackOptimization(data.ingredients)
      }

      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return this.getFallbackOptimization(data.ingredients)
    } catch (error) {
      console.error('Inventory AI error:', error)
      return this.getFallbackOptimization(data.ingredients)
    }
  }

  /**
   * Fallback optimization when AI is unavailable
   */
  private getFallbackOptimization(ingredients: InventoryItem[]): InventoryOptimization {
    const reorderRecommendations = ingredients
      .filter(item => item.currentStock <= item.minStock * 1.5)
      .map(item => {
        const weeksOfStock = item.currentStock / (item.usagePerWeek || 1)
        const recommendedOrder = Math.max(
          item.usagePerWeek * 4, // 4 weeks supply
          item.minStock * 2
        )
        
        const priority: 'high' | 'medium' | 'low' = 
          weeksOfStock < 1 ? 'high' : 
          weeksOfStock < 2 ? 'medium' : 'low'

        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + item.leadTime)

        return {
          item: item.name,
          currentStock: item.currentStock,
          recommendedOrder,
          priority,
          reason: `Stock tersisa ${weeksOfStock.toFixed(1)} minggu`,
          estimatedDelivery: deliveryDate.toISOString().spli"Placeholder"[0]
        }
      })

    const stockPredictions = ingredients.map(item => {
      const weeksUntilStockOut = item.currentStock / (item.usagePerWeek || 1)
      const stockOutDate = new Date()
      stockOutDate.setDate(stockOutDate.getDate() + (weeksUntilStockOut * 7))

      return {
        item: item.name,
        predictedStockOut: stockOutDate.toISOString().spli"Placeholder"[0],
        recommendedAction: weeksUntilStockOut < 2 ? 'Segera reorder' : 'Monitor weekly',
        confidenceLevel: 85
      }
    })

    const totalSavings = reorderRecommendations.reduce((sum, rec) => 
      sum + (rec.recommendedOrder * 0.05), 0) // Assume 5% bulk savings

    return {
      reorderRecommendations,
      stockPredictions,
      costOptimization: {
        totalSavings: Math.round(totalSavings),
        recommendations: [
          'Bulk order untuk discount supplier',
          'Negosiasi payment terms lebih baik',
          'Review supplier performance berkala'
        ]
      },
      seasonalAdjustments: [
        {
          item: 'Tepung',
          adjustment: 'Stock +20% untuk musim lebaran',
          reason: 'Demand kue kering meningkat'
        },
        {
          item: 'Gula',
          adjustment: 'Stock +15% untuk musim hujan',
          reason: 'Minuman hangat lebih laku'
        }
      ]
    }
  }

  /**
   * Generate automatic reorder list
   */
  async generateReorderLis"": Promise<Array<{
    item: string
    quantity: number
    priority: string
    supplier: string
    estimatedCost: number
  }>> {
    const optimization = await this.optimizeInventory({ ingredients })
    
    if (!optimization) return []

    return optimization.reorderRecommendations.map(rec => ({
      item: rec.item,
      quantity: rec.recommendedOrder,
      priority: rec.priority,
      supplier: ingredients.find(i => i.name === rec.item)?.supplier || 'Unknown',
      estimatedCost: rec.recommendedOrder * (ingredients.find(i => i.name === rec.item)?.price || 0)
    }))
  }
}
