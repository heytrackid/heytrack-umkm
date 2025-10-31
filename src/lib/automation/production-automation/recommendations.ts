// @ts-nocheck
/**
 * Recommendations Module
 * Generates production recommendations and optimizations
 */

import type { AvailabilityCheck, ProductionPlanItem } from '@/lib/automation/types'

export class ProductionRecommendations {
  /**
   * Generate production recommendations
   */
  static generateProductionRecommendations(
    availability: AvailabilityCheck,
    productionTime: number
  ): string[] {
    const recommendations: string[] = []

    if (!availability.canProduce) {
      recommendations.push('🛑 Cannot produce - insufficient ingredients')

      const criticalShortages = availability.requirements
        .filter(req => !req.sufficient)
        .sort((a, b) => b.shortage - a.shortage)
        .slice(0, 3)

      criticalShortages.forEach(shortage => {
        recommendations.push(
          `📦 Need ${shortage.shortage} ${shortage.ingredient.unit} more of ${shortage.ingredient.name}`
        )
      })
    } else {
      recommendations.push('✅ All ingredients available for production')
    }

    if (productionTime > 8) {
      recommendations.push('⏰ Long production time (8+ hours), consider staging production')
      recommendations.push('👥 May require additional staff or shift planning')
    } else if (productionTime > 4) {
      recommendations.push('⚠️ Extended production time, ensure adequate staffing')
    }

    if (productionTime < 1) {
      recommendations.push('⚡ Quick production - good for rush orders')
    }

    return recommendations
  }

  /**
   * Suggest production optimizations
   */
  static suggestProductionOptimizations(plan: ProductionPlanItem[]): string[] {
    const optimizations: string[] = []

    // Batch optimization
    const recipeGroups = plan.reduce((groups, item) => {
      const recipeId = item.recipe.id
      if (!groups[recipeId]) {
        groups[recipeId] = []
      }
      groups[recipeId].push(item)
      return groups
    }, {} as Record<string, ProductionPlanItem[]>)

    Object.entries(recipeGroups).forEach(([recipeId, items]) => {
      if (items.length > 1) {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        optimizations.push(
          `🔄 Batch ${items.length} orders of ${items[0].recipe.name} (${totalQuantity} total units) for efficiency`
        )
      }
    })

    // Timeline optimization
    const timelineConflicts = this.detectTimelineConflicts(plan)
    if (timelineConflicts.length > 0) {
      optimizations.push('⚠️ Timeline conflicts detected - consider rescheduling some orders')
      timelineConflicts.forEach(conflict => {
        optimizations.push(`  • ${conflict.recipe1} overlaps with ${conflict.recipe2}`)
      })
    }

    // Resource optimization
    const totalHours = plan.reduce((sum, p) => sum + p.production.estimatedDuration, 0)
    if (totalHours > 16) {
      optimizations.push('👥 Consider multiple shifts or additional staff for peak production')
    }

    // Ingredient optimization
    const commonIngredients = this.findCommonIngredients(plan)
    if (commonIngredients.length > 0) {
      optimizations.push('📦 Consider bulk preparation of common ingredients:')
      commonIngredients.forEach(ingredient => {
        optimizations.push(`  • ${ingredient.name} used in ${ingredient.recipeCount} recipes`)
      })
    }

    return optimizations
  }

  /**
   * Detect timeline conflicts between production items
   */
  private static detectTimelineConflicts(plan: ProductionPlanItem[]) {
    const conflicts: Array<{ recipe1: string; recipe2: string; overlap: number }> = []

    for (let i = 0; i < plan.length; i++) {
      for (let j = i + 1; j < plan.length; j++) {
        const item1 = plan[i]
        const item2 = plan[j]

        const start1 = item1.production.startTime
        const end1 = new Date(start1.getTime() + item1.production.estimatedDuration * 60 * 60 * 1000)

        const start2 = item2.production.startTime
        const end2 = new Date(start2.getTime() + item2.production.estimatedDuration * 60 * 60 * 1000)

        // Check for overlap
        if (start1 < end2 && start2 < end1) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))
          const overlapHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60)

          conflicts.push({
            recipe1: item1.recipe.name,
            recipe2: item2.recipe.name,
            overlap: overlapHours
          })
        }
      }
    }

    return conflicts
  }

  /**
   * Find common ingredients across recipes
   */
  private static findCommonIngredients(plan: ProductionPlanItem[]) {
    const ingredientUsage: Record<string, { name: string; recipeCount: number; totalQuantity: number }> = {}

    plan.forEach(item => {
      item.recipe.recipe_ingredients.forEach(ri => {
        const ingredientId = ri.ingredient.id
        if (!ingredientUsage[ingredientId]) {
          ingredientUsage[ingredientId] = {
            name: ri.ingredient.name,
            recipeCount: 0,
            totalQuantity: 0
          }
        }
        ingredientUsage[ingredientId].recipeCount++
        ingredientUsage[ingredientId].totalQuantity += ri.quantity * item.quantity
      })
    })

    return Object.values(ingredientUsage)
      .filter(ingredient => ingredient.recipeCount > 1)
      .sort((a, b) => b.recipeCount - a.recipeCount)
  }
}
