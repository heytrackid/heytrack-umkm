// @ts-nocheck
/**
 * Optimized Database Query Field Selectors
 * 
 * Define specific fields to fetch instead of using SELECT *
 * This reduces data transfer and improves query performance
 */

/**
 * Recipe field selectors
 */
export const RECIPE_FIELDS = {
  // Minimal fields for list views
  LIST: 'id, name, selling_price, total_cost, margin_percentage, servings, created_at',
  
  // Card view with basic info
  CARD: 'id, name, description, selling_price, total_cost, margin_percentage, servings, image_url',
  
  // Full detail with ingredients
  DETAIL: `
    *,
    recipe_ingredients (
      id,
      quantity,
      unit,
      ingredient:ingredients (
        id,
        name,
        unit,
        weighted_average_cost,
        price_per_unit,
        current_stock
      )
    )
  `,
  
  // For HPP calculations
  HPP: `
    id,
    name,
    selling_price,
    servings,
    recipe_ingredients (
      quantity,
      unit,
      ingredient:ingredients (
        id,
        name,
        weighted_average_cost,
        price_per_unit
      )
    )
  `,
  
  // For dropdown/select components
  SELECT: 'id, name',
} as const

/**
 * Order field selectors
 */
export const ORDER_FIELDS = {
  // List view
  LIST: 'id, order_no, customer_name, customer_phone, delivery_date, total_amount, status, payment_status, priority, created_at',
  
  // Card view
  CARD: 'id, order_no, customer_name, customer_phone, delivery_date, total_amount, status, payment_status, priority, notes',
  
  // Full detail with items
  DETAIL: `
    *,
    order_items (
      id,
      quantity,
      unit_price,
      total_price,
      product_name,
      special_requests,
      recipe_id,
      recipe:recipes (
        id,
        name,
        image_url
      )
    )
  `,
  
  // For reports
  REPORT: 'id, order_no, customer_name, delivery_date, total_amount, status, payment_status, created_at',
  
  // For dropdown
  SELECT: 'id, order_no, customer_name',
} as const

/**
 * Ingredient field selectors
 */
export const INGREDIENT_FIELDS = {
  // List view
  LIST: 'id, name, unit, price_per_unit, weighted_average_cost, current_stock, min_stock, category',
  
  // Card view
  CARD: 'id, name, unit, price_per_unit, weighted_average_cost, current_stock, min_stock, category, supplier',
  
  // Full detail
  DETAIL: '*',
  
  // For calculations (WAC)
  WAC: 'id, name, weighted_average_cost, price_per_unit',
  
  // For dropdown
  SELECT: 'id, name, unit',
  
  // For stock alerts
  STOCK_ALERT: 'id, name, current_stock, min_stock, unit',
} as const

/**
 * Customer field selectors
 */
export const CUSTOMER_FIELDS = {
  // List view
  LIST: 'id, name, phone, email, address, total_orders, total_spent',
  
  // Card view
  CARD: 'id, name, phone, email, address, notes',
  
  // Full detail
  DETAIL: '*',
  
  // For dropdown
  SELECT: 'id, name, phone',
} as const

/**
 * Production batch field selectors
 */
export const PRODUCTION_FIELDS = {
  // List view
  LIST: 'id, batch_no, recipe_id, quantity, status, scheduled_start, scheduled_end, created_at',
  
  // Detail with recipe
  DETAIL: `
    *,
    recipe:recipes (
      id,
      name,
      servings,
      recipe_ingredients (
        quantity,
        unit,
        ingredient:ingredients (
          id,
          name,
          current_stock
        )
      )
    )
  `,
  
  // For timeline view
  TIMELINE: 'id, batch_no, recipe_id, quantity, status, scheduled_start, scheduled_end, actual_start, actual_end',
} as const

/**
 * Financial record field selectors
 */
export const FINANCIAL_FIELDS = {
  // List view
  LIST: 'id, date, type, category, amount, description, created_at',
  
  // For reports
  REPORT: 'id, date, type, category, amount, payment_method',
  
  // Full detail
  DETAIL: '*',
} as const

/**
 * HPP calculation field selectors
 */
export const HPP_FIELDS = {
  // List view
  LIST: 'id, recipe_id, total_cost, ingredient_cost, operational_cost, calculated_at',
  
  // Detail with breakdown
  DETAIL: `
    *,
    recipe:recipes (
      id,
      name,
      selling_price,
      margin_percentage
    )
  `,
  
  // For comparison
  COMPARISON: 'id, recipe_id, total_cost, calculated_at',
} as const

/**
 * Helper function to build query with specific fields
 */
export function selectFields<T extends keyof typeof RECIPE_FIELDS>(
  table: 'recipes',
  view: T
): string
export function selectFields<T extends keyof typeof ORDER_FIELDS>(
  table: 'orders',
  view: T
): string
export function selectFields<T extends keyof typeof INGREDIENT_FIELDS>(
  table: 'ingredients',
  view: T
): string
export function selectFields<T extends keyof typeof CUSTOMER_FIELDS>(
  table: 'customers',
  view: T
): string
export function selectFields<T extends keyof typeof PRODUCTION_FIELDS>(
  table: 'production_batches',
  view: T
): string
export function selectFields<T extends keyof typeof FINANCIAL_FIELDS>(
  table: 'financial_records',
  view: T
): string
export function selectFields<T extends keyof typeof HPP_FIELDS>(
  table: 'hpp_calculations',
  view: T
): string
export function selectFields(table: string, view: string): string {
  const fieldMaps: Record<string, any> = {
    recipes: RECIPE_FIELDS,
    orders: ORDER_FIELDS,
    ingredients: INGREDIENT_FIELDS,
    customers: CUSTOMER_FIELDS,
    production_batches: PRODUCTION_FIELDS,
    financial_records: FINANCIAL_FIELDS,
    hpp_calculations: HPP_FIELDS,
  }
  
  return fieldMaps[table]?.[view] || '*'
}

/**
 * Usage examples:
 * 
 * // List view
 * const { data } = await supabase
 *   .from('recipes')
 *   .select(RECIPE_FIELDS.LIST)
 * 
 * // Detail view
 * const { data } = await supabase
 *   .from('recipes')
 *   .select(RECIPE_FIELDS.DETAIL)
 *   .eq('id', recipeId)
 *   .single()
 * 
 * // Using helper
 * const fields = selectFields('recipes', 'LIST')
 * const { data } = await supabase
 *   .from('recipes')
 *   .select(fields)
 */
