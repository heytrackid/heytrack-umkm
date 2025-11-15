/**
 * Stock Reservation System
 * Prevents overselling by reserving stock when orders are created
 */

 
import { createClient } from '@/utils/supabase/server'

export interface StockReservation {
  id: string
  order_id: string
  ingredient_id: string
  quantity: number
  status: 'active' | 'released' | 'consumed'
  user_id: string
  created_at: string
  updated_at: string
}

export interface AvailableStockInfo {
  ingredient_id: string
  current_stock: number
  reserved_stock: number
  available_stock: number
}

/**
 * Reserve stock for an order
 * @param orderId - Order ID
 * @param ingredientId - Ingredient ID
 * @param quantity - Quantity to reserve
 * @param userId - User ID
 * @returns Reservation ID
 */
export async function reserveStock(
  orderId: string,
  ingredientId: string,
  quantity: number,
  userId: string
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('reserve_stock', {
    p_order_id: orderId,
    p_ingredient_id: ingredientId,
    p_quantity: quantity,
    p_user_id: userId,
  } as any)

  if (error) {
    throw new Error(`Failed to reserve stock: ${error.message}`)
  }

  return data as string
}

/**
 * Release reserved stock (on order cancellation)
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns Number of reservations released
 */
export async function releaseStock(
  orderId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('release_stock', {
    p_order_id: orderId,
    p_user_id: userId,
  } as any)

  if (error) {
    throw new Error(`Failed to release stock: ${error.message}`)
  }

  return data as number
}

/**
 * Consume reserved stock (on order completion)
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns Number of reservations consumed
 */
export async function consumeStock(
  orderId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('consume_stock', {
    p_order_id: orderId,
    p_user_id: userId,
  } as any)

  if (error) {
    throw new Error(`Failed to consume stock: ${error.message}`)
  }

  return data as number
}

/**
 * Get available stock for an ingredient
 * @param ingredientId - Ingredient ID
 * @param userId - User ID
 * @returns Available stock quantity
 */
export async function getAvailableStock(
  ingredientId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_available_stock', {
    p_ingredient_id: ingredientId,
    p_user_id: userId,
  } as any)

  if (error) {
    throw new Error(`Failed to get available stock: ${error.message}`)
  }

  return data as number
}

/**
 * Get stock reservations for an order
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns List of reservations
 */
export async function getOrderReservations(
  orderId: string,
  userId: string
): Promise<StockReservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock_reservations')
    .select('*')
    .eq('order_id', orderId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get reservations: ${error.message}`)
  }

  return data as StockReservation[]
}

/**
 * Check if enough stock is available for order items
 * @param items - Order items with ingredient_id and quantity
 * @param userId - User ID
 * @returns Object with availability status and details
 */
export async function checkStockAvailability(
  items: Array<{ ingredient_id: string; quantity: number }>,
  userId: string
): Promise<{
  available: boolean
  insufficientItems: Array<{
    ingredient_id: string
    requested: number
    available: number
  }>
}> {
  const supabase = await createClient()
  const insufficientItems: Array<{
    ingredient_id: string
    requested: number
    available: number
  }> = []

  for (const item of items) {
    const { data: ingredient, error } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, reserved_stock')
      .eq('id', item.ingredient_id)
      .eq('user_id', userId)
      .single()

    if (error || !ingredient) {
      continue
    }

    type IngredientData = { id: string; name: string; current_stock: number | null; reserved_stock: number | null }
    const ingredientData = ingredient as IngredientData
    const available = (ingredientData.current_stock || 0) - (ingredientData.reserved_stock || 0)
    if (available < item.quantity) {
      insufficientItems.push({
        ingredient_id: item.ingredient_id,
        requested: item.quantity,
        available,
      })
    }
  }

  return {
    available: insufficientItems.length === 0,
    insufficientItems,
  }
}

/**
 * Reserve stock for multiple items (order creation)
 * @param orderId - Order ID
 * @param items - Order items with ingredient_id and quantity
 * @param userId - User ID
 * @returns Array of reservation IDs
 */
export async function reserveStockForOrder(
  orderId: string,
  items: Array<{ ingredient_id: string; quantity: number }>,
  userId: string
): Promise<string[]> {
  // First check availability
  const availability = await checkStockAvailability(items, userId)

  if (!availability.available) {
    const itemNames = availability.insufficientItems
      .map((item) => `${item.ingredient_id}: need ${item.requested}, available ${item.available}`)
      .join(', ')
    throw new Error(`Insufficient stock for items: ${itemNames}`)
  }

  // Reserve stock for each item
  const reservationIds: string[] = []

  for (const item of items) {
    try {
      const reservationId = await reserveStock(
        orderId,
        item.ingredient_id,
        item.quantity,
        userId
      )
      reservationIds.push(reservationId)
    } catch (error) {
      // If any reservation fails, release all previous reservations
      if (reservationIds.length > 0) {
        await releaseStock(orderId, userId)
      }
      throw error
    }
  }

  return reservationIds
}
