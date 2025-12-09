import { apiLogger } from '@/lib/logger'
import { RATE_LIMITS, RateLimiter } from '@/lib/services/RateLimiter'
import { BaseService } from '@/services/base'
import { InputSanitizer } from '@/utils/security/index'


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
  specialInstructions?: string
}

export interface GeneratedRecipe {
  name: string
  description?: string
  category?: string
  servings?: number
  prep_time_minutes?: number
  cook_time_minutes?: number
  total_time_minutes?: number
  difficulty?: string
  cooking_method?: string
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    notes?: string
    actualCost?: number
    costPerServing?: number
    substitutions?: Array<{
      name: string
      newCost: number
      savings: number
      confidence: number
      reason: string
      inStock: boolean
    }>
    hasSubstitutions?: boolean
    potentialSavings?: number
  }>
  instructions: string[]
  nutrition_info?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  cost_info?: {
    total_cost: number
    cost_per_serving: number
    ingredient_costs: Array<{
      name: string
      cost: number
    }>
  }
  // Post-processing properties
  totalCost?: number
  costPerServing?: number
  estimatedProfit?: number
  totalPotentialSavings?: number
  optimizedCostPerServing?: number
  costOptimizations?: string[]
  budgetCompliance?: boolean | null
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

interface AvailableIngredient {
  id: string
  name: string
  price_per_unit: number
  unit: string
  current_stock: number
}

interface IngredientSubstitution {
  name: string
  newCost: number
  savings: number
  confidence: number
  reason: string
  inStock: boolean
}

