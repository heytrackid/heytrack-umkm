
/**
 * HPP (Harga Pokok Produksi) Automation System
 * Otomatis update HPP ketika ada perubahan harga bahan baku atau biaya operasional
 */

import { workflowAutomation } from '../automation-engine'
import { automationLogger } from '../logger'
import { smartNotificationSystem } from '../smart-notifications'

export interface HPPComponent {
  id: string
  name: string
  type: 'ingredient' | 'labor' | 'overhead' | 'packaging' | 'utility'
  cost: number
  unit: string
  lastUpdated: string
}

// Recipe ingredient with pricing info
export interface RecipeIngredient {
  ingredientId: string
  name: string
  quantity: number
  unit: string
  pricePerUnit?: number
}

// Packaging item for cost calculation
export interface PackagingItem {
  name: string
  quantity: number
  unit: string
  costPerUnit: number
}

// Recipe data structure for HPP calculation
export interface RecipeData {
  id: string
  name: string
  servings: number
  prepTime: number
  cookTime: number
  estimatedDuration: number
  ingredients: RecipeIngredient[]
  packaging?: PackagingItem[]
}

// Recipe with basic info for affected recipes list
export interface RecipeBasicInfo {
  id: string
  name: string
}

// HPP recalculation result
export interface HPPRecalculationResult {
  recipeId: string
  recipeName: string
  oldHPP: number
  newHPP: number
  change: number
  changePercentage: number
  impactLevel: 'low' | 'medium' | 'high'
}

export interface RecipeHPP {
  id: string
  recipeName: string
  recipeId: string
  servings: number
  components: {
    ingredients: Array<{
      ingredientId: string
      ingredientName: string
      quantity: number
      unit: string
      pricePerUnit: number
      totalCost: number
    }>
    labor: {
      prepTime: number // minutes
      cookTime: number // minutes
      hourlyRate: number
      totalLaborCost: number
    }
    overhead: {
      electricity: number
      gas: number
      rent: number // allocated per batch
      depreciation: number
      other: number
      totalOverheadCost: number
    }
    packaging: Array<{
      itemName: string
      quantity: number
      unit: string
      costPerUnit: number
      totalCost: number
    }>
  }
  totalDirectCost: number
  totalIndirectCost: number
  totalHPP: number
  hppPerServing: number
  suggestedSellingPrice: Array<{
    tier: 'economy' | 'standard' | 'premium'
    price: number
    margin: number
  }>
  lastCalculated: string
  needsRecalculation: boolean
}

export interface OperationalCost {
  id: string
  category: 'labor' | 'overhead' | 'utility' | 'rent' | 'depreciation'
  name: string
  amount: number
  period: 'hourly' | 'daily' | 'monthly' | 'per_batch'
  isActive: boolean
  lastUpdated: string
  autoAllocate: boolean // Otomatis alokasi ke semua resep
}

export class HPPAutomationSystem {
  private static instance: HPPAutomationSystem
  private recipeHPPCache: Map<string, RecipeHPP> = new Map()
  private operationalCosts: Map<string, OperationalCost> = new Map()
  private ingredientPriceHistory: Map<string, Array<{ date: string, price: number }>> = new Map()

  private constructor() {
    this.loadDefaultOperationalCosts()
  }

  public static getInstance(): HPPAutomationSystem {
    if (!HPPAutomationSystem.instance) {
      HPPAutomationSystem.instance = new HPPAutomationSystem()
    }
    return HPPAutomationSystem.instance
  }

  /**
   * AUTO-UPDATE HPP ketika harga bahan baku berubah
   */
  async onIngredientPriceChange(ingredientId: string, oldPrice: number, newPrice: number) {
    automationLogger.info({ ingredientId, oldPrice, newPrice }, 'Ingredient price changed')

    // Track price history
    this.trackPriceHistory(ingredientId, newPrice)

    // Find all recipes yang menggunakan ingredient ini
    const affectedRecipes = await this.findRecipesUsingIngredient(ingredientId)

    if (affectedRecipes.length === 0) {
      automationLogger.info('No recipes affected by price change')
      return
    }

    automationLogger.info({ count: affectedRecipes.length }, 'Found recipes affected by price change')

    // Recalculate HPP untuk semua affected recipes
    const recalculationResults = []
    for (const recipe of affectedRecipes) {
      const result = await this.recalculateRecipeHPP(recipe.id)
      recalculationResults.push(result)
    }

    // Generate notifications untuk price impact
    this.generatePriceChangeNotifications(ingredientId, oldPrice, newPrice, recalculationResults)

    // Trigger workflow automation
    await workflowAutomation.triggerEvent({
      event: 'ingredient.price_changed' as any,
      entityId: ingredientId,
      data: {
        ingredientId,
        oldPrice,
        newPrice,
        priceChange: ((newPrice - oldPrice) / oldPrice) * 100,
        affectedRecipes: recalculationResults
      }
    })
  }

