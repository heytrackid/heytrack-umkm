// Customers Page Types
// Type definitions for customer management

// Use generated types from Supabase
import type { Database } from '@/types/supabase-generated'

export type Customer = Database['public']['Tables']['customers']['Row']

// Extended type for UI state
export interface CustomerWithStatus extends Customer {
  status?: string // Additional field for UI state
}

export interface CustomerStats {
  total: number
  active: number
  averageSpent: number
  averageOrders: number
}

export interface CustomerFilters {
  searchTerm: string
  customerType?: string
  isActive?: boolean
}

export interface BulkActionResult {
  success: boolean
  message: string
  affectedCount: number
}

export interface CustomerTableActions {
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onAddNew: () => void
}
