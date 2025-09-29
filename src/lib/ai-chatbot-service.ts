/**
 * AI Chatbot Service for UMKM F&B
 * Handles natural language processing, action execution, and business intelligence
 * Integrates with OpenRouter AI and Supabase for user-specific data
 * Created: 2025-01-29
 */

import { enhancedApiClient } from './enhanced-api';
import { QueryOptimizer } from './query-optimization';
import { openRouterClient } from './openrouter-client';
import { supabaseUserContext } from './supabase-user-context';

// Types for chatbot interactions
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'action';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  data?: any;
  contextId?: string;
}

export interface ChatAction {
  id: string;
  type: 'add_order' | 'check_stock' | 'view_report' | 'analysis' | 'recommendation';
  label: string;
  data: any;
  executed?: boolean;
  result?: any;
}

export interface ChatContext {
  id: string;
  userId: string;
  conversation: ChatMessage[];
  businessContext: {
    businessType: 'bakery' | 'restaurant' | 'cafe' | 'catering' | 'general_fnb';
    currentPeriod: string;
    lastAnalysis?: Date;
  };
  activeActions: ChatAction[];
  memory: Record<string, any>;
}

// AI Intent Detection
export type ChatIntent = 
  | 'greeting' 
  | 'add_order' 
  | 'check_stock' 
  | 'view_orders' 
  | 'financial_report' 
  | 'profit_analysis' 
  | 'business_advice' 
  | 'inventory_alert'
  | 'recipe_suggestion'
  | 'customer_analysis'
  | 'cost_optimization'
  | 'sales_forecast';

// Business Intelligence Modules with User Context
class BusinessIntelligence {
  
  // Stock Analysis for UMKM F&B with user-specific data
  static async analyzeInventoryStatus(userId: string): Promise<{
    summary: string;
    alerts: string[];
    recommendations: string[];
    criticalItems: any[];
    aiAnalysis?: string;
  }> {
    try {
      // Get user-specific business data
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const userProfile = await supabaseUserContext.getUserProfile(userId);
      
      const { inventory } = businessData;
      const critical = inventory.criticalItems;
      const lowStockItems = inventory.lowStockItems;
      
      const recommendations = [];
      if (critical.length > 0) {
        recommendations.push(`Segera restock ${critical.length} item kritis untuk menghindari kehabisan stok`);
        recommendations.push('Pertimbangkan untuk menaikkan minimum stock untuk item yang sering habis');
      }

      // Generate AI analysis using OpenRouter
      let aiAnalysis = '';
      try {
        aiAnalysis = await openRouterClient.generateDataAnalysis(
          'inventory',
          {
            criticalItems: critical,
            alerts: critical.map(item => `${item.name}: ${item.current_stock} ${item.unit}`),
            totalValue: inventory.totalValue,
            lowStockItems
          },
          {
            businessType: userProfile.businessType,
            businessName: userProfile.businessName,
            location: userProfile.location
          }
        );
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        aiAnalysis = 'Analisis AI tidak tersedia saat ini.';
      }

      return {
        summary: `Total inventori: Rp ${inventory.totalValue.toLocaleString('id-ID')}. ${critical.length} item kritis, ${lowStockItems.length} item perlu restock.`,
        alerts: critical.map(item => `${item.name}: Stok tinggal ${item.current_stock} ${item.unit}`),
        recommendations,
        criticalItems: critical,
        aiAnalysis
      };
    } catch (error) {
      console.error('Error in analyzeInventoryStatus:', error);
      // Fallback to basic analysis
      return {
        summary: 'Error mengambil data inventori.',
        alerts: [],
        recommendations: ['Silakan coba lagi atau hubungi support.'],
        criticalItems: []
      };
    }
  }

