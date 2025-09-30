import { supabase } from '@/lib/supabase'
import { inventoryCache, CACHE_PATTERNS } from '@/lib/api-cache'
import { 
  Ingredient, 
  StockTransaction, 
  InsertIngredient, 
  UpdateIngredient,
  InventoryStats,
  InventorySearchParams
} from '../types'
import { 
  calculateStockValue, 
  getStockAlerts, 
  calculateUsageRate,
  getAlertLevel,
  calculateDaysUntilReorder
} from '../utils'

export class InventoryService {
  /**
   * Get all ingredients dengan pagination dan filtering (dengan caching)
   */
  static async getIngredients(params?: InventorySearchParams) {
    return await inventoryCache.cachedFetch(
      'ingredients',
      async () => {
        let query = supabase.from('ingredients').select('*')
    
    // Apply filters
    if (params?.filters.category) {
      query = query.eq('category', params.filters.category)
    }
    
    if (params?.filters.supplier) {
      query = query.eq('supplier', params.filters.supplier)
    }
    
    if (params?.filters.stockLevel) {
      switch (params.filters.stockLevel) {
        case 'low':
          // Stock kurang dari min_stock
          query = query.filter('current_stock', 'lt', 'min_stock')
          break
        case 'out':
          query = query.eq('current_stock', 0)
          break
        case 'normal':
          query = query.filter('current_stock', 'gte', 'min_stock')
          break
      }
    }
    
    // Apply search
    if (params?.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      const direction = params.sortOrder === 'desc' ? false : true
      query = query.order(params.sortBy, { ascending: direction })
    } else {
      query = query.order('name', { ascending: true })
    }
    
    // Apply pagination
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit
      const to = from + params.limit - 1
      query = query.range(from, to)
    }
    
        const { data, error, count } = await query
        
        if (error) throw error
        
        return { data: data || [], count: count || 0 }
      },
      params, // Use params as cache key
      { ttl: 10 * 60 * 1000 } // 10 minutes cache
    )
  }
  
  /**
   * Get single ingredient by ID (with caching)
   */
  static async getIngredient(id: string): Promise<Ingredient | null> {
    return await inventoryCache.cachedFetch(
      `ingredient/${id}`,
      async () => {
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      },
      undefined,
      { ttl: 15 * 60 * 1000 } // 15 minutes cache for individual items
    )
  }
  
  /**
   * Create new ingredient (invalidate cache)
   */
  static async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredient)
      .select('*')
      .single()
    
    if (error) throw error
    
    // Invalidate related caches
    inventoryCache.invalidate(CACHE_PATTERNS.INVENTORY)
    
    return data as Ingredient
  }
  
  /**
   * Update ingredient (invalidate cache)
   */
  static async updateIngredient(id: string, updates: Partial<UpdateIngredient>): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error
    
    // Invalidate specific ingredient cache and general inventory cache
    inventoryCache.invalidate(`ingredient/${id}`)
    inventoryCache.invalidate(CACHE_PATTERNS.INVENTORY)
    
    return data as Ingredient
  }
  
  /**
   * Delete ingredient
   */
  static async deleteIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
  
  /**
   * Get stock transactions dengan filtering
   */
  static async getStockTransactions(ingredientId?: string, limit?: number) {
    let query = supabase
      .from('stock_transactions')
      .select(`
        *,
        ingredients:ingredient_id (
          name,
          unit,
          category
        )
      `)
      .order('created_at', { ascending: false })
    
    if (ingredientId) {
      query = query.eq('ingredient_id', ingredientId)
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }
  
  /**
   * Create stock transaction
   */
  static async createStockTransaction(transaction: Omit<StockTransaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('stock_transactions')
      .insert(transaction)
      .select('*')
      .single()
    
    if (error) throw error
    
    // Update ingredient stock
    await this.updateIngredientStock(transaction.ingredient_id, transaction.quantity, transaction.type)
    
    return data
  }
  
  /**
   * Update ingredient stock berdasarkan transaction
   */
  private static async updateIngredientStock(
    ingredientId: string, 
    quantity: number, 
    type: string
  ) {
    // Get current ingredient
    const ingredient = await this.getIngredient(ingredientId)
    if (!ingredient) throw new Error('Ingredient not found')
    
    // Calculate new stock berdasarkan transaction type
    let newStock = ingredient.current_stock
    
    switch (type) {
      case 'PURCHASE':
        newStock += quantity
        break
      case 'USAGE':
      case 'WASTE':
      case 'EXPIRED':
        newStock -= Math.abs(quantity)
        break
      case 'ADJUSTMENT':
        newStock = quantity // Adjustment set absolute value
        break
      default:
        throw new Error(`Unknown transaction type: ${type}`)
    }
    
    // Ensure stock tidak negatif
    newStock = Math.max(0, newStock)
    
    // Update ingredient stock
    await this.updateIngredient(ingredientId, { 
      current_stock: newStock,
      updated_at: new Date().toISOString()
    })
  }
  
  /**
   * Get inventory statistics
   */
  static async getInventoryStats(): Promise<InventoryStats> {
    // Get all ingredients
    const { data: ingredients } = await this.getIngredients()
    
    // Get recent transactions for usage calculation
    const transactions = await this.getStockTransactions(undefined, 1000)
    
    // Calculate stats
    const totalIngredients = ingredients.length
    const totalValue = ingredients.reduce((sum, ing) => sum + calculateStockValue(ing), 0)
    const lowStockCount = ingredients.filter(ing => ing.current_stock <= ing.min_stock).length
    const outOfStockCount = ingredients.filter(ing => ing.current_stock <= 0).length
    
    // Calculate monthly usage
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyUsage = transactions
      .filter(t => t.type === 'USAGE' && new Date(t.created_at) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + (t.unit_price || 0) * Math.abs(t.quantity), 0)
    
    const averagePrice = ingredients.reduce((sum, ing) => sum + ing.price_per_unit, 0) / totalIngredients || 0
    
    // Top used ingredients
    const ingredientUsage = ingredients.map(ingredient => {
      const usageTransactions = transactions.filter(t => 
        t.ingredient_id === ingredient.id && t.type === 'USAGE'
      )
      
      return {
        ingredient,
        usageCount: usageTransactions.length,
        totalValue: usageTransactions.reduce((sum, t) => sum + (t.unit_price || 0) * Math.abs(t.quantity), 0),
        lastUsed: usageTransactions[0]?.created_at || ''
      }
    }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10)
    
    return {
      totalIngredients,
      totalValue,
      lowStockCount,
      outOfStockCount,
      monthlyUsage,
      averagePrice,
      topUsedIngredients: ingredientUsage
    }
  }
  
  /**
   * Get ingredients dengan extended stats
   */
  static async getIngredientsWithStats() {
    const { data: ingredients } = await this.getIngredients()
    const transactions = await this.getStockTransactions()
    
    return ingredients.map(ingredient => {
      const usageRate = calculateUsageRate(ingredient, transactions)
      const alertLevel = getAlertLevel(ingredient)
      const daysUntilReorder = calculateDaysUntilReorder(ingredient, usageRate)
      
      // Find last transaction for this ingredient
      const lastTransaction = transactions.find(t => t.ingredient_id === ingredient.id)
      
      return {
        ...ingredient,
        totalValue: calculateStockValue(ingredient),
        usageRate,
        alertLevel,
        daysUntilReorder,
        lastTransactionDate: lastTransaction?.created_at
      }
    })
  }
  
  /**
   * Get stock alerts untuk dashboard
   */
  static async getStockAlerts() {
    const { data: ingredients } = await this.getIngredients()
    return getStockAlerts(ingredients)
  }
  
  /**
   * Bulk update ingredient stocks (untuk inventory audit)
   */
  static async bulkUpdateStocks(updates: Array<{ id: string; newStock: number; reason?: string }>) {
    const results = []
    
    for (const update of updates) {
      try {
        // Create adjustment transaction
        await this.createStockTransaction({
          ingredient_id: update.id,
          type: 'ADJUSTMENT',
          quantity: update.newStock,
          unit_price: 0,
          reference: 'BULK_AUDIT',
          notes: update.reason || 'Bulk stock adjustment'
        })
        
        results.push({ id: update.id, success: true })
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message })
      }
    }
    
    return results
  }
}