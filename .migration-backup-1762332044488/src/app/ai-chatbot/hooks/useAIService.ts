import { apiLogger } from '@/lib/logger'
import { generateAIInsights } from '@/lib/ai'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

/**
 * Fetch business context dari database
 */
async function fetchBusinessContext(userId: string) {
  try {
    // Fetch orders data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (ordersError) { 
      throw ordersError 
    }

    // Fetch ingredients dengan stok rendah
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, unit, minimum_stock')
      .eq('user_id', userId)
      .limit(10)

    if (ingredientsError) { 
      apiLogger.warn({ error: ingredientsError }, 'Failed to fetch ingredients') 
    }

    // Fetch top recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name, category, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(10)

    if (recipesError) { 
      apiLogger.warn({ error: recipesError }, 'Failed to fetch recipes') 
    }

    // Type assertions untuk avoid TS errors
    interface OrderData { id: string; status: string; total_amount: number; created_at: string }
    interface IngredientData { id: string; name: string; current_stock: number; unit: string; minimum_stock: number }
    interface RecipeData { id: string; name: string; category: string; is_active: boolean }

    const typedOrders = (orders ?? []) as OrderData[]
    const typedIngredients = (ingredients ?? []) as IngredientData[]
    const typedRecipes = (recipes ?? []) as RecipeData[]

    // Calculate business metrics
    const totalOrders = typedOrders.length
    const pendingOrders = typedOrders.filter(o => o.status === 'PENDING').length
    const totalRevenue = typedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const criticalStock = typedIngredients.filter(i => i.current_stock < i.minimum_stock)

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        revenue: totalRevenue,
        recent: typedOrders.slice(0, 5)
      },
      inventory: {
        critical: criticalStock.map(i => ({
          name: i.name,
          stock: i.current_stock,
          unit: i.unit,
          minimum: i.minimum_stock
        })),
        total: typedIngredients.length
      },
      recipes: {
        total: typedRecipes.length,
        active: typedRecipes.filter(r => r.is_active).length,
        categories: [...new Set(typedRecipes.map(r => r.category))]
      }
    }
  } catch (error) {
    apiLogger.error({ error, userId }, 'Error fetching business context')
    return null
  }
}