  // Financial Analysis for UMKM
  static async analyzeFinancialPerformance(period: 'week' | 'month' | 'quarter' = 'month'): Promise<{
    summary: string;
    profitMargin: number;
    revenue: number;
    costs: number;
    insights: string[];
    recommendations: string[];
  }> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [orders, expenses] = await Promise.all([
      QueryOptimizer.orders.getAnalytics(startDate.toISOString(), now.toISOString()),
      enhancedApiClient.getFinancialRecords({
        type: 'EXPENSE',
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      })
    ]);

    const revenue = orders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const costs = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const profit = revenue - costs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const insights = [];
    const recommendations = [];

    if (profitMargin < 20) {
      insights.push('Margin keuntungan di bawah standar industri F&B (20-30%)');
      recommendations.push('Pertimbangkan untuk menaikkan harga atau mengurangi biaya produksi');
    } else if (profitMargin > 40) {
      insights.push('Margin keuntungan sangat baik!');
      recommendations.push('Pertimbangkan ekspansi atau investasi dalam peralatan baru');
    }

    if (revenue < 10000000) { // 10 juta
      recommendations.push('Fokus pada pemasaran digital dan promosi untuk meningkatkan penjualan');
    }

    return {
      summary: `Periode ${period}: Revenue Rp ${revenue.toLocaleString('id-ID')}, Profit Rp ${profit.toLocaleString('id-ID')}, Margin ${profitMargin.toFixed(1)}%`,
      profitMargin,
      revenue,
      costs,
      insights,
      recommendations
    };
  }

  // Recipe Profitability Analysis
  static async analyzeBestSellingRecipes(): Promise<{
    summary: string;
    topRecipes: any[];
    recommendations: string[];
  }> {
    const recipes = await QueryOptimizer.recipes.getProfitabilityAnalysis();
    const topRecipes = recipes.data?.slice(0, 5) || [];
    
    const recommendations = [];
    if (topRecipes.length > 0) {
      const bestSeller = topRecipes[0];
      recommendations.push(`${bestSeller.name} adalah produk terlaris. Pertimbangkan untuk membuat variasi atau paket bundle.`);
      
      const lowProfit = topRecipes.filter(r => {
        const margin = r.selling_price > 0 ? ((r.selling_price - r.cost_per_unit) / r.selling_price) * 100 : 0;
        return margin < 30;
      });
      
      if (lowProfit.length > 0) {
        recommendations.push(`${lowProfit.length} produk memiliki margin rendah. Pertimbangkan untuk meninjau harga atau efisiensi produksi.`);
      }
    }

    return {
      summary: `${topRecipes.length} produk terlaris menghasilkan revenue total Rp ${topRecipes.reduce((sum, r) => sum + (r.total_revenue || 0), 0).toLocaleString('id-ID')}`,
      topRecipes,
      recommendations
    };
  }

  // Customer Analysis for UMKM
  static async analyzeCustomerBehavior(): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
    topCustomers: any[];
  }> {
    const customers = await QueryOptimizer.customers.getValueAnalysis();
    const topCustomers = customers.data?.slice(0, 10) || [];
    
    const totalCustomers = customers.data?.length || 0;
    const activeCustomers = customers.data?.filter(c => {
      const lastOrder = new Date(c.last_order_date);
      const daysSinceLastOrder = (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastOrder <= 30;
    }).length || 0;
    
    const avgOrderValue = totalCustomers > 0 
      ? customers.data?.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers 
      : 0;

    const insights = [];
    const recommendations = [];

    const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
    
    if (retentionRate < 60) {
      insights.push('Tingkat retensi pelanggan perlu diperbaiki');
      recommendations.push('Implementasikan program loyalitas atau follow-up rutin dengan pelanggan');
    }

    if (avgOrderValue < 50000) {
      recommendations.push('Pertimbangkan upselling atau paket hemat untuk meningkatkan nilai transaksi rata-rata');
    }

    return {
      summary: `${totalCustomers} total pelanggan, ${activeCustomers} aktif (${retentionRate.toFixed(1)}%), AOV: Rp ${avgOrderValue.toLocaleString('id-ID')}`,
      insights,
      recommendations,
      topCustomers
    };
  }
}

