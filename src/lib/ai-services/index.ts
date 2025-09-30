/**
 * AI Services - Lazy Loading Entry Point
 * Dynamically loads AI service modules only when needed
 */

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
   * 🧠 Smart Pricing Analysis - Lazy loaded
   */
  async analyzePricing(data: any) {
    const { analyzePricing } = await import('@/components')
    return analyzePricing(data, this.apiKey, this.baseUrl)
  }

  /**
   * 📦 Smart Inventory Optimization - Lazy loaded
   */
  async optimizeInventory(data: any) {
    const { optimizeInventory } = await import('@/components')
    return optimizeInventory(data, this.apiKey, this.baseUrl)
  }

  /**
   * 🏭 Smart Production Planning - Lazy loaded
   */
  async optimizeProduction(data: any) {
    const { optimizeProduction } = await import('@/components')
    return optimizeProduction(data, this.apiKey, this.baseUrl)
  }

  /**
   * 👥 Customer Insights - Lazy loaded
   */
  async analyzeCustomers(data: any) {
    const { analyzeCustomers } = await import('@/components')
    return analyzeCustomers(data, this.apiKey, this.baseUrl)
  }

  /**
   * 💰 Financial Analytics - Lazy loaded
   */
  async analyzeFinancial(data: any) {
    const { analyzeFinancial } = await import('@/components')
    return analyzeFinancial(data, this.apiKey, this.baseUrl)
  }

  /**
   * 📈 Sales Forecast - Lazy loaded
   */
  async forecastSales(data: any) {
    const { forecastSales } = await import('@/components')
    return forecastSales(data, this.apiKey, this.baseUrl)
  }

  /**
   * 💡 Business Insights - Lazy loaded
   */
  async generateBusinessInsights(data: any) {
    const { generateBusinessInsights } = await import('@/components')
    return generateBusinessInsights(data, this.apiKey, this.baseUrl)
  }

  /**
   * 🎯 Marketing Recommendations - Lazy loaded
   */
  async analyzeMarketing(data: any) {
    const { analyzeMarketing } = await import('@/components')
    return analyzeMarketing(data, this.apiKey, this.baseUrl)
  }
}

// Create singleton instance
export const aiService = new AIService()
export default aiService