  /**
   * AUTO-UPDATE HPP ketika biaya operasional berubah
   */
  async onOperationalCostChange(costId: string, oldAmount: number, newAmount: number) {
    automationLogger.info({ costId, oldAmount, newAmount }, 'Operational cost changed')

    const costItem = this.operationalCosts.get(costId)
    if (!costItem) {
      automationLogger.error({ costId }, 'Operational cost item not found')
      return
    }

    // Update operational cost
    costItem.amount = newAmount
    costItem.lastUpdated = new Date().toISOString()

    // Jika auto-allocate enabled, recalculate semua resep
    if (costItem.autoAllocate) {
      automationLogger.info({ costName: costItem.name }, 'Auto-allocating cost change to all recipes')
      await this.recalculateAllRecipes('operational_cost_change')
    }

    // Generate notification
    smartNotificationSystem.addNotification({
      type: 'info',
      category: 'financial',
      priority: 'medium',
      title: 'Biaya Operasional Berubah',
      message: `${costItem.name}: ${this.formatCurrency(oldAmount)} → ${this.formatCurrency(newAmount)}. HPP otomatis diperbarui.`,
      actionUrl: '/hpp-simple?tab=operational_costs',
      actionLabel: 'Lihat HPP'
    })
  }

  /**
   * SMART HPP CALCULATION dengan automation
   */
  async calculateSmartHPP(recipeId: string): Promise<RecipeHPP> {
    automationLogger.info({ recipeId }, 'Calculating smart HPP for recipe')

    // Get recipe data from database/API
    const recipeData = await this.getRecipeData(recipeId)

    if (!recipeData) {
      throw new Error(`Recipe not found: ${recipeId}`)
    }

    // Calculate ingredient costs (otomatis ambil harga terbaru)
    const ingredientCosts = await this.calculateIngredientCosts(recipeData.ingredients)

    // Calculate labor costs (berdasarkan waktu prep/cook dan hourly rate)
    const laborCosts = this.calculateLaborCosts(recipeData.prepTime, recipeData.cookTime)

    // Calculate overhead costs (otomatis alokasi dari operational costs)
    const overheadCosts = this.calculateOverheadCosts(recipeData.servings, recipeData.estimatedDuration)

    // Calculate packaging costs
    const packagingCosts = await this.calculatePackagingCosts(recipeData.packaging || [])

    // Build comprehensive HPP
    const recipeHPP: RecipeHPP = {
      id: `hpp_${recipeId}_${Date.now()}`,
      recipeName: recipeData.name,
      recipeId: recipeId,
      servings: recipeData.servings,
      components: {
        ingredients: ingredientCosts.items,
        labor: laborCosts,
        overhead: overheadCosts,
        packaging: packagingCosts.items
      },
      totalDirectCost: ingredientCosts.total + laborCosts.totalLaborCost,
      totalIndirectCost: overheadCosts.totalOverheadCost + packagingCosts.total,
      totalHPP: 0,
      hppPerServing: 0,
      suggestedSellingPrice: [],
      lastCalculated: new Date().toISOString(),
      needsRecalculation: false
    }

    // Calculate totals
    recipeHPP.totalHPP = recipeHPP.totalDirectCost + recipeHPP.totalIndirectCost
    recipeHPP.hppPerServing = recipeHPP.totalHPP / recipeData.servings

    // Generate smart pricing suggestions
    recipeHPP.suggestedSellingPrice = this.generateSmartPricing(recipeHPP.hppPerServing)

    // Cache the result
    this.recipeHPPCache.set(recipeId, recipeHPP)

    automationLogger.info({
      recipeId,
      totalHPP: recipeHPP.totalHPP,
      hppPerServing: recipeHPP.hppPerServing
    }, 'HPP calculated successfully')

    return recipeHPP
  }

