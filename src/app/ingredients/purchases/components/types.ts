import type { Row } from '@/types/database'

// Ingredient Purchases Types
// Type definitions for ingredient purchase management


type IngredientPurchaseBase = Row<'ingredient_purchases'>
type Ingredient = Row<'ingredients'>

// Re-export base type with relations
export interface IngredientPurchase extends Omit<IngredientPurchaseBase, 'supplier'> {
  ingredient?: Pick<Ingredient, 'id' | 'name' | 'unit'>
  supplier?: {
    id: string
    name: string
  } | string | null
}

export interface PurchaseFormData {
  ingredient_id: string
  quantity: string
  unit_price: string
  supplier: string
  purchase_date: string
  notes: string
}

export interface StatsItem {
  title: string
  value: number | string
  color: string
  bgColor: string
  description: string
}

export type AvailableIngredient = Pick<Ingredient, 'current_stock' | 'id' | 'name' | 'price_per_unit' | 'unit'>