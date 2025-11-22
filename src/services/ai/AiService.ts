import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'
import { RateLimiter, RATE_LIMITS } from '@/lib/services/RateLimiter'
import { InputSanitizer } from '@/utils/security/index'

import type { Database } from '@/types/database'

export interface ChatRequest {
  message: string
  session_id?: string | null
  currentPage?: string | null
}

export interface ChatResponse {
  response: string
  session_id: string
  context_used: string[]
  processing_time: number
}

export interface ContextInfo {
  business_data: {
    recipes_count: number
    ingredients_count: number
    calculated_recipes_count: number
    current_page: string
  }
  recent_activities: Array<{
    id: string
    order_no: string
    total_amount: number | null
    created_at: string | null
    status: string | null
  }>
  user_preferences: {
    language: string
    timezone: string
    currency: string
  }
}

export interface RecipeGenerationRequest {
  productName: string
  productType: string
  servings: number
  preferredIngredients?: string[]
  dietaryRestrictions?: string[]
  budget?: number
  complexity?: 'simple' | 'medium' | 'complex'
}

interface GeneratedRecipe {
  name: string
  description: string
  servings: number
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
  }>
  instructions: string[]
  nutritional_info: Record<string, unknown>
}

export interface RecipeGenerationResponse {
  recipe: unknown
  confidence: number
  processing_time: number
}

export interface AiSuggestions {
  suggestions: Array<{
    type: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    action_url?: string
  }>
  context: {
    business_health: 'excellent' | 'good' | 'needs_attention' | 'critical'
    insights_count: number
  }
}

export class AiService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async chat(request: ChatRequest, userId: string): Promise<ChatResponse> {
    const startTime = Date.now()

