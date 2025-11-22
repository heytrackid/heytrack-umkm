

// Analytics and business intelligence types

/**
 * Smart pricing assistant analysis (used in UI components)
 */
export interface SmartPricingAnalysis {
  breakdown: {
    ingredientCost: number
    overheadCost: number
    totalCost: number
    costPerServing: number
  }
  pricing: {
    economy: PricingTierOption
    standard: PricingTierOption
    premium: PricingTierOption
  }
  analysis: ProfitabilityAnalysis[]
  recommendations: string[]
}

/**
 * Profitability analysis for each pricing tier
 */
export interface ProfitabilityAnalysis {
  tier: string
  profitAmount: number
  profitMargin: number
  breakEvenVolume: number
}

/**
 * Pricing tier option for smart pricing
 */
export interface PricingTierOption {
  price: number
  margin: number
  positioning: string
}

/**
 * Inventory analysis result
 */
export interface InventoryAnalysis {
  ingredient_id: string
  ingredient_name: string
  status: InventoryStatus
  recommendation: string
  metrics: InventoryMetrics
  alerts: InventoryAlert[]
}

/**
 * Inventory status categories
 */
export type InventoryStatus = 'adequate' | 'critical' | 'low' | 'overstocked'

/**
 * Inventory metrics for analysis
 */
export interface InventoryMetrics {
  current_stock: number
  min_stock: number
  max_stock: number
  reorder_point: number
  usage_rate: number
  days_remaining: number
  stock_percentage: number
}

/**
 * Inventory alert
 */
export interface InventoryAlert {
  type: 'expiring' | 'low_stock' | 'overstock' | 'usage_spike'
  severity: 'critical' | 'high' | 'low' | 'medium'
  message: string
  action_required: string
}

/**
 * Pricing analysis result
 */
export interface PricingAnalysis {
  recipe_id: string
  recipe_name: string
  current_price: number
  cost_breakdown: CostBreakdownAnalysis
  pricing_tiers: PricingTiers
  recommendations: PricingRecommendation[]
  market_comparison?: MarketComparison
}

/**
 * Cost breakdown for pricing analysis
 */
export interface CostBreakdownAnalysis {
  material_cost: number
  labor_cost: number
  overhead_cost: number
  packaging_cost: number
  total_cost: number
  cost_per_serving: number
}

/**
 * Pricing tiers for different market segments
 */
export interface PricingTiers {
  economy: PricingTier
  standard: PricingTier
  premium: PricingTier
}

/**
 * Individual pricing tier
 */
export interface PricingTier {
  price: number
  margin_percentage: number
  margin_amount: number
  target_market: string
  description: string
}

/**
 * Pricing recommendation
 */
export interface PricingRecommendation {
  type: 'decrease' | 'increase' | 'maintain'
  suggested_price: number
  reason: string
  impact: PricingImpact
  confidence: 'high' | 'low' | 'medium'
}

/**
 * Impact of pricing change
 */
export interface PricingImpact {
  revenue_change: number
  margin_change: number
  volume_change_estimate: number
  competitive_position: string
}

/**
 * Market comparison data
 */
export interface MarketComparison {
  average_market_price: number
  price_position: 'above' | 'at' | 'below'
  price_difference_percentage: number
  competitors: CompetitorPrice[]
}

/**
 * Competitor pricing data
 */
export interface CompetitorPrice {
  competitor_name: string
  price: number
  notes?: string
}

/**
 * Sales analytics data
 */
export interface SalesAnalytics {
  period: TimePeriod
  total_revenue: number
  total_orders: number
  average_order_value: number
  growth_rate: number
  trends: SalesTrend[]
  top_products: ProductPerformance[]
  customer_segments: CustomerSegment[]
}

/**
 * Time period for analytics
 */
export interface TimePeriod {
  start_date: string
  end_date: string
  label: string
}

/**
 * Sales trend data point
 */
export interface SalesTrend {
  date: string
  revenue: number
  orders: number
  average_order_value: number
}

/**
 * Product performance metrics
 */
export interface ProductPerformance {
  recipe_id: string
  recipe_name: string
  quantity_sold: number
  revenue: number
  profit: number
  growth_rate: number
  rank: number
}

/**
 * Customer segment analysis
 */
export interface CustomerSegment {
  segment_name: string
  customer_count: number
  total_revenue: number
  average_order_value: number
  order_frequency: number
  characteristics: string[]
}

/**
 * Business intelligence dashboard data
 */
export interface DashboardAnalytics {
  summary: BusinessSummary
  sales: SalesAnalytics
  inventory: InventoryAnalysis[]
  financial: FinancialAnalytics
  alerts: SystemAlert[]
}

/**
 * Business summary metrics
 */
export interface BusinessSummary {
  total_revenue: number
  total_orders: number
  total_customers: number
  active_products: number
  revenue_growth: number
  order_growth: number
  customer_growth: number
  profit_margin: number
}

/**
 * Financial analytics
 */
export interface FinancialAnalytics {
  revenue: number
  costs: number
  profit: number
  profit_margin: number
  cash_flow: number
  expenses_breakdown: ExpenseCategory[]
  revenue_by_category: RevenueCategory[]
}

/**
 * Expense category breakdown
 */
export interface ExpenseCategory {
  category: string
  amount: number
  percentage: number
  trend: 'decreasing' | 'increasing' | 'stable'
}

/**
 * Revenue category breakdown
 */
export interface RevenueCategory {
  category: string
  revenue: number
  percentage: number
  growth_rate: number
}

/**
 * System alert for dashboard
 */
export interface SystemAlert {
  id: string
  type: 'error' | 'info' | 'success' | 'warning'
  priority: 'critical' | 'high' | 'low' | 'medium'
  title: string
  message: string
  action_url?: string
  action_label?: string
  created_at: string
  is_read: boolean
}