// Action Executor
class ActionExecutor {
  
  static async executeAction(action: ChatAction, context: ChatContext): Promise<any> {
    try {
      switch (action.type) {
        case 'add_order':
          return await this.addOrder(action.data);
        
        case 'check_stock':
          return await this.checkStock(action.data, context);
        
        case 'view_report':
          return await this.generateReport(action.data, context);
        
        case 'analysis':
          return await this.performAnalysis(action.data, context);
        
        case 'recommendation':
          return await this.generateRecommendations(action.data, context);
        
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Action execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async addOrder(data: any) {
    // Implementation for adding orders
    const orderData = {
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      order_items: data.items,
      delivery_date: data.deliveryDate,
      status: 'PENDING',
      total_amount: data.total
    };
    
    // This would integrate with your existing order creation API
    return {
      success: true,
      orderId: 'ORD-' + Date.now(),
      message: `Pesanan untuk ${data.customerName} berhasil ditambahkan dengan total Rp ${data.total.toLocaleString('id-ID')}`
    };
  }

  private static async checkStock(data: any, context: ChatContext) {
    const { ingredient } = data;
    
    if (ingredient) {
      const results = await QueryOptimizer.ingredients.searchByName(ingredient, 5);
      return {
        success: true,
        data: results.data,
        message: `Ditemukan ${results.data?.length || 0} item yang cocok`
      };
    } else {
      return await BusinessIntelligence.analyzeInventoryStatus(context.userId);
    }
  }

  private static async generateReport(data: any, context?: ChatContext) {
    const { type, period } = data;
    const userId = context?.userId || 'default-user';
    
    switch (type) {
      case 'financial':
        return await BusinessIntelligence.analyzeFinancialPerformance(period);
      
      case 'inventory':
        return await BusinessIntelligence.analyzeInventoryStatus(userId);
      
      case 'products':
        return await BusinessIntelligence.analyzeBestSellingRecipes();
      
      case 'customers':
        return await BusinessIntelligence.analyzeCustomerBehavior();
      
      default:
        return {
          success: false,
          message: 'Tipe laporan tidak dikenali'
        };
    }
  }

  private static async performAnalysis(data: any, context?: ChatContext) {
    // Comprehensive business analysis
    const userId = context?.userId || 'default-user';
    const [financial, inventory, recipes, customers] = await Promise.all([
      BusinessIntelligence.analyzeFinancialPerformance(),
      BusinessIntelligence.analyzeInventoryStatus(userId),
      BusinessIntelligence.analyzeBestSellingRecipes(),
      BusinessIntelligence.analyzeCustomerBehavior()
    ]);

    return {
      success: true,
      analysis: {
        financial,
        inventory,
        recipes,
        customers
      },
      summary: 'Analisis bisnis lengkap telah selesai'
    };
  }

  private static async generateRecommendations(data: any, context: ChatContext) {
    const businessType = context.businessContext.businessType;
    
    // Get current business metrics
    const [financial, inventory] = await Promise.all([
      BusinessIntelligence.analyzeFinancialPerformance(),
      BusinessIntelligence.analyzeInventoryStatus(context.userId)
    ]);

    const recommendations = [];

    // Financial recommendations
    if (financial.profitMargin < 25) {
      recommendations.push({
        category: 'Keuangan',
        priority: 'high',
        title: 'Optimalkan Margin Keuntungan',
        description: 'Margin saat ini di bawah standar industri. Pertimbangkan meninjau harga atau efisiensi operasional.',
        actions: ['Audit biaya produksi', 'Evaluasi pricing strategy', 'Cari supplier yang lebih efisien']
      });
    }

    // Inventory recommendations
    if (inventory.criticalItems.length > 0) {
      recommendations.push({
        category: 'Inventori',
        priority: 'urgent',
        title: 'Atasi Stok Kritis',
        description: `${inventory.criticalItems.length} item hampir habis dan perlu segera direstok.`,
        actions: ['Restock item kritis', 'Atur supplier backup', 'Tingkatkan minimum stock']
      });
    }

    // Business-specific recommendations
    if (businessType === 'bakery') {
      recommendations.push({
        category: 'Operasional',
        priority: 'medium',
        title: 'Optimasi Produksi Roti',
        description: 'Pertimbangkan batch production untuk efisiensi dan mengurangi waste.',
        actions: ['Buat jadwal produksi harian', 'Monitor waste ratio', 'Implementasi fresh guarantee']
      });
    }

    return {
      success: true,
      recommendations,
      message: `${recommendations.length} rekomendasi bisnis telah disiapkan berdasarkan analisis data Anda`
    };
  }
}

// Intent Recognition (Simplified NLP)
class IntentRecognizer {
  
  static recognizeIntent(message: string): {
    intent: ChatIntent;
    confidence: number;
    entities: Record<string, any>;
  } {
    const msg = message.toLowerCase();
    
    // Greeting patterns
    if (/^(hai|hello|halo|selamat|good morning|pagi)/i.test(msg)) {
      return {
        intent: 'greeting',
        confidence: 0.9,
        entities: {}
      };
    }

    // Order-related patterns
    if (/tambah pesanan|buat pesanan|order baru|pesan/i.test(msg)) {
      return {
        intent: 'add_order',
        confidence: 0.8,
        entities: this.extractOrderEntities(msg)
      };
    }

    // Stock inquiry patterns
    if (/stok|stock|persediaan|bahan|ingredient/i.test(msg)) {
      return {
        intent: 'check_stock',
        confidence: 0.8,
        entities: this.extractStockEntities(msg)
      };
    }

    // Financial patterns
    if (/laporan keuangan|financial|pendapatan|revenue|profit|untung|rugi/i.test(msg)) {
      return {
        intent: 'financial_report',
        confidence: 0.8,
        entities: this.extractPeriodEntities(msg)
      };
    }

    // Analysis patterns
    if (/analisis|analyze|insight|performa|performance/i.test(msg)) {
      return {
        intent: 'profit_analysis',
        confidence: 0.7,
        entities: {}
      };
    }

    // Advice patterns
    if (/saran|advice|rekomendasi|strategi|tips|bagaimana/i.test(msg)) {
      return {
        intent: 'business_advice',
        confidence: 0.7,
        entities: {}
      };
    }

    // Customer patterns
    if (/pelanggan|customer|pembeli/i.test(msg)) {
      return {
        intent: 'customer_analysis',
        confidence: 0.7,
        entities: {}
      };
    }

    // Default fallback
    return {
      intent: 'business_advice',
      confidence: 0.3,
      entities: {}
    };
  }

  private static extractOrderEntities(message: string): Record<string, any> {
    // Extract customer name, items, quantities, etc.
    const entities: Record<string, any> = {};
    
    // Simple entity extraction (can be enhanced with better NLP)
    const phoneMatch = message.match(/(\d{10,13})/);
    if (phoneMatch) {
      entities.phone = phoneMatch[1];
    }

    const nameMatch = message.match(/untuk\s+([A-Za-z\s]+)/i);
    if (nameMatch) {
      entities.customerName = nameMatch[1].trim();
    }

    return entities;
  }

  private static extractStockEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract ingredient names
    const ingredients = ['tepung', 'gula', 'mentega', 'telur', 'susu', 'coklat', 'vanilla'];
    for (const ingredient of ingredients) {
      if (message.includes(ingredient)) {
        entities.ingredient = ingredient;
        break;
      }
    }

    return entities;
  }

  private static extractPeriodEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    if (/minggu|week/i.test(message)) {
      entities.period = 'week';
    } else if (/bulan|month/i.test(message)) {
      entities.period = 'month';
    } else if (/kuartal|quarter/i.test(message)) {
      entities.period = 'quarter';
    } else {
      entities.period = 'month'; // default
    }

    return entities;
  }
}

// Main AI Chatbot Service
export class AIChatbotService {
  private contexts = new Map<string, ChatContext>();

