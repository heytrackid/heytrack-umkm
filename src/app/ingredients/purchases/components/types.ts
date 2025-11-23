import type { LucideIcon } from '@/components/icons'

export interface IngredientPurchase {
  id: string
  user_id: string
  ingredient_id: string
  supplier_id?: string | null
  supplier?: string | { id: string; name: string } | null
  quantity: number
  unit_price: number
  total_price: number
  purchase_date: string
  notes?: string | null
  created_at: string
  updated_at: string
  ingredient?: {
    id: string
    name: string
    unit: string
  }
}

export interface StatsItem {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
}

export interface PurchaseFormData {
  ingredient_id: string
  quantity: number
  unit_price: number
  supplier?: string | null
  purchase_date?: string
  notes?: string | null
}
