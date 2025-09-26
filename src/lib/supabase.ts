import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// For client-side usage with typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Export createClient function for API routes and server-side usage
export const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Helper function for server-side operations with service role (server-only)
export const createServerSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('createServerSupabaseAdmin should only be called server-side')
  }
  
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Real-time subscription helper
export const subscribeToTable = (
  table: keyof Database['public']['Tables'],
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`realtime_${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Database service helpers
export const dbService = {
  // Ingredients
  async getIngredients() {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async addIngredient(ingredient: Database['public']['Tables']['ingredients']['Insert']) {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredient as any)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateIngredient(id: string, updates: Database['public']['Tables']['ingredients']['Update']) {
    const { data, error } = await (supabase as any)
      .from('ingredients')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error
    return data as Database['public']['Tables']['ingredients']['Row']
  },

  // Recipes with ingredients
  async getRecipesWithIngredients() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          ingredient:ingredients(*)
        )
      `)
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Orders with items
  async getOrdersWithItems() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          recipe:recipes(*)
        ),
        payments (*),
        customer:customers(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Productions
  async getProductions() {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Financial records
  async getFinancialRecords(startDate?: string, endDate?: string) {
    let query = supabase
      .from('financial_records')
      .select('*')
      .order('date', { ascending: false })
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },
}

