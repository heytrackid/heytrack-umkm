/**
 * Enhanced AI Chatbot Service for HeyTrack
 * Now with NLP support, detailed prompts, and business strategy capabilities
 */

import { supabase } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { NLPProcessor, AIResponseGenerator } from '@/lib/nlp-processor'

const logger = createLogger('AI-Chatbot-Enhanced')

export interface AIResponse {
  message: string
  suggestions?: string[]
  data?: any
}

// Inventory Insights
export async function getInventoryInsights(query: string): Promise<AIResponse> {
  try {
    logger.info('Processing inventory query', { query })

    // Get current inventory status
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('is_active', true)
      .order('current_stock', { ascending: false })

    if (error) throw error

    const totalItems = ingredients?.length || 0
    const lowStockItems = ingredients?.filter(item => item.current_stock <= item.minimum_stock) || []
    const outOfStockItems = ingredients?.filter(item => item.current_stock <= 0) || []

    let message = `📦 **Status Inventory Saat Ini:**\n\n`
    message += `• Total jenis bahan: ${totalItems}\n`
    message += `• Bahan stok rendah: ${lowStockItems.length}\n`
    message += `• Bahan habis: ${outOfStockItems.length}\n\n`

    if (lowStockItems.length > 0) {
      message += `⚠️ **Perlu Perhatian:**\n`
      lowStockItems.slice(0, 5).forEach(item => {
        message += `• ${item.name}: ${item.current_stock} ${item.unit} (min: ${item.minimum_stock})\n`
      })
      if (lowStockItems.length > 5) {
        message += `• ... dan ${lowStockItems.length - 5} bahan lainnya\n`
      }
    }

    const suggestions = [
      "Bahan mana yang perlu direstock?",
      "Prediksi penggunaan bahan minggu depan",
      "Berapa biaya restock semua bahan?"
    ]

    return {
      message,
      suggestions,
      data: {
        totalItems,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems: lowStockItems.slice(0, 5)
      }
    }
  } catch (error) {
    logger.error('Error getting inventory insights', { error })
    return {
      message: 'Maaf, saya tidak dapat mengakses data inventory saat ini. Silakan coba lagi nanti.',
      suggestions: ['Cek status koneksi database', 'Refresh halaman']
    }
  }
}

