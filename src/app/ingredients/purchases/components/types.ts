import type { ReactNode } from 'react'
// Ingredient Purchases Types
// Type definitions for ingredient purchase management

export interface IngredientPurchase {
  id: string
  ingredient_id: string
  quantity: number
  unit_price: number
  total_price: number
  supplier?: string
  purchase_date: string
  notes?: string
  created_at: string
  updated_at: string
  ingredient?: {
    id: string
    name: string
    unit: string
  }
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
  icon: string | ReactNode
  color: string
  bgColor: string
  description: string
}

export interface AvailableIngredient {
  id: string
  name: string
  unit: string
  current_stock: number
  price_per_unit: number
}