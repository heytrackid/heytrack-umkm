



/**
 * Stock Reservation Domain Types
 * Business logic types for stock reservation system
 */

export type ReservationStatus = 'ACTIVE' | 'CONSUMED' | 'RELEASED' | 'EXPIRED'

export type ProductionPriority = 'URGENT' | 'NORMAL' | 'LOW'

export interface StockReservation {
  id: string
  ingredient_id: string
  order_id: string
  reserved_quantity: number
  status: ReservationStatus
  reserved_at: string
  consumed_at: string | null
  released_at: string | null
  notes: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface StockReservationCreate {
  ingredient_id: string
  order_id: string
  reserved_quantity: number
  notes?: string
  user_id: string
}

export interface IngredientAvailability {
  id: string
  name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  min_stock: number | null
  reorder_point: number | null
  unit: string
  availability_status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'BELOW_MIN' | 'AVAILABLE'
  user_id: string
}

export interface ReservationRequest {
  ingredient_id: string
  required_quantity: number
}

export interface ReservationResult {
  success: boolean
  ingredient_id: string
  ingredient_name: string
  requested: number
  reserved: number
  available: number
  sufficient: boolean
  message: string
}

export interface OrderReservationSummary {
  order_id: string
  total_items: number
  reserved_items: number
  insufficient_items: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortfall: number
  }>
  can_fulfill: boolean
}
