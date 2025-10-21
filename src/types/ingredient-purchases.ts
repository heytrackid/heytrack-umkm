/**
 * Ingredient Purchases Types
 * Purchase history tracking for inventory management
 */

export type IngredientPurchasesTable = {
  Row: {
    id: string
    ingredient_id: string
    quantity: number
    unit_price: number
    total_price: number
    supplier: string | null
    purchase_date: string
    notes: string | null
    created_at: string
    updated_at: string
    expense_id: string | null
    cost_per_unit: number | null
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id: string
    quantity: number
    unit_price: number
    total_price: number
    supplier?: string | null
    purchase_date?: string
    notes?: string | null
    created_at?: string
    updated_at?: string
    expense_id?: string | null
    cost_per_unit?: number | null
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string
    quantity?: number
    unit_price?: number
    total_price?: number
    supplier?: string | null
    purchase_date?: string
    notes?: string | null
    created_at?: string
    updated_at?: string
    expense_id?: string | null
    cost_per_unit?: number | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
      columns: ["ingredient_id"]
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "ingredient_purchases_expense_id_fkey"
      columns: ["expense_id"]
      referencedRelation: "expenses"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "ingredient_purchases_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
