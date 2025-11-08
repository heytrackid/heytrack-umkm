import { apiLogger } from '@/lib/logger'

import { PromptBuilder } from './prompt-builder'
import { AIService } from './service'

/**
 * Business AI Module
 * AI services for business intelligence and insights
 */


export interface PricingData {
  products?: Array<{
    id: string
    name: string
    currentPrice: number
    cost: number
    category: string
    salesVolume: number
  }>
  marketData?: {
    competitors: Array<{
      name: string
      price: number
      marketShare: number
    }>
    targetMargin: number
  }
  [key: string]: unknown
}

export interface InventoryData {
  items?: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
    demandRate: number
    supplierLeadTime: number
  }>
  warehouse?: {
    capacity: number
    utilization: number
  }
  [key: string]: unknown
}

export interface ProductionData {
  recipes?: Array<{
    id: string
    name: string
    productionTime: number
    ingredients: Array<{
      id: string
      name: string
      quantity: number
    }>
  }>
  equipment?: {
    capacity: number
    utilization: number
  }
  [key: string]: unknown
}

export class BusinessAI {
  /**
   * Generate pricing recommendations
   */
  static generatePricingStrategy(data: PricingData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'dynamic pricing strategy and market positioning')
    const systemPrompt = 'You are a pricing strategist specializing in Indonesian food businesses and competitive analysis.'
    return AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Analyze inventory patterns and suggest optimizations
   */
  static analyzeInventory(data: InventoryData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'inventory management and supply chain optimization')
    const systemPrompt = 'You are an inventory optimization expert for food service businesses.'
    return AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize production schedules
   */
  static optimizeProduction(data: ProductionData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'production planning and resource optimization')
    const systemPrompt = 'You are a production planning expert for food manufacturing businesses.'
    return AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Build business data string from context
   */
  private static buildBusinessData(context: {
    orders?: {
      total: number
      pending: number
      revenue: number
      recent: Array<{ id: string; status: string; total_amount: number; created_at: string }>
    }
    inventory?: {
      critical: Array<{ name: string; stock: number; unit: string; minimum: number }>
      total: number
    }
    recipes?: {
      total: number
      active: number
      categories: string[]
    }
  } | undefined): string {
    if (!context) {
      return ''
    }

    return `
DATA BISNIS REAL-TIME:
- Total Pesanan: ${context.orders?.total ?? 0}
- Pesanan Pending: ${context.orders?.pending ?? 0}
- Total Revenue: Rp ${context.orders?.revenue?.toLocaleString('id-ID') ?? 0}
- Stok Kritis: ${context.inventory?.critical?.length ?? 0} bahan
- Total Bahan: ${context.inventory?.total ?? 0}
- Total Resep: ${context.recipes?.total ?? 0}
- Kategori Resep: ${context.recipes?.categories?.join(', ') ?? 'N/A'}

${context.inventory?.critical?.length ? `STOK KRITIS DETAIL:
${context.inventory.critical.map(item =>
  `- ${item.name}: ${item.stock} ${item.unit} (min: ${item.minimum} ${item.unit})`
).join('\n')}` : ''}

${context.orders?.recent?.length ? `PESANAN TERBARU:
${context.orders.recent.slice(0, 3).map(order =>
  `- ${order['status']}: Rp ${order.total_amount?.toLocaleString('id-ID') || 0} (${new Date(order.created_at).toLocaleDateString('id-ID')})`
).join('\n')}` : ''}`
  }

  /**
   * Build contextual prompt based on intent
   */
  private static buildContextualPrompt(intent: string, query: string, businessData: string): string {
    let contextualPrompt = ''

    switch (intent) {
      case 'check_inventory':
        contextualPrompt = `User bertanya tentang stok inventory: "${query}".

${businessData}

Berdasarkan data bisnis real-time di atas, berikan analisis yang akurat tentang:
- Status stok bahan baku saat ini
- Bahan yang perlu direstock segera
- Tips manajemen inventory berdasarkan kondisi aktual
- Saran optimasi stok bahan baku`
        break
      case 'analyze_hpp':
        contextualPrompt = `User bertanya tentang HPP (Harga Pokok Produksi): "${query}".

${businessData}

Berdasarkan data bisnis real-time, jelaskan:
- Cara menghitung HPP akurat berdasarkan data aktual
- Faktor-faktor yang mempengaruhi berdasarkan kondisi bisnis saat ini
- Tips optimasi biaya produksi yang realistis`
        break
      case 'analyze_profit':
        contextualPrompt = `User bertanya tentang profit/keuntungan: "${query}".

${businessData}

Berdasarkan data revenue dan pesanan aktual, berikan analisis:
- Status profit saat ini berdasarkan data real
- Cara meningkatkan profit margin dengan data konkret
- Strategi pricing berdasarkan kondisi bisnis saat ini
- Tips bisnis kuliner yang actionable`
        break
      case 'recipe_query':
        contextualPrompt = `User bertanya tentang resep: "${query}".

${businessData}

Berdasarkan data resep dan inventory saat ini, berikan saran:
- Manajemen resep yang efisien
- Optimasi bahan berdasarkan stok tersedia
- Tips produksi yang sesuai dengan kapasitas saat ini`
        break
      case 'pricing_strategy':
        contextualPrompt = `User bertanya tentang strategi harga: "${query}".

${businessData}

Berdasarkan data revenue dan biaya aktual, berikan saran:
- Penetapan harga yang kompetitif berdasarkan data real
- Analisis margin berdasarkan kondisi bisnis saat ini
- Strategi pricing untuk UMKM kuliner yang realistis`
        break
      case 'marketing_strategy':
        contextualPrompt = `User bertanya tentang marketing: "${query}".

${businessData}

Berdasarkan data pesanan dan revenue saat ini, berikan tips:
- Marketing untuk UMKM kuliner berdasarkan performa aktual
- Strategi promosi yang sesuai dengan kondisi bisnis
- Cara meningkatkan penjualan dengan data konkret`
        break
      case 'order_management':
        contextualPrompt = `User bertanya tentang manajemen pesanan: "${query}".

${businessData}

Berdasarkan data pesanan pending dan status saat ini, berikan tips:
- Mengelola pesanan berdasarkan kondisi real-time
- Optimasi workflow berdasarkan volume pesanan saat ini
- Meningkatkan efisiensi operasional dengan data aktual`
        break
      default:
        contextualPrompt = `User bertanya: "${query}".

${businessData}

Berikan jawaban yang membantu terkait bisnis kuliner UMKM di Indonesia, menggunakan data bisnis real-time di atas jika relevan.`
        break
    }

    return contextualPrompt
  }

