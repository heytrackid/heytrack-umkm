import type { Row } from '@/types/database'

// Ingredient Purchases Types
// Type definitions for ingredient purchase management


type IngredientPurchaseBase = Row<'ingredient_purchases'>
type Ingredient = Row<'ingredients'>

// Re-export base type with relations
export interface IngredientPurchase extends IngredientPurchaseBase {
  ingredient?: Pick<Ingredient, 'id' | 'name' | 'unit'>
}

export interface PurchaseFormData {
  ingredient_id: string
  quantity: string
  unit_price: string
  supplier: string
  purchase_date: string
  notes: string
}

export interface PurchaseStats {
  title: string
  value: string | number
  color: string
  bgColor: string
  description: string
}

export type AvailableIngredient = Pick<Ingredient, 'id' | 'name' | 'unit' | 'current_stock' | 'price_per_unit'>