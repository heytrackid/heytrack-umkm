/**
 * Inventory Reorder Rules Types
 * Auto-reorder configuration for ingredients
 */

export type InventoryReorderRulesTable = {
  Row: {
    id: string
    ingredient_id: string
    reorder_point: number
    reorder_quantity: number
    is_active: boolean | null
    created_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id: string
    reorder_point?: number
    reorder_quantity?: number
    is_active?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string
    reorder_point?: number
    reorder_quantity?: number
    is_active?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "inventory_reorder_rules_ingredient_id_fkey"
      columns: ["ingredient_id"]
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "inventory_reorder_rules_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
