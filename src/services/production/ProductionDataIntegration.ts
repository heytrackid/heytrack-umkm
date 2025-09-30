/**
 * ProductionDataIntegration
 * Integrates real-time order data and inventory levels with production planning
 * Handles order-to-batch conversion and resource availability checks
 */

import { supabase } from '@/lib/supabase'
import { 
  ProductionBatch, 
  batchSchedulingService,
  SchedulingResult 
} from './BatchSchedulingService'

// Core interfaces for integration
export interface OrderData {
  id: string
  customer_name: string
  items: OrderItem[]
  delivery_date: string
  priority: number
  status: 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled'
  special_instructions?: string
  created_at: string
}

export interface OrderItem {
  id: string
  recipe_id: string
  recipe_name: string
  quantity: number
  unit_price: number
  customizations?: Record<string, any>
}

export interface InventoryLevel {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  unit: string
  minimum_stock: number
  cost_per_unit: number
  supplier_id?: string
  last_updated: string
}

export interface RecipeRequirement {
  recipe_id: string
  recipe_name: string
  ingredients: {
    ingredient_id: string
    ingredient_name: string
    quantity_needed: number
    unit: string
  }[]
  estimated_production_time: number // minutes
  equipment_requirements: {
    oven_slots: number
    mixing_time: number
    decorating_time?: number
  }
  skill_level: 'basic' | 'intermediate' | 'advanced'
  profit_margin: number
}

export interface ProductionDemand {
  orders: OrderData[]
  totalBatches: number
  urgentOrders: OrderData[]
  resourceConstraints: {
    ingredient_shortfalls: { ingredient_name: string; shortage: number }[]
    capacity_warnings: string[]
  }
  forecastedDemand: {
    next_24h: number
    next_week: number
    seasonal_trends: any[]
  }
}

