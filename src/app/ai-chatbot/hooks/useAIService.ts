import { apiLogger } from '@/lib/logger'
import { processChatbotQuery, generateAIInsights } from '@/lib/ai'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

export function useAIService() {
  const processAIQuery = async (query: string) => {
    // Get current user ID for database filtering
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    if (!userId) {
      return {
        message: '❌ **Error:** Anda perlu login untuk menggunakan AI Chatbot',
        suggestions: ['Login terlebih dahulu', 'Refresh halaman']
      }
    }

    try {
      // Use available NLP processing
      const nlpResult = await processChatbotQuery(query)

      // Get business insights if NLP analysis is successful
      const insights = await generateAIInsights({
        query,
        nlpAnalysis: nlpResult,
        userId
      })

      return {
        message: insights,
        suggestions: [
          "Berapa stok bahan baku yang tersedia?",
          "Rekomendasikan resep untuk hari ini",
          "Analisis profit margin bulan ini",
          "Status pesanan terbaru"
        ],
        data: nlpResult
      }
    } catch (error) {
      apiLogger.error({ error }, 'Error processing AI query:')

      // Fallback to basic responses
      const lowerQuery = query.toLowerCase()

      if (lowerQuery.includes('stok') || lowerQuery.includes('bahan') || lowerQuery.includes('inventory')) {
        return {
          message: 'Untuk informasi stok bahan baku, silakan akses halaman Inventory atau gunakan fitur pencarian di dashboard.',
          suggestions: ['Buka halaman Inventory', 'Cek dashboard utama']
        }
      }

      if (lowerQuery.includes('resep') || lowerQuery.includes('recipe') || lowerQuery.includes('produksi')) {
        return {
          message: 'Untuk resep dan produksi, silakan akses halaman Recipes atau gunakan fitur manajemen resep.',
          suggestions: ['Buka halaman Recipes', 'Tambah resep baru']
        }
      }

      if (lowerQuery.includes('uang') || lowerQuery.includes('profit') || lowerQuery.includes('harga') || lowerQuery.includes('financial')) {
        return {
          message: 'Untuk analisis keuangan, silakan akses halaman Profit atau Reports untuk melihat laporan lengkap.',
          suggestions: ['Buka halaman Profit', 'Akses laporan keuangan']
        }
      }

      if (lowerQuery.includes('pesanan') || lowerQuery.includes('order') || lowerQuery.includes('pelanggan')) {
        return {
          message: 'Untuk pesanan dan pelanggan, silakan akses halaman Orders untuk melihat detail pesanan.',
          suggestions: ['Buka halaman Orders', 'Lihat status pesanan']
        }
      }

      // Default fallback
      return {
        message: 'Saya bisa membantu Anda dengan manajemen inventory, resep, analisis keuangan, dan pesanan. Coba tanyakan hal spesifik seperti "Berapa stok tepung terigu?" atau "Rekomendasikan resep roti untuk hari ini".',
        suggestions: [
          "Berapa stok bahan baku yang tersedia?",
          "Rekomendasikan resep untuk hari ini",
          "Analisis profit margin bulan ini",
          "Status pesanan terbaru"
        ]
      }
    }
  }

  return { processAIQuery }
}
