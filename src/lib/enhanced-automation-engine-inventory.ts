// Intelligent Inventory Analysis Engine
import type { EnhancedAutomationConfig, InventoryAnalysisResult } from './enhanced-automation-engine-types'
import { supabase } from '@/lib/supabase'

export class InventoryEngine {
  constructor(private config: EnhancedAutomationConfig) {}

  async analyzeIntelligentInventory() {
    try {
      // Use database function for intelligent inventory analysis
      const { data: inventoryAnalysis, error } = await supabase.rpc('analyze_inventory_needs')

      if (error) throw error

      const analysis = inventoryAnalysis as InventoryAnalysisResult[]

      // Enhanced analysis with usage predictions
      const usagePredictions = await this.predictUsageTrends()
      const costOptimization = await this.analyzeInventoryCostOptimization()

      // Generate critical alerts with impact assessment
      const criticalAlerts = analysis
        .filter(item => ['CRITICAL', 'HIGH'].includes(item.urgency_level))
        .map(item => ({
          ingredient: item.ingredient_name,
          status: this.mapUrgencyToStatus(item.urgency_level),
          days_remaining: item.days_until_stockout,
          impact_level: this.calculateImpactLevel(item.cost_impact),
          recommended_action: this.generateActionRecommendation(item)
        }))

      // Generate intelligent reorder recommendations
      const reorderRecommendations = analysis
        .filter(item => item.suggested_order_quantity > 0)
        .map(item => ({
          ingredient: item.ingredient_name,
          current_stock: item.current_stock,
          optimal_order_qty: item.suggested_order_quantity,
          cost_estimate: item.cost_impact,
          delivery_priority: this.calculateDeliveryPriority(item.days_until_stockout),
          supplier_recommendation: 'Best price supplier' // TODO: Implement supplier selection
        }))

      return {
        critical_alerts: criticalAlerts,
        reorder_recommendations: reorderRecommendations,
        usage_predictions: usagePredictions,
        cost_optimization: costOptimization
      }
    } catch (error: any) {
      console.error('Intelligent inventory analysis error:', error)
      throw error
    }
  }

  // Static method for inventory analysis (used by components)
  static async analyzeInventoryNeeds() {
    try {
      const { data: analysisResult, error } = await (supabase as any).rpc('analyze_inventory_needs')

      if (error) throw error

      // Transform and categorize results
      const criticalItems = analysisResult?.filter((item: any) => item.urgency_level === 'CRITICAL') || []
      const reorderSuggestions = analysisResult?.filter((item: any) =>
        ['HIGH', 'MEDIUM'].includes(item.urgency_level)
      ) || []

      return {
        criticalItems,
        reorderSuggestions,
        totalItemsNeedingAttention: analysisResult?.length || 0
      }
    } catch (error: any) {
      console.error('Error analyzing inventory needs:', error)
      return {
        criticalItems: [],
        reorderSuggestions: [],
        totalItemsNeedingAttention: 0
      }
    }
  }

  private mapUrgencyToStatus(urgency: string): 'OUT_OF_STOCK' | 'CRITICAL_LOW' | 'REORDER_URGENT' {
    switch (urgency) {
      case 'CRITICAL': return 'OUT_OF_STOCK'
      case 'HIGH': return 'CRITICAL_LOW'
      default: return 'REORDER_URGENT'
    }
  }

  private calculateImpactLevel(costImpact: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (costImpact > 100000) return 'HIGH'      // > 100k per week
    if (costImpact > 50000) return 'MEDIUM'     // > 50k per week
    return 'LOW'
  }

  private generateActionRecommendation(item: InventoryAnalysisResult): string {
    if (item.days_until_stockout <= 1) {
      return `EMERGENCY: Order ${item.suggested_order_quantity} ${item.ingredient_name} immediately!`
    } else if (item.days_until_stockout <= 3) {
      return `URGENT: Schedule order for ${item.suggested_order_quantity} ${item.ingredient_name} today`
    } else {
      return `SCHEDULE: Plan to order ${item.suggested_order_quantity} ${item.ingredient_name} this week`
    }
  }

  private calculateDeliveryPriority(daysUntilStockout: number): number {
    // Priority score 1-10 (10 = highest priority)
    if (daysUntilStockout <= 1) return 10
    if (daysUntilStockout <= 3) return 8
    if (daysUntilStockout <= 7) return 6
    return 4
  }

  private async predictUsageTrends() {
    // Would implement time series analysis for usage prediction
    return []
  }

  private async analyzeInventoryCostOptimization() {
    // Would implement cost optimization algorithms
    return {
      potential_savings: 0,
      overstock_value: 0,
      understock_risk: 0,
      optimization_suggestions: []
    }
  }
}
