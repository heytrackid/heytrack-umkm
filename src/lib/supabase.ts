import { sanitizeSQL, validateInput } from '@/lib/validation';
import { Database } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory cache for server-side operations
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMs: number = 300000): void {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only validate at runtime, not during build
// Skip validation if we're in build process or if we have placeholder values
const shouldValidate = (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') &&
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')

if (shouldValidate) {
  // Validate environment variables format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('Invalid Supabase URL format. Should be: https://your-project.supabase.co')
  }

  if (supabaseAnonKey.length < 100) {
    console.warn('Invalid Supabase anonymous key format. Key appears too short.')
  }
}

// Create a mock client that throws helpful errors when env vars are missing
const createMockSupabaseClient = () => {
  const mockClient = {
    from: () => {
      throw new Error('Supabase client not initialized. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
    },
    auth: {
      signIn: () => Promise.reject(new Error('Supabase client not initialized. Please configure environment variables.')),
      signOut: () => Promise.reject(new Error('Supabase client not initialized. Please configure environment variables.')),
    },
    channel: () => ({
      on: () => mockClient,
      subscribe: () => Promise.resolve(),
    }),
    removeChannel: () => {},
  }
  return mockClient as any
}

// Create a lazy-loaded supabase client
let _supabaseClient: any = null

function getSupabaseClient(): any {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
    }

    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  }

  return _supabaseClient
}

// For client-side usage with typing - lazy loaded
export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getSupabaseClient()
    return client[prop]
  }
}) as any

// Export createClient function for API routes and server-side usage
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

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

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
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
    cacheManager.set(cacheKey, data, 300000)
    return data
  },

  async addIngredient(ingredientData: any) {
    // Validate input
    const validation = validateInput(ingredientData)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    // Sanitize string inputs
    const sanitizedIngredient = {
      ...ingredientData,
      name: typeof ingredientData.name === 'string' ? sanitizeSQL(ingredientData.name) : ingredientData.name,
      unit: typeof ingredientData.unit === 'string' ? sanitizeSQL(ingredientData.unit) : ingredientData.unit,
    }

    const { data, error } = await supabase
      .from('ingredients')
      .insert(ingredientData)
      .select('*')
      .single()

    if (error) {
      console.error('Database error in addIngredient:', error)
      throw new Error('Failed to add ingredient')
    }

    // Clear cache
    cacheManager.clear()
    return data
  },

  async updateIngredient(id: string, updates: any) {
    // Validate UUID
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error('Invalid ingredient ID format')
    }

    // Validate updates
    const validation = validateInput(updates)
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

