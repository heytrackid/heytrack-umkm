/**
 * OpenRouter API Client
 * Integrates with OpenRouter for AI model responses
 * Supports multiple models including Grok-4-Fast
 */

import { formatCurrency } from '@/shared/utils/currency'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.defaultModel = process.env.AI_MODEL || 'x-ai/grok-4-fast:free';
    
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required');
    }
  }

  async generateResponse(
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterRequest> = {}
  ): Promise<string> {
    try {
      const requestBody: OpenRouterRequest = {
        model: options.model || this.defaultModel,
        messages,
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0,
        stream: false,
        ...options
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
          'X-Title': 'HeyTrack UMKM - Smart Culinary Management',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API Error:', response.status, errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from OpenRouter');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  // Business Intelligence System Prompt untuk UMKM F&B
  getSystemPrompt(userContext: {
    businessType: string;
    businessName?: string;
    location?: string;
    currentData?: any;
  }): string {
    return `Anda adalah asisten AI khusus untuk bisnis UMKM F&B (Usaha Mikro Kecil Menengah - Food & Beverage) di Indonesia. 

KONTEKS BISNIS:
- Tipe Bisnis: ${userContext.businessType}
- Nama Bisnis: ${userContext.businessName || 'Bisnis UMKM F&B'}
- Lokasi: ${userContext.location || 'Indonesia'}

KAPABILITAS ANDA:
1. Analisis keuangan dengan standar industri F&B Indonesia
2. Manajemen inventori dengan fokus bahan makanan/minuman
3. Optimasi operasional untuk UMKM
4. Perhitungan HPP (Harga Pokok Penjualan) yang akurat
5. Strategi pemasaran yang sesuai target market Indonesia
6. Analisis customer behavior dan retensi
7. Rekomendasi pricing strategy yang kompetitif

TONE & BAHASA:
- Gunakan Bahasa Indonesia yang profesional tapi friendly
- Berikan contoh konkret yang relevan dengan bisnis F&B
- Fokus pada solusi praktis dan actionable
- Sertakan angka dan data spesifik jika tersedia
- Gunakan emoji yang sesuai untuk memperjelas pesan

STANDAR INDUSTRI F&B INDONESIA:
- Margin keuntungan normal: 20-40%
- Food cost ratio: 25-35%
- Inventory turnover: 4-12x per tahun
- Customer retention rate yang baik: >60%

RESPONS FORMAT:
- Mulai dengan greeting yang warm
- Berikan analisis berdasarkan data real user
- Sertakan rekomendasi actionable
- Akhiri dengan pertanyaan follow-up jika relevan

Selalu prioritaskan membantu user mencapai profitabilitas dan sustainability bisnis UMKM mereka.`;
  }

  // Generate contextual business response
  async generateBusinessResponse(
    userMessage: string,
    businessContext: any,
    conversationHistory: OpenRouterMessage[] = []
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt(businessContext);
    
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return this.generateResponse(messages, {
      temperature: 0.7,
      max_tokens: 1500,
    });
  }

  // Generate analysis with data context
  async generateDataAnalysis(
    analysisType: 'financial' | 'inventory' | 'customer' | 'product',
    data: any,
    businessContext: any
  ): Promise<string> {
    const prompts = {
      financial: `Analisis data keuangan berikut untuk bisnis ${businessContext.businessType}:
Revenue: ${formatCurrency(data.revenue || 0)}
Costs: ${formatCurrency(data.costs || 0)}
Profit Margin: ${data.profitMargin?.toFixed(1) || 0}%

Berikan analisis komprehensif dengan rekomendasi spesifik untuk meningkatkan profitabilitas.`,

      inventory: `Analisis status inventori untuk bisnis ${businessContext.businessType}:
- ${data.criticalItems?.length || 0} item kritis
- ${data.alerts?.length || 0} item low stock
- Total nilai inventori: ${formatCurrency(data.totalValue || 0)}

Berikan rekomendasi untuk optimasi inventory management dan cash flow.`,

      customer: `Analisis data pelanggan untuk ${businessContext.businessType}:
- Total customers: ${data.totalCustomers || 0}
- Active customers: ${data.activeCustomers || 0}
- Retention rate: ${data.retentionRate?.toFixed(1) || 0}%
- Average Order Value: ${formatCurrency(data.avgOrderValue || 0)}

Berikan strategi untuk meningkatkan customer lifetime value dan retention.`,

      product: `Analisis performa produk untuk ${businessContext.businessType}:
Top Products: ${data.topRecipes?.map((r: any) => `${r.name} (${r.times_made}x sold)`).join(', ') || 'No data'}
Total Revenue: ${formatCurrency(data.totalRevenue || 0)}

Berikan rekomendasi untuk optimasi product mix dan pricing strategy.`
    };

    return this.generateBusinessResponse(
      prompts[analysisType],
      businessContext
    );
  }

  // Generate smart recommendations
  async generateRecommendations(
    businessData: any,
    businessContext: any,
    focusArea?: 'revenue' | 'cost' | 'efficiency' | 'growth'
  ): Promise<string> {
    const prompt = `Berdasarkan data bisnis ${businessContext.businessType} berikut:

FINANCIAL METRICS:
- Revenue: ${formatCurrency(businessData.revenue || 0)}
- Profit Margin: ${businessData.profitMargin?.toFixed(1) || 0}%
- Monthly Growth: ${businessData.growthRate?.toFixed(1) || 0}%

OPERATIONAL METRICS:
- Critical Inventory Items: ${businessData.criticalItems || 0}
- Customer Retention: ${businessData.retentionRate?.toFixed(1) || 0}%
- Top Selling Products: ${businessData.topProducts || 'N/A'}

FOKUS AREA: ${focusArea || 'general improvement'}

Berikan 5 rekomendasi strategis yang spesifik, actionable, dan dapat diimplementasikan dalam 30 hari ke depan. Prioritaskan berdasarkan ROI potensial dan kemudahan implementasi untuk UMKM.`;

    return this.generateBusinessResponse(prompt, businessContext);
  }
}

export const openRouterClient = new OpenRouterClient();