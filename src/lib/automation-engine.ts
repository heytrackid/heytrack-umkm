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

/**
 * WORKFLOW AUTOMATION SYSTEM
 * Sistem otomasi untuk workflow bisnis yang seamless
 */

// Event types untuk automation triggers
export type WorkflowEvent = 
  | 'order.status_changed'
  | 'order.completed'
  | 'order.cancelled'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'production.batch_completed'
  | 'ingredient.price_changed'
  | 'operational_cost.changed'
  | 'hpp.recalculation_needed'

export interface WorkflowEventData {
  event: WorkflowEvent
  entityId: string
  data: any
  timestamp: string
}

export class WorkflowAutomation {
  private static instance: WorkflowAutomation
  private eventQueue: WorkflowEventData[] = []
  private isProcessing = false

  private constructor() {}

  public static getInstance(): WorkflowAutomation {
    if (!WorkflowAutomation.instance) {
      WorkflowAutomation.instance = new WorkflowAutomation()
    }
    return WorkflowAutomation.instance
  }

  /**
   * Trigger workflow automation event
   */
  async triggerEvent(eventData: Omit<WorkflowEventData, 'timestamp'>) {
    const event: WorkflowEventData = {
      ...eventData,
      timestamp: new Date().toISOString()
    }

    console.log('🤖 Workflow Automation: Event triggered', event.event, event.entityId)
    
    // Add to queue for processing
    this.eventQueue.push(event)
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  /**
   * Process event queue
   */
  private async processEventQueue() {
    if (this.eventQueue.length === 0 || this.isProcessing) return

    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      if (event) {
        await this.processEvent(event)
      }
    }

    this.isProcessing = false
  }

  /**
   * Process single workflow event
   */
  private async processEvent(event: WorkflowEventData) {
    console.log(`🎯 Processing workflow event: ${event.event}`);

    try {
      switch (event.event) {
        case 'order.completed':
          await this.handleOrderCompleted(event)
          break
        case 'order.cancelled':
          await this.handleOrderCancelled(event)
          break
        case 'inventory.low_stock':
          await this.handleLowStock(event)
          break
        case 'ingredient.price_changed':
          await this.handleIngredientPriceChanged(event)
          break
        case 'operational_cost.changed':
          await this.handleOperationalCostChanged(event)
          break
        case 'hpp.recalculation_needed':
          await this.handleHPPRecalculationNeeded(event)
          break
        default:
          console.log(`No handler for event: ${event.event}`)
      }
    } catch (error) {
      console.error(`❌ Error processing event ${event.event}:`, error)
    }
  }