export class ProductionDataIntegration {
  /**
   * Fetch and analyze current production demand from orders
   */
  async getCurrentProductionDemand(days_ahead = 7): Promise<ProductionDemand> {
    try {
      // Get pending and confirmed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            recipe:recipes (
              id, name, estimated_production_time,
              recipe_ingredients (
                ingredient:ingredients (name),
                quantity
              )
            )
          )
        `)
        .in('status', ['pending', 'confirmed'])
        .gte('delivery_date', new Date().toISOString())
        .lte('delivery_date', new Date(Date.now() + days_ahead * 24 * 60 * 60 * 1000).toISOString())
        .order('delivery_date', { ascending: true })

      if (ordersError) throw ordersError

      // Process orders into standardized format
      const processedOrders: OrderData[] = (orders || []).map(order => ({
        id: order.id,
        customer_name: order.customer_name || 'Unknown',
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          recipe_id: item.recipe_id,
          recipe_name: item.recipe?.name || 'Unknown Recipe',
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          customizations: item.customizations
        })),
        delivery_date: order.delivery_date,
        priority: order.priority || 5,
        status: order.status,
        special_instructions: order.special_instructions,
        created_at: order.created_at
      }))

      // Calculate total batches needed
      const totalBatches = processedOrders.reduce((sum, order) => 
        sum + order.items.length, 0
      )

      // Identify urgent orders (within 24 hours)
      const urgentOrders = processedOrders.filter(order => {
        const deliveryTime = new Date(order.delivery_date).getTime()
        const now = Date.now()
        return (deliveryTime - now) < (24 * 60 * 60 * 1000)
      })

      // Check inventory constraints
      const resourceConstraints = await this.checkResourceConstraints(processedOrders)

      // Calculate forecasted demand
      const forecastedDemand = await this.calculateDemandForecas""

      return {
        orders: processedOrders,
        totalBatches,
        urgentOrders,
        resourceConstraints,
        forecastedDemand
      }
    } catch (error) {
      console.error('Error fetching production demand:', error)
      throw error
    }
  }

  /**
   * Convert orders to production batches for scheduling
   */
  async convertOrdersToBatches(orders: OrderData[]): Promise<Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'>[]> {
    const batches: Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'>[] = []

    for (const order of orders) {
      for (const item of order.items) {
        // Get recipe details
        const recipeData = await this.getRecipeRequirements(item.recipe_id)
        if (!recipeData) continue

        // Calculate batch timing
        const deliveryDate = new Date(order.delivery_date)
        const productionBuffer = 2 * 60 * 60 * 1000 // 2 hours before delivery
        const deadline = new Date(deliveryDate.getTime() - productionBuffer)
        
        // Calculate earliest start (considering ingredients availability)
        const earliestStart = await this.calculateEarliestStar""

        // Calculate priority score
        const urgencyScore = this.calculateUrgencyScore(order.delivery_date)
        const profitScore = Math.min(100, recipeData.profit_margin * 2) // Scale to 0-100

        const batch: Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'> = {
          id: `batch_${order.id}_${item.id}`,
          recipe_id: item.recipe_id,
          recipe_name: item.recipe_name,
          quantity: item.quantity,
          priority: Math.max(1, Math.min(10, Math.ceil(urgencyScore / 10))),
          
          earliest_start: earliestStart.toISOString(),
          deadline: deadline.toISOString(),
          estimated_duration: recipeData.estimated_production_time,
          
          oven_slots_required: recipeData.equipment_requirements.oven_slots,
          baker_hours_required: Math.ceil(recipeData.estimated_production_time / 60),
          decorator_hours_required: recipeData.equipment_requirements.decorating_time ? 
            Math.ceil(recipeData.equipment_requirements.decorating_time / 60) : 0,
          
          prerequisite_batches: [],
          blocking_ingredients: await this.getBlockingIngredients(item.recipe_id, item.quantity),
          
          status: 'scheduled',
          profit_score: profitScore,
          urgency_score: urgencyScore,
          efficiency_score: 0, // Will be calculated by scheduling service
          total_score: 0 // Will be calculated by scheduling service
        }

        batches.push(batch)
      }
    }

    return batches
  }

  /**
   * Generate optimized production schedule from current orders
   */
  async generateProductionSchedule(days_ahead = 3): Promise<SchedulingResult> {
    try {
      // Get current demand
      const demand = await this.getCurrentProductionDemand(days_ahead)
      
      // Convert orders to batches
      const batches = await this.convertOrdersToBatches(demand.orders)
      
      // Get current production capacity
      const constraints = await batchSchedulingService.getProductionCapacity()
      
      // Generate schedule
      const schedule = await batchSchedulingService.scheduleProductionBatches(batches, constraints)
      
      // Add order context to warnings
      if (demand.urgentOrders.length > 0) {
        schedule.warnings.unshift(
          `${demand.urgentOrders.length} orders need delivery within 24 hours`
        )
      }

      if (demand.resourceConstraints.ingredient_shortfalls.length > 0) {
        schedule.warnings.push(
          `Ingredient shortfalls: ${demand.resourceConstraints.ingredient_shortfalls
            .map(s => `${s.ingredient_name} (${s.shortage} units short)`)
            .join(', ')}`
        )
      }

      return schedule
    } catch (error) {
      console.error('Error generating production schedule:', error)
      throw error
    }
  }

  /**
   * Update production progress and sync with orders
   */
  async updateProductionProgress(batchId: string, status: ProductionBatch['status']): Promise<void> {
    try {
      // Extract order and item IDs from batch ID
      const [, orderId, itemId] = batchId.spli"Placeholder"

      // Update order item status
      if (status === 'completed') {
        await supabase
          .from('order_items')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', itemId)

        // Check if all order items are completed
        const { data: orderItems } = await supabase
          .from('order_items')
          .selec"Placeholder"
          .eq('order_id', orderId)

        const allCompleted = orderItems?.every(item => item.status === 'completed')
        
        if (allCompleted) {
          await supabase
            .from('orders')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', orderId)
        }
      } else if (status === 'in_progress') {
        await supabase
          .from('order_items')
          .update({ 
            status: 'in_production',
            production_started_at: new Date().toISOString()
          })
          .eq('id', itemId)

        await supabase
          .from('orders')
          .update({ status: 'in_production' })
          .eq('id', orderId)
      }
    } catch (error) {
      console.error('Error updating production progress:', error)
      throw error
    }
  }

  /**
   * Private helper methods
   */
  private async getRecipeRequirements(recipeId: string): Promise<RecipeRequirement | null> {
    try {
      const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
          id, name, estimated_production_time, profit_margin,
          recipe_ingredients (
            quantity,
            ingredient:ingredients (id, name, unit)
          )
        `)
        .eq('id', recipeId)
        .single()

      if (error || !recipe) return null

      return {
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        ingredients: (recipe.recipe_ingredients || []).map((ri: any) => ({
          ingredient_id: ri.ingredient.id,
          ingredient_name: ri.ingredient.name,
          quantity_needed: ri.quantity,
          unit: ri.ingredient.unit
        })),
        estimated_production_time: recipe.estimated_production_time || 60,
        equipment_requirements: {
          oven_slots: 1, // Default - could be recipe-specific
          mixing_time: 30, // Default
          decorating_time: recipe.name.toLowerCase().includes('cake') ? 45 : undefined
        },
        skill_level: 'intermediate',
        profit_margin: recipe.profit_margin || 30
      }
    } catch (error) {
      console.error('Error getting recipe requirements:', error)
      return null
    }
  }

  private async calculateEarliestStar"": Promise<Date> {
    // Check ingredient availability and lead times
    const now = new Date()
    
    // For now, assume ingredients are available immediately
    // In a full implementation, this would check:
    // 1. Current inventory levels
    // 2. Supplier lead times
    // 3. Existing production commitments
    
    return now
  }

  private calculateUrgencyScore(deliveryDate: string): number {
    const now = Date.now()
    const delivery = new Date(deliveryDate).getTime()
    const hoursUntilDelivery = (delivery - now) / (1000 * 60 * 60)
    
    // Higher score for more urgent orders
    if (hoursUntilDelivery < 6) return 100
    if (hoursUntilDelivery < 24) return 80
    if (hoursUntilDelivery < 48) return 60
    if (hoursUntilDelivery < 72) return 40
    return 20
  }

  private async getBlockingIngredients(recipeId: string, quantity: number): Promise<string[]> {
    try {
      // Get current inventory levels
      const { data: inventory } = await supabase
        .from('inventory')
        .selec"Placeholder"

      // Get recipe ingredient requirements
      const { data: recipeIngredients } = await supabase
        .from('recipe_ingredients')
        .selec"Placeholder"
        .eq('recipe_id', recipeId)

      const blocking: string[] = []
      
      for (const ingredient of recipeIngredients || []) {
        const inventoryItem = inventory?.find(inv => inv.ingredient_id === ingredient.ingredient_id)
        const requiredQuantity = ingredient.quantity * quantity
        
        if (!inventoryItem || inventoryItem.current_stock < requiredQuantity) {
          blocking.push(ingredient.ingredient_id)
        }
      }

      return blocking
    } catch (error) {
      console.error('Error checking blocking ingredients:', error)
      return []
    }
  }

  private async checkResourceConstraints(orders: OrderData[]): Promise<{
    ingredient_shortfalls: { ingredient_name: string; shortage: number }[]
    capacity_warnings: string[]
  }> {
    const ingredient_shortfalls: { ingredient_name: string; shortage: number }[] = []
    const capacity_warnings: string[] = []

    try {
      // Calculate total ingredient requirements
      const ingredientRequirements = new Map<string, { name: string; required: number }>()

      for (const order of orders) {
        for (const item of order.items) {
          const { data: recipeIngredients } = await supabase
            .from('recipe_ingredients')
            .select(`
              quantity,
              ingredient:ingredients (id, name)
            `)
            .eq('recipe_id', item.recipe_id)

          for (const ri of recipeIngredients || []) {
            const key = ri.ingredient.id
            const existing = ingredientRequirements.get(key) || { name: ri.ingredient.name, required: 0 }
            existing.required += ri.quantity * item.quantity
            ingredientRequirements.set(key: string, data: any, ttl: number = 300000): void {
          }
        }
      }

      // Check against current inventory
      const { data: inventory } = await supabase
        .from('inventory')
        .selec"Placeholder"

      for (const [ingredientId, requirement] of ingredientRequirements) {
        const inventoryItem = inventory?.find(inv => inv.ingredient_id === ingredientId)
        
        if (!inventoryItem || inventoryItem.current_stock < requirement.required) {
          const shortage = requirement.required - (inventoryItem?.current_stock || 0)
          ingredient_shortfalls.push({
            ingredient_name: requirement.name,
            shortage
          })
        }
      }

      // Check capacity constraints
      const totalBatches = orders.reduce((sum, order) => sum + order.items.length, 0)
      const urgentBatches = orders
        .filter(order => new Date(order.delivery_date).getTime() - Date.now() < 24 * 60 * 60 * 1000)
        .reduce((sum, order) => sum + order.items.length, 0)

      if (urgentBatches > 10) {
        capacity_warnings.push(`High volume of urgent orders: ${urgentBatches} batches needed within 24 hours`)
      }

      if (totalBatches > 50) {
        capacity_warnings.push(`Very high production volume: ${totalBatches} total batches scheduled`)
      }

    } catch (error) {
      console.error('Error checking resource constraints:', error)
    }

    return { ingredient_shortfalls, capacity_warnings }
  }

  private async calculateDemandForecas"" {
    const now = Date.now()
    const next24h = orders
      .filter(order => new Date(order.delivery_date).getTime() - now < 24 * 60 * 60 * 1000)
      .reduce((sum, order) => sum + order.items.length, 0)

    const nextWeek = orders
      .filter(order => new Date(order.delivery_date).getTime() - now < 7 * 24 * 60 * 60 * 1000)
      .reduce((sum, order) => sum + order.items.length, 0)

    return {
      next_24h: next24h,
      next_week: nextWeek,
      seasonal_trends: [] // Would implement seasonal analysis
    }
  }
}

export const productionDataIntegration = new ProductionDataIntegration()
export default ProductionDataIntegration