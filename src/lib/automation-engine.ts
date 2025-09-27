/**
 * Smart Automation Engine for UMKM F&B
 * Handles automatic calculations, notifications, and business logic
 */

import { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']

// Configuration for automation rules
interface AutomationConfig {
  // Pricing automation
  defaultProfitMargin: number // e.g., 60% 
  minimumProfitMargin: number // e.g., 30%
  maximumProfitMargin: number // e.g., 200%
  
  // Inventory automation  
  autoReorderDays: number // e.g., 7 days before stock runs out
  safetyStockMultiplier: number // e.g., 1.5x normal usage
  
  // Production automation
  productionLeadTime: number // hours needed for production
  batchOptimizationThreshold: number // minimum batch size
  
  // Financial automation
  lowProfitabilityThreshold: number // e.g., 20%
  cashFlowWarningDays: number // e.g., 7 days
}

export class AutomationEngine {
  private config: AutomationConfig

  constructor(config?: Partial<AutomationConfig>) {
    this.config = {
      defaultProfitMargin: 60, // 60% margin
      minimumProfitMargin: 30,
      maximumProfitMargin: 200,
      autoReorderDays: 7,
      safetyStockMultiplier: 1.5,
      productionLeadTime: 4, // 4 hours
      batchOptimizationThreshold: 5,
      lowProfitabilityThreshold: 20,
      cashFlowWarningDays: 7,
      ...config
    }
  }

  /**
   * 🧮 AUTO-CALCULATION: Smart HPP & Pricing
   * Automatically calculates cost and suggests optimal pricing
   */
  calculateSmartPricing(recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }) {
    // 1. Calculate exact HPP from ingredients
    const ingredientCost = recipe.recipe_ingredients.reduce((total, ri) => {
      return total + (ri.ingredient.price_per_unit * ri.quantity)
    }, 0)

    // 2. Add overhead costs (utilities, labor, packaging, etc.)
    const overheadPercentage = 15 // 15% overhead
    const overheadCost = ingredientCost * (overheadPercentage / 100)
    const totalCost = ingredientCost + overheadCost

    // 3. Smart pricing based on market positioning
    const competitivePricing = this.calculateCompetitivePricing(totalCost)
    const profitabilityAnalysis = this.analyzeProfitability(totalCost, competitivePricing)

    return {
      breakdown: {
        ingredientCost,
        overheadCost,
        totalCost,
        costPerServing: totalCost / recipe.servings
      },
      pricing: competitivePricing,
      analysis: profitabilityAnalysis,
      recommendations: this.generatePricingRecommendations(totalCost, competitivePricing)
    }
  }

  /**
   * Calculate competitive pricing options
   */
  private calculateCompetitivePricing(totalCost: number) {
    const economyPrice = totalCost * (1 + this.config.minimumProfitMargin / 100)
    const standardPrice = totalCost * (1 + this.config.defaultProfitMargin / 100)
    const premiumPrice = totalCost * (1 + 100 / 100) // 100% margin for premium

    return {
      economy: {
        price: Math.ceil(economyPrice / 500) * 500, // Round to nearest 500
        margin: this.config.minimumProfitMargin,
        positioning: 'Harga Ekonomis - Kompetitif untuk volume tinggi'
      },
      standard: {
        price: Math.ceil(standardPrice / 1000) * 1000, // Round to nearest 1000
        margin: this.config.defaultProfitMargin,
        positioning: 'Harga Standar - Balance antara profit dan kompetitif'
      },
      premium: {
        price: Math.ceil(premiumPrice / 1000) * 1000,
        margin: 100,
        positioning: 'Harga Premium - Fokus kualitas dan brand'
      }
    }
  }

  /**
   * 📊 INVENTORY AUTOMATION: Smart Stock Management
   */
  analyzeInventoryNeeds(ingredients: Ingredient[], usageData: Record<string, number>) {
    return ingredients.map(ingredient => {
      const monthlyUsage = usageData[ingredient.id] || 0
      const dailyUsage = monthlyUsage / 30
      const daysRemaining = dailyUsage > 0 ? ingredient.current_stock / dailyUsage : Infinity

      // Smart reorder calculation
      const reorderPoint = dailyUsage * this.config.autoReorderDays
      const optimalOrderQuantity = this.calculateEconomicOrderQuantity(ingredient, monthlyUsage)

      return {
        ingredient,
        status: this.getInventoryStatus(daysRemaining, ingredient.current_stock, ingredient.min_stock),
        daysRemaining: Math.floor(daysRemaining),
        reorderRecommendation: {
          shouldReorder: ingredient.current_stock <= reorderPoint,
          quantity: optimalOrderQuantity,
          urgency: this.getReorderUrgency(daysRemaining),
          estimatedCost: optimalOrderQuantity * ingredient.price_per_unit
        },
        insights: this.generateInventoryInsights(ingredient, dailyUsage, daysRemaining)
      }
    })
  }

  /**
   * 🏭 PRODUCTION AUTOMATION: Smart Production Planning
   */
  generateProductionPlan(
    orders: Array<{ recipe_id: string; quantity: number; delivery_date: string }>,
    recipes: Array<Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }>,
    currentInventory: Ingredient[]
  ) {
    const productionPlan = orders.map(order => {
      const recipe = recipes.find(r => r.id === order.recipe_id)!
      
      // Check ingredient availability
      const availabilityCheck = this.checkIngredientAvailability(recipe, order.quantity, currentInventory)
      
      // Calculate production timeline
      const productionTime = this.calculateProductionTime(recipe, order.quantity)
      const startTime = this.calculateOptimalStartTime(order.delivery_date, productionTime)

      return {
        orderId: order.recipe_id + '-' + Date.now(),
        recipe,
        quantity: order.quantity,
        deliveryDate: new Date(order.delivery_date),
        production: {
          canProduce: availabilityCheck.canProduce,
          startTime,
          estimatedDuration: productionTime,
          batchCount: Math.ceil(order.quantity / recipe.servings),
        },
        ingredients: availabilityCheck,
        recommendations: this.generateProductionRecommendations(availabilityCheck, productionTime)
      }
    })

    return {
      plan: productionPlan,
      summary: this.generateProductionSummary(productionPlan),
      optimizations: this.suggestProductionOptimizations(productionPlan)
    }
  }

  /**
   * 💰 FINANCIAL AUTOMATION: Smart Financial Insights
   */
  analyzeFinancialHealth(
    sales: Array<{ amount: number; cost: number; date: string }>,
    expenses: Array<{ amount: number; category: string; date: string }>,
    inventory: Ingredient[]
  ) {
    const period30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Filter recent data
    const recentSales = sales.filter(s => new Date(s.date) >= period30Days)
    const recentExpenses = expenses.filter(e => new Date(e.date) >= period30Days)

    // Calculate key metrics
    const totalRevenue = recentSales.reduce((sum, s) => sum + s.amount, 0)
    const totalCOGS = recentSales.reduce((sum, s) => sum + s.cost, 0)
    const totalExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalExpenses

    // Inventory value
    const inventoryValue = inventory.reduce((sum, i) => sum + (i.current_stock * i.price_per_unit), 0)

    return {
      metrics: {
        revenue: totalRevenue,
        grossProfit,
        netProfit,
        grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        inventoryValue
      },
      trends: this.analyzeFinancialTrends(recentSales, recentExpenses),
      alerts: this.generateFinancialAlerts(grossProfit, netProfit, inventoryValue),
      recommendations: this.generateFinancialRecommendations(totalRevenue, grossProfit, netProfit)
    }
  }

  /**
   * 🔔 NOTIFICATION SYSTEM: Smart Alerts
   */
  generateSmartNotifications(
    inventory: Ingredient[],
    orders: Array<{ delivery_date: string; status: string }>,
    financialMetrics: { grossMargin: number; netMargin: number }
  ) {
    const notifications = []

    // Ensure inventory is an array
    const safeInventory = Array.isArray(inventory) ? inventory : []
    const safeOrders = Array.isArray(orders) ? orders : []

    // Inventory notifications
    safeInventory.forEach(ingredient => {
      if (ingredient.current_stock <= ingredient.min_stock * 0.5) {
        notifications.push({
          type: 'critical' as const,
          category: 'inventory' as const,
          title: `Stok ${ingredient.name} KRITIS!`,
          message: `Tersisa ${ingredient.current_stock}${ingredient.unit}. Segera restock untuk menghindari kehabisan.`,
          action: 'reorder',
          priority: 'high' as const
        })
      }
    })

    // Order notifications
    const urgentOrders = safeOrders.filter(o => {
      const deliveryDate = new Date(o.delivery_date)
      const now = new Date()
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && o.status !== 'COMPLETED'
    })

    urgentOrders.forEach(order => {
      notifications.push({
        type: 'warning' as const,
        category: 'production' as const,
        title: 'Pesanan Mendesak!',
        message: `Pesanan harus selesai dalam 24 jam. Pastikan produksi sudah dimulai.`,
        action: 'check_production',
        priority: 'high' as const
      })
    })

    // Financial notifications
    if (financialMetrics.grossMargin < this.config.lowProfitabilityThreshold) {
      notifications.push({
        type: 'warning' as const,
        category: 'financial' as const,
        title: 'Margin Keuntungan Rendah',
        message: `Margin kotor hanya ${financialMetrics.grossMargin.toFixed(1)}%. Pertimbangkan menaikkan harga atau efisiensi cost.`,
        action: 'review_pricing',
        priority: 'medium' as const
      })
    }

    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Helper methods
  private analyzeProfitability(cost: number, pricing: any) {
    return Object.entries(pricing).map(([tier, data]: [string, any]) => ({
      tier,
      profitAmount: data.price - cost,
      profitMargin: ((data.price - cost) / data.price) * 100,
      breakEvenVolume: Math.ceil(1000 / (data.price - cost)) // Assuming 1000 fixed costs
    }))
  }

  private generatePricingRecommendations(cost: number, pricing: any) {
    const recommendations = []
    
    if (cost > pricing.standard.price * 0.7) {
      recommendations.push('⚠️ Cost terlalu tinggi, pertimbangkan optimasi ingredient atau supplier')
    }
    
    recommendations.push(`💡 Harga optimal: Rp ${pricing.standard.price.toLocaleString()} untuk margin sehat`)
    recommendations.push(`🎯 Break-even minimum: Rp ${Math.ceil(cost * 1.3).toLocaleString()}`)
    
    return recommendations
  }

  private getInventoryStatus(daysRemaining: number, currentStock: number, minStock: number): 'critical' | 'low' | 'adequate' | 'overstocked' {
    if (currentStock <= minStock * 0.5) return 'critical'
    if (currentStock <= minStock) return 'low'
    if (currentStock > minStock * 3) return 'overstocked'
    return 'adequate'
  }

  private calculateEconomicOrderQuantity(ingredient: Ingredient, monthlyUsage: number): number {
    // Simplified EOQ calculation
    const annualDemand = monthlyUsage * 12
    const orderingCost = 50000 // Rp 50k per order (delivery, admin, etc.)
    const holdingCostRate = 0.2 // 20% of item value per year
    const holdingCost = ingredient.price_per_unit * holdingCostRate

    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost)
    return Math.max(eoq, ingredient.min_stock) // At least minimum stock
  }

  private getReorderUrgency(daysRemaining: number): 'urgent' | 'soon' | 'normal' {
    if (daysRemaining <= 3) return 'urgent'
    if (daysRemaining <= 7) return 'soon'
    return 'normal'
  }

  private generateInventoryInsights(ingredient: Ingredient, dailyUsage: number, daysRemaining: number) {
    const insights = []
    
    if (daysRemaining < 7) {
      insights.push(`⚠️ Akan habis dalam ${Math.floor(daysRemaining)} hari`)
    }
    
    if (dailyUsage > 0) {
      const monthlyUsage = dailyUsage * 30
      insights.push(`📊 Pemakaian bulanan: ${monthlyUsage.toFixed(1)} ${ingredient.unit}`)
    }
    
    return insights
  }

  private checkIngredientAvailability(recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }, quantity: number, inventory: Ingredient[]) {
    const requirements = recipe.recipe_ingredients.map(ri => {
      const needed = ri.quantity * quantity
      const available = ri.ingredient.current_stock
      return {
        ingredient: ri.ingredient,
        needed,
        available,
        sufficient: available >= needed,
        shortage: Math.max(0, needed - available)
      }
    })

    return {
      canProduce: requirements.every(r => r.sufficient),
      requirements,
      totalShortage: requirements.reduce((sum, r) => sum + r.shortage, 0)
    }
  }

  private calculateProductionTime(recipe: Recipe, quantity: number): number {
    // Base time + time per batch + prep time
    const batchSize = recipe.servings
    const batches = Math.ceil(quantity / batchSize)
    const prepTime = recipe.prep_time || 30 // minutes
    const cookTime = recipe.cook_time || 45 // minutes
    
    return (prepTime + cookTime) * batches / 60 // Convert to hours
  }

  private calculateOptimalStartTime(deliveryDate: string, productionTime: number): Date {
    const delivery = new Date(deliveryDate)
    const startTime = new Date(delivery.getTime() - (productionTime + this.config.productionLeadTime) * 60 * 60 * 1000)
    return startTime
  }

  private generateProductionRecommendations(availability: any, productionTime: number) {
    const recommendations = []
    
    if (!availability.canProduce) {
      recommendations.push('🛑 Tidak bisa produksi - stok bahan tidak cukup')
      recommendations.push('📦 Segera restock bahan yang kurang')
    }
    
    if (productionTime > 8) {
      recommendations.push('⏰ Produksi memerlukan waktu lama, pertimbangkan produksi bertahap')
    }
    
    return recommendations
  }

  private generateProductionSummary(plan: any[]) {
    const totalOrders = plan.length
    const canProduceCount = plan.filter(p => p.production.canProduce).length
    const totalBatches = plan.reduce((sum, p) => sum + p.production.batchCount, 0)
    
    return {
      totalOrders,
      canProduceCount,
      blockedCount: totalOrders - canProduceCount,
      totalBatches,
      efficiency: totalOrders > 0 ? (canProduceCount / totalOrders) * 100 : 0
    }
  }

  private suggestProductionOptimizations(plan: any[]) {
    const optimizations: Array<{
      type: string;
      description: string;
      impact: string;
      action: string;
    }> = []
    
    // Batch similar recipes together
    const recipeGroups: Record<string, any[]> = plan.reduce((groups, item) => {
      const key = item.recipe.id
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, any[]>)

    const groupValues = Object.values(recipeGroups) as any[][]
    groupValues.forEach((group: any[]) => {
      if (group.length > 1) {
        optimizations.push({
          type: 'batch_optimization',
          description: `Produksi ${group[0].recipe.name} dalam 1 batch untuk ${group.length} pesanan`,
          impact: `Hemat ${group.length - 1} kali setup time`,
          action: 'Gabungkan produksi untuk efisiensi'
        })
      }
    })
    
    return optimizations
  }

  private analyzeFinancialTrends(sales: any[], expenses: any[]) {
    // Calculate weekly trends
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const weeklyData = weeks.map((week, index) => {
      const weekStart = new Date(Date.now() - (4 - index) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(Date.now() - (3 - index) * 7 * 24 * 60 * 60 * 1000)
      
      const weekSales = sales.filter(s => {
        const date = new Date(s.date)
        return date >= weekStart && date < weekEnd
      })
      
      const weekExpenses = expenses.filter(e => {
        const date = new Date(e.date)
        return date >= weekStart && date < weekEnd
      })
      
      return {
        week,
        revenue: weekSales.reduce((sum, s) => sum + s.amount, 0),
        expenses: weekExpenses.reduce((sum, e) => sum + e.amount, 0)
      }
    })
    
    return weeklyData
  }

  private generateFinancialAlerts(grossProfit: number, netProfit: number, inventoryValue: number) {
    const alerts = []
    
    if (netProfit < 0) {
      alerts.push({
        type: 'danger',
        message: 'Bisnis mengalami kerugian bulan ini',
        action: 'Segera review pricing dan efisiensi operasional'
      })
    }
    
    if (grossProfit / inventoryValue < 0.1) {
      alerts.push({
        type: 'warning', 
        message: 'Inventory terlalu tinggi dibanding profit',
        action: 'Pertimbangkan mengurangi stok atau tingkatkan penjualan'
      })
    }
    
    return alerts
  }

  private generateFinancialRecommendations(revenue: number, grossProfit: number, netProfit: number) {
    const recommendations = []
    
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0
    
    if (grossMargin < 50) {
      recommendations.push('🎯 Target gross margin minimal 50% untuk F&B yang sehat')
    }
    
    if (netMargin < 15) {
      recommendations.push('💡 Fokus pada produk dengan margin tinggi untuk tingkatkan profitabilitas')
    }
    
    recommendations.push(`📈 Untuk mencapai target profit 25%, perlu tambah revenue Rp ${((grossProfit / 0.25) - revenue).toLocaleString()}`)
    
    return recommendations
  }
}

// Default configuration for Indonesian UMKM F&B
export const UMKM_CONFIG: AutomationConfig = {
  defaultProfitMargin: 60, // 60% margin - typical for F&B
  minimumProfitMargin: 30, // 30% minimum
  maximumProfitMargin: 150, // 150% for premium products
  autoReorderDays: 7, // Reorder 7 days before stock out
  safetyStockMultiplier: 1.5, // 50% safety stock
  productionLeadTime: 4, // 4 hours production buffer
  batchOptimizationThreshold: 5, // Minimum 5 units per batch
  lowProfitabilityThreshold: 20, // Alert if margin below 20%
  cashFlowWarningDays: 7 // Cash flow warning 7 days ahead
}

export const automationEngine = new AutomationEngine(UMKM_CONFIG)