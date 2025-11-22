import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import 'server-only'

type CustomerPreferences = {
  recipes: Array<{
    recipe_id: string
    recipe_name: string
    order_count: number
    last_ordered: string
    average_quantity: number
  }>
  ingredients: Array<{
    ingredient_id: string
    ingredient_name: string
    usage_frequency: number
  }>
  categories: Array<{
    category: string
    preference_score: number
  }>
}

/**
 * Customer Preferences Service
 * Tracks customer ordering patterns for demand forecasting and personalization
 */
export class CustomerPreferencesService {
  /**
   * Update customer preferences based on a new order
   */
  static async updateCustomerPreferences(
    customerId: string,
    orderItems: Array<{ recipe_id: string; quantity: number }>,
    userId: string
  ): Promise<void> {
    try {
      const client = await createClient()
      const supabase = client

      // Get current customer preferences
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('favorite_items')
        .eq('id', customerId)
        .eq('user_id', userId)
        .single()

      if (customerError) {
        dbLogger.error({ customerId, error: customerError }, 'Failed to fetch customer preferences')
        return
      }

      const preferences: CustomerPreferences = customer.favorite_items as CustomerPreferences || {
        recipes: [],
        ingredients: [],
        categories: []
      }

      // Get recipe details for the order items
      const recipeIds = orderItems.map(item => item.recipe_id)
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          category,
          recipe_ingredients (
            ingredient:ingredients (
              id,
              name
            )
          )
        `)
        .in('id', recipeIds)
        .eq('user_id', userId)

      if (recipesError) {
        dbLogger.error({ error: recipesError }, 'Failed to fetch recipe details for preferences update')
        return
      }

      const recipeMap = new Map(recipes?.map(r => [r.id, r]) || [])

      // Update recipe preferences
      for (const orderItem of orderItems) {
        const recipe = recipeMap.get(orderItem.recipe_id)
        if (!recipe) continue

        const existingRecipe = preferences.recipes.find(r => r.recipe_id === orderItem.recipe_id)
        if (existingRecipe) {
          // Update existing preference
          existingRecipe.order_count += 1
          existingRecipe.last_ordered = new Date().toISOString()
          existingRecipe.average_quantity = Math.round(
            (existingRecipe.average_quantity * (existingRecipe.order_count - 1) + orderItem.quantity) / existingRecipe.order_count
          )
        } else {
          // Add new preference
          preferences.recipes.push({
            recipe_id: orderItem.recipe_id,
            recipe_name: recipe.name,
            order_count: 1,
            last_ordered: new Date().toISOString(),
            average_quantity: orderItem.quantity
          })
        }

        // Update category preferences
        const category = recipe.category || 'Uncategorized'
        const existingCategory = preferences.categories.find(c => c.category === category)
        if (existingCategory) {
          existingCategory.preference_score += 1
        } else {
          preferences.categories.push({
            category,
            preference_score: 1
          })
        }

        // Update ingredient preferences
        const recipeIngredients = (recipe as { recipe_ingredients?: unknown[] }).recipe_ingredients || []
        for (const ri of recipeIngredients) {
          const riTyped = ri as { ingredient?: { id: string; name?: string } }
          if (!riTyped.ingredient) continue

          const existingIngredient = preferences.ingredients.find(i => i.ingredient_id === riTyped.ingredient!.id)
          if (existingIngredient) {
            existingIngredient.usage_frequency += orderItem.quantity
          } else {
            preferences.ingredients.push({
              ingredient_id: riTyped.ingredient!.id,
              ingredient_name: riTyped.ingredient!.name || 'Unknown',
              usage_frequency: orderItem.quantity
            })
          }
        }
      }

      // Sort preferences by frequency/score
      preferences.recipes.sort((a, b) => b.order_count - a.order_count)
      preferences.ingredients.sort((a, b) => b.usage_frequency - a.usage_frequency)
      preferences.categories.sort((a, b) => b.preference_score - a.preference_score)

      // Limit to top preferences to avoid bloat
      preferences.recipes = preferences.recipes.slice(0, 20)
      preferences.ingredients = preferences.ingredients.slice(0, 30)
      preferences.categories = preferences.categories.slice(0, 10)

      // Update customer record
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          favorite_items: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', userId)

      if (updateError) {
        dbLogger.error({ customerId, error: updateError }, 'Failed to update customer preferences')
      } else {
        dbLogger.info({
          customerId,
          recipesUpdated: preferences.recipes.length,
          ingredientsUpdated: preferences.ingredients.length
        }, 'Customer preferences updated successfully')
      }

    } catch (error) {
      dbLogger.error({ customerId, error }, 'Failed to update customer preferences')
    }
  }

  /**
   * Get customer preferences for demand forecasting
   */
  static async getCustomerPreferences(
    customerId: string,
    userId: string
  ): Promise<CustomerPreferences | null> {
    try {
      const client = await createClient()
      const supabase = client

      const { data: customer, error } = await supabase
        .from('customers')
        .select('favorite_items')
        .eq('id', customerId)
        .eq('user_id', userId)
        .single()

      if (error || !customer?.favorite_items) {
        return null
      }

      return customer.favorite_items as CustomerPreferences
    } catch (error) {
      dbLogger.error({ customerId, error }, 'Failed to get customer preferences')
      return null
    }
  }

  /**
   * Analyze all customer preferences for aggregate demand forecasting
   */
  static async analyzeAggregateDemand(
    userId: string,
    days: number = 90
  ): Promise<{
    topRecipes: Array<{
      recipe_id: string
      recipe_name: string
      total_orders: number
      unique_customers: number
      average_quantity: number
    }>
    topIngredients: Array<{
      ingredient_id: string
      ingredient_name: string
      total_usage: number
      customer_count: number
    }>
    categoryTrends: Array<{
      category: string
      total_preference_score: number
      customer_count: number
    }>
  }> {
    try {
      const client = await createClient()
      const supabase = client

      // Get all customers with preferences from recent orders
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data: customers, error } = await supabase
        .from('customers')
        .select('favorite_items')
        .eq('user_id', userId)
        .not('favorite_items', 'is', null)
        .gte('last_order_date', cutoffDate.toISOString())

      if (error || !customers) {
        dbLogger.warn({ error }, 'Failed to fetch customers for demand analysis')
        return {
          topRecipes: [],
          topIngredients: [],
          categoryTrends: []
        }
      }

      // Aggregate preferences
      const recipeStats = new Map<string, {
        recipe_name: string
        total_orders: number
        unique_customers: number
        total_quantity: number
      }>()

      const ingredientStats = new Map<string, {
        ingredient_name: string
        total_usage: number
        customer_count: number
      }>()

      const categoryStats = new Map<string, {
        total_preference_score: number
        customer_count: number
      }>()

      for (const customer of customers) {
        const preferences = customer.favorite_items as CustomerPreferences
        if (!preferences) continue

        // Aggregate recipe preferences
        for (const recipe of preferences.recipes) {
          const existing = recipeStats.get(recipe.recipe_id)
          if (existing) {
            existing.total_orders += recipe.order_count
            existing.unique_customers += 1
            existing.total_quantity += recipe.average_quantity * recipe.order_count
          } else {
            recipeStats.set(recipe.recipe_id, {
              recipe_name: recipe.recipe_name,
              total_orders: recipe.order_count,
              unique_customers: 1,
              total_quantity: recipe.average_quantity * recipe.order_count
            })
          }
        }

        // Aggregate ingredient preferences
        for (const ingredient of preferences.ingredients) {
          const existing = ingredientStats.get(ingredient.ingredient_id)
          if (existing) {
            existing.total_usage += ingredient.usage_frequency
            existing.customer_count += 1
          } else {
            ingredientStats.set(ingredient.ingredient_id, {
              ingredient_name: ingredient.ingredient_name,
              total_usage: ingredient.usage_frequency,
              customer_count: 1
            })
          }
        }

        // Aggregate category preferences
        for (const category of preferences.categories) {
          const existing = categoryStats.get(category.category)
          if (existing) {
            existing.total_preference_score += category.preference_score
            existing.customer_count += 1
          } else {
            categoryStats.set(category.category, {
              total_preference_score: category.preference_score,
              customer_count: 1
            })
          }
        }
      }

      // Convert to sorted arrays
      const topRecipes = Array.from(recipeStats.entries())
        .map(([recipe_id, stats]) => ({
          recipe_id,
          recipe_name: stats.recipe_name,
          total_orders: stats.total_orders,
          unique_customers: stats.unique_customers,
          average_quantity: Math.round(stats.total_quantity / stats.total_orders)
        }))
        .sort((a, b) => b.total_orders - a.total_orders)
        .slice(0, 10)

      const topIngredients = Array.from(ingredientStats.entries())
        .map(([ingredient_id, stats]) => ({
          ingredient_id,
          ingredient_name: stats.ingredient_name,
          total_usage: stats.total_usage,
          customer_count: stats.customer_count
        }))
        .sort((a, b) => b.total_usage - a.total_usage)
        .slice(0, 15)

      const categoryTrends = Array.from(categoryStats.entries())
        .map(([category, stats]) => ({
          category,
          total_preference_score: stats.total_preference_score,
          customer_count: stats.customer_count
        }))
        .sort((a, b) => b.total_preference_score - a.total_preference_score)
        .slice(0, 8)

      return {
        topRecipes,
        topIngredients,
        categoryTrends
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to analyze aggregate demand')
      return {
        topRecipes: [],
        topIngredients: [],
        categoryTrends: []
      }
    }
  }
}