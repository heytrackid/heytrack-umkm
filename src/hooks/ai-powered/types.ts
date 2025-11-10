
/**
 * AI-Powered Business Intelligence Types
 * Type definitions for AI analysis requests and responses
 */

export interface AIAnalysisState<T = unknown> {
  data: T | null
  loading: boolean
  error: string | null
  confidence: number
  lastUpdated: string | null
}

export interface PricingAnalysisRequest {
  productName: string
  ingredients: Array<{ name: string; cost: number; quantity: number }>
  currentPrice?: number
  competitorPrices?: number[]
  location?: string
  targetMarket?: 'budget' | 'mid-market' | 'premium'
}

export interface InventoryOptimizationRequest {
  ingredients: Array<{
    name: string
    currentStock: number
    minStock: number
    usagePerWeek?: number
    price: number
    supplier?: string
    leadTime?: number
  }>
  seasonality?: 'high' | 'low' | 'normal'
  upcomingEvents?: string[]
  weatherForecast?: string
}

export interface CustomerAnalyticsRequest {
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
    competition: 'high' | 'low' | 'medium'
    economicCondition: 'challenging' | 'fair' | 'good'
  }
}

export interface FinancialAnalysisRequest {
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
}

export interface SmartInsightsRequest {
  recipes?: unknown[]
  ingredients?: unknown[]
  orders?: unknown[]
  customers?: unknown[]
  financials?: unknown
}

export interface AIInsight {
  type: string
  productName?: string
  analysis: unknown
  priority: 'high' | 'low' | 'medium'
  confidence?: number
  timestamp?: string
  isAIPowered?: boolean
}

export type AnalysisType = 'customer' | 'financial' | 'inventory' | 'pricing'
