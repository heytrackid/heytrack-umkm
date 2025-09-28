import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { validateInput, sanitizeSQL } from '@/middleware'

// Simple in-memory cache for server-side operations
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(): void {
    this.cache.clear()
  }
}

const cacheManager = new SimpleCache()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validate environment variables format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format')
}

if (supabaseAnonKey.length < 100) {
  throw new Error('Invalid Supabase anonymous key format')
}

// For client-side usage with typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'bakery-management-app',
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

// Enhanced validation rules
const validationRules = {
  ingredient: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    price_per_unit: { required: true, type: 'number', min: 0 },
    unit: { required: true, type: 'string', minLength: 1, maxLength: 20 },
    current_stock: { required: true, type: 'number', min: 0 },
    minimum_stock: { required: true, type: 'number', min: 0 },
  },
  order: {
    customer_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    total_amount: { required: true, type: 'number', min: 0 },
    order_date: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
  },
  recipe: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    category: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  }
}

// Secure database service helpers with input validation and caching
export const dbService = {
  // Ingredients with caching and validation
  async getIngredients() {
    const cacheKey = 'ingredients_active'
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached
    
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('Database error in getIngredients:', error)
      throw new Error('Failed to fetch ingredients')
    }
    
    // Cache for 5 minutes
    cacheManager.set(cacheKey, data, 5 * 60 * 1000)
    return data
  },

  async addIngredient(ingredient: Database['public']['Tables']['ingredients']['Insert']) {
    // Validate input
    const validation = validateInput(ingredient, validationRules.ingredient)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Sanitize string inputs
    const sanitizedIngredient = {
      ...ingredient,
      name: typeof ingredient.name === 'string' ? sanitizeSQL(ingredient.name) : ingredient.name,
      unit: typeof ingredient.unit === 'string' ? sanitizeSQL(ingredient.unit) : ingredient.unit,
    }
    
    const { data, error } = await supabase
      .from('ingredients')
      .insert(sanitizedIngredient as any)
      .select()
      .single()
    
    if (error) {
      console.error('Database error in addIngredient:', error)
      throw new Error('Failed to add ingredient')
    }
    
    // Clear cache
    cacheManager.clear()
    return data
  },

  async updateIngredient(id: string, updates: Database['public']['Tables']['ingredients']['Update']) {
    // Validate UUID
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error('Invalid ingredient ID format')
    }
    
    // Validate updates
    const validation = validateInput(updates, validationRules.ingredient)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Sanitize string inputs
    const sanitizedUpdates = { ...updates }
    if (sanitizedUpdates.name && typeof sanitizedUpdates.name === 'string') {
      sanitizedUpdates.name = sanitizeSQL(sanitizedUpdates.name)
    }
    if (sanitizedUpdates.unit && typeof sanitizedUpdates.unit === 'string') {
      sanitizedUpdates.unit = sanitizeSQL(sanitizedUpdates.unit)
    }
    
    const { data, error } = await supabase
      .from('ingredients')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Database error in updateIngredient:', error)
      throw new Error('Failed to update ingredient')
    }
    
    // Clear cache
    cacheManager.clear()
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

