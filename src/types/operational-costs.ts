/**
 * Operational Costs Types
 * Tracking for recurring and one-time operational expenses
 */

export type OperationalCostsTable = {
  Row: {
    id: string
    category: string
    amount: number
    description: string
    date: string | null
    reference: string | null
    payment_method: string | null
    supplier: string | null
    recurring: boolean | null
    frequency: string | null
    notes: string | null
    created_by: string | null
    updated_by: string | null
    created_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    id?: string
    category: string
    amount: number
    description: string
    date?: string | null
    reference?: string | null
    payment_method?: string | null
    supplier?: string | null
    recurring?: boolean | null
    frequency?: string | null
    notes?: string | null
    created_by?: string | null
    updated_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    id?: string
    category?: string
    amount?: number
    description?: string
    date?: string | null
    reference?: string | null
    payment_method?: string | null
    supplier?: string | null
    recurring?: boolean | null
    frequency?: string | null
    notes?: string | null
    created_by?: string | null
    updated_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "operational_costs_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "operational_costs_created_by_fkey"
      columns: ["created_by"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "operational_costs_updated_by_fkey"
      columns: ["updated_by"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
