/**
 * External AI Service Integration for HeyTrack
 * Supports OpenRouter API for advanced AI responses
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class ExternalAIService {
  private static readonly OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
  private static readonly API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''

  static async generateResponse(prompt: string, context?: string): Promise<string> {
    if (!this.API_KEY) {
      console.warn('OpenRouter API key not configured, using fallback response')
      return this.generateFallbackResponse(prompt)
    }

    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `Anda adalah HeyTrack AI, asisten cerdas untuk manajemen bisnis UMKM kuliner di Indonesia.
          Berikan saran strategis yang praktis dan implementable untuk bisnis kuliner HPP (Harga Pokok Produksi).

          Konteks bisnis saat ini:
          - Industri: Kuliner UMKM dengan fokus efisiensi dan profitabilitas
          - Target: UMKM kuliner dengan manajemen cost yang optimal
          - Tantangan: Kompetisi pasar, biaya bahan baku, margin keuntungan

          Pertanyaan user: "${prompt}"

          Berikan saran yang:
          1. Realistis untuk skala UMKM kuliner
          2. Measurable dengan KPI yang jelas
          3. Implementable dalam 30-90 hari
          4. Cost-effective dan low-risk
          5. Spesifik untuk industri kuliner`
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const response = await fetch(this.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': 'https://heytrack.vercel.app',
          'X-Title': 'HeyTrack Bakery Management'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content || this.generateFallbackResponse(prompt)

    } catch (error) {
      console.error('Error calling OpenRouter API:', error)
      return this.generateFallbackResponse(prompt)
    }
  }

  static generateFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    // Business strategy responses
    if (lowerPrompt.includes('strategi') || lowerPrompt.includes('bisnis') || lowerPrompt.includes('rencana')) {
      return `Untuk strategi bisnis UMKM kuliner Anda, fokus pada:

1. **Product Excellence**: Kembangkan menu signature yang unik
2. **Cost Optimization**: Optimalkan HPP dan efisiensi operasional
3. **Customer Loyalty**: Build repeat customer base
4. **Digital Presence**: Manfaatkan online ordering dan social media

Apakah ada aspek strategi tertentu yang ingin Anda dalami?`
    }

    // Marketing strategy
    if (lowerPrompt.includes('marketing') || lowerPrompt.includes('promosi') || lowerPrompt.includes('jualan')) {
      return `Strategi marketing untuk UMKM kuliner:

1. **Social Media Content**: Bagikan proses memasak, behind-the-scenes
2. **Customer Stories**: Showcase testimonials dan ulasan positif
3. **Seasonal Promotions**: Manfaatkan hari besar dan tren kuliner
4. **Partnerships**: Kolaborasi dengan kafe atau restoran lokal
5. **Loyalty Program**: Reward system untuk repeat customers

Target audience: Masyarakat sekitar, kantor-kantor, dan online community.`
    }

    // Growth strategy
    if (lowerPrompt.includes('tumbuh') || lowerPrompt.includes('expand') || lowerPrompt.includes('skal')) {
      return `Strategi pertumbuhan UMKM kuliner Anda:

**Fase 1 (0-6 bulan)**: Stabilkan operasi dan build customer base
**Fase 2 (6-12 bulan)**: Perluas menu dan optimasi proses
**Fase 3 (1-2 tahun)**: Buka outlet kedua atau franchise

Fokus pada:
- Operational scalability
- Quality consistency
- Brand building
- Financial management

Risiko utama: Over-expansion sebelum operasi stabil.`
    }

    // Competition analysis
    if (lowerPrompt.includes('kompetitor') || lowerPrompt.includes('competitor') || lowerPrompt.includes('saingan')) {
      return `Analisis kompetitor bakery:

**Kelebihan Kompetitor Modern**:
- Branding yang kuat
- Teknologi ordering online
- Harga premium
- Variasi produk luas

**Kelebihan UMKM Bakery**:
- Produk fresh setiap hari
- Harga lebih terjangkau
- Customer service personal
- Lokasi strategis
- Specialty products unik

**Strategi Anda**:
- Differentiation melalui kualitas dan keunikan
- Build loyal customer base
- Fokus pada niche market
- Leverage local advantage`
    }

    // Default response
    return `Sebagai AI asisten untuk bisnis UMKM kuliner Anda, saya bisa membantu dengan:

• **Strategi Bisnis**: Rencana pertumbuhan dan positioning
• **Marketing**: Promosi dan customer acquisition
• **Operasional**: Efisiensi dan optimasi proses
• **Keuangan**: Pricing strategy dan profit optimization
• **Kompetitor**: Analisis persaingan dan differentiation

Apa yang ingin Anda ketahui tentang bisnis kuliner Anda?`
  }

  static async generateBusinessInsights(data: any): Promise<string> {
    const context = `
    Data bisnis saat ini:
    - Inventory: ${JSON.stringify(data.inventory || {})}
    - Recipes: ${JSON.stringify(data.recipes || {})}
    - Financial: ${JSON.stringify(data.financial || {})}
    - Orders: ${JSON.stringify(data.orders || {})}

    Berikan insights strategis berdasarkan data ini.`

    return await this.generateResponse(
      'Berikan insights strategis mendalam tentang kondisi bisnis bakery ini berdasarkan data yang tersedia.',
      context
    )
  }

  static async generateCustomStrategy(query: string, businessData: any): Promise<string> {
    const context = `
    Data bisnis lengkap:
    ${JSON.stringify(businessData, null, 2)}

    User meminta strategi khusus tentang: "${query}"

    Berikan rekomendasi strategis yang:
    - Spesifik untuk bakery UMKM Indonesia
    - Measurable dengan KPI jelas
    - Implementable dalam timeframe realistis
    - Cost-effective dan low-risk`

    return await this.generateResponse(
      `Saya ingin strategi khusus untuk: ${query}`,
      context
    )
  }
}

export default ExternalAIService