  /**
   * REAL-TIME HPP MONITORING
   */
  async monitorHPPChanges() {
    automationLogger.info('Starting HPP monitoring')

    // Check for ingredient price changes (real implementation would use websocket/polling)
    setInterval(async () => {
      await this.checkIngredientPriceChanges()
    }, 300000) // Check every 5 minutes

    // Check for recipes yang perlu recalculation
    setInterval(async () => {
      await this.processStaleHPPCalculations()
    }, 600000) // Check every 10 minutes
  }

  /**
   * AUTO-RECALCULATE ketika ada perubahan
   */
  private async recalculateRecipeHPP(recipeId: string): Promise<HPPRecalculationResult> {
    const oldHPP = this.recipeHPPCache.get(recipeId)
    const newHPP = await this.calculateSmartHPP(recipeId)

    const result: HPPRecalculationResult = {
      recipeId,
      recipeName: newHPP.recipeName,
      oldHPP: oldHPP?.hppPerServing || 0,
      newHPP: newHPP.hppPerServing,
      change: newHPP.hppPerServing - (oldHPP?.hppPerServing || 0),
      changePercentage: oldHPP ? ((newHPP.hppPerServing - oldHPP.hppPerServing) / oldHPP.hppPerServing) * 100 : 0,
      impactLevel: this.getImpactLevel(newHPP.hppPerServing - (oldHPP?.hppPerServing || 0))
    }

    automationLogger.info({
      recipeName: newHPP.recipeName,
      oldHPP: result.oldHPP,
      newHPP: result.newHPP
    }, 'HPP recalculated for recipe')

    return result
  }

  /**
   * BATCH RECALCULATION untuk semua resep
   */
  private async recalculateAllRecipes(reason: string) {
    automationLogger.info({ reason }, 'Recalculating all recipes')

    const allRecipeIds = await this.getAllRecipeIds()
    const results: HPPRecalculationResult[] = []

    for (const recipeId of allRecipeIds) {
      try {
        const result = await this.recalculateRecipeHPP(recipeId)
        results.push(result)
      } catch (error: unknown) {
        automationLogger.error({ err: error, recipeId }, 'Error recalculating recipe')
      }
    }

    // Generate batch update notification
    smartNotificationSystem.addNotification({
      type: 'info',
      category: 'financial',
      priority: 'medium',
      title: 'HPP Batch Update Selesai',
      message: `${results.length} resep telah diperbarui HPP-nya karena ${reason}`,
      actionUrl: '/hpp-simple?tab=batch_results',
      actionLabel: 'Lihat Hasil'
    })

    return results
  }

  // Helper Methods

  private trackPriceHistory(ingredientId: string, newPrice: number) {
    const history = this.ingredientPriceHistory.get(ingredientId) || []
    history.push({
      date: new Date().toISOString(),
      price: newPrice
    })

    // Keep only last 30 entries
    this.ingredientPriceHistory.set(ingredientId, history.slice(-30))
  }