export function useAIService() {
  const generateSuggestions = (intent: string): string[] => {
    switch (intent) {
      case 'check_inventory':
        return [
          "Berapa stok tepung terigu yang tersisa?",
          "Bahan apa saja yang perlu direstock?",
          "Tips mengoptimalkan stok bahan baku"
        ]
      case 'analyze_hpp':
        return [
          "Bagaimana cara menghitung HPP brownies?",
          "Faktor apa yang mempengaruhi HPP?",
          "Tips menurunkan biaya produksi"
        ]
      case 'analyze_profit':
        return [
          "Produk mana yang paling menguntungkan?",
          "Bagaimana cara meningkatkan profit margin?",
          "Analisis keuntungan bulan ini"
        ]
      case 'recipe_query':
        return [
          "Resep apa yang cocok untuk hari ini?",
          "Bagaimana optimasi resep untuk profit?",
          "Tips manajemen resep yang efisien"
        ]
      case 'pricing_strategy':
        return [
          "Berapa harga jual yang optimal?",
          "Strategi pricing untuk produk baru",
          "Cara menentukan margin yang sehat"
        ]
      case 'marketing_strategy':
        return [
          "Tips marketing untuk UMKM kuliner",
          "Strategi promosi yang efektif",
          "Cara meningkatkan penjualan online"
        ]
      default:
        return [
          "Berapa stok bahan baku yang tersedia?",
          "Rekomendasikan resep untuk hari ini", 
          "Analisis profit margin bulan ini",
          "Status pesanan terbaru"
        ]
    }
  }

  const processAIQuery = async (query: string) => {
    // Get current user ID for database filtering
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    if (!userId) {
      apiLogger.warn('AI Chatbot accessed without authentication')
      return {
        message: '❌ **Error:** Anda perlu login untuk menggunakan AI Chatbot',
        suggestions: ['Login terlebih dahulu', 'Refresh halaman']
      }
    }

    apiLogger.info({ userId, query: query.substring(0, 100) }, 'Processing AI chatbot query')

    // Fetch business context dari database
    const businessContext = await fetchBusinessContext(userId)

    try {
      // Use available NLP processing
      // Get business insights dengan real data dari database
      const aiQueryParams = {
        query,
        businessContext: businessContext ?? undefined
      }
      const insights = await generateAIInsights(aiQueryParams as Record<string, unknown>)

      // Generate contextual suggestions based on query type
      const lowerQuery = query.toLowerCase()
      let intentType = 'default'
      
      if (lowerQuery.includes('stok') || lowerQuery.includes('bahan')) {
        intentType = 'check_inventory'
      } else if (lowerQuery.includes('pesanan') || lowerQuery.includes('order')) {
        intentType = 'analyze_profit'
      } else if (lowerQuery.includes('resep') || lowerQuery.includes('recipe')) {
        intentType = 'recipe_query'
      }
      
      const suggestions = generateSuggestions(intentType)

      apiLogger.info({ 
        userId, 
        intent: intentType, 
        responseLength: insights.length
      }, 'AI query processed successfully')

      return {
        message: insights,
        suggestions,
        data: { businessContext } // Include context untuk data visualization
      }
    } catch (error: unknown) {
      apiLogger.error({ error, userId, query }, 'Error processing AI query')

      // Enhanced fallback responses with better error handling
      const lowerQuery = query.toLowerCase()

      // Get business context for fallback responses
      const businessContext = await fetchBusinessContext(userId)

      // Check if it's an API configuration issue
      if (error instanceof Error && error.message.includes('API key')) {
        return {
          message: '⚠️ **Konfigurasi AI Service**\n\nLayanan AI sedang tidak tersedia. Silakan hubungi administrator untuk mengaktifkan fitur AI chatbot.',
          suggestions: [
            'Refresh halaman dan coba lagi',
            'Gunakan fitur manual di dashboard'
          ]
      }
    }
      if (lowerQuery.includes('stok') || lowerQuery.includes('bahan') || lowerQuery.includes('inventory')) {
        const criticalStock = businessContext?.inventory?.critical ?? []
        const totalStock = businessContext?.inventory?.total ?? 0

        let stockMessage = '📦 **Manajemen Stok Bahan Baku**\n\n'

        if (criticalStock.length > 0) {
          stockMessage += `⚠️ **PERINGATAN STOK KRITIS!**\n\nAda ${criticalStock.length} bahan yang stoknya di bawah minimum:\n\n`
          criticalStock.forEach(item => {
            stockMessage += `• ${item.name}: ${item.stock} ${item.unit} (minimum: ${item.minimum} ${item.unit})\n`
          })
          stockMessage += '\n**Rekomendasi Segera:**\n• Buat purchase order untuk bahan kritikal\n• Hubungi supplier untuk pengiriman darurat\n• Pertimbangkan alternatif bahan sementara\n\n'
        }

        stockMessage += `**Status Stok Saat Ini:**\n• Total bahan terdaftar: ${totalStock}\n• Bahan stok kritikal: ${criticalStock.length}\n\n**Tips Manajemen Stok:**\n• **Monitoring Real-time** - Pantau stok di halaman Inventory\n• **Alert Otomatis** - Set minimum stock untuk notifikasi\n• **Tracking Penggunaan** - Catat konsumsi per produksi\n• **Supplier Management** - Kelola data supplier dan lead time\n\n💡 **Tips**: Gunakan fitur reorder point untuk menghindari stockout.`

        return {
          message: stockMessage,
          suggestions: generateSuggestions('check_inventory'),
          data: { businessContext }
        }
      }

      if (lowerQuery.includes('resep') || lowerQuery.includes('recipe') || lowerQuery.includes('produksi')) {
        const totalRecipes = businessContext?.recipes?.total ?? 0
        const activeRecipes = businessContext?.recipes?.active ?? 0
        const categories = businessContext?.recipes?.categories ?? []

        let recipeMessage = '🍳 **Manajemen Resep & Produksi**\n\n'

        recipeMessage += `**Status Resep Saat Ini:**\n• Total resep: ${totalRecipes}\n• Resep aktif: ${activeRecipes}\n• Kategori: ${categories.length > 0 ? categories.join(', ') : 'Belum dikategorikan'}\n\n`

        recipeMessage += '**Optimasi Resep untuk Profit Maksimal:**\n\n• **Cost Analysis** - Hitung HPP setiap resep\n• **Ingredient Optimization** - Sesuaikan komposisi bahan\n• **Batch Planning** - Rencanakan produksi efisien\n• **Quality Control** - Standardisasi proses produksi\n\n💡 **Tips**: Fokus pada resep dengan margin tertinggi dan sesuaikan dengan stok bahan yang tersedia.'

        return {
          message: recipeMessage,
          suggestions: generateSuggestions('recipe_query'),
          data: { businessContext }
        }
      }

      if (lowerQuery.includes('hpp') || lowerQuery.includes('biaya') || lowerQuery.includes('cost')) {
        return {
          message: '💰 **Analisis HPP (Harga Pokok Produksi)**\n\nKelola biaya produksi dengan tepat:\n\n• **Ingredient Costing** - Hitung biaya bahan per unit\n• **Operational Costs** - Alokasi biaya operasional\n• **Margin Analysis** - Tentukan markup yang sehat\n• **Price Optimization** - Sesuaikan harga jual\n\n💡 **Formula**: HPP + Margin = Harga Jual Optimal',
          suggestions: generateSuggestions('analyze_hpp')
        }
      }

      if (lowerQuery.includes('profit') || lowerQuery.includes('untung') || lowerQuery.includes('laba')) {
        const totalOrders = businessContext?.orders?.total ?? 0
        const pendingOrders = businessContext?.orders?.pending ?? 0
        const totalRevenue = businessContext?.orders?.revenue ?? 0

        let profitMessage = '📈 **Analisis Profitabilitas**\n\n'

        profitMessage += `**Status Bisnis Saat Ini:**\n• Total pesanan: ${totalOrders}\n• Pesanan pending: ${pendingOrders}\n• Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n• Rata-rata per pesanan: Rp ${totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString('id-ID') : 0}\n\n`

        profitMessage += '**Strategi Maximalkan Keuntungan:**\n\n• **Margin Tracking** - Monitor profit per produk\n• **Cost Efficiency** - Identifikasi area penghematan\n• **Revenue Optimization** - Fokus produk high-margin\n• **Trend Analysis** - Analisis performa bulanan\n\n💡 **Target**: Margin 35-50% untuk sustainability.'

        return {
          message: profitMessage,
          suggestions: generateSuggestions('analyze_profit'),
          data: { businessContext }
        }
      }

      if (lowerQuery.includes('harga') || lowerQuery.includes('pricing') || lowerQuery.includes('price')) {
        const totalRevenue = businessContext?.orders?.revenue ?? 0
        const totalOrders = businessContext?.orders?.total ?? 0
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        let pricingMessage = '🏷️ **Strategi Pricing**\n\n'

        pricingMessage += `**Data Pricing Saat Ini:**\n• Rata-rata nilai pesanan: Rp ${avgOrderValue.toLocaleString('id-ID')}\n• Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n\n`

        pricingMessage += '**Tentukan Harga yang Kompetitif:**\n\n• **Market Research** - Analisis harga kompetitor\n• **Cost-Plus Pricing** - HPP + margin target\n• **Value-Based Pricing** - Sesuai perceived value\n• **Dynamic Pricing** - Sesuaikan dengan demand\n\n💡 **Tips**: Review harga secara berkala sesuai market dan sesuaikan dengan rata-rata nilai pesanan saat ini.'

        return {
          message: pricingMessage,
          suggestions: generateSuggestions('pricing_strategy'),
          data: { businessContext }
        }
      }

      if (lowerQuery.includes('pesanan') || lowerQuery.includes('order') || lowerQuery.includes('customer')) {
        const totalOrders = businessContext?.orders?.total ?? 0
        const pendingOrders = businessContext?.orders?.pending ?? 0
        const totalRevenue = businessContext?.orders?.revenue ?? 0

        let orderMessage = '📋 **Manajemen Pesanan**\n\n'

        if (pendingOrders > 0) {
          orderMessage += `⚠️ **PERHATIAN**: Ada ${pendingOrders} pesanan yang masih pending!\n\n`
        }

        orderMessage += `**Status Pesanan Saat Ini:**\n• Total pesanan: ${totalOrders}\n• Pesanan pending: ${pendingOrders}\n• Pesanan selesai: ${totalOrders - pendingOrders}\n• Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n\n`

        orderMessage += '**Optimasi Manajemen Pesanan:**\n\n• **Order Tracking** - Monitor status pesanan real-time\n• **Priority Management** - Prioritaskan pesanan urgent\n• **Customer Communication** - Update status ke customer\n• **Workflow Optimization** - Streamline proses produksi\n\n💡 **Tips**: Fokus pada pesanan pending untuk meningkatkan customer satisfaction.'

        return {
          message: orderMessage,
          suggestions: generateSuggestions('analyze_profit'),
          data: { businessContext }
        }
      }

      if (lowerQuery.includes('marketing') || lowerQuery.includes('promosi') || lowerQuery.includes('jualan')) {
        const totalOrders = businessContext?.orders?.total ?? 0
        const totalRevenue = businessContext?.orders?.revenue ?? 0

        let marketingMessage = '📢 **Strategi Marketing UMKM**\n\n'

        marketingMessage += `**Data Penjualan Saat Ini:**\n• Total pesanan: ${totalOrders}\n• Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n\n`

        marketingMessage += '**Tingkatkan Penjualan dengan:**\n\n• **Digital Marketing** - Social media & online presence\n• **Customer Retention** - Program loyalitas pelanggan\n• **Product Positioning** - Highlight unique selling point\n• **Seasonal Campaigns** - Promo sesuai momen\n\n💡 **Focus**: Build brand awareness & customer loyalty berdasarkan performa penjualan saat ini.'

        return {
          message: marketingMessage,
          suggestions: generateSuggestions('marketing_strategy'),
          data: { businessContext }
        }
      }

      // Default comprehensive fallback with real business data
      const totalOrders = businessContext?.orders?.total ?? 0
      const pendingOrders = businessContext?.orders?.pending ?? 0
      const totalRevenue = businessContext?.orders?.revenue ?? 0
      const criticalStock = businessContext?.inventory?.critical?.length ?? 0
      const totalRecipes = businessContext?.recipes?.total ?? 0

      let defaultMessage = '🤖 **Asisten AI HeyTrack**\n\n'

      // Add business overview if data available
      if (totalOrders > 0 || totalRevenue > 0 || criticalStock > 0) {
        defaultMessage += '**📊 Quick Business Overview:**\n'
        if (totalOrders > 0) {
          defaultMessage += `• Total Pesanan: ${totalOrders}\n`
        }
        if (pendingOrders > 0) {
          defaultMessage += `• Pending Orders: ${pendingOrders}\n`
        }
        if (totalRevenue > 0) {
          defaultMessage += `• Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}\n`
        }
        if (criticalStock > 0) {
          defaultMessage += `• ⚠️ Stok Kritis: ${criticalStock} bahan\n`
        }
        if (totalRecipes > 0) {
          defaultMessage += `• Total Resep: ${totalRecipes}\n`
        }
        defaultMessage += '\n'
      }

      defaultMessage += 'Saya siap membantu mengelola bisnis kuliner Anda!\n\n**Layanan yang tersedia:**\n• 📦 Manajemen Inventory & Stok\n• 💰 Analisis HPP & Costing\n• 📊 Profit & Financial Analysis\n• 🍳 Manajemen Resep & Produksi\n• 📋 Tracking Pesanan\n• 🏷️ Strategi Pricing\n• 📢 Marketing & Sales\n\n**Contoh pertanyaan:**\n• "Berapa stok bahan baku yang tersedia?"\n• "Bagaimana cara menghitung HPP brownies?"\n• "Tips mengoptimalkan stok bahan baku"\n• "Strategi pricing untuk produk baru"'

      return {
        message: defaultMessage,
        suggestions: [
          "Berapa stok bahan baku yang tersedia?",
          "Status pesanan terbaru",
          "Bagaimana cara menghitung HPP?",
          "Tips mengoptimalkan stok bahan"
        ],
        data: { businessContext }
      }
    }
  }

  return { processAIQuery }
}
