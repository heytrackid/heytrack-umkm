// Customers Page Types
// Type definitions for customer management

export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  customer_type?: string | null
  is_active?: boolean | null
  total_orders?: number | null
  total_spent?: number | null
  last_order_date?: string | null
  loyalty_points?: number | null
  discount_percentage?: number | null
  favorite_items?: unknown | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: string | null
  updated_by?: string | null
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
