import { supabase } from '@/lib/supabase'
import { HPPCalculationService } from '@/modules/recipes'
import { ORDER_CONFIG } from '../constants'

export interface RecipeOption {
  id: string
  name: string
  category: string
  servings: number
  description?: string
  price: number
  hpp_cost: number
  margin: number
  is_available: boolean
  estimated_prep_time: number
}

export interface OrderItemCalculation {
  recipe_id: string
  recipe_name: string
  quantity: number
  unit_price: number
  total_price: number
  hpp_cost: number
  total_cost: number
  profit: number
  margin_percentage: number
}

export interface OrderPricing {
  items: OrderItemCalculation[]
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  total_amount: number
  total_hpp_cost: number
  total_profit: number
  overall_margin: number
}

export class OrderRecipeService {
  /**
   * Get available recipes for order selection
   */
  static async getAvailableRecipes(): Promise<RecipeOption[]> {
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          category,
          servings,
          description,
          price,
          margin,
          prep_time,
          cook_time,
          is_active,
          recipe_ingredients!inner (
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              current_stock,
              reorder_point,
              unit_cost,
              is_active
            )
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      if (!recipes) return []

      // Process recipes and check availability
      const recipeOptions: RecipeOption[] = await Promise.all(
        recipes.map(async (recipe) => {
          // Calculate HPP and check ingredient availability
          const hppCalculation = await HPPCalculationService.calculateAdvancedHPP(
            recipe.id,
            {
              overheadRate: 0.15,
              laborCostPerHour: 25000,
              targetMargin: 0.6
            }
          )

          // Check ingredient availability
          const isAvailable = this.checkIngredientAvailability(recipe.recipe_ingredients)

          return {
            id: recipe.id,
            name: recipe.name,
            category: recipe.category,
            servings: recipe.servings,
            description: recipe.description,
            price: recipe.price || hppCalculation.suggestedPricing.standard.price,
            hpp_cost: hppCalculation.costPerServing,
            margin: recipe.margin || hppCalculation.suggestedPricing.standard.margin,
            is_available: isAvailable,
            estimated_prep_time: (recipe.prep_time || 0) + (recipe.cook_time || 0)
          }
        })
      )

      return recipeOptions
    } catch (error) {
      console.error('Error fetching available recipes:', error)
      throw new Error('Failed to fetch available recipes')
    }
  }

  /**
   * Check if ingredients are available for production
   */
  private static checkIngredientAvailability(recipeIngredients: any[]): boolean {
    return recipeIngredients.every(ri => {
      if (!ri.ingredient || !ri.ingredient.is_active) return false
      
      // Check if current stock is above reorder point
      const currentStock = ri.ingredient.current_stock || 0
      const reorderPoint = ri.ingredient.reorder_point || 0
      const requiredQuantity = ri.quantity || 0
      
      return currentStock >= Math.max(reorderPoint, requiredQuantity)
    })
  }

  /**
   * Calculate pricing for order items
   */
  static async calculateOrderPricing(
    items: Array<{
      recipe_id: string
      quantity: number
      custom_price?: number
    }>,
    options: {
      tax_rate?: number
      discount_amount?: number
      discount_percentage?: number
    } = {}
  ): Promise<OrderPricing> {
    try {
      const {
        tax_rate = ORDER_CONFIG.DEFAULT_TAX_RATE,
        discount_amount = 0,
        discount_percentage = 0
      } = options

      // Get recipe details for pricing
      const recipeIds = items.map(item => item.recipe_id)
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          price,
          servings,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              unit_cost,
              unit_type
            )
          )
        `)
        .in('id', recipeIds)

      if (error) throw error
      if (!recipes) throw new Error('Recipes not found')

      // Calculate each item
      const calculatedItems: OrderItemCalculation[] = await Promise.all(
        items.map(async (item) => {
          const recipe = recipes.find(r => r.id === item.recipe_id)
          if (!recipe) {
            throw new Error(`Recipe with ID ${item.recipe_id} not found`)
          }

          // Calculate HPP cost
          const hppCalculation = await HPPCalculationService.calculateAdvancedHPP(
            recipe.id,
            {
              overheadRate: 0.15,
              laborCostPerHour: 25000,
              targetMargin: 0.6
            }
          )

          const unit_price = item.custom_price || recipe.price || hppCalculation.suggestedPricing.standard.price
          const total_price = unit_price * item.quantity
          const hpp_cost = hppCalculation.costPerServing
          const total_cost = hpp_cost * item.quantity
          const profit = total_price - total_cost
          const margin_percentage = total_price > 0 ? (profit / total_price) * 100 : 0

          return {
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            quantity: item.quantity,
            unit_price,
            total_price,
            hpp_cost,
            total_cost,
            profit,
            margin_percentage
          }
        })
      )

      // Calculate totals
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total_price, 0)
      
      // Apply discount
      let final_subtotal = subtotal
      if (discount_percentage > 0) {
        final_subtotal = subtotal * (1 - discount_percentage / 100)
      } else if (discount_amount > 0) {
        final_subtotal = Math.max(0, subtotal - discount_amount)
      }

      const tax_amount = final_subtotal * tax_rate
      const total_amount = final_subtotal + tax_amount
      
      const total_hpp_cost = calculatedItems.reduce((sum, item) => sum + item.total_cost, 0)
      const total_profit = final_subtotal - total_hpp_cost
      const overall_margin = final_subtotal > 0 ? (total_profit / final_subtotal) * 100 : 0

      return {
        items: calculatedItems,
        subtotal,
        tax_amount,
        tax_rate,
        discount_amount: discount_percentage > 0 
          ? subtotal * (discount_percentage / 100) 
          : discount_amount,
        total_amount,
        total_hpp_cost,
        total_profit,
        overall_margin
      }
    } catch (error) {
      console.error('Error calculating order pricing:', error)
      throw new Error('Failed to calculate order pricing')
    }
  }

  /**
   * Validate order items against inventory
   */
  static async validateOrderAgainstInventory(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    isValid: boolean
    warnings: string[]
    errors: string[]
  }> {
    const warnings: string[] = []
    const errors: string[] = []

    try {
      for (const item of items) {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            id,
            name,
            recipe_ingredients (
              quantity,
              unit,
              ingredient:ingredients (
                id,
                name,
                current_stock,
                reorder_point,
                unit_type,
                is_active
              )
            )
          `)
          .eq('id', item.recipe_id)
          .single()

        if (error || !recipe) {
          errors.push(`Recipe dengan ID ${item.recipe_id} tidak ditemukan`)
          continue
        }

        // Check each ingredient
        for (const ri of recipe.recipe_ingredients || []) {
          if (!ri.ingredient || !ri.ingredient.is_active) {
            errors.push(`Ingredient ${ri.ingredient?.name || 'unknown'} untuk ${recipe.name} tidak tersedia`)
            continue
          }

          const requiredQuantity = ri.quantity * item.quantity
          const currentStock = ri.ingredient.current_stock || 0
          const reorderPoint = ri.ingredient.reorder_point || 0

          if (currentStock < requiredQuantity) {
            errors.push(
              `Stock ${ri.ingredient.name} tidak cukup. Dibutuhkan: ${requiredQuantity}, Tersedia: ${currentStock}`
            )
          } else if (currentStock - requiredQuantity < reorderPoint) {
            warnings.push(
              `Stock ${ri.ingredient.name} akan di bawah reorder point setelah produksi`
            )
          }
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors
      }
    } catch (error) {
      console.error('Error validating order against inventory:', error)
      return {
        isValid: false,
        warnings,
        errors: ['Gagal memvalidasi inventory']
      }
    }
  }

  /**
   * Get recipe recommendations based on order history
   */
  static async getRecipeRecommendations(
    customer_name?: string,
    limit: number = 5
  ): Promise<RecipeOption[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          order_items (
            recipe_id,
            quantity,
            recipe:recipes (
              id,
              name,
              category,
              price
            )
          )
        `)

      if (customer_name) {
        query = query.eq('customer_name', customer_name)
      }

      query = query
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50) // Get recent orders

      const { data: orders, error } = await query

      if (error) throw error
      if (!orders) return []

      // Analyze order patterns
      const recipeFrequency = new Map<string, { count: number; recipe: any }>()

      orders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.recipe) {
            const existing = recipeFrequency.get(item.recipe.id)
            if (existing) {
              existing.count += item.quantity
            } else {
              recipeFrequency.set(item.recipe.id, {
                count: item.quantity,
                recipe: item.recipe
              })
            }
          }
        })
      })

      // Sort by frequency and convert to RecipeOption format
      const recommendations = Array.from(recipeFrequency.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([recipeId, data]) => ({
          id: data.recipe.id,
          name: data.recipe.name,
          category: data.recipe.category,
          servings: 1, // Default
          price: data.recipe.price || 0,
          hpp_cost: 0, // Would need to calculate
          margin: 0, // Would need to calculate
          is_available: true, // Would need to check
          estimated_prep_time: 0 // Would need to calculate
        }))

      return recommendations
    } catch (error) {
      console.error('Error getting recipe recommendations:', error)
      return []
    }
  }

  /**
   * Calculate production time estimate for order
   */
  static async calculateProductionTime(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    total_prep_time: number
    total_cook_time: number
    estimated_completion: string
    parallel_processing_time: number
  }> {
    try {
      const recipeIds = items.map(item => item.recipe_id)
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, prep_time, cook_time, difficulty')
        .in('id', recipeIds)

      if (error) throw error

      let total_prep_time = 0
      let total_cook_time = 0
      let max_single_recipe_time = 0

      items.forEach(item => {
        const recipe = recipes?.find(r => r.id === item.recipe_id)
        if (recipe) {
          const prep_time = (recipe.prep_time || 0) * item.quantity
          const cook_time = (recipe.cook_time || 0) * item.quantity
          
          total_prep_time += prep_time
          total_cook_time += cook_time
          
          // Track longest single recipe for parallel processing estimate
          const single_recipe_time = prep_time + cook_time
          max_single_recipe_time = Math.max(max_single_recipe_time, single_recipe_time)
        }
      })

      // Estimate parallel processing (assuming some overlap)
      const parallel_processing_time = Math.max(
        max_single_recipe_time,
        (total_prep_time + total_cook_time) * 0.7 // 30% time saving from parallel work
      )

      const estimated_completion = new Date(
        Date.now() + parallel_processing_time * 60 * 1000
      ).toISOString()

      return {
        total_prep_time,
        total_cook_time,
        estimated_completion,
        parallel_processing_time
      }
    } catch (error) {
      console.error('Error calculating production time:', error)
      return {
        total_prep_time: 0,
        total_cook_time: 0,
        estimated_completion: new Date().toISOString(),
        parallel_processing_time: 0
      }
    }
  }

  /**
   * Update ingredient inventory after order confirmation
   */
  static async updateInventoryForOrder(
    order_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
      // This would be called when order status changes to 'in_production'
      for (const item of items) {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            recipe_ingredients (
              quantity,
              ingredient:ingredients (
                id,
                current_stock
              )
            )
          `)
          .eq('id', item.recipe_id)
          .single()

        if (error || !recipe) continue

        // Update ingredient stock
        for (const ri of recipe.recipe_ingredients || []) {
          if (ri.ingredient) {
            const usedQuantity = ri.quantity * item.quantity
            const newStock = Math.max(0, (ri.ingredient.current_stock || 0) - usedQuantity)

            await supabase
              .from('ingredients')
              .update({ 
                current_stock: newStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', ri.ingredient.id)

            // Create stock transaction record
            await supabase
              .from('stock_transactions')
              .insert({
                ingredient_id: ri.ingredient.id,
                transaction_type: 'out',
                quantity: usedQuantity,
                reference_type: 'order',
                reference_id: order_id,
                notes: `Used for order production`,
                created_at: new Date().toISOString()
              })
          }
        }
      }
    } catch (error) {
      console.error('Error updating inventory for order:', error)
      throw new Error('Failed to update inventory')
    }
  }
}