  private async findRecipesUsingIngredient(ingredientId: string): Promise<RecipeBasicInfo[]> {
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`)
      if (!response.ok) return []
      const data = await response.json() as { recipes?: RecipeBasicInfo[] }
      return data.recipes || []
    } catch (error: unknown) {
      automationLogger.error({ err: error, ingredientId }, 'Error fetching recipes for ingredient')
      return []
    }
  }

  private async getRecipeData(recipeId: string): Promise<RecipeData | null> {
    // TODO: Implement real recipe data fetching from database
    throw new Error('Recipe data fetching not implemented yet')
  }

  private async calculateIngredientCosts(ingredients: RecipeIngredient[]) {
    const items: Array<{
      ingredientId: string
      ingredientName: string
      quantity: number
      unit: string
      pricePerUnit: number
      totalCost: number
    }> = []
    let total = 0

    for (const ing of ingredients) {
      // Get latest price from database/cache
      const pricePerUnit = await this.getLatestIngredientPrice(ing.ingredientId)
      const totalCost = (ing.quantity * pricePerUnit) / this.getUnitMultiplier(ing.unit)

      items.push({
        ingredientId: ing.ingredientId,
        ingredientName: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        pricePerUnit,
        totalCost
      })

      total += totalCost
    }

    return { items, total }
  }

  private calculateLaborCosts(prepTime: number, cookTime: number) {
    const hourlyRate = this.getOperationalCostAmount("labor", 50000) // Default Rp 50k/hour
    const totalMinutes = prepTime + cookTime
    const totalHours = totalMinutes / 60
    const totalLaborCost = totalHours * hourlyRate

    return {
      prepTime,
      cookTime,
      hourlyRate,
      totalLaborCost
    }
  }

  private calculateOverheadCosts(servings: number, durationMinutes: number) {
    // Auto-allocate overhead costs
    const electricity = this.allocateOverheadCost("electricity", servings, durationMinutes)
    const gas = this.allocateOverheadCost("gas", servings, durationMinutes)
    const rent = this.allocateOverheadCost("rent", servings, durationMinutes)
    const depreciation = this.allocateOverheadCost("depreciation", servings, durationMinutes)
    const other = this.allocateOverheadCost("other", servings, durationMinutes)

    return {
      electricity,
      gas,
      rent,
      depreciation,
      other,
      totalOverheadCost: electricity + gas + rent + depreciation + other
    }
  }

  private async calculatePackagingCosts(packagingItems: PackagingItem[]) {
    let total = 0
    const items: Array<{
      itemName: string
      quantity: number
      unit: string
      costPerUnit: number
      totalCost: number
    }> = []

    for (const item of packagingItems) {
      const totalCost = item.quantity * item.costPerUnit
      items.push({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        totalCost
      })
      total += totalCost
    }

    return { items, total }
  }

  private generateSmartPricing(hppPerServing: number) {
    return [
      {
        tier: 'economy' as const,
        price: Math.ceil((hppPerServing * 1.3) / 500) * 500, // 30% margin, rounded to 500
        margin: 30
      },
      {
        tier: 'standard' as const,
        price: Math.ceil((hppPerServing * 1.6) / 500) * 500, // 60% margin
        margin: 60
      },
      {
        tier: 'premium' as const,
        price: Math.ceil((hppPerServing * 2.0) / 1000) * 1000, // 100% margin, rounded to 1000
        margin: 100
      }
    ]
  }

  private generatePriceChangeNotifications(ingredientId: string, oldPrice: number, newPrice: number, affectedRecipes: HPPRecalculationResult[]) {
    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100
    const changeDirection = priceChange > 0 ? 'naik' : 'turun'
    const impactLevel = Math.abs(priceChange) > 10 ? 'high' : Math.abs(priceChange) > 5 ? 'medium' : 'low'

    // Main price change notification
    smartNotificationSystem.addNotification({
      type: priceChange > 0 ? 'warning' : 'info',
      category: 'financial',
      priority: impactLevel === 'high' ? 'high' : 'medium',
      title: `Harga Bahan Baku ${changeDirection.toUpperCase()}`,
      message: `Harga bahan ${changeDirection} ${Math.abs(priceChange).toFixed(1)}%. ${affectedRecipes.length} resep terpengaruh, HPP otomatis diperbarui.`,
      actionUrl: '/hpp-simple?tab=price_changes',
      actionLabel: 'Lihat Dampak'
    })

    // Individual recipe impact notifications (for high impact changes)
    if (impactLevel === 'high') {
      affectedRecipes.forEach(recipe => {
        if (Math.abs(recipe.changePercentage) > 5) {
          smartNotificationSystem.addNotification({
            type: 'warning',
            category: 'financial',
            priority: 'medium',
            title: `HPP ${recipe.recipeName} Berubah Signifikan`,
            message: `HPP ${recipe.changePercentage > 0 ? 'naik' : 'turun'} ${Math.abs(recipe.changePercentage).toFixed(1)}% menjadi ${this.formatCurrency(recipe.newHPP)}`,
            actionUrl: `/hpp-simple?recipe=${recipe.recipeId}`,
            actionLabel: 'Review Pricing'
          })
        }
      })
    }
  }

  private async getLatestIngredientPrice(ingredientId: string): Promise<number> {
    // TODO: Implement real price fetching from database
    throw new Error('Ingredient price fetching not implemented yet')
  }

  private getUnitMultiplier(unit: string): number {
    const multipliers: Record<string, number> = {
      'g': 1000, // per kg
      'gram': 1000,
      'ml': 1000, // per liter
      'butir': 1,
      'lembar': 1,
      'kg': 1,
      'liter': 1
    }
    return multipliers[unit] || 1
  }

  private getOperationalCostAmount(key: string, defaultValue: number): number {
    const cost = this.operationalCosts.get(key)
    return cost?.amount || defaultValue
  }

  private allocateOverheadCost(key: string, servings: number, durationMinutes: number): number {
    // Simplified allocation based on duration and servings
    const baseCost = this.getOperationalCostAmount(key, 0)
    const durationFactor = durationMinutes / 60 // convert to hours
    const servingFactor = servings / 10 // normalized per 10 servings

    return baseCost * durationFactor * servingFactor
  }

  private async getAllRecipeIds(): Promise<string[]> {
    try {
      const response = await fetch('/api/recipes')
      if (!response.ok) return []
      const recipes = await response.json() as Array<{ id: string }>
      return recipes.map((r) => r.id)
    } catch (error: unknown) {
      automationLogger.error({ err: error }, 'Error fetching recipe IDs')
      return []
    }
  }

  private getImpactLevel(change: number): 'low' | 'medium' | 'high' {
    const absChange = Math.abs(change)
    if (absChange > 1000) return 'high'
    if (absChange > 500) return 'medium'
    return 'low'
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  private async checkIngredientPriceChanges() {
    // TODO: Check database for price updates
    automationLogger.info('Checking for ingredient price changes')
  }

  private async processStaleHPPCalculations() {
    // Check for HPP calculations yang perlu refresh
    automationLogger.info('Processing stale HPP calculations')
  }

  private loadDefaultOperationalCosts() {
    // Load default operational costs for Indonesian UMKM
    const defaultCosts: OperationalCost[] = [
      {
        id: 'labor_hourly_rate',
        category: 'labor',
        name: 'Upah Kerja per Jam',
        amount: 50000, // Rp 50k/hour
        period: 'hourly',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_electricity',
        category: 'overhead',
        name: 'Listrik',
        amount: 2000, // Rp 2k base cost
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_gas',
        category: 'overhead',
        name: 'Gas',
        amount: 1500,
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_rent',
        category: 'overhead',
        name: 'Sewa Tempat (Alokasi)',
        amount: 500,
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      }
    ]

    defaultCosts.forEach(cost => {
      this.operationalCosts.set(cost.id, cost)
    })
  }

  // Public API methods
  public getRecipeHPP(recipeId: string): RecipeHPP | undefined {
    return this.recipeHPPCache.get(recipeId)
  }

  public getOperationalCosts(): OperationalCost[] {
    return Array.from(this.operationalCosts.values())
  }

  public updateOperationalCost(costId: string, newAmount: number) {
    const cost = this.operationalCosts.get(costId)
    if (cost) {
      const oldAmount = cost.amount
      this.onOperationalCostChange(costId, oldAmount, newAmount)
    }
  }

  /**
   * Monitor ingredient prices untuk testing
   */
  public async monitorIngredientPrices(ingredients: Array<{ id: string; name: string; price_per_unit: number }>) {
    automationLogger.info({ count: ingredients.length }, 'Monitoring ingredient prices')

    const significantChanges: Array<{
      ingredientId: string
      ingredientName: string
      oldPrice: number
      newPrice: number
      changePercent: number
    }> = []

    for (const ingredient of ingredients) {
      const history = this.ingredientPriceHistory.get(ingredient.id) || []

      if (history.length > 0) {
        const lastPrice = history[history.length - 1].price
        const currentPrice = ingredient.price_per_unit
        const changePercent = ((currentPrice - lastPrice) / lastPrice) * 100

        if (Math.abs(changePercent) > 10) {
          significantChanges.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            oldPrice: lastPrice,
            newPrice: currentPrice,
            changePercent
          })
        }
      }

      // Update price history
      this.trackPriceHistory(ingredient.id, ingredient.price_per_unit)
    }

    return {
      monitoredIngredients: ingredients.length,
      significantChanges,
      lastCheck: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const hppAutomation = HPPAutomationSystem.getInstance()

// Helper functions untuk integrasi
export const calculateAutoHPP = async (recipeId: string) => {
  return hppAutomation.calculateSmartHPP(recipeId)
}

export const triggerIngredientPriceUpdate = async (ingredientId: string, oldPrice: number, newPrice: number) => {
  return hppAutomation.onIngredientPriceChange(ingredientId, oldPrice, newPrice)
}

export const updateOperationalCosts = (costId: string, newAmount: number) => {
  return hppAutomation.updateOperationalCost(costId, newAmount)
}

export default hppAutomation