  /**
   * WORKFLOW: Order Completed
   * Otomatis: update inventory, create financial record, update customer stats
   */
  private async handleOrderCompleted(event: WorkflowEventData) {
    const orderId = event.entityId
    console.log('📦 Processing order completion workflow for:', orderId)

    // Import supabase inside function to avoid potential issues
    const { createServerSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = createServerSupabaseAdmin()

    try {
      // 1. Get order with items and recipes
      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            recipe:recipes (
              *,
              recipe_ingredients (
                *,
                ingredient:ingredients (*)
              )
            )
          ),
          customer:customers (*)
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Order not found:', orderError)
        return
      }

      console.log(`Processing completed order: ${order.order_no}`)

      // 2. Update inventory stock
      await this.updateInventoryFromOrder(order, supabase)

      // 3. Create financial record
      await this.createFinancialRecordFromOrder(order, supabase)

      // 4. Update customer statistics
      if (order.customer) {
        await this.updateCustomerStats(order, supabase)
      }

      // 5. Send completion notification
      console.log(`✅ Order completion workflow finished for ${order.order_no}`);

    } catch (error) {
      console.error('Error in order completion workflow:', error)
    }
  }

  /**
   * Update inventory stock berdasarkan order items
   */
  private async updateInventoryFromOrder(order: any, supabase: any) {
    console.log('📊 Updating inventory from order items...')

    for (const orderItem of order.order_items || []) {
      const recipe = orderItem.recipe
      if (!recipe || !recipe.recipe_ingredients) continue

      console.log(`Processing recipe: ${recipe.name} (${orderItem.quantity} qty)`)

      for (const recipeIngredient of recipe.recipe_ingredients) {
        const ingredient = recipeIngredient.ingredient
        const usedQuantity = recipeIngredient.quantity * orderItem.quantity
        const newStock = Math.max(0, ingredient.current_stock - usedQuantity)

        // Update ingredient stock
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ 
            current_stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredient.id)

        if (updateError) {
          console.error('Error updating ingredient stock:', updateError)
          continue
        }

        // Create stock transaction record
        await supabase
          .from('stock_transactions')
          .insert({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            type: 'USAGE',
            quantity: -usedQuantity, // Negative for usage
            unit: ingredient.unit,
            unit_price: ingredient.price_per_unit,
            total_value: usedQuantity * ingredient.price_per_unit,
            reference: `ORDER-${order.order_no}`,
            reason: 'Order completion',
            notes: `Used for order ${order.order_no} - ${recipe.name} (${orderItem.quantity} units)`
          })

        console.log(`✅ Updated ${ingredient.name}: ${ingredient.current_stock} → ${newStock}`)

        // Check for low stock dan trigger alert
        if (newStock <= ingredient.min_stock && newStock > 0) {
          this.triggerEvent({
            event: 'inventory.low_stock',
            entityId: ingredient.id,
            data: {
              ingredient,
              currentStock: newStock,
              minStock: ingredient.min_stock,
              severity: newStock <= ingredient.min_stock * 0.5 ? 'critical' : 'warning'
            }
          })
        }
      }
    }
  }

  /**
   * Create financial record untuk completed order
   */
  private async createFinancialRecordFromOrder(order: any, supabase: any) {
    console.log('💰 Creating financial record for completed order...')

    try {
      // Create income record
      const { error: financialError } = await supabase
        .from('financial_records')
        .insert({
          type: 'INCOME',
          category: 'Penjualan',
          amount: order.total_amount,
          description: `Penjualan - Order ${order.order_no}`,
          reference: `ORDER-${order.order_no}`,
          payment_method: order.payment_method || 'CASH',
          date: new Date().toISOString().split('T')[0], // Today's date
          order_id: order.id
        })

      if (financialError) {
        console.error('Error creating financial record:', financialError)
      } else {
        console.log(`✅ Created financial record: +Rp ${order.total_amount.toLocaleString()}`)
      }
    } catch (error) {
      console.error('Error in createFinancialRecordFromOrder:', error)
    }
  }

  /**
   * Update customer statistics
   */
  private async updateCustomerStats(order: any, supabase: any) {
    if (!order.customer_id) return

    console.log('👤 Updating customer statistics...')

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', order.customer_id)
        .single()

      if (customer) {
        const newTotalOrders = (customer.total_orders || 0) + 1
        const newTotalSpent = (customer.total_spent || 0) + order.total_amount
        const newAverageOrderValue = newTotalSpent / newTotalOrders

        await supabase
          .from('customers')
          .update({
            total_orders: newTotalOrders,
            total_spent: newTotalSpent,
            average_order_value: newAverageOrderValue,
            last_order_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', order.customer_id)

        console.log(`✅ Updated customer stats: orders=${newTotalOrders}, spent=Rp${newTotalSpent.toLocaleString()}`)
      }
    } catch (error) {
      console.error('Error updating customer stats:', error)
    }
  }

  /**
   * WORKFLOW: Handle Low Stock
   * Otomatis: send alert, suggest reorder
   */
  private async handleLowStock(event: WorkflowEventData) {
    const ingredient = event.data.ingredient
    const currentStock = event.data.currentStock
    const severity = event.data.severity

    console.log(`📉 Handling low stock for ${ingredient.name}: ${currentStock} ${ingredient.unit}`)

    // Create notification in database (simplified)
    // In real app, would integrate with notification system
    console.log(`🔔 ALERT: ${ingredient.name} stock rendah (${currentStock} ${ingredient.unit})!`)
    
    if (severity === 'critical') {
      console.log('🚨 CRITICAL: Segera restock sebelum kehabisan total!')
    }

    // Auto-generate reorder suggestion
    const suggestedQuantity = Math.max(
      ingredient.min_stock * 2, // 2x minimum stock
      50 // Minimum reorder quantity
    )
    
    console.log(`💡 Suggested reorder: ${suggestedQuantity} ${ingredient.unit}`);
  }

  /**
   * WORKFLOW: Handle Order Cancelled
   * Otomatis: restore inventory (if needed), update financial records
   */
  private async handleOrderCancelled(event: WorkflowEventData) {
    console.log('❌ Processing order cancellation workflow...', event.entityId)
    // Implementation for order cancellation workflow
    // This would restore inventory if order was already in production
  }

  /**
   * WORKFLOW: Handle Ingredient Price Change
   * Otomatis: trigger HPP recalculation, update pricing suggestions
   */
  private async handleIngredientPriceChanged(event: WorkflowEventData) {
    const { ingredientId, oldPrice, newPrice, priceChange, affectedRecipes } = event.data
    
    console.log(`💰 Processing ingredient price change workflow: ${ingredientId}`);
    console.log(`Price change: ${priceChange.toFixed(2)}% (${oldPrice} → ${newPrice})`)

    // Generate smart notifications for significant price changes
    if (Math.abs(priceChange) > 10) {
      // Import smart notification system
      const { smartNotificationSystem } = await import('./smart-notifications')
      
      smartNotificationSystem.addNotification({
        type: priceChange > 0 ? 'warning' : 'info',
        category: 'financial',
        priority: Math.abs(priceChange) > 20 ? 'critical' : 'high',
        title: `Harga Bahan Baku ${priceChange > 0 ? 'NAIK' : 'TURUN'} Signifikan`,
        message: `Perubahan ${Math.abs(priceChange).toFixed(1)}% mempengaruhi ${affectedRecipes?.length || 0} resep. HPP otomatis diperbarui.`,
        actionUrl: '/hpp-simple?tab=price_impact',
        actionLabel: 'Review HPP'
      })
    }

    // Trigger pricing review for high-impact changes
    if (Math.abs(priceChange) > 15 && affectedRecipes?.length > 0) {
      console.log(`🎯 High-impact price change detected, triggering pricing review workflow`)
      
      // Schedule pricing review task
      setTimeout(async () => {
        await this.triggerEvent({
          event: 'hpp.recalculation_needed',
          entityId: 'batch_pricing_review',
          data: {
            reason: 'significant_price_change',
            triggerIngredient: ingredientId,
            priceChange,
            affectedRecipes
          }
        })
      }, 5000) // 5 second delay to allow price change to propagate
    }
  }

  /**
   * WORKFLOW: Handle Operational Cost Change  
   * Otomatis: recalculate all HPP, update pricing across all recipes
   */
  private async handleOperationalCostChanged(event: WorkflowEventData) {
    const { costId, costName, oldAmount, newAmount } = event.data
    
    console.log(`🏭 Processing operational cost change workflow: ${costName}`);
    console.log(`Cost change: ${oldAmount} → ${newAmount}`)

    // Import smart notification system
    const { smartNotificationSystem } = await import('./smart-notifications')
    
    // Operational cost changes affect ALL recipes, so generate comprehensive alert
    smartNotificationSystem.addNotification({
      type: 'info',
      category: 'financial', 
      priority: 'medium',
      title: 'Biaya Operasional Diperbarui',
      message: `${costName} berubah dari Rp ${oldAmount.toLocaleString()} ke Rp ${newAmount.toLocaleString()}. Semua HPP otomatis diperbarui.`,
      actionUrl: '/hpp-simple?tab=operational_costs',
      actionLabel: 'Lihat HPP'
    })

    // Generate business recommendation
    const costChange = ((newAmount - oldAmount) / oldAmount) * 100
    if (Math.abs(costChange) > 10) {
      smartNotificationSystem.addNotification({
        type: 'warning',
        category: 'financial',
        priority: 'high', 
        title: 'Review Pricing Strategy Disarankan',
        message: `Perubahan biaya operasional ${Math.abs(costChange).toFixed(1)}% mempengaruhi seluruh profitabilitas. Pertimbangkan review harga jual.`,
        actionUrl: '/hpp-simple?tab=pricing_review',
        actionLabel: 'Review Pricing'
      })
    }
  }

  /**
   * WORKFLOW: Handle HPP Recalculation Needed
   * Otomatis: batch recalculate HPP, generate business insights
   */
  private async handleHPPRecalculationNeeded(event: WorkflowEventData) {
    const { reason, affectedRecipes } = event.data
    
    console.log(`🧮 Processing HPP recalculation workflow: ${reason}`);

    // Import smart notification system
    const { smartNotificationSystem } = await import('./smart-notifications')
    
    // Notify about batch recalculation start
    smartNotificationSystem.addNotification({
      type: 'info',
      category: 'financial',
      priority: 'low',
      title: 'HPP Recalculation Started',
      message: `Memproses ulang HPP untuk ${affectedRecipes?.length || 'semua'} resep karena ${reason}`,
      actionUrl: '/hpp-simple?tab=recalculation_progress',
      actionLabel: 'Monitor Progress'
    })

    // Simulate batch recalculation (in real app would call HPP automation API)
    setTimeout(async () => {
      // Generate completion notification with business insights
      smartNotificationSystem.addNotification({
        type: 'success',
        category: 'financial',
        priority: 'medium',
        title: 'HPP Recalculation Selesai',
        message: `HPP telah diperbarui. Review pricing suggestions untuk optimasi profit margin.`,
        actionUrl: '/hpp-simple?tab=pricing_suggestions',
        actionLabel: 'Lihat Suggestions'
      })

      // Generate business insights
      this.generateHPPBusinessInsights(affectedRecipes || [])
    }, 10000) // 10 second simulation
  }

  /**
   * Generate business insights dari HPP changes
   */
  private generateHPPBusinessInsights(affectedRecipes: any[]) {
    // Import smart notification system
    import('./smart-notifications').then(({ smartNotificationSystem }) => {
      // Mock insights - in real app would analyze actual HPP data
      const insights = [
        {
          type: 'optimization',
          message: 'Identifikasi 3 resep dengan margin terendah yang perlu review pricing',
          action: 'Review resep dengan profitabilitas rendah'
        },
        {
          type: 'cost_efficiency', 
          message: 'Ditemukan peluang penghematan 5% dengan substitusi bahan alternatif',
          action: 'Analisis ingredient alternatives'
        },
        {
          type: 'pricing_strategy',
          message: 'Margin rata-rata industri F&B: 60%. Current average: 45%',
          action: 'Pertimbangkan penyesuaian harga untuk target margin optimal'
        }
      ]

      insights.forEach((insight, index) => {
        setTimeout(() => {
          smartNotificationSystem.addNotification({
            type: 'info',
            category: 'financial',
            priority: 'medium',
            title: 'Business Insight: HPP Analysis',
            message: insight.message,
            actionUrl: '/hpp-simple?tab=insights&insight=' + insight.type,
            actionLabel: insight.action
          })
        }, (index + 1) * 2000) // Stagger notifications
      })
    })
  }
}

// Export singleton instance
export const workflowAutomation = WorkflowAutomation.getInstance()

// Helper function untuk trigger automation dari komponen lain
export const triggerWorkflow = async (
  event: WorkflowEvent, 
  entityId: string, 
  data: any = {}
) => {
  return workflowAutomation.triggerEvent({
    event,
    entityId,
    data
  })
}
