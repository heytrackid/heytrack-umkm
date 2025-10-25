/**
 * Table-Specific Typed Operations
 * Pre-defined operations for each table to avoid type inference issues
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

// ============================================================================
// Customers Operations
// ============================================================================

export async function getCustomer(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  return {
    data: data as Tables['customers']['Row'] | null,
    error
  }
}

export async function getAllCustomers(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  return {
    data: data as Tables['customers']['Row'][] | null,
    error
  }
}

export async function createCustomer(
  supabase: SupabaseClient<Database>,
  customer: Tables['customers']['Insert']
) {
  const { data, error } = await (supabase
    .from('customers') as any)
    .insert(customer)
    .select()
    .single()
  
  return {
    data: data as Tables['customers']['Row'] | null,
    error
  }
}

export async function updateCustomer(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['customers']['Update']
) {
  const { data, error } = await (supabase
    .from('customers') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['customers']['Row'] | null,
    error
  }
}

export async function deleteCustomer(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  
  return { error }
}

// ============================================================================
// Recipes Operations
// ============================================================================

export async function getRecipe(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()
  
  return {
    data: data as Tables['recipes']['Row'] | null,
    error
  }
}

export async function getRecipeWithIngredients(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        id,
        quantity,
        unit,
        ingredient:ingredients (
          id,
          name,
          price_per_unit,
          unit,
          stock
        )
      )
    `)
    .eq('id', id)
    .single()
  
  return {
    data: data as any,
    error
  }
}

export async function getAllRecipes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
  
  return {
    data: data as Tables['recipes']['Row'][] | null,
    error
  }
}

export async function createRecipe(
  supabase: SupabaseClient<Database>,
  recipe: Tables['recipes']['Insert']
) {
  const { data, error } = await (supabase
    .from('recipes') as any)
    .insert(recipe)
    .select()
    .single()
  
  return {
    data: data as Tables['recipes']['Row'] | null,
    error
  }
}

export async function updateRecipe(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['recipes']['Update']
) {
  const { data, error } = await (supabase
    .from('recipes') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['recipes']['Row'] | null,
    error
  }
}

// ============================================================================
// Ingredients Operations
// ============================================================================

export async function getIngredient(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single()
  
  return {
    data: data as Tables['ingredients']['Row'] | null,
    error
  }
}

export async function getAllIngredients(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')
  
  return {
    data: data as Tables['ingredients']['Row'][] | null,
    error
  }
}

export async function createIngredient(
  supabase: SupabaseClient<Database>,
  ingredient: Tables['ingredients']['Insert']
) {
  const { data, error } = await (supabase
    .from('ingredients') as any)
    .insert(ingredient)
    .select()
    .single()
  
  return {
    data: data as Tables['ingredients']['Row'] | null,
    error
  }
}

export async function updateIngredient(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['ingredients']['Update']
) {
  const { data, error } = await (supabase
    .from('ingredients') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['ingredients']['Row'] | null,
    error
  }
}

// ============================================================================
// Orders Operations
// ============================================================================

export async function getOrder(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  
  return {
    data: data as Tables['orders']['Row'] | null,
    error
  }
}

export async function getAllOrders(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  return {
    data: data as Tables['orders']['Row'][] | null,
    error
  }
}

export async function createOrder(
  supabase: SupabaseClient<Database>,
  order: Tables['orders']['Insert']
) {
  const { data, error } = await (supabase
    .from('orders') as any)
    .insert(order)
    .select()
    .single()
  
  return {
    data: data as Tables['orders']['Row'] | null,
    error
  }
}

export async function updateOrder(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['orders']['Update']
) {
  const { data, error } = await (supabase
    .from('orders') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['orders']['Row'] | null,
    error
  }
}

// ============================================================================
// HPP Snapshots Operations
// ============================================================================

export async function getHPPSnapshot(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('hpp_snapshots')
    .select('*')
    .eq('id', id)
    .single()
  
  return {
    data: data as Tables['hpp_snapshots']['Row'] | null,
    error
  }
}

export async function getHPPSnapshotsByRecipe(
  supabase: SupabaseClient<Database>,
  recipeId: string
) {
  const { data, error } = await supabase
    .from('hpp_snapshots')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('snapshot_date', { ascending: false })
  
  return {
    data: data as Tables['hpp_snapshots']['Row'][] | null,
    error
  }
}

export async function createHPPSnapshot(
  supabase: SupabaseClient<Database>,
  snapshot: Tables['hpp_snapshots']['Insert']
) {
  const { data, error } = await supabase
    .from('hpp_snapshots')
    .insert(snapshot as any)
    .select()
    .single()
  
  return {
    data: data as Tables['hpp_snapshots']['Row'] | null,
    error
  }
}

// ============================================================================
// Expenses Operations
// ============================================================================

export async function getAllExpenses(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('operational_costs')
    .select('*')
    .order('created_at', { ascending: false })
  
  return {
    data: data as Tables['operational_costs']['Row'][] | null,
    error
  }
}

export async function createExpense(
  supabase: SupabaseClient<Database>,
  expense: Tables['operational_costs']['Insert']
) {
  const { data, error } = await supabase
    .from('operational_costs')
    .insert(expense as any)
    .select()
    .single()
  
  return {
    data: data as Tables['operational_costs']['Row'] | null,
    error
  }
}

export async function updateExpense(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['operational_costs']['Update']
) {
  const { data, error } = await (supabase
    .from('operational_costs') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['operational_costs']['Row'] | null,
    error
  }
}

// ============================================================================
// Suppliers Operations
// ============================================================================

export async function getAllSuppliers(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')
  
  return {
    data: data as Tables['suppliers']['Row'][] | null,
    error
  }
}

export async function createSupplier(
  supabase: SupabaseClient<Database>,
  supplier: Tables['suppliers']['Insert']
) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier as any)
    .select()
    .single()
  
  return {
    data: data as Tables['suppliers']['Row'] | null,
    error
  }
}

export async function updateSupplier(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['suppliers']['Update']
) {
  const { data, error } = await (supabase
    .from('suppliers') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['suppliers']['Row'] | null,
    error
  }
}

// ============================================================================
// Financial Records Operations
// ============================================================================

export async function createFinancialRecord(
  supabase: SupabaseClient<Database>,
  record: Tables['financial_records']['Insert']
) {
  const { data, error } = await supabase
    .from('financial_records')
    .insert(record as any)
    .select()
    .single()
  
  return {
    data: data as Tables['financial_records']['Row'] | null,
    error
  }
}

export async function getFinancialRecordsByDateRange(
  supabase: SupabaseClient<Database>,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })
  
  return {
    data: data as Tables['financial_records']['Row'][] | null,
    error
  }
}

// ============================================================================
// Production Batches Operations
// ============================================================================

export async function createProductionBatch(
  supabase: SupabaseClient<Database>,
  batch: Tables['productions']['Insert']
) {
  const { data, error } = await supabase
    .from('productions')
    .insert(batch as any)
    .select()
    .single()
  
  return {
    data: data as Tables['productions']['Row'] | null,
    error
  }
}

export async function updateProductionBatch(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Tables['productions']['Update']
) {
  const { data, error } = await (supabase
    .from('productions') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return {
    data: data as Tables['productions']['Row'] | null,
    error
  }
}
