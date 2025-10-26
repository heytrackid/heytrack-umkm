/**
 * Production Automation Module Types
 * Additional type definitions specific to production automation
 */

import type { Recipe, Ingredient, RecipeIngredient } from '../types'

// Additional production types
export interface OrderForProduction {
  recipe_id: string
  quantity: number
  delivery_date: string
}

export interface ProductionCapacity {
  maxCapacity: number
  bottleneck: 'equipment' | 'staffing'
  equipmentCapacity: number
  staffCapacity: number
  utilizationRate: number
  recommendations: string[]
}

export interface ScheduledProductionItem {
  orderId: string
  recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }
  quantity: number
  deliveryDate: Date
  production: {
    canProduce: boolean
    startTime: Date
    estimatedDuration: number
    batchCount: number
  }
  ingredients: any // AvailabilityCheck
  recommendations: string[]
  scheduledStart: Date
  scheduledEnd: Date
  isOnTime: boolean
}

export interface TimelineConflict {
  recipe1: string
  recipe2: string
  overlap: number
}

export interface CommonIngredient {
  name: string
  recipeCount: number
  totalQuantity: number
}

export interface WorkingHours {
  start: number // hour in 24h format (e.g., 6 for 6 AM)
  end: number // hour in 24h format (e.g., 22 for 10 PM)
}

export interface Equipment {
  name: string
  capacity: number
  availability: number // percentage (0-100)
}

export interface Staffing {
  role: string
  count: number
  productivity: number // units per hour
}
