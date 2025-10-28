// Ingredient Purchases Types
// Type definitions for ingredient purchase management

import type { Database } from '@/types/supabase-generated'

type IngredientPurchaseBase = Database['public']['Tables']['ingredient_purchases']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

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