import { apiLogger } from '@/lib/logger'
import { processChatbotQuery, generateAIInsights } from '@/lib/ai'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

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

    try {
      // Use available NLP processing
      const nlpResult = await processChatbotQuery(query)

      // Get business insights if NLP analysis is successful
      const insights = await generateAIInsights({
        query,
        nlpAnalysis: nlpResult,
        userId,
        intent: nlpResult.primaryIntent,
        entities: nlpResult.entities
      })

      // Generate contextual suggestions based on intent
      const suggestions = generateSuggestions(nlpResult.primaryIntent)

      apiLogger.info({ 
        userId, 
        intent: nlpResult.primaryIntent, 
        responseLength: insights.length 
      }, 'AI query processed successfully')

      return {
        message: insights,
        suggestions,
        data: nlpResult
      }
    } catch (error) {
      apiLogger.error({ error, userId, query }, 'Error processing AI query')

      // Enhanced fallback responses with better error handling
      const lowerQuery = query.toLowerCase()
      
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

      // Provide intelligent fallback based on query
      if (lowerQuery.includes('stok') || lowerQuery.includes('bahan') || lowerQuery.includes('inventory')) {
        return {
          message: '📦 **Manajemen Stok Bahan Baku**\n\nUntuk mengelola stok dengan optimal:\n\n• **Monitoring Real-time** - Pantau stok di halaman Inventory\n• **Alert Otomatis** - Set minimum stock untuk notifikasi\n• **Tracking Penggunaan** - Catat konsumsi per produksi\n• **Supplier Management** - Kelola data supplier dan lead time\n\n💡 **Tips**: Gunakan fitur reorder point untuk menghindari stockout.',
          suggestions: generateSuggestions('check_inventory')
        }
      }

      if (lowerQuery.includes('resep') || lowerQuery.includes('recipe') || lowerQuery.includes('produksi')) {
        return {
          message: '🍳 **Manajemen Resep & Produksi**\n\nOptimalkan resep untuk profit maksimal:\n\n• **Cost Analysis** - Hitung HPP setiap resep\n• **Ingredient Optimization** - Sesuaikan komposisi bahan\n• **Batch Planning** - Rencanakan produksi efisien\n• **Quality Control** - Standardisasi proses produksi\n\n💡 **Tips**: Fokus pada resep dengan margin tertinggi.',
          suggestions: generateSuggestions('recipe_query')
        }
      }

      if (lowerQuery.includes('hpp') || lowerQuery.includes('biaya') || lowerQuery.includes('cost')) {
        return {
          message: '💰 **Analisis HPP (Harga Pokok Produksi)**\n\nKelola biaya produksi dengan tepat:\n\n• **Ingredient Costing** - Hitung biaya bahan per unit\n• **Operational Costs** - Alokasi biaya operasional\n• **Margin Analysis** - Tentukan markup yang sehat\n• **Price Optimization** - Sesuaikan harga jual\n\n💡 **Formula**: HPP + Margin = Harga Jual Optimal',
          suggestions: generateSuggestions('analyze_hpp')
        }
      }

      if (lowerQuery.includes('profit') || lowerQuery.includes('untung') || lowerQuery.includes('laba')) {
        return {
          message: '📈 **Analisis Profitabilitas**\n\nMaximalkan keuntungan bisnis:\n\n• **Margin Tracking** - Monitor profit per produk\n• **Cost Efficiency** - Identifikasi area penghematan\n• **Revenue Optimization** - Fokus produk high-margin\n• **Trend Analysis** - Analisis performa bulanan\n\n💡 **Target**: Margin 35-50% untuk sustainability.',
          suggestions: generateSuggestions('analyze_profit')
        }
      }

      if (lowerQuery.includes('harga') || lowerQuery.includes('pricing') || lowerQuery.includes('price')) {
        return {
          message: '🏷️ **Strategi Pricing**\n\nTentukan harga yang kompetitif:\n\n• **Market Research** - Analisis harga kompetitor\n• **Cost-Plus Pricing** - HPP + margin target\n• **Value-Based Pricing** - Sesuai perceived value\n• **Dynamic Pricing** - Sesuaikan dengan demand\n\n💡 **Tips**: Review harga secara berkala sesuai market.',
          suggestions: generateSuggestions('pricing_strategy')
        }
      }

      if (lowerQuery.includes('marketing') || lowerQuery.includes('promosi') || lowerQuery.includes('jualan')) {
        return {
          message: '📢 **Strategi Marketing UMKM**\n\nTingkatkan penjualan dengan:\n\n• **Digital Marketing** - Social media & online presence\n• **Customer Retention** - Program loyalitas pelanggan\n• **Product Positioning** - Highlight unique selling point\n• **Seasonal Campaigns** - Promo sesuai momen\n\n💡 **Focus**: Build brand awareness & customer loyalty.',
          suggestions: generateSuggestions('marketing_strategy')
        }
      }

      // Default comprehensive fallback
      return {
        message: '🤖 **Asisten AI HeyTrack**\n\nSaya siap membantu mengelola bisnis kuliner Anda!\n\n**Layanan yang tersedia:**\n• 📦 Manajemen Inventory & Stok\n• 💰 Analisis HPP & Costing\n• 📊 Profit & Financial Analysis\n• 🍳 Optimasi Resep & Produksi\n• 🏷️ Strategi Pricing\n• 📢 Marketing & Sales\n\n**Contoh pertanyaan:**\n• "Bagaimana cara menghitung HPP brownies?"\n• "Tips mengoptimalkan stok bahan baku"\n• "Strategi pricing untuk produk baru"',
        suggestions: [
          "Bagaimana cara menghitung HPP?",
          "Tips mengoptimalkan stok bahan",
          "Strategi pricing yang efektif",
          "Cara meningkatkan profit margin"
        ]
      }
    }
  }

  return { processAIQuery }
}
