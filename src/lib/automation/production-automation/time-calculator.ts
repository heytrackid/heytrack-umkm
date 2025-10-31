// @ts-nocheck
/**
 * Time Calculator Module
 * Handles production time calculations and scheduling
 */

import { type Recipe, type AutomationConfig } from '@/lib/automation/types'

export class TimeCalculator {
  /**
   * Calculate production time based on recipe and quantity
   */
  static calculateProductionTime(recipe: Recipe, quantity: number): number {
    // Base time + time per batch + prep time
    const batchSize = recipe.servings || 1
    const batches = Math.ceil(quantity / batchSize)
    const prepTime = recipe.prep_time || 30 // minutes
    const cookTime = recipe.cook_time || 45 // minutes

    // Sequential batches with some parallelization efficiency
    const baseTime = prepTime + cookTime
    const additionalBatchTime = cookTime * 0.8 // 20% efficiency gain for additional batches

    const totalMinutes = baseTime + (additionalBatchTime * (batches - 1))
    return totalMinutes / 60 // Convert to hours
  }

  /**
   * Calculate optimal start time for production
   */
  static calculateOptimalStartTime(
    deliveryDate: string,
    productionTime: number,
    config: AutomationConfig
  ): Date {
    const delivery = new Date(deliveryDate)
    const bufferTime = config.productionLeadTime || 2 // Default 2 hours buffer
    const startTime = new Date(delivery.getTime() - (productionTime + bufferTime) * 60 * 60 * 1000)

    // Ensure start time is during working hours (6 AM - 10 PM)
    const workStartHour = 6
    const workEndHour = 22

    if (startTime.getHours() < workStartHour) {
      startTime.setHours(workStartHour, 0, 0, 0)
    } else if (startTime.getHours() > workEndHour) {
      // Move to next day
      startTime.setDate(startTime.getDate() + 1)
      startTime.setHours(workStartHour, 0, 0, 0)
    }

    return startTime
  }

  /**
   * Schedule production orders with optimal timing
   */
  static scheduleOptimalProduction(
    plan: Array<{ recipeId: string; quantity: number; priority: number }>, // ProductionPlanItem[]
    workingHours: { start: number; end: number }
  ) {
    // Sort by delivery date priority
    const sortedPlan = [...plan].sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime())

    let currentTime = new Date()
    currentTime.setHours(workingHours.start, 0, 0, 0)

    return sortedPlan.map(item => {
      const scheduledStart = new Date(currentTime)
      const scheduledEnd = new Date(scheduledStart.getTime() + item.production.estimatedDuration * 60 * 60 * 1000)

      // Adjust for working hours
      if (scheduledEnd.getHours() > workingHours.end) {
        // Move to next day
        currentTime.setDate(currentTime.getDate() + 1)
        currentTime.setHours(workingHours.start, 0, 0, 0)
        const newStart = new Date(currentTime)
        const newEnd = new Date(newStart.getTime() + item.production.estimatedDuration * 60 * 60 * 1000)

        currentTime = newEnd

        return {
          ...item,
          scheduledStart: newStart,
          scheduledEnd: newEnd,
          isOnTime: newEnd <= item.deliveryDate
        }
      } 
        currentTime = scheduledEnd

        return {
          ...item,
          scheduledStart,
          scheduledEnd,
          isOnTime: scheduledEnd <= item.deliveryDate
        }
      
    })
  }
}
