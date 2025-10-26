'use client'

import { useCallback } from 'react'
import type { SmartInsightsRequest, AIInsight, PricingAnalysisRequest, InventoryOptimizationRequest } from './types'

interface UseSmartInsightsProps {
  analyzePricing: (request: PricingAnalysisRequest) => Promise<AIInsight['analysis']>
  optimizeInventory: (request: InventoryOptimizationRequest) => Promise<AIInsight['analysis']>
}

/**
 * Smart Business Insights Generator Hook
 * Combines multiple AI analyses to provide comprehensive business intelligence
 */
export function useSmartInsights({
  analyzePricing,
  optimizeInventory
}: UseSmartInsightsProps) {

  const generateSmartInsights = useCallback(async (businessData: SmartInsightsRequest): Promise<AIInsight[]> => {
    const insights: AIInsight[] = []

    try {
      // Generate pricing insights if recipes available
      if (businessData.recipes && businessData.ingredients) {
        const topRecipes = businessData.recipes.slice(0, 3)
        for (const recipe of topRecipes) {
          if ('recipe_ingredients' in recipe && Array.isArray(recipe.recipe_ingredients)) {
            const ingredients = recipe.recipe_ingredients.map(ri => ({
              name: ri.ingredient?.name ?? 'Unknown',
              cost: (ri.ingredient?.price_per_unit ?? 0) * ri.quantity,
              quantity: ri.quantity
            }))

            try {
              const pricingAnalysis = await analyzePricing({
                productName: recipe.name ?? 'Unknown Recipe',
                ingredients,
                currentPrice: recipe.selling_price ?? undefined
              })

              insights.push({
                type: 'pricing',
                productName: recipe.name ?? 'Unknown Recipe',
                analysis: pricingAnalysis,
                priority: 'high'
              })
            } catch (error: unknown) {
              console.warn(`Pricing analysis failed for ${recipeData.name}:`, error)
            }
          }
        }
      }

      // Generate inventory insights if ingredients available
      if (businessData.ingredients && businessData.ingredients.length > 0) {
        try {
          const inventoryOptimization = await optimizeInventory({
            ingredients: businessData.ingredients.map(ingredient => ({
              name: ingredient.name ?? 'Unknown Ingredient',
              currentStock: ingredient.current_stock ?? 0,
              minStock: ingredient.min_stock ?? 0,
              price: ingredient.price_per_unit ?? 0,
              supplier: ingredient.supplier ?? 'Unknown',
              leadTime: ingredient.lead_time ?? 3
            }))
          })

          insights.push({
            type: 'inventory',
            analysis: inventoryOptimization,
            priority: 'medium'
          })
        } catch (error: unknown) {
          console.warn('Inventory optimization failed:', error)
        }
      }

      return insights

    } catch (error: unknown) {
      console.error('Smart insights generation failed:', error)
      return []
    }
  }, [analyzePricing, optimizeInventory])

  return {
    generateSmartInsights
  }
}
