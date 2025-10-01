/**
 * AI Intent Detection Module
 * Analyzes user messages and detects intent using pattern matching and AI
 */

import { ChatIntent, IntentResult } from './types';
import { openRouterClient } from '../openrouter-client';

export class IntentDetector {
  
  /**
   * Detect user intent from message
   */
  static async detectIntent(message: string, context?: any): Promise<IntentResult> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Pattern-based detection (fast path)
    const patternIntent = this.detectIntentFromPatterns(normalizedMessage);
    if (patternIntent.confidence > 0.8) {
      return patternIntent;
    }
    
    // AI-based detection (fallback for complex queries)
    try {
      const aiIntent = await this.detectIntentWithAI(message, context);
      return aiIntent;
    } catch (error) {
      console.error('AI intent detection failed, using pattern result:', error);
      return patternIntent;
    }
  }
  
  /**
   * Pattern-based intent detection (fast, offline)
   */
  private static detectIntentFromPatterns(message: string): IntentResult {
    const patterns = {
      greeting: /^(hai|halo|hi|hello|selamat|pagi|siang|sore|malam)/,
      add_order: /(tambah|buat|bikin|pesan|order|pesanan baru)/,
      check_stock: /(cek|lihat|periksa).*(stok|stock|bahan|inventory|persediaan)/,
      view_orders: /(lihat|tampilkan|daftar|list).*(order|pesanan)/,
      financial_report: /(laporan|report|ringkasan).*(keuangan|finance|uang|pendapatan)/,
      profit_analysis: /(analisa|analisis|hitung|cek).*(profit|untung|rugi|margin|keuntungan)/,
      business_advice: /(saran|advice|tips|rekomendasi|bagaimana|gimana|cara).*?(bisnis|usaha|jualan|omset)/,
      inventory_alert: /(peringatan|alert|notif).*(stok|bahan)/,
      recipe_suggestion: /(resep|menu|produk).*(baru|suggest|rekomendasi)/,
      customer_analysis: /(analisa|data|info).*(pelanggan|customer)/,
      cost_optimization: /(hemat|kurangi|optim|efisien).*(biaya|cost|pengeluaran)/,
      sales_forecast: /(prediksi|forecast|proyeksi|estimasi).*(penjualan|sales)/
    };
    
    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return {
          intent: intent as ChatIntent,
          confidence: 0.85,
          entities: this.extractEntities(message),
          suggestedActions: this.getSuggestedActions(intent as ChatIntent)
        };
      }
    }
    
    // Default to greeting if no pattern matches
    return {
      intent: 'greeting',
      confidence: 0.5,
      entities: {},
      suggestedActions: [
        'Cek status stok',
        'Lihat laporan keuangan',
        'Tambah pesanan baru',
        'Analisa profit'
      ]
    };
  }
  
  /**
   * AI-based intent detection for complex queries
   */
  private static async detectIntentWithAI(message: string, context?: any): Promise<IntentResult> {
    const prompt = `
Analisa pesan pengguna berikut dan tentukan intent-nya untuk sistem manajemen bakery/F&B:

Pesan: "${message}"
Context: ${JSON.stringify(context || {})}

Intent options:
- greeting: sapaan/perkenalan
- add_order: tambah pesanan baru
- check_stock: cek stok bahan
- view_orders: lihat daftar pesanan
- financial_report: minta laporan keuangan
- profit_analysis: analisa profit/margin
- business_advice: minta saran bisnis
- inventory_alert: peringatan stok
- recipe_suggestion: saran resep/menu
- customer_analysis: analisa pelanggan
- cost_optimization: optimasi biaya
- sales_forecast: prediksi penjualan

Respond in JSON format:
{
  "intent": "detected_intent",
  "confidence": 0.95,
  "entities": { "key": "value" },
  "reasoning": "why this intent"
}
`;
    
    try {
      const response = await openRouterClient.chat(prompt, {
        maxTokens: 200,
        temperature: 0.3
      });
      
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent as ChatIntent,
        confidence: parsed.confidence || 0.7,
        entities: parsed.entities || {},
        suggestedActions: this.getSuggestedActions(parsed.intent)
      };
    } catch (error) {
      throw new Error('AI intent detection failed');
    }
  }
  
  /**
   * Extract entities from message
   */
  private static extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract numbers
    const numbers = message.match(/\d+/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseInt(n));
    }
    
    // Extract date references
    const datePatterns = [
      { pattern: /hari ini/i, value: 'today' },
      { pattern: /kemarin/i, value: 'yesterday' },
      { pattern: /minggu ini/i, value: 'this_week' },
      { pattern: /bulan ini/i, value: 'this_month' }
    ];
    
    for (const { pattern, value } of datePatterns) {
      if (pattern.test(message)) {
        entities.timeframe = value;
        break;
      }
    }
    
    return entities;
  }
  
  /**
   * Get suggested actions based on intent
   */
  private static getSuggestedActions(intent: ChatIntent): string[] {
    const actionMap: Record<ChatIntent, string[]> = {
      greeting: ['Lihat dashboard', 'Cek stok', 'Tambah pesanan'],
      add_order: ['Pilih produk', 'Input customer', 'Set delivery'],
      check_stock: ['Lihat detail stok', 'Update stok', 'Reorder bahan'],
      view_orders: ['Filter by date', 'Export orders', 'Update status'],
      financial_report: ['Lihat detail', 'Export PDF', 'Bandingkan periode'],
      profit_analysis: ['Analisa per produk', 'Tren profit', 'Rekomendasi pricing'],
      business_advice: ['Analisa mendalam', 'Buat action plan', 'Set goals'],
      inventory_alert: ['Reorder now', 'Adjust minimum', 'View suppliers'],
      recipe_suggestion: ['Analisa demand', 'Cek ingredient', 'Calculate HPP'],
      customer_analysis: ['Segment customers', 'Loyalty program', 'Marketing tips'],
      cost_optimization: ['Identify waste', 'Supplier comparison', 'Batch optimization'],
      sales_forecast: ['View trends', 'Set targets', 'Inventory planning']
    };
    
    return actionMap[intent] || [];
  }
}