export class AiService extends BaseService {
  constructor(context: import('@/services/base').ServiceContext) {
    super(context)
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const userId = this.context.userId
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
        const { data: session, error } = await this.context.supabase
          .from('chat_sessions')
          .insert({
            user_id: userId,
            title: 'AI Assistant Chat'
          })
          .select('id')
          .single()

        if (error) throw error
        sessionId = session.id
      } else {
        // Validate existing session belongs to user
        const { data: existingSession, error: sessionError } = await this.context.supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single()

        if (sessionError || !existingSession) {
          apiLogger.warn({ userId, sessionId }, 'Invalid session ID, creating new session')
          // Create new session if provided one is invalid
          const { data: newSession, error: createError } = await this.context.supabase
            .from('chat_sessions')
            .insert({
              user_id: userId,
              title: 'AI Assistant Chat'
            })
            .select('id')
            .single()

          if (createError) throw createError
          sessionId = newSession.id
        }
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
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Terlalu banyak permintaan. Silakan tunggu beberapa saat.')
        }
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          throw new Error('Koneksi timeout. Silakan coba lagi.')
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Masalah koneksi jaringan. Periksa internet Anda.')
        }
        if (error.message.includes('API key') || error.message.includes('unauthorized')) {
          throw new Error('Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.')
        }
      }
      throw new Error('Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.')
    }
  }

  async getContext(page?: string): Promise<ContextInfo> {
    const userId = this.context.userId
    try {
      // Get recent activities
      const { data: recentActivities } = await this.context.supabase
        .from('orders')
        .select('id, order_no, total_amount, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get basic business data
      const { data: recipes } = await this.context.supabase
        .from('recipes')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true)

      const { data: ingredients } = await this.context.supabase
        .from('ingredients')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true)

      // Get count of recipes with HPP calculations
      const { data: hppData } = await this.context.supabase
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

  async deleteContext(): Promise<void> {
    const userId = this.context.userId
    try {
      // Clear user sessions (simple implementation)
      await this.context.supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      apiLogger.info({ userId }, 'AI context deleted successfully')
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to delete AI context')
      throw error
    }
  }

  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> {
    const userId = this.context.userId
    const startTime = Date.now()

    apiLogger.info({ userId, request }, 'Starting recipe generation')

    try {
      const { productName, productType, servings, preferredIngredients = [], dietaryRestrictions = [], budget, specialInstructions } = request

      if (!productName || !servings) {
        throw new Error('productName dan servings wajib diisi')
      }

      // Get available ingredients for the user (optional - for cost calculation)
      const availableIngredients = await this.getAvailableIngredients(userId) as AvailableIngredient[]
      apiLogger.info({ userId, ingredientCount: availableIngredients.length }, 'Fetched available ingredients')

      // Import prompt builder and AI service
      const { buildRecipePrompt } = await import('@/app/api/ai/generate-recipe/services/prompt-builder')
      const { callAIServiceWithRetry } = await import('@/app/api/ai/generate-recipe/services/ai-service')

      // Build the prompt
      const promptParams = {
        productName,
        productType: productType || 'other',
        servings,
        dietaryRestrictions,
        availableIngredients: availableIngredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          price_per_unit: ing.price_per_unit,
          unit: ing.unit,
          current_stock: 0 // Default value since it's not in the type
        })),
        userProvidedIngredients: preferredIngredients,
        ...(specialInstructions && { specialInstructions }),
        ...(budget !== undefined && { targetPrice: budget })
      }
      const prompt = buildRecipePrompt(promptParams)

      // Call AI service
      const aiResponse = await callAIServiceWithRetry(prompt, 3)

      // Parse the response
      let recipe: GeneratedRecipe
      try {
        recipe = JSON.parse(aiResponse) as GeneratedRecipe
      } catch {
        apiLogger.error({ aiResponse }, 'Failed to parse AI response as JSON')
        throw new Error('AI menghasilkan format yang tidak valid. Silakan coba lagi.')
      }

      // Validate required fields
      if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
        throw new Error('Resep yang dihasilkan tidak lengkap. Silakan coba lagi.')
      }

      // Post-process: Calculate accurate costs with waste factors
      const processedRecipe = await this.calculateRecipeCosts(recipe, availableIngredients, servings)
      
      // Generate ingredient substitutions and cost optimizations
      const optimizedRecipe = await this.generateIngredientSubstitutions(processedRecipe, availableIngredients, budget)

      const processingTime = Date.now() - startTime

      apiLogger.info({
        userId,
        productName,
        servings,
        ingredientCount: recipe.ingredients.length,
        processingTime
      }, 'Recipe generated successfully')

      return {
        recipe: optimizedRecipe,
        confidence: 0.85,
        processing_time: processingTime
      }
    } catch (error) {
      apiLogger.error({ error, userId, request }, 'Recipe generation failed')
      throw error
    }
  }

  async getSuggestions(): Promise<AiSuggestions> {
    const userId = this.context.userId
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
    const userId = this.context.userId
    
    // Try to use real AI first, fallback to templates
    try {
      const aiResponse = await this.callChatAI(message, businessContext)
      if (aiResponse) {
        return aiResponse
      }
    } catch (error) {
      apiLogger.warn({ error, userId }, 'AI call failed, using template response')
    }
    
    // Fallback to template responses
    return this.getTemplateResponse(message, businessContext)
  }

  private async callChatAI(message: string, businessContext: ContextInfo): Promise<string | null> {
    const apiKey = process.env['OPENROUTER_API_KEY']
    if (!apiKey) {
      apiLogger.warn('OpenRouter API key not configured for chat')
      return null
    }

    const recipeCount = businessContext.business_data.recipes_count || 0
    const ingredientCount = businessContext.business_data.ingredients_count || 0
    const calculatedRecipes = businessContext.business_data.calculated_recipes_count || 0
    const recentOrders = businessContext.recent_activities || []

    // Build context summary for AI
    const ordersSummary = recentOrders.length > 0
      ? recentOrders.slice(0, 5).map(o => `- Order ${o.order_no}: Rp ${(o.total_amount || 0).toLocaleString('id-ID')} (${o.status})`).join('\n')
      : 'Belum ada pesanan'

    // Get low stock items (items with stock below reasonable threshold)
    let lowStockInfo = ''
    try {
      // Get ingredients with low stock - use percentage-based approach
      // Items with current_stock < 20% of a reasonable baseline (100 units) are considered low
      const { data: lowStock } = await this.context.supabase
        .from('ingredients')
        .select('name, current_stock, unit')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)
        .lt('current_stock', 20)
        .order('current_stock', { ascending: true })
        .limit(5)
      
      if (lowStock && lowStock.length > 0) {
        lowStockInfo = '\n\nSTOK RENDAH (perlu diperhatikan):\n' + 
          lowStock.map(i => `- ${i.name}: ${i.current_stock ?? 0} ${i.unit}`).join('\n')
      }
    } catch {
      // Ignore stock fetch errors
    }

    const systemPrompt = `Kamu adalah Heytrack AI Assistant, asisten bisnis kuliner yang ramah, pintar, dan helpful untuk UMKM Indonesia.

KEPRIBADIAN:
- Gunakan bahasa Indonesia casual tapi profesional
- Gunakan emoji yang relevan tapi tidak berlebihan
- Berikan jawaban yang actionable dan spesifik
- Jika user bertanya tentang data bisnis, berikan insight berdasarkan context yang diberikan

DATA BISNIS USER SAAT INI:
- Total Resep: ${recipeCount} (${calculatedRecipes} sudah dihitung HPP)
- Total Bahan Baku: ${ingredientCount} jenis
- Pesanan Terbaru (5 terakhir):
${ordersSummary}${lowStockInfo}

FITUR YANG TERSEDIA DI APLIKASI:
- Bahan Baku: kelola stok, catat pembelian, set minimum stok
- Resep: buat resep manual atau generate dengan AI
- HPP Calculator: hitung harga pokok produksi
- Pesanan: catat order customer, kirim notifikasi WhatsApp
- Laporan: analisis profit, penjualan, dan inventory
- AI Recipe Generator: generate resep otomatis dengan AI

ATURAN:
1. Jawab dalam Bahasa Indonesia
2. Berikan saran yang konkret berdasarkan data user
3. Jika data user kosong, bantu user untuk setup aplikasi
4. Jika tidak yakin, arahkan user ke menu yang relevan
5. JANGAN bahas hal di luar konteks bisnis kuliner/UMKM
6. Format response dengan markdown untuk keterbacaan (bold, list, etc)
7. Response harus CONCISE, maksimal 300 kata`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
          'X-Title': 'Heytrack AI Chat'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        apiLogger.error({ error }, 'OpenRouter chat API error')
        return null
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        return null
      }

      apiLogger.info({ userId: this.context.userId, messageLength: message.length, responseLength: content.length }, 'AI chat response generated')
      return content
    } catch (error) {
      apiLogger.error({ error }, 'Failed to call chat AI')
      return null
    }
  }

  private async getTemplateResponse(message: string, businessContext: ContextInfo): Promise<string> {
    // Original template-based response logic
    const lowerMessage = message.toLowerCase()
    const recipeCount = businessContext.business_data.recipes_count || 0
    const ingredientCount = businessContext.business_data.ingredients_count || 0
    const calculatedRecipes = businessContext.business_data.calculated_recipes_count || 0
    const recentOrders = businessContext.recent_activities || []
    
    const { ORDER_STATUSES } = await import('@/lib/shared/constants')
    const deliveredStatus = ORDER_STATUSES.find(s => s.value === 'DELIVERED')?.value
    const pendingStatus = ORDER_STATUSES.find(s => s.value === 'PENDING')?.value

    // Greeting
    if (lowerMessage.match(/^(hai|halo|hi|hello|hey|selamat|pagi|siang|sore|malam)/)) {
      const greeting = this.getTimeBasedGreeting()
      return `${greeting} 👋\n\n📊 **Ringkasan bisnis kamu:**\n• ${recipeCount} resep terdaftar\n• ${ingredientCount} jenis bahan baku\n• ${recentOrders.length} pesanan terbaru\n\nAda yang bisa saya bantu hari ini? 😊`
    }

    // Business/Orders
    if (lowerMessage.match(/(pesanan|order|kondisi|bisnis|ringkasan)/i)) {
      const completedOrders = recentOrders.filter(o => o.status === deliveredStatus).length
      const pendingOrders = recentOrders.filter(o => o.status === pendingStatus).length
      const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      
      return `� **Kondisi Bisnis**\n\n**Data:**\n• Resep: ${recipeCount} (${calculatedRecipes} dengan HPP)\n• Bahan: ${ingredientCount} jenis\n• Pesanan: ${completedOrders} selesai, ${pendingOrders} pending\n• Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n\nBuka menu **Laporan** untuk detail lengkap!`
    }

    // Ingredients/Stock
    if (lowerMessage.match(/(bahan|stok|stock|ingredient)/i)) {
      return `� **Bahan Baku**\n\nTotal: ${ingredientCount} jenis\n\nBuka menu **Bahan Baku** untuk:\n• Lihat semua stok\n• Catat pembelian\n• Set minimum stok`
    }

    // Recipes
    if (lowerMessage.match(/(resep|recipe|menu)/i)) {
      return `👨‍🍳 **Resep**\n\nTotal: ${recipeCount} resep (${calculatedRecipes} dengan HPP)\n\n**Opsi:**\n• Buat resep manual\n• Generate dengan **AI Recipe Generator**\n• Hitung HPP di **HPP Calculator**`
    }

    // Default
    return `Saya kurang paham 🤔\n\nCoba tanyakan tentang:\n• Kondisi bisnis\n• Stok bahan\n• Resep dan HPP\n• Pesanan\n\nAtau ketik **"bantuan"** untuk semua topik!`
  }

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  private async saveMessage(sessionId: string, _userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const { error } = await this.context.supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content
      })

    if (error) {
      apiLogger.error({ error, sessionId }, 'Failed to save chat message')
    }
  }

  private async generateDataDrivenSuggestions(userId: string): Promise<AiSuggestions['suggestions']> {
    const suggestions: AiSuggestions['suggestions'] = []

    // Check if user has recipes
    const { count: recipeCount } = await this.context.supabase
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
    const { count: orderCount } = await this.context.supabase
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
    const { data: lowStock } = await this.context.supabase
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
      const { count: hppCount } = await this.context.supabase
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
    const { data: orders } = await this.context.supabase
      .from('orders')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!orders || orders.length === 0) {
      return 'needs_attention'
    }

    const { ORDER_STATUSES } = await import('@/lib/shared/constants')
    const deliveredStatus = ORDER_STATUSES.find(s => s.value === 'DELIVERED')?.value
    const completedOrders = orders.filter(o => o.status === deliveredStatus).length
    const completionRate = completedOrders / orders.length

    if (completionRate >= 0.9) return 'excellent'
    if (completionRate >= 0.7) return 'good'
    if (completionRate >= 0.5) return 'needs_attention'
    return 'critical'
  }

  private async generateIngredientSubstitutions(
    recipe: GeneratedRecipe,
    availableIngredients: AvailableIngredient[],
    budget?: number
  ): Promise<GeneratedRecipe> {
    // Define ingredient substitution categories
    const substitutionCategories = {
      'daging sapi': ['daging kambing', 'daging ayam', 'tempe', 'tahu'],
      'ayam': ['daging sapi', 'telur', 'tempe', 'tahu'],
      'telur': ['tempe', 'tahu', 'ayam'],
      'susu': ['santan', 'air kelapa', 'air'],
      'keju': ['telur', 'santan', 'tempe'],
      'mentega': ['minyak goreng', 'santan', 'margarine'],
      'gula pasir': ['gula merah', 'gula aren', 'madu'],
      'tepung terigu': ['tepung beras', 'tepung sagu', 'tepung tapioka'],
      'bawang bombay': ['bawang merah', 'bawang putih'],
      'cabai merah': ['cabai rawit', 'cabai hijau', 'lada'],
      'jahe': ['kunyit', 'lada', 'jahe instan'],
      'kunyit': ['jahe', 'kunyit instan', 'kunyit bubuk'],
      'kemiri': ['kacang tanah', 'almond', 'susu kental manis'],
      'serai': ['daun jeruk', 'jeruk nipis'],
      'lengkuas': ['jahe', 'kunyit'],
      'udang': ['ikan teri', 'teri medan', 'telur', 'tempe'],
      'cumi': ['ikan tongkol', 'ikan lele', 'ayam'],
      'ikan salmon': ['ikan lele', 'ikan mas', 'ayam'],
      'brokoli': ['kembang kol', 'buncis', 'wortel'],
      'bayam': ['kangkung', 'sawi', 'daun singkong'],
      'tomat': ['tomat ceri', 'saus tomat'],
      'wortel': ['labu siam', 'kentang', 'ubi jalar']
    }

    const enhancedIngredients = await Promise.all(recipe.ingredients.map(async (ingredient) => {
      const substitutions = await this.findSubstitutions(
        ingredient.name.toLowerCase(),
        ingredient,
        availableIngredients,
        substitutionCategories
      )

      return {
        ...ingredient,
        substitutions,
        hasSubstitutions: substitutions.length > 0,
        potentialSavings: substitutions.length > 0 
          ? Math.max(0, (ingredient.actualCost || 0) - Math.min(...substitutions.map(s => s.newCost)))
          : 0
      }
    }))

    // Calculate total potential savings
    const totalPotentialSavings = enhancedIngredients.reduce((sum: number, ing) => sum + ing.potentialSavings, 0)
    const optimizedCostPerServing = Math.max(0, recipe.costPerServing! - (totalPotentialSavings / recipe.servings!))

    // Generate cost optimization suggestions
    const costOptimizations = this.generateCostOptimizations(enhancedIngredients, budget, recipe.costPerServing)

    return {
      ...recipe,
      ingredients: enhancedIngredients,
      totalPotentialSavings,
      optimizedCostPerServing,
      costOptimizations,
      budgetCompliance: budget ? optimizedCostPerServing <= (budget * 0.6) : null // 60% cost target
    } as GeneratedRecipe
  }

  private async findSubstitutions(
    ingredientName: string, 
    originalIngredient: GeneratedRecipe['ingredients'][0], 
    availableIngredients: AvailableIngredient[], 
    substitutionCategories: Record<string, string[]>
  ): Promise<IngredientSubstitution[]> {
    const substitutions: Array<{
      name: string;
      newCost: number;
      savings: number;
      confidence: number;
      reason: string;
      inStock: boolean;
    }> = []

    // Find direct category matches
    const categories = substitutionCategories[ingredientName] || []
    const alternatives = availableIngredients.filter((ing) => 
      categories.includes(ing.name.toLowerCase()) && ing.name.toLowerCase() !== ingredientName
    )
          
    for (const altIngredient of alternatives) {
      if (altIngredient && altIngredient.price_per_unit < (originalIngredient.actualCost || 0) / originalIngredient.quantity) {
        const newCost = originalIngredient.quantity * altIngredient.price_per_unit * this.getWasteFactor(originalIngredient.unit)
        const savings = (originalIngredient.actualCost || 0) - newCost
        
        if (savings > 100) { // Only show meaningful savings (> Rp 100)
          substitutions.push({
            name: altIngredient.name,
            newCost: Math.round(newCost),
            savings: Math.round(savings),
            confidence: this.getConfidenceScore(ingredientName, altIngredient.name),
            reason: this.getSubstitutionReason(ingredientName, altIngredient.name, 'category'),
            inStock: altIngredient.current_stock > 0
          })
        }
      }
    }

    // Find cheaper alternatives with similar function (price-based)
    const similarIngredients = availableIngredients.filter((ing) => {
      const originalUnit = originalIngredient.unit
      const altUnit = ing.unit
      
      // Similar units comparison
      const isCompatibleUnit = 
        (originalUnit.includes('gram') && altUnit.includes('gram')) ||
        (originalUnit.includes('kg') && altUnit.includes('kg')) ||
        (originalUnit.includes('ml') && altUnit.includes('ml')) ||
        (originalUnit.includes('liter') && altUnit.includes('liter')) ||
        (originalUnit === altUnit)

      return isCompatibleUnit && 
             ing.name.toLowerCase() !== ingredientName &&
             ing.price_per_unit < (originalIngredient.actualCost || 0) / originalIngredient.quantity
    })

    // Add top 3 cheapest alternatives
    const cheapestAlternatives = similarIngredients
      .sort((a, b) => a.price_per_unit - b.price_per_unit)
      .slice(0, 3)

    for (const alt of cheapestAlternatives) {
      const newCost = originalIngredient.quantity * alt.price_per_unit * this.getWasteFactor(originalIngredient.unit)
      const savings = (originalIngredient.actualCost || 0) - newCost
      
      if (savings > 100) { // Only show meaningful savings (> Rp 100)
        substitutions.push({
          name: alt.name,
          newCost: Math.round(newCost),
          savings: Math.round(savings),
          confidence: 0.6, // Lower confidence for generic substitutions
          reason: 'Alternatif lebih murah dengan fungsi serupa',
          inStock: alt.current_stock > 0
        })
      }
    }

    return substitutions.sort((a, b) => b.savings - a.savings).slice(0, 3) // Top 3 substitutions
  }

  private getConfidenceScore(category: string, _substitution: string): number {
    // High confidence substitutions
    const highConfidence = [
      ['daging sapi', 'daging ayam'],
      ['ayam', 'daging sapi'],
      ['telur', 'tempe'],
      ['gula pasir', 'gula merah'],
      ['tepung terigu', 'tepung beras'],
      ['bawang bombay', 'bawang merah'],
      ['cabai merah', 'cabai rawit']
    ]

    // Medium confidence substitutions
    const mediumConfidence = [
      ['daging sapi', 'tempe'],
      ['susu', 'santan'],
      ['mentega', 'minyak goreng'],
      ['keju', 'telur'],
      ['udang', 'ikan teri']
    ]

    for (const [cat, _sub] of highConfidence) {
      if (category === cat && _sub === _substitution) return 0.9
    }
    
    for (const [cat, _sub] of mediumConfidence) {
      if (category === cat && _sub === _substitution) return 0.7
    }

    return 0.5 // Default confidence
  }

  private getSubstitutionReason(category: string, _substitution: string, type: 'category' | 'price'): string {
    const reasons: Record<string, string> = {
      'daging sapi': 'Protein serupa, tekstur berbeda',
      'ayam': 'Protein lebih murah, tekstur lebih lembut',
      'telur': 'Protein alternatif, tekstur berbeda',
      'susu': 'Rasa gurih alternatif',
      'keju': 'Tekstur creamy alternatif',
      'mentega': 'Lemak untuk memasak alternatif',
      'gula pasir': 'Rasa manis alternatif',
      'tepung terigu': 'Tepung alternatif untuk mengental'
    }

    if (type === 'category' && reasons[category]) {
      return reasons[category]
    }

    return 'Alternatif hemat biaya'
  }

  private generateCostOptimizations(
    ingredients: Array<{ potentialSavings: number; name: string; hasSubstitutions: boolean }>,
    budget?: number,
    currentCostPerServing?: number
  ): string[] {
    const optimizations: string[] = []

    // High potential savings ingredients
    const highSavingsIngredients = ingredients
      .filter(ing => ing.potentialSavings > 1000)
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 3)

    if (highSavingsIngredients.length > 0) {
      optimizations.push(
        `💰 Hemat hingga Rp ${highSavingsIngredients.reduce((sum, ing) => sum + ing.potentialSavings, 0).toLocaleString('id-ID')} dengan substitusi ${highSavingsIngredients.map(ing => ing.name).join(', ')}`
      )
    }

    // Budget compliance
    if (budget && currentCostPerServing) {
      const targetCost = budget * 0.6
      if (currentCostPerServing > targetCost) {
        optimizations.push(
          `🎯 Gunakan substitusi untuk mencapai target biaya 60% (Rp ${targetCost.toLocaleString('id-ID')}) dari harga jual`
        )
      }
    }

    // General optimization tips
    const ingredientsWithSubstitutions = ingredients.filter(ing => ing.hasSubstitutions)
    if (ingredientsWithSubstitutions.length > 0) {
      optimizations.push(
        `📊 ${ingredientsWithSubstitutions.length} bahan dapat diganti dengan alternatif lebih murah`
      )
    }

    return optimizations
  }

  private async calculateRecipeCosts(
    recipe: GeneratedRecipe, 
    availableIngredients: Array<{ id: string; name: string; price_per_unit: number; unit: string }>,
    servings: number
  ): Promise<GeneratedRecipe> {
    // Create ingredient price map for quick lookup
    const ingredientPriceMap = new Map<string, { price: number; unit: string }>()
    for (const ing of availableIngredients) {
      ingredientPriceMap.set(ing.name.toLowerCase(), { price: ing.price_per_unit, unit: ing.unit })
    }

    // Calculate costs for each ingredient with waste factors
    const processedIngredients = recipe.ingredients.map(ing => {
      const priceInfo = ingredientPriceMap.get(ing.name.toLowerCase())
      let actualCost = 0
      
      if (priceInfo) {
        // Apply waste factors based on ingredient type
        const wasteFactor = this.getWasteFactor(ing.unit)
        actualCost = ing.quantity * priceInfo.price * wasteFactor
      }

      return {
        ...ing,
        actualCost: Math.round(actualCost),
        costPerServing: Math.round(actualCost / servings)
      }
    })

    // Calculate total costs
    const totalCost = processedIngredients.reduce((sum, ing) => sum + (ing.actualCost || 0), 0)
    const costPerServing = Math.round(totalCost / servings)

    // Add cost information to recipe
    return {
      ...recipe,
      ingredients: processedIngredients,
      totalCost,
      costPerServing,
      estimatedProfit: costPerServing > 0 ? Math.round((costPerServing * 2.5) - costPerServing) : 0 // Assuming 60% margin target
    } as GeneratedRecipe & { 
      totalCost: number; 
      costPerServing: number; 
      estimatedProfit: number;
      ingredients: Array<{ actualCost: number; costPerServing: number } & typeof recipe.ingredients[0]>
    }
  }

  private getWasteFactor(unit: string): number {
    // Waste factors based on ingredient type
    const solidUnits = ['gram', 'kg', 'piece', 'buah', 'siung', 'batang', 'lembar']
    const liquidUnits = ['ml', 'liter', 'cup', 'gelas']
    
    if (solidUnits.includes(unit)) return 1.05 // 5% waste for solids
    if (liquidUnits.includes(unit)) return 1.02 // 2% waste for liquids
    return 1.03 // 3% default for other units
  }

  private async getAvailableIngredients(userId: string): Promise<Array<{
    id: string
    name: string
    price_per_unit: number
    unit: string
    current_stock: number
  }>> {
    const { data: ingredients } = await this.context.supabase
      .from('ingredients')
      .select('id, name, price_per_unit, unit, current_stock')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name')

    // Filter out ingredients with null price_per_unit and ensure proper types
    return (ingredients || [])
      .filter(ing => ing.price_per_unit !== null && ing.price_per_unit !== undefined)
      .map(ing => ({
        id: ing.id,
        name: ing.name,
        price_per_unit: ing.price_per_unit ?? 0,
        unit: ing.unit,
        current_stock: ing.current_stock ?? 0
      }))
  }

}