  /**
   * Generate business insights from data
   */
  static async getBusinessInsights(data: Record<string, unknown>): Promise<string> {
    try {
      const { query, intent, businessContext } = data

      // Extract real business data dari context
      const context = businessContext as {
        orders?: {
          total: number
          pending: number
          revenue: number
          recent: Array<{ id: string; status: string; total_amount: number; created_at: string }>
        }
        inventory?: {
          critical: Array<{ name: string; stock: number; unit: string; minimum: number }>
          total: number
        }
        recipes?: {
          total: number
          active: number
          categories: string[]
        }
      } | undefined

      // Build contextual information
      const businessData = this.buildBusinessData(context)

      // Build contextual prompt based on intent
      const contextualPrompt = this.buildContextualPrompt(intent as string, query as string, businessData)

      const systemPrompt = `Anda adalah asisten AI HeyTrack yang ahli dalam bisnis kuliner UMKM Indonesia. 

KONTEKS:
- HeyTrack adalah sistem manajemen bisnis untuk UMKM kuliner
- User menggunakan sistem untuk tracking HPP, inventory, resep, dan profit
- Fokus pada solusi praktis dan actionable untuk bisnis kuliner

GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang ramah dan profesional
- Berikan jawaban yang spesifik dan actionable
- Sertakan contoh praktis jika relevan
- Gunakan format yang mudah dibaca (bullet points, numbering)
- Fokus pada solusi bisnis yang realistis untuk UMKM

BATASAN:
- Hanya jawab pertanyaan terkait bisnis kuliner dan manajemen
- Jangan berikan informasi yang tidak akurat
- Jika tidak yakin, arahkan user ke fitur yang relevan di HeyTrack`

      const response = await AIService.callOpenRouter(contextualPrompt, systemPrompt)
      return response
      
    } catch (error) {
      apiLogger.error({ error, data }, 'Error generating business insights')
      
      const _query = data['query'] as string || ''
      const lowerQuery = _query.toLowerCase()
      
      if (lowerQuery.includes('stok') || lowerQuery.includes('inventory')) {
        return `📦 **Manajemen Stok Bahan Baku**

Untuk mengelola stok dengan baik:

1. **Cek Stok Reguler** - Pantau stok harian di halaman Inventory
2. **Set Minimum Stock** - Atur batas minimum untuk alert otomatis  
3. **Tracking Penggunaan** - Catat penggunaan bahan per produksi
4. **Supplier Backup** - Siapkan supplier alternatif

💡 **Tips**: Gunakan fitur reorder alert di HeyTrack untuk menghindari kehabisan stok.

Akses: Dashboard → Inventory → Kelola Stok`
      }
      
      if (lowerQuery.includes('hpp') || lowerQuery.includes('biaya')) {
        return `💰 **Analisis HPP (Harga Pokok Produksi)**

HPP yang akurat penting untuk profit:

1. **Hitung Biaya Bahan** - Semua ingredient + packaging
2. **Biaya Operasional** - Listrik, gas, tenaga kerja
3. **Overhead** - Sewa, depresiasi alat
4. **Margin Keuntungan** - Minimal 30-50% untuk sustainability

📊 **Formula**: HPP + Margin = Harga Jual

Akses: Dashboard → HPP Calculator → Analisis Biaya`
      }
      
      if (lowerQuery.includes('profit') || lowerQuery.includes('untung')) {
        return `📈 **Optimasi Profit Margin**

Strategi meningkatkan keuntungan:

1. **Efisiensi Bahan** - Kurangi waste, optimasi porsi
2. **Pricing Strategy** - Review harga secara berkala
3. **Volume Sales** - Fokus pada produk high-margin
4. **Cost Control** - Monitor biaya operasional

🎯 **Target**: Margin 35-50% untuk produk makanan

Akses: Dashboard → Reports → Profit Analysis`
      }
      
      return `🤖 **Asisten AI HeyTrack**

Saya bisa membantu Anda dengan:

• 📦 **Manajemen Inventory** - Stok, reorder, supplier
• 💰 **Analisis HPP** - Kalkulasi biaya produksi  
• 📊 **Profit Analysis** - Margin, pricing strategy
• 🍳 **Manajemen Resep** - Optimasi bahan, costing
• 📋 **Tracking Pesanan** - Workflow, customer management

Coba tanyakan hal spesifik seperti:
- "Bagaimana cara menghitung HPP brownies?"
- "Tips mengoptimalkan stok bahan baku"
- "Strategi pricing untuk produk baru"`
    }
  }
}
