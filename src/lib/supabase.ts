import { dbLogger } from '@/lib/logger';
import { sanitizeSQL, validateInput } from '@/lib/validations';
import { Database } from '@/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple in-memory cache for server-side operations
class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
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
    dbLogger.warn('Invalid Supabase URL format. Should be: https://your-project.supabase.co')
  }

  if (supabaseAnonKey.length < 100) {
    dbLogger.warn('Invalid Supabase anonymous key format. Key appears too short.')
  }
}

// Create a lazy-loaded supabase client
let _supabaseClient: SupabaseClient<Database> | null = null

function getSupabaseClient(): SupabaseClient<Database> {
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
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient()
    return client[prop as keyof SupabaseClient<Database>]
  }
}) as SupabaseClient<Database>

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

// Type for realtime payload
export interface RealtimePayload<T = Record<string, unknown>> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: string[] | null;
}

// Real-time subscription helper
export const subscribeToTable = <T extends Record<string, unknown> = Record<string, unknown>>(
  table: keyof Database['public']['Tables'],
  callback: (payload: RealtimePayload<T>) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`realtime_${String(table)}`)
    .on(
      'postgres_changes' as const,
      {
        event: '*',
        schema: 'public',
        table: String(table),
        filter,
      },
      (payload: any) => callback(payload as RealtimePayload<T>)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Type definitions for database operations
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type FinancialRecord = Database['public']['Tables']['financial_records']['Row']

// Secure database service helpers with input validation and caching
export const dbService = {
  // Ingredients with caching and validation
  async getIngredients(): Promise<Ingredient[]> {
    const cacheKey = 'ingredients_active'
    const cached = cacheManager.get<Ingredient[]>(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      dbLogger.error({ err: error }, 'Database error in getIngredients')
      throw new Error('Failed to fetch ingredients')
    }

    // Cache for 5 minutes
    cacheManager.set(cacheKey, data, 300000)
    return data
  },

  async addIngredient(ingredientData: Partial<Ingredient>): Promise<Ingredient> {
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

    // Type assertion needed due to Supabase client type inference limitations
    // The sanitizedIngredient matches IngredientInsert structure but TS can't infer it
    const result = await supabase
      .from('ingredients')
      // @ts-ignore - Supabase client returns 'never' for ingredients table, using type assertion
      .insert(sanitizedIngredient)
      .select('*')
      .single()

    const { data, error } = result as { data: Ingredient | null; error: unknown }

    if (error) {
      dbLogger.error({ err: error }, 'Database error in addIngredient')
      throw new Error('Failed to add ingredient')
    }

    if (!data) {
      throw new Error('No data returned from insert')
    }

    // Clear cache
    cacheManager.clear()
    return data
  },

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
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

    // Type assertion needed due to Supabase client type inference limitations
    // The sanitizedUpdates matches IngredientUpdate structure but TS can't infer it
    const result = await supabase
      .from('ingredients')
      // @ts-ignore - Supabase client returns 'never' for ingredients table, using type assertion
      .update(sanitizedUpdates)
      .eq('id', id)
      .select('*')
      .single()

    const { data, error } = result as { data: Ingredient | null; error: unknown }

    if (error) {
      dbLogger.error({ err: error }, 'Database error in updateIngredient')
      throw new Error('Failed to update ingredient')
    }

    if (!data) {
      throw new Error('No data returned from update')
    }

    // Clear cache
    cacheManager.clear()
    return data
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
  async getFinancialRecords(startDate?: string, endDate?: string): Promise<FinancialRecord[]> {
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
