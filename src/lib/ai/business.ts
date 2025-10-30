/**
 * Business AI Module
 * AI services for business intelligence and insights
 */

import { apiLogger } from '@/lib/logger'
import { AIService } from './service'
import { PromptBuilder } from './prompt-builder'

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
  static async generatePricingStrategy(data: PricingData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'dynamic pricing strategy and market positioning')
    const systemPrompt = 'You are a pricing strategist specializing in Indonesian food businesses and competitive analysis.'
    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Analyze inventory patterns and suggest optimizations
   */
  static async analyzeInventory(data: InventoryData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'inventory management and supply chain optimization')
    const systemPrompt = 'You are an inventory optimization expert for food service businesses.'
    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Optimize production schedules
   */
  static async optimizeProduction(data: ProductionData): Promise<string> {
    const prompt = PromptBuilder.buildAnalysisPrompt(data, 'production planning and resource optimization')
    const systemPrompt = 'You are a production planning expert for food manufacturing businesses.'
    return await AIService.callOpenRouter(prompt, systemPrompt)
  }

  /**
   * Generate business insights from data
   */
  static async getBusinessInsights(data: Record<string, unknown>): Promise<string> {
    try {
      const { query, intent } = data
      
      let contextualPrompt = ''
      
      if (typeof intent === 'string') {
        switch (intent) {
          case 'check_inventory':
            contextualPrompt = `User bertanya tentang stok inventory: "${query}". Berikan informasi tentang cara mengecek stok, tips manajemen inventory, dan saran untuk optimasi stok bahan baku.`
            break
          case 'analyze_hpp':
            contextualPrompt = `User bertanya tentang HPP (Harga Pokok Produksi): "${query}". Jelaskan cara menghitung HPP, faktor-faktor yang mempengaruhi, dan tips untuk mengoptimalkan biaya produksi.`
            break
          case 'analyze_profit':
            contextualPrompt = `User bertanya tentang profit/keuntungan: "${query}". Berikan analisis tentang cara meningkatkan profit margin, strategi pricing, dan tips bisnis kuliner.`
            break
          case 'recipe_query':
            contextualPrompt = `User bertanya tentang resep: "${query}". Berikan saran tentang manajemen resep, optimasi bahan, dan tips produksi yang efisien.`
            break
          case 'pricing_strategy':
            contextualPrompt = `User bertanya tentang strategi harga: "${query}". Berikan saran tentang penetapan harga yang kompetitif, analisis margin, dan strategi pricing untuk UMKM kuliner.`
            break
          case 'marketing_strategy':
            contextualPrompt = `User bertanya tentang marketing: "${query}". Berikan tips marketing untuk UMKM kuliner, strategi promosi, dan cara meningkatkan penjualan.`
            break
          case 'order_management':
            contextualPrompt = `User bertanya tentang manajemen pesanan: "${query}". Berikan tips untuk mengelola pesanan, optimasi workflow, dan meningkatkan efisiensi operasional.`
            break
          default:
            contextualPrompt = `User bertanya: "${query}". Berikan jawaban yang membantu terkait bisnis kuliner UMKM di Indonesia.`
        }
      } else {
        contextualPrompt = `User bertanya: "${query}". Berikan jawaban yang membantu terkait bisnis kuliner UMKM di Indonesia.`
      }

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
      
      const query = data.query as string || ''
      const lowerQuery = query.toLowerCase()
      
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
