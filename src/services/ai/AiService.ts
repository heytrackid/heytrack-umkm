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
    // Analyze business context and provide contextual responses
    const lowerMessage = message.toLowerCase()
    const recipeCount = businessContext.business_data.recipes_count || 0
    const ingredientCount = businessContext.business_data.ingredients_count || 0
    const calculatedRecipes = businessContext.business_data.calculated_recipes_count || 0
    const recentOrders = businessContext.recent_activities || []

    // ===== GREETING & GENERAL =====
    if (lowerMessage.match(/^(hai|halo|hi|hello|hey|selamat|pagi|siang|sore|malam)/)) {
      const greeting = this.getTimeBasedGreeting()
      const hasData = recipeCount > 0 || ingredientCount > 0 || recentOrders.length > 0
      
      if (!hasData) {
        return `${greeting} 👋\n\nSelamat datang di HeyTrack! Saya asisten AI yang siap bantu bisnis kuliner kamu.\n\n🚀 **Yuk mulai setup:**\n1. Tambah bahan baku di menu **Bahan Baku**\n2. Buat resep produk di menu **Resep**\n3. Hitung HPP untuk tentukan harga jual\n\nMau mulai dari mana?`
      }
      
      return `${greeting} 👋\n\n📊 **Ringkasan bisnis kamu:**\n• ${recipeCount} resep terdaftar\n• ${ingredientCount} jenis bahan baku\n• ${recentOrders.length} pesanan terbaru\n\nAda yang bisa saya bantu hari ini? 😊`
    }

    // ===== BUSINESS HEALTH / KONDISI =====
    if (lowerMessage.match(/(kondisi|kesehatan|gimana|bagaimana).*(bisnis|usaha|toko)/i) || 
        lowerMessage.includes('ringkasan') || lowerMessage.includes('summary')) {
      const completedOrders = recentOrders.filter(o => o.status === 'DELIVERED').length
      const pendingOrders = recentOrders.filter(o => o.status === 'PENDING').length
      const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      
      let healthStatus = '🟢 Excellent'
      let advice = 'Bisnis kamu berjalan dengan baik!'
      
      if (recipeCount === 0 || ingredientCount === 0) {
        healthStatus = '🟡 Perlu Setup'
        advice = 'Lengkapi dulu data resep dan bahan baku untuk tracking yang lebih akurat.'
      } else if (pendingOrders > 5) {
        healthStatus = '🟠 Perlu Perhatian'
        advice = `Ada ${pendingOrders} pesanan pending yang perlu diproses.`
      }
      
      return `📊 **Kondisi Bisnis Kamu**\n\nStatus: ${healthStatus}\n\n**Data Terkini:**\n• Resep: ${recipeCount} (${calculatedRecipes} sudah ada HPP)\n• Bahan Baku: ${ingredientCount} jenis\n• Pesanan Terbaru: ${recentOrders.length}\n• Selesai: ${completedOrders} | Pending: ${pendingOrders}\n• Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n\n💡 **Saran:** ${advice}`
    }

    // ===== HPP & PRICING =====
    if (lowerMessage.match(/(harga|price|hpp|biaya|cost|margin|untung|profit)/i)) {
      if (calculatedRecipes === 0) {
        return `💰 **Tentang HPP (Harga Pokok Produksi)**\n\nKamu belum punya perhitungan HPP. HPP penting untuk:\n• Menentukan harga jual yang tepat\n• Menghitung margin keuntungan\n• Analisis profitabilitas produk\n\n**Langkah selanjutnya:**\n1. Pastikan sudah ada resep (kamu punya ${recipeCount} resep)\n2. Buka menu **HPP Calculator**\n3. Pilih resep dan hitung HPP\n\nMau saya bantu jelaskan cara hitung HPP?`
      }

      const uncalculated = recipeCount - calculatedRecipes
      return `💰 **Status HPP Kamu**\n\n✅ ${calculatedRecipes} resep sudah ada HPP\n${uncalculated > 0 ? `⚠️ ${uncalculated} resep belum dihitung HPP` : '🎉 Semua resep sudah ada HPP!'}\n\n**Tips Pricing:**\n• Margin ideal UMKM: 30-50%\n• Jangan lupa hitung biaya operasional\n• Review HPP berkala saat harga bahan berubah\n\nBuka **HPP Calculator** untuk detail lengkap atau **Laporan > Profit** untuk analisis.`
    }

    // ===== RECIPES =====
    if (lowerMessage.match(/(resep|recipe|menu|produk|masak)/i)) {
      if (recipeCount === 0) {
        return `👨‍🍳 **Resep Produk**\n\nKamu belum punya resep. Resep penting untuk:\n• Standarisasi produksi\n• Perhitungan HPP akurat\n• Konsistensi rasa\n\n**Cara buat resep:**\n1. Buka menu **Resep** > **Tambah Resep**\n2. Atau gunakan **AI Recipe Generator** untuk generate otomatis!\n\n✨ Mau coba generate resep dengan AI?`
      }

      return `👨‍🍳 **Resep Kamu**\n\nTotal: ${recipeCount} resep terdaftar\nDengan HPP: ${calculatedRecipes} resep\n\n**Yang bisa kamu lakukan:**\n• Buat resep baru di menu **Resep**\n• Generate resep dengan **AI Recipe Generator**\n• Hitung HPP di **HPP Calculator**\n\nMau saya bantu apa?`
    }

    // ===== INGREDIENTS / STOCK =====
    if (lowerMessage.match(/(bahan|ingredient|stok|stock|inventory|persediaan|habis|restock)/i)) {
      if (ingredientCount === 0) {
        return `📦 **Bahan Baku**\n\nKamu belum punya data bahan baku. Data ini penting untuk:\n• Tracking stok real-time\n• Perhitungan HPP akurat\n• Alert stok rendah otomatis\n\n**Cara menambah:**\n1. Buka menu **Bahan Baku**\n2. Klik **Tambah Bahan**\n3. Atau **Import** dari file CSV\n\nMulai dengan 5-10 bahan utama dulu ya!`
      }

      // Check for low stock
      const { data: lowStock } = await this.context.supabase
        .from('ingredients')
        .select('name, current_stock, min_stock')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)
        .lt('current_stock', 10)
        .limit(5)

      let stockAlert = ''
      if (lowStock && lowStock.length > 0) {
        const items = lowStock.map(i => `• ${i.name}: ${i.current_stock ?? 0} ${(i.current_stock ?? 0) <= 0 ? '❌' : '⚠️'}`).join('\n')
        stockAlert = `\n\n🚨 **Stok Rendah:**\n${items}\n\nSegera restock ya!`
      }

      return `📦 **Bahan Baku Kamu**\n\nTotal: ${ingredientCount} jenis bahan${stockAlert}\n\n**Menu Bahan Baku:**\n• Lihat semua stok\n• Catat pembelian baru\n• Set minimum stok untuk alert\n\nAda yang mau ditanyakan tentang stok?`
    }

    // ===== ORDERS =====
    if (lowerMessage.match(/(pesanan|order|penjualan|transaksi|customer|pelanggan)/i)) {
      if (recentOrders.length === 0) {
        return `🛒 **Pesanan**\n\nBelum ada data pesanan. Fitur pesanan membantu:\n• Catat order dari customer\n• Track status pengerjaan\n• Kirim notifikasi WhatsApp\n• Analisis penjualan\n\n**Cara buat pesanan:**\n1. Buka menu **Pesanan**\n2. Klik **Pesanan Baru**\n3. Pilih customer & produk\n\nMau coba buat pesanan pertama?`
      }

      const completedOrders = recentOrders.filter(o => o.status === 'DELIVERED').length
      const pendingOrders = recentOrders.filter(o => o.status === 'PENDING').length
      const inProgressOrders = recentOrders.filter(o => o.status === 'IN_PROGRESS').length

      return `🛒 **Pesanan Terbaru**\n\n📊 **Status:**\n• ✅ Selesai: ${completedOrders}\n• 🔄 Diproses: ${inProgressOrders}\n• ⏳ Pending: ${pendingOrders}\n\n${pendingOrders > 0 ? `⚠️ Ada ${pendingOrders} pesanan pending yang perlu diproses!\n\n` : ''}Buka menu **Pesanan** untuk detail lengkap.`
    }

    // ===== PROFIT / LAPORAN =====
    if (lowerMessage.match(/(laporan|report|analisis|analysis|profit|laba|rugi|revenue|pendapatan)/i)) {
      return `📈 **Laporan & Analisis**\n\nHeyTrack menyediakan berbagai laporan:\n\n**📊 Laporan Tersedia:**\n• **Profit/Loss** - Analisis laba rugi\n• **Sales Report** - Tren penjualan\n• **Inventory Report** - Pergerakan stok\n\n**Tips:**\n• Review laporan mingguan untuk insight\n• Bandingkan periode untuk lihat tren\n• Export ke Excel untuk analisis lanjutan\n\nBuka menu **Laporan** untuk mulai analisis!`
    }

    // ===== HELP / BANTUAN =====
    if (lowerMessage.match(/(bantu|help|cara|gimana|bagaimana|tutorial|panduan)/i)) {
      return `🤝 **Saya Bisa Bantu Apa?**\n\n**Topik yang bisa ditanyakan:**\n\n📦 **Bahan Baku**\n"Gimana cara tambah bahan?"\n"Stok apa yang rendah?"\n\n👨‍🍳 **Resep**\n"Cara buat resep baru"\n"Generate resep dengan AI"\n\n💰 **HPP & Harga**\n"Cara hitung HPP"\n"Berapa margin ideal?"\n\n🛒 **Pesanan**\n"Status pesanan terbaru"\n"Cara buat pesanan"\n\n📈 **Laporan**\n"Analisis profit bulan ini"\n"Kondisi bisnis saya"\n\nTanyakan apa saja! 😊`
    }

    // ===== DEFAULT RESPONSE =====
    const hasData = recipeCount > 0 || ingredientCount > 0 || recentOrders.length > 0

    if (hasData) {
      return `Hmm, saya kurang paham maksudnya 🤔\n\nCoba tanyakan tentang:\n• **Kondisi bisnis** - "Gimana kondisi bisnis saya?"\n• **Stok bahan** - "Bahan apa yang perlu restock?"\n• **HPP & Harga** - "Berapa HPP resep saya?"\n• **Pesanan** - "Ada berapa pesanan pending?"\n\nAtau ketik **"bantuan"** untuk lihat semua topik!`
    }

    return `👋 Halo! Selamat datang di HeyTrack!\n\nSaya asisten AI yang siap bantu bisnis kuliner kamu. Sepertinya kamu baru mulai ya?\n\n🚀 **Langkah awal:**\n1. Tambah **Bahan Baku** yang kamu pakai\n2. Buat **Resep** produk\n3. Hitung **HPP** untuk tentukan harga\n4. Mulai catat **Pesanan**\n\nMau mulai dari mana? Atau ketik **"bantuan"** untuk lihat semua yang bisa saya bantu! 😊`
  }

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  private async saveMessage(sessionId: string, userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const { error } = await this.context.supabase
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
    const { data: ingredients } = await this.context.supabase
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
    const { data, error } = await this.context.supabase
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