// Recipe Suggestions
export async function getRecipeSuggestions(query: string): Promise<AIResponse> {
  try {
    logger.info('Processing recipe query', { query })

    // Get recipes with production data
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          quantity,
          unit,
          ingredients (name, current_stock, price_per_unit)
        )
      `)
      .eq('is_active', true)
      .order('times_made', { ascending: false })
      .limit(10)

    if (error) throw error

    const totalRecipes = recipes?.length || 0
    const popularRecipes = recipes?.slice(0, 3) || []

    let message = `👨‍🍳 **Rekomendasi Resep:**\n\n`
    message += `• Total resep aktif: ${totalRecipes}\n\n`

    if (popularRecipes.length > 0) {
      message += `🔥 **Resep Terpopuler:**\n`
      popularRecipes.forEach((recipe, index) => {
        message += `${index + 1}. ${recipe.name} (${recipe.times_made} kali dibuat)\n`
        message += `   Kategori: ${recipe.category} | HPP: Rp${recipe.total_cost?.toLocaleString() || 'N/A'}\n`
      })
    }

    // Check for recipes that can be made with current inventory
    const feasibleRecipes = recipes?.filter(recipe => {
      return recipe.recipe_ingredients?.every((ri: any) =>
        (ri.ingredients?.current_stock || 0) >= ri.quantity
      )
    }) || []

    if (feasibleRecipes.length > 0) {
      message += `\n✅ **Bisa Dibuat Sekarang:** ${feasibleRecipes.length} resep\n`
    }

    const suggestions = [
      "Resep apa yang bisa dibuat hari ini?",
      "Hitung biaya produksi resep tertentu",
      "Optimalkan resep untuk profit maksimal"
    ]

    return {
      message,
      suggestions,
      data: {
        totalRecipes,
        popularRecipes: popularRecipes.map(r => ({ name: r.name, timesMade: r.times_made })),
        feasibleRecipesCount: feasibleRecipes.length
      }
    }
  } catch (error) {
    logger.error('Error getting recipe suggestions', { error })
    return {
      message: 'Maaf, saya tidak dapat mengakses data resep saat ini.',
      suggestions: ['Cek koneksi database', 'Lihat daftar resep manual']
    }
  }
}

// Financial Analysis
export async function getFinancialAnalysis(query: string): Promise<AIResponse> {
  try {
    logger.info('Processing financial query', { query })

    // Get recent financial data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: transactions, error } = await supabase
      .from('financial_records')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) throw error

    const income = transactions?.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0) || 0
    const expenses = transactions?.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0) || 0
    const profit = income - expenses

    let message = `💰 **Analisis Keuangan (30 hari terakhir):**\n\n`
    message += `• Pemasukan: Rp${income.toLocaleString()}\n`
    message += `• Pengeluaran: Rp${expenses.toLocaleString()}\n`
    message += `• Laba Bersih: Rp${profit.toLocaleString()}\n`
    message += `• Margin Profit: ${income > 0 ? ((profit / income) * 100).toFixed(1) : 0}%\n\n`

    // Get top expense categories
    const expenseByCategory = transactions?.filter(t => t.type === 'EXPENSE')
      .reduce((acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {}) || {}

    const topCategories = Object.entries(expenseByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    if (topCategories.length > 0) {
      message += `📊 **Kategori Pengeluaran Terbesar:**\n`
      topCategories.forEach(([category, amount], index) => {
        message += `${index + 1}. ${category}: Rp${amount.toLocaleString()}\n`
      })
    }

    const suggestions = [
      "Analisis profit margin per produk",
      "Prediksi cash flow bulan depan",
      "Sarankan strategi penghematan biaya"
    ]

    return {
      message,
      suggestions,
      data: {
        income,
        expenses,
        profit,
        profitMargin: income > 0 ? (profit / income) * 100 : 0,
        topExpenseCategories: topCategories
      }
    }
  } catch (error) {
    logger.error('Error getting financial analysis', { error })
    return {
      message: 'Maaf, saya tidak dapat mengakses data keuangan saat ini.',
      suggestions: ['Periksa laporan keuangan manual', 'Cek koneksi database']
    }
  }
}

// Order Insights
export async function getOrderInsights(query: string): Promise<AIResponse> {
  try {
    logger.info('Processing order query', { query })

    // Get recent orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          total_price,
          recipes (name)
        ),
        customers (name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => o.status === 'PENDING') || []
    const deliveredOrders = orders?.filter(o => o.status === 'DELIVERED') || []

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

    let message = `📋 **Status Pesanan:**\n\n`
    message += `• Total pesanan: ${totalOrders}\n`
    message += `• Menunggu proses: ${pendingOrders.length}\n`
    message += `• Sudah dikirim: ${deliveredOrders.length}\n`
    message += `• Total pendapatan: Rp${totalRevenue.toLocaleString()}\n\n`

    // Get most popular products
    const productSales = deliveredOrders.reduce((acc: Record<string, number>, order) => {
      order.order_items?.forEach((item: any) => {
        const productName = item.recipes?.name || 'Unknown'
        acc[productName] = (acc[productName] || 0) + (item.quantity || 0)
      })
      return acc
    }, {})

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    if (topProducts.length > 0) {
      message += `🔥 **Produk Terlaris:**\n`
      topProducts.forEach(([product, quantity], index) => {
        message += `${index + 1}. ${product}: ${quantity} porsi\n`
      })
    }

    const suggestions = [
      "Status pesanan hari ini",
      "Pelanggan teraktif bulan ini",
      "Prediksi pesanan hari besok"
    ]

    return {
      message,
      suggestions,
      data: {
        totalOrders,
        pendingCount: pendingOrders.length,
        deliveredCount: deliveredOrders.length,
        totalRevenue,
        topProducts
      }
    }
  } catch (error) {
    logger.error('Error getting order insights', { error })
    return {
      message: 'Maaf, saya tidak dapat mengakses data pesanan saat ini.',
      suggestions: ['Periksa daftar pesanan manual', 'Cek status pesanan tertunda']
    }
  }
}

// General business insights
export async function getBusinessInsights(): Promise<AIResponse> {
  try {
    logger.info('Processing business insights request')

    // Get comprehensive business metrics
    const [inventory, orders, financials] = await Promise.all([
      supabase.from('ingredients').select('current_stock, minimum_stock').eq('is_active', true),
      supabase.from('orders').select('status, total_amount').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('financial_records').select('type, amount').gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ])

    const lowStockCount = inventory.data?.filter(item => item.current_stock <= item.minimum_stock).length || 0
    const weeklyRevenue = orders.data?.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    const monthlyExpenses = financials.data?.filter(f => f.type === 'EXPENSE').reduce((sum, f) => sum + f.amount, 0) || 0

    let message = `🎯 **Ringkasan Bisnis Hari Ini:**\n\n`
    message += `📦 Inventory: ${lowStockCount} bahan perlu restock\n`
    message += `💰 Pendapatan Minggu: Rp${weeklyRevenue.toLocaleString()}\n`
    message += `💸 Pengeluaran Bulan: Rp${monthlyExpenses.toLocaleString()}\n\n`

    if (lowStockCount > 0) {
      message += `⚠️ **Prioritas:** Restock bahan baku segera!\n`
    }

    if (weeklyRevenue > 0) {
      message += `✅ **Bagus:** Pendapatan minggu ini positif!\n`
    }

    return {
      message,
      suggestions: [
        'Lihat detail inventory',
        'Analisis performa minggu ini',
        'Periksa pesanan pending'
      ]
    }
  } catch (error) {
    logger.error('Error getting business insights', { error })
    return {
      message: 'Tidak dapat memuat ringkasan bisnis saat ini.',
      suggestions: ['Refresh halaman', 'Cek koneksi internet']
    }
  }
}
