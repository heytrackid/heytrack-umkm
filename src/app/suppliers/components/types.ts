// Suppliers Page Types
// Type definitions for supplier management

// Use generated types from Supabase
import type { Row } from '@/types/database'

export type Supplier = Row<'suppliers'> & {
  supplier_type?: 'preferred' | 'standard' | 'trial' | 'blacklisted'
}

// Extended type for UI state
export interface SupplierWithStatus extends Supplier {
  status?: string // Additional field for UI state
}

export interface SupplierStats {
  total: number
  active: number
  preferred: number
  averageSpent: number
  averageRating: number
  averageLeadTime: number
}

export interface SupplierFilters {
  searchTerm: string
  supplierType?: 'preferred' | 'standard' | 'trial' | 'blacklisted'
  isActive?: boolean
  minRating?: number
}

export interface BulkActionResult {
  success: boolean
  message: string
  affectedCount: number
}

export interface SupplierTableActions {
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onView: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onAddNew: () => void
}