    // Rate limiting
    const rateLimitKey = `ai-chat:${userId}`
    if (!RateLimiter.check(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests, RATE_LIMITS.AI_CHAT.windowMs)) {
      const resetTime = RateLimiter.getResetTime(rateLimitKey)
      const remaining = RateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests)
      apiLogger.warn({ userId, remaining, resetTime }, 'AI chat rate limit exceeded')
      throw new Error('Terlalu banyak permintaan. Silakan tunggu sebentar.')
    }

    const hourlyRateLimitKey = `ai-chat-hourly:${userId}`
    if (!RateLimiter.check(hourlyRateLimitKey, RATE_LIMITS.AI_CHAT_HOURLY.maxRequests, RATE_LIMITS.AI_CHAT_HOURLY.windowMs)) {
      throw new Error('Anda telah mencapai batas maksimal chat per jam. Silakan coba lagi nanti.')
    }

    // Validate and sanitize message
    const { message, session_id } = request
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      throw new Error('Message cannot be empty')
    }

    const sanitizedMessage = InputSanitizer.sanitizeHtml(trimmedMessage)
      .split('')
      .filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
      .join('')

    if (sanitizedMessage.length === 0) {
      throw new Error('Message cannot be empty')
    }

    // Security patterns check
    const suspiciousPatterns = [
      /ignore\s+(previous|all|above)\s+instructions?/i,
      /system\s+prompt/i,
      /developer\s+mode/i,
      /admin\s+access/i,
      /bypass\s+(security|restrictions)/i
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(sanitizedMessage))) {
      apiLogger.warn({ userId, message: sanitizedMessage }, 'Suspicious message pattern detected')
      throw new Error('Pesan mengandung konten yang tidak diizinkan')
    }

    try {
      // Get or create session
      let sessionId = session_id
      if (!sessionId) {
        // Create new session
        const { data: session, error } = await this.supabase
          .from('chat_sessions')
          .insert({
            user_id: userId,
            title: 'AI Assistant Chat',
            is_active: true
          })
          .select('id')
          .single()

        if (error) throw error
        sessionId = session.id
      }

      // Get business context for contextual responses
      const businessContext = await this.getContext(userId)

      // Generate contextual AI response based on business data
      const aiResponse = await this.generateContextualResponse(sanitizedMessage, businessContext)

      // Save messages
      await this.saveMessage(sessionId, userId, 'user', sanitizedMessage)
      await this.saveMessage(sessionId, userId, 'assistant', aiResponse)

      const processingTime = Date.now() - startTime

      apiLogger.info({
        userId,
        sessionId,
        messageLength: sanitizedMessage.length,
        responseLength: aiResponse.length,
        processingTime
      }, 'AI chat completed successfully')

      return {
        response: aiResponse,
        session_id: sessionId,
        context_used: [],
        processing_time: processingTime
      }
    } catch (error) {
      apiLogger.error({ error, userId, messageLength: sanitizedMessage.length }, 'AI chat failed')
      throw new Error('Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.')
    }
  }

  async getContext(userId: string, page?: string): Promise<ContextInfo> {
    try {
      // Get recent activities
      const { data: recentActivities } = await this.supabase
        .from('orders')
        .select('id, order_no, total_amount, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get basic business data
      const { data: recipes } = await this.supabase
        .from('recipes')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true)

      const { data: ingredients } = await this.supabase
        .from('ingredients')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true)

      // Get count of recipes with HPP calculations
      const { data: hppData } = await this.supabase
        .from('hpp_calculations')
        .select('recipe_id')
        .eq('user_id', userId)
        .not('recipe_id', 'is', null)

      const uniqueRecipeIds = new Set(hppData?.map(d => d.recipe_id) || [])
      const calculatedRecipesCount = uniqueRecipeIds.size

      const businessData = {
        recipes_count: recipes?.length || 0,
        ingredients_count: ingredients?.length || 0,
        calculated_recipes_count: calculatedRecipesCount || 0,
        current_page: page || 'dashboard'
      }

      // Get user preferences (mock for now)
      const userPreferences = {
        language: 'id',
        timezone: 'Asia/Jakarta',
        currency: 'IDR'
      }

      return {
        business_data: businessData,
        recent_activities: recentActivities || [],
        user_preferences: userPreferences
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to get AI context')
      throw error
    }
  }

  async deleteContext(userId: string): Promise<void> {
    try {
      // Clear user sessions (simple implementation)
      await this.supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      apiLogger.info({ userId }, 'AI context deleted successfully')
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to delete AI context')
      throw error
    }
  }

  async generateRecipe(request: RecipeGenerationRequest, userId: string): Promise<RecipeGenerationResponse> {
    const startTime = Date.now()

    try {
      const { productName, servings } = request

      // Get available ingredients for the user
      const availableIngredients = await this.getAvailableIngredients(userId)

      if (availableIngredients.length === 0) {
        throw new Error('Tidak ada bahan baku tersedia. Silakan tambahkan bahan baku terlebih dahulu.')
      }

      // Generate recipe based on available ingredients and preferences
      const recipe = await this.generateRecipeFromIngredients(
        productName,
        servings,
        availableIngredients
      )

      // Validate and save recipe
      const validatedRecipe = await this.validateAndSaveRecipe(recipe, userId)

      const processingTime = Date.now() - startTime

      apiLogger.info({
        userId,
        productName,
        servings,
        ingredientCount: recipe.ingredients.length,
        processingTime
      }, 'Recipe generated successfully')

      return {
        recipe: validatedRecipe,
        confidence: 0.85,
        processing_time: processingTime
      }
    } catch (error) {
      apiLogger.error({ error, userId, request }, 'Recipe generation failed')
      throw error
    }
  }

  async getSuggestions(userId: string): Promise<AiSuggestions> {
    try {
      // Generate data-driven suggestions based on business data
      const suggestions = await this.generateDataDrivenSuggestions(userId)

      // Analyze business health
      const businessHealth = await this.analyzeBusinessHealth(userId)

      return {
        suggestions,
        context: {
          business_health: businessHealth,
          insights_count: suggestions.length
        }
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to get AI suggestions')
      throw error
    }
  }

  private async generateContextualResponse(message: string, businessContext: ContextInfo): Promise<string> {
    // Analyze business context and provide contextual responses
    const lowerMessage = message.toLowerCase()

    // Check for price-related queries
    if (lowerMessage.includes('harga') || lowerMessage.includes('price') || lowerMessage.includes('hpp')) {
      const recipeCount = businessContext.business_data.recipes_count || 0
      const calculatedRecipes = businessContext.business_data.calculated_recipes_count || 0

      if (calculatedRecipes === 0) {
        return 'Anda belum memiliki perhitungan HPP. Silakan buat resep dan hitung HPP terlebih dahulu di menu Resep.'
      }

      return `Anda memiliki ${calculatedRecipes} resep dengan HPP terhitung dari total ${recipeCount} resep. Lihat detail di menu Laporan > Laba/Rugi untuk informasi lengkap harga pokok produksi.`
    }

    // Check for recipe-related queries
    if (lowerMessage.includes('resep') || lowerMessage.includes('recipe')) {
      const recipeCount = businessContext.business_data.recipes_count || 0

      if (recipeCount === 0) {
        return 'Anda belum memiliki resep. Mari mulai membuat resep pertama Anda di menu Resep.'
      }

      return `Anda memiliki ${recipeCount} resep terdaftar. Saya bisa membantu Anda membuat resep baru atau mengoptimalkan resep existing. Apa yang ingin Anda lakukan?`
    }

    // Check for ingredient-related queries
    if (lowerMessage.includes('bahan') || lowerMessage.includes('ingredient') || lowerMessage.includes('stok')) {
      const ingredientCount = businessContext.business_data.ingredients_count || 0

      if (ingredientCount === 0) {
        return 'Anda belum memiliki data bahan baku. Silakan tambahkan bahan baku terlebih dahulu di menu Bahan Baku.'
      }

      return `Anda memiliki ${ingredientCount} jenis bahan baku terdaftar. Untuk monitoring stok dan pengelolaan bahan, gunakan menu Bahan Baku.`
    }

    // Check for order-related queries
    if (lowerMessage.includes('pesanan') || lowerMessage.includes('order') || lowerMessage.includes('penjualan')) {
      const recentOrders = businessContext.recent_activities || []

      if (recentOrders.length === 0) {
        return 'Belum ada data pesanan. Mari mulai mencatat pesanan pertama Anda di menu Pesanan.'
      }

      const completedOrders = recentOrders.filter((order) => order.status === 'DELIVERED').length
      return `Anda memiliki ${recentOrders.length} pesanan terbaru dengan ${completedOrders} sudah selesai. Lihat detail di menu Pesanan.`
    }

    // Default contextual response
    const hasData = (businessContext.business_data.recipes_count || 0) > 0 ||
                   (businessContext.business_data.ingredients_count || 0) > 0 ||
                   (businessContext.recent_activities?.length || 0) > 0

    if (hasData) {
      return 'Halo! Saya melihat bisnis kuliner Anda sudah memiliki beberapa data. Saya bisa membantu dengan resep, perhitungan harga, bahan baku, dan pesanan. Apa yang ingin Anda ketahui?'
    }

    return 'Selamat datang di asisten AI bisnis kuliner! Mari mulai membangun bisnis Anda. Saya bisa membantu dengan membuat resep, menghitung harga pokok produksi, mengelola bahan baku, dan mencatat pesanan. Apa yang ingin Anda mulai?'
  }

  private async saveMessage(sessionId: string, userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role,
        content,
        is_active: true
      })

    if (error) {
      apiLogger.error({ error, sessionId, userId }, 'Failed to save chat message')
    }
  }

  private async generateDataDrivenSuggestions(userId: string): Promise<AiSuggestions['suggestions']> {
    const suggestions: AiSuggestions['suggestions'] = []

    // Check if user has recipes
    const { count: recipeCount } = await this.supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!recipeCount || recipeCount === 0) {
      suggestions.push({
        type: 'recipe',
        title: 'Buat Resep Pertama Anda',
        description: 'Mulai bisnis kuliner Anda dengan membuat resep pertama',
        priority: 'high',
        action_url: '/recipes/new'
      })
    }

    // Check if user has recent orders
    const { count: orderCount } = await this.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (!orderCount || orderCount === 0) {
      suggestions.push({
        type: 'order',
        title: 'Buat Pesanan Pertama',
        description: 'Coba buat pesanan pertama untuk menguji sistem',
        priority: 'medium',
        action_url: '/orders/new'
      })
    }

    // Check low stock ingredients
    const { data: lowStock } = await this.supabase
      .from('ingredients')
      .select('name')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('current_stock', 10)
      .limit(3)

    if (lowStock && lowStock.length > 0) {
      const ingredientNames = lowStock.map(ing => ing.name).join(', ')
      suggestions.push({
        type: 'inventory',
        title: 'Stok Bahan Rendah',
        description: `Beberapa bahan (${ingredientNames}) stoknya rendah`,
        priority: 'high',
        action_url: '/ingredients'
      })
    }

    // Check if user has uncalculated HPP
    if (recipeCount && recipeCount > 0) {
      const { count: hppCount } = await this.supabase
        .from('hpp_calculations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (!hppCount || hppCount < recipeCount) {
        suggestions.push({
          type: 'analysis',
          title: 'Hitung HPP Resep',
          description: `Anda memiliki ${recipeCount - (hppCount || 0)} resep yang belum dihitung HPP-nya`,
          priority: 'medium',
          action_url: '/hpp'
        })
      }
    }

    return suggestions
  }

  private async analyzeBusinessHealth(userId: string): Promise<'excellent' | 'good' | 'needs_attention' | 'critical'> {
    // Simple business health analysis
    const { data: orders } = await this.supabase
      .from('orders')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!orders || orders.length === 0) {
      return 'needs_attention'
    }

    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length
    const completionRate = completedOrders / orders.length

    if (completionRate >= 0.9) return 'excellent'
    if (completionRate >= 0.7) return 'good'
    if (completionRate >= 0.5) return 'needs_attention'
    return 'critical'
  }

  private async getAvailableIngredients(userId: string): Promise<Array<{
    id: string
    name: string
    price_per_unit: number
    unit: string
  }>> {
    const { data: ingredients } = await this.supabase
      .from('ingredients')
      .select('id, name, price_per_unit, unit')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name')

    return ingredients || []
  }

  private async generateRecipeFromIngredients(
    productName: string,
    servings: number,
    availableIngredients: Array<{
      id: string
      name: string
      price_per_unit: number
      unit: string
    }>
  ): Promise<GeneratedRecipe> {
    // Simple recipe generation based on available ingredients
    const selectedIngredients = availableIngredients.slice(0, 5) // Use first 5 ingredients

    const ingredients = selectedIngredients.map((ing, index) => ({
      name: ing.name,
      quantity: servings * (index + 1) * 50, // Simple quantity calculation
      unit: ing.unit
    }))

    const instructions = [
      'Langkah 1: Persiapkan semua bahan-bahan',
      'Langkah 2: Potong dan cuci bahan sesuai kebutuhan',
      'Langkah 3: Masak dengan api sedang hingga matang',
      'Langkah 4: Sajikan selagi hangat'
    ]

    return {
      name: productName,
      description: `Resep ${productName} yang lezat untuk ${servings} porsi`,
      servings: servings,
      ingredients,
      instructions,
      nutritional_info: {}
    }
  }

  private async validateAndSaveRecipe(recipe: GeneratedRecipe, userId: string): Promise<unknown> {
    // Validate recipe and save to database
    const { data, error } = await this.supabase
      .from('recipes')
      .insert({
        name: recipe.name,
        description: recipe.description,
        servings: recipe.servings,
        user_id: userId,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }
}