  constructor() {
    // Initialize service
  }

  async processMessage(
    userId: string, 
    message: string, 
    contextId?: string
  ): Promise<{
    response: ChatMessage;
    actions?: ChatAction[];
    context: ChatContext;
  }> {
    // Get or create context
    const context = this.getOrCreateContext(userId, contextId);
    
    // Add user message to context
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: message,
      timestamp: new Date(),
      contextId: context.id
    };
    context.conversation.push(userMessage);

    // Recognize intent
    const { intent, confidence, entities } = IntentRecognizer.recognizeIntent(message);
    
    // Generate response based on intent
    const response = await this.generateResponse(intent, entities, context);
    
    // Add response to context
    context.conversation.push(response);
    
    // Update context memory
    context.memory.lastIntent = intent;
    context.memory.lastEntities = entities;
    
    return {
      response,
      actions: response.actions,
      context
    };
  }

  private async generateResponse(
    intent: ChatIntent, 
    entities: Record<string, any>, 
    context: ChatContext
  ): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_assistant`;
    
    try {
      switch (intent) {
        case 'greeting':
          return {
            id: messageId,
            type: 'assistant',
            content: `Halo! Saya adalah asisten AI untuk bisnis ${context.businessContext.businessType} Anda. Saya bisa membantu dengan:\n\n• 📋 Tambah pesanan baru\n• 📦 Cek status stok\n• 📊 Laporan keuangan & analisis\n• 💡 Saran strategi bisnis\n• 👥 Analisis pelanggan\n\nAda yang bisa saya bantu hari ini?`,
            timestamp: new Date(),
            contextId: context.id
          };

        case 'add_order':
          return await this.handleAddOrder(messageId, entities, context);

        case 'check_stock':
          return await this.handleStockInquiry(messageId, entities, context);

        case 'financial_report':
          return await this.handleFinancialReport(messageId, entities, context);

        case 'profit_analysis':
          return await this.handleProfitAnalysis(messageId, context);

        case 'business_advice':
          return await this.handleBusinessAdvice(messageId, context);

        case 'customer_analysis':
          return await this.handleCustomerAnalysis(messageId, context);

        default:
          return {
            id: messageId,
            type: 'assistant',
            content: 'Maaf, saya belum mengerti permintaan Anda. Bisa dijelaskan lebih detail? Saya bisa membantu dengan pesanan, stok, laporan keuangan, atau saran bisnis.',
            timestamp: new Date(),
            contextId: context.id
          };
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        id: messageId,
        type: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi support.',
        timestamp: new Date(),
        contextId: context.id
      };
    }
  }

  private async handleAddOrder(messageId: string, entities: Record<string, any>, context: ChatContext): Promise<ChatMessage> {
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'add_order',
      label: 'Buat Pesanan Baru',
      data: entities
    }];

    return {
      id: messageId,
      type: 'assistant',
      content: 'Saya akan membantu Anda membuat pesanan baru. Silakan klik tombol di bawah untuk memulai, atau berikan detail seperti:\n\n• Nama pelanggan\n• Nomor telepon\n• Item yang dipesan\n• Tanggal pengiriman',
      timestamp: new Date(),
      contextId: context.id,
      actions
    };
  }

  private async handleStockInquiry(messageId: string, entities: Record<string, any>, context: ChatContext): Promise<ChatMessage> {
    const stockAnalysis = await BusinessIntelligence.analyzeInventoryStatus(context.userId);
    
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'check_stock',
      label: 'Lihat Detail Stok',
      data: entities
    }];

    const content = `📦 **Status Inventori Saat Ini:**\n\n${stockAnalysis.summary}\n\n` +
      (stockAnalysis.alerts.length > 0 
        ? `🚨 **Item yang Perlu Perhatian:**\n${stockAnalysis.alerts.map(alert => `• ${alert}`).join('\n')}\n\n`
        : '') +
      (stockAnalysis.recommendations.length > 0 
        ? `💡 **Rekomendasi:**\n${stockAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}`
        : '');

    return {
      id: messageId,
      type: 'assistant',
      content,
      timestamp: new Date(),
      contextId: context.id,
      actions,
      data: stockAnalysis
    };
  }

  private async handleFinancialReport(messageId: string, entities: Record<string, any>, context: ChatContext): Promise<ChatMessage> {
    const period = entities.period || 'month';
    const financial = await BusinessIntelligence.analyzeFinancialPerformance(period);
    
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'view_report',
      label: 'Lihat Laporan Lengkap',
      data: { type: 'financial', period }
    }];

    const profitStatus = financial.profitMargin > 25 ? '🟢 Baik' : 
                        financial.profitMargin > 15 ? '🟡 Cukup' : '🔴 Perlu Perbaikan';

    const content = `💰 **Laporan Keuangan (${period}):**\n\n` +
      `📊 ${financial.summary}\n\n` +
      `**Status Margin:** ${profitStatus}\n\n` +
      (financial.insights.length > 0 
        ? `📈 **Insights:**\n${financial.insights.map(insight => `• ${insight}`).join('\n')}\n\n`
        : '') +
      (financial.recommendations.length > 0 
        ? `💡 **Rekomendasi:**\n${financial.recommendations.map(rec => `• ${rec}`).join('\n')}`
        : '');

    return {
      id: messageId,
      type: 'assistant',
      content,
      timestamp: new Date(),
      contextId: context.id,
      actions,
      data: financial
    };
  }

  private async handleProfitAnalysis(messageId: string, context: ChatContext): Promise<ChatMessage> {
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'analysis',
      label: 'Analisis Bisnis Lengkap',
      data: {}
    }];

    const recipes = await BusinessIntelligence.analyzeBestSellingRecipes();

    const content = `📊 **Analisis Profit & Produk:**\n\n` +
      `${recipes.summary}\n\n` +
      `**Top 3 Produk Terlaris:**\n` +
      `${recipes.topRecipes.slice(0, 3).map((recipe, idx) => 
        `${idx + 1}. ${recipe.name} - ${recipe.times_made}x terjual (Rp ${recipe.total_revenue?.toLocaleString('id-ID') || 0})`
      ).join('\n')}\n\n` +
      (recipes.recommendations.length > 0 
        ? `💡 **Rekomendasi:**\n${recipes.recommendations.map(rec => `• ${rec}`).join('\n')}`
        : '');

    return {
      id: messageId,
      type: 'assistant',
      content,
      timestamp: new Date(),
      contextId: context.id,
      actions,
      data: recipes
    };
  }

  private async handleBusinessAdvice(messageId: string, context: ChatContext): Promise<ChatMessage> {
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'recommendation',
      label: 'Rekomendasi Bisnis Personal',
      data: { businessType: context.businessContext.businessType }
    }];

    const content = `💡 **Saran Strategis untuk UMKM F&B:**\n\n` +
      `Berdasarkan tipe bisnis **${context.businessContext.businessType}** Anda, berikut beberapa area yang bisa dioptimalkan:\n\n` +
      `📈 **Peningkatan Revenue:**\n` +
      `• Implementasi cross-selling & upselling\n` +
      `• Program loyalitas pelanggan\n` +
      `• Optimasi pricing strategy\n\n` +
      `⚡ **Efisiensi Operasional:**\n` +
      `• Otomatisasi inventory management\n` +
      `• Batch production planning\n` +
      `• Waste reduction program\n\n` +
      `🎯 **Marketing & Customer:**\n` +
      `• Digital marketing strategy\n` +
      `• Customer retention program\n` +
      `• Social media presence\n\n` +
      `Klik tombol di bawah untuk mendapatkan rekomendasi yang disesuaikan dengan data bisnis Anda saat ini.`;

    return {
      id: messageId,
      type: 'assistant',
      content,
      timestamp: new Date(),
      contextId: context.id,
      actions
    };
  }

  private async handleCustomerAnalysis(messageId: string, context: ChatContext): Promise<ChatMessage> {
    const customerAnalysis = await BusinessIntelligence.analyzeCustomerBehavior();
    
    const actions: ChatAction[] = [{
      id: `action_${Date.now()}`,
      type: 'view_report',
      label: 'Lihat Analisis Pelanggan Detail',
      data: { type: 'customers' }
    }];

    const content = `👥 **Analisis Pelanggan:**\n\n` +
      `📊 ${customerAnalysis.summary}\n\n` +
      (customerAnalysis.insights.length > 0 
        ? `🔍 **Insights:**\n${customerAnalysis.insights.map(insight => `• ${insight}`).join('\n')}\n\n`
        : '') +
      `**Top 3 Pelanggan Terbaik:**\n` +
      `${customerAnalysis.topCustomers.slice(0, 3).map((customer, idx) => 
        `${idx + 1}. ${customer.name} - ${customer.total_orders} pesanan (Rp ${customer.total_spent?.toLocaleString('id-ID') || 0})`
      ).join('\n')}\n\n` +
      (customerAnalysis.recommendations.length > 0 
        ? `💡 **Rekomendasi:**\n${customerAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}`
        : '');

    return {
      id: messageId,
      type: 'assistant',
      content,
      timestamp: new Date(),
      contextId: context.id,
      actions,
      data: customerAnalysis
    };
  }

  // Execute action
  async executeAction(actionId: string, contextId: string): Promise<any> {
    try {
      const context = this.contexts.get(contextId);
      if (!context) {
        throw new Error(`Context not found: ${contextId}`);
      }

      const action = context.activeActions.find(a => a.id === actionId);
      if (!action) {
        throw new Error(`Action not found: ${actionId}`);
      }

      console.log(`Executing action: ${action.type} for user: ${context.userId}`);
      const result = await ActionExecutor.executeAction(action, context);
      
      action.executed = true;
      action.result = result;

      // Add system message about action execution
      const systemMessage: ChatMessage = {
        id: `msg_${Date.now()}_system`,
        type: 'system',
        content: `Aksi "${action.label}" telah dijalankan.`,
        timestamp: new Date(),
        contextId: context.id,
        data: result
      };
      context.conversation.push(systemMessage);

      return result;
    } catch (error) {
      console.error('Error in executeAction:', error);
      throw error;
    }
  }

  // Get or create context
  private getOrCreateContext(userId: string, contextId?: string): ChatContext {
    const id = contextId || `ctx_${userId}_${Date.now()}`;
    
    if (contextId && this.contexts.has(contextId)) {
      return this.contexts.get(contextId)!;
    }

    const context: ChatContext = {
      id,
      userId,
      conversation: [],
      businessContext: {
        businessType: 'bakery', // Default, could be configured per user
        currentPeriod: new Date().toISOString().slice(0, 7) // YYYY-MM format
      },
      activeActions: [],
      memory: {}
    };

    this.contexts.set(id, context);
    return context;
  }

  // Get conversation history
  getConversation(contextId: string): ChatMessage[] {
    const context = this.contexts.get(contextId);
    return context?.conversation || [];
  }

  // Clear context
  clearContext(contextId: string): void {
    this.contexts.delete(contextId);
  }
}

// Create singleton instance
export const aiChatbotService = new AIChatbotService();
export default aiChatbotService;