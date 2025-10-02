/**
 * AI Chatbot Service (Main Entry Point)
 * Orchestrates intent detection, business intelligence, and action execution
 * Split from 926-line monolith into modular architecture
 */

import { formatCurrency } from '@/shared/utils/currency';
import { 
  ChatMessage, 
  ChatAction, 
  ChatContext, 
  ChatIntent,
  IntentResult 
} from './types';
import { IntentDetector } from './intent-detector';
import { BusinessIntelligence } from './business-intelligence';
import { ActionExecutor } from './action-executor';
import { openRouterClient } from '../openrouter-client';
import { supabaseUserContext } from '../supabase-user-context';

export * from './types';

/**
 * Main AI Chatbot Service
 */
export class AIChatbotService {
  private contexts: Map<string, ChatContext> = new Map();
  
  /**
   * Process user message and generate response
   */
  async processMessage(
    userId: string,
    message: string,
    contextId?: string
  ): Promise<{
    response: string;
    actions?: ChatAction[];
    intent: ChatIntent;
    data?: any;
  }> {
    try {
      // Get or create context
      const context = this.getOrCreateContext(userId, contextId);
      
      // Detect intent
      const intentResult = await IntentDetector.detectIntent(message, context);
      
      // Add user message to context
      const userMessage: ChatMessage = {
        id: this.generateMessageId(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        contextId: context.id
      };
      context.conversation.push(userMessage);
      
      // Generate response based on intent
      const { response, actions, data } = await this.generateResponse(
        userId,
        intentResult,
        context
      );
      
      // Add assistant response to context
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        actions,
        data,
        contextId: context.id
      };
      context.conversation.push(assistantMessage);
      
      // Update context
      this.contexts.set(context.id, context);
      
      return {
        response,
        actions,
        intent: intentResult.intent,
        data
      };
    } catch (error: any) {
      console.error('Error processing message:', error);
      return {
        response: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        intent: 'greeting'
      };
    }
  }
  
  /**
   * Execute a chat action
   */
  async executeAction(
    userId: string,
    action: ChatAction
  ): Promise<any> {
    try {
      const result = await ActionExecutor.executeAction(action, userId);
      
      // Update action status
      action.executed = true;
      action.result = result;
      
      return result;
    } catch (error: any) {
      console.error('Error executing action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed'
      };
    }
  }
  
  /**
   * Generate response based on detected intent
   */
  private async generateResponse(
    userId: string,
    intentResult: IntentResult,
    context: ChatContext
  ): Promise<{
    response: string;
    actions?: ChatAction[];
    data?: any;
  }> {
    const { intent, entities } = intentResult;
    
    switch (intent) {
      case 'greeting':
        return this.handleGreeting(userId, context);
      
      case 'check_stock':
        return this.handleCheckStock(userId);
      
      case 'financial_report':
        return this.handleFinancialReport(userId, entities);
      
      case 'profit_analysis':
        return this.handleProfitAnalysis(userId);
      
      case 'business_advice':
        return this.handleBusinessAdvice(userId, context);
      
      case 'add_order':
        return this.handleAddOrder();
      
      case 'view_orders':
        return this.handleViewOrders(userId);
      
      default:
        return {
          response: 'Saya belum mengerti maksud Anda. Bisa dijelaskan lebih detail?',
          actions: intentResult.suggestedActions.map(label => ({
            id: this.generateMessageId(),
            type: 'recommendation',
            label,
            data: {}
          }))
        };
    }
  }
  
  /**
   * Handle greeting intent
   */
  private async handleGreeting(userId: string, context: ChatContext): Promise<any> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const userProfile = await supabaseUserContext.getUserProfile(userId);
      
      const greeting = this.getContextualGreeting();
      const userName = userProfile.full_name || 'Boss';
      
      // Quick stats
      const stats = {
        revenue: businessData.financial?.totalRevenue || 0,
        orders: businessData.orders?.length || 0,
        criticalStock: businessData.inventory?.criticalItems?.length || 0
      };
      
      let response = `${greeting} ${userName}! 👋\n\n`;
      response += `📊 Quick Overview:\n`;
      response += `• Revenue hari ini: ${formatCurrency(stats.revenue)}\n`;
      response += `• Pesanan aktif: ${stats.orders}\n`;
      
      if (stats.criticalStock > 0) {
        response += `\n⚠️ Perhatian: ${stats.criticalStock} item stok kritis perlu direstock!\n`;
      }
      
      response += `\nAda yang bisa saya bantu?`;
      
      const actions: ChatAction[] = [
        {
          id: this.generateMessageId(),
          type: 'check_stock',
          label: '📦 Cek Stok',
          data: {}
        },
        {
          id: this.generateMessageId(),
          type: 'view_report',
          label: '📊 Laporan Keuangan',
          data: { type: 'financial' }
        },
        {
          id: this.generateMessageId(),
          type: 'analysis',
          label: '💡 Analisa Bisnis',
          data: { type: 'general' }
        }
      ];
      
      return { response, actions, data: stats };
    } catch (error: any) {
      return { response: 'Halo! Ada yang bisa saya bantu?' };
    }
  }
  
  /**
   * Handle check stock intent
   */
  private async handleCheckStock(userId: string): Promise<any> {
    try {
      const analysis = await BusinessIntelligence.analyzeInventoryStatus(userId);
      
      let response = `📦 Status Inventory:\n\n`;
      response += analysis.summary + '\n\n';
      
      if (analysis.alerts.length > 0) {
        response += `⚠️ Alerts:\n`;
        analysis.alerts.forEach(alert => {
          response += `• ${alert}\n`;
        });
        response += '\n';
      }
      
      if (analysis.recommendations.length > 0) {
        response += `💡 Rekomendasi:\n`;
        analysis.recommendations.forEach(rec => {
          response += `• ${rec}\n`;
        });
      }
      
      if (analysis.aiAnalysis) {
        response += `\n\n🤖 AI Insights:\n${analysis.aiAnalysis}`;
      }
      
      const actions: ChatAction[] = analysis.criticalItems.length > 0 ? [{
        id: this.generateMessageId(),
        type: 'recommendation',
        label: '🛒 Reorder Sekarang',
        data: { items: analysis.criticalItems }
      }] : [];
      
      return { response, actions, data: analysis };
    } catch (error: any) {
      return { response: 'Gagal mengecek stok. Silakan coba lagi.' };
    }
  }
  
  /**
   * Handle financial report intent
   */
  private async handleFinancialReport(userId: string, entities: any): Promise<any> {
    try {
      const period = entities.timeframe || 'this_month';
      const analysis = await BusinessIntelligence.analyzeFinancialPerformance(userId, period);
      
      let response = `💰 Laporan Keuangan (${period}):\n\n`;
      response += analysis.summary + '\n\n';
      response += `📈 Metrics:\n`;
      response += `• Revenue: ${formatCurrency(analysis.metrics.revenue)}\n`;
      response += `• Expenses: ${formatCurrency(analysis.metrics.expenses)}\n`;
      response += `• Profit: ${formatCurrency(analysis.metrics.profit)}\n`;
      response += `• Margin: ${analysis.metrics.margin.toFixed(1)}%\n\n`;
      
      if (analysis.trends.length > 0) {
        response += `📊 Trends:\n`;
        analysis.trends.forEach(trend => {
          response += `${trend}\n`;
        });
      }
      
      if (analysis.aiInsights) {
        response += `\n\n🤖 AI Insights:\n${analysis.aiInsights}`;
      }
      
      return { response, data: analysis };
    } catch (error: any) {
      return { response: 'Gagal mengambil laporan keuangan.' };
    }
  }
  
  /**
   * Handle profit analysis intent
   */
  private async handleProfitAnalysis(userId: string): Promise<any> {
    return this.handleFinancialReport(userId, {});
  }
  
  /**
   * Handle business advice intent
   */
  private async handleBusinessAdvice(userId: string, context: ChatContext): Promise<any> {
    try {
      const lastMessage = context.conversation[context.conversation.length - 1];
      const advice = await BusinessIntelligence.generateBusinessAdvice(
        userId,
        lastMessage.content,
        context
      );
      
      let response = `💡 Business Advice:\n\n`;
      response += advice.advice + '\n\n';
      
      if (advice.actionItems.length > 0) {
        response += `🎯 Action Items:\n`;
        advice.actionItems.forEach((item, i) => {
          response += `${i + 1}. ${item}\n`;
        });
      }
      
      return { response, data: advice };
    } catch (error: any) {
      return { response: 'Maaf, belum bisa memberikan advice saat ini.' };
    }
  }
  
  /**
   * Handle add order intent
   */
  private handleAddOrder(): any {
    return {
      response: 'Mari kita buat pesanan baru. Siapa nama pelanggannya?',
      actions: [{
        id: this.generateMessageId(),
        type: 'add_order',
        label: '📝 Form Pesanan',
        data: { openForm: true }
      }]
    };
  }
  
  /**
   * Handle view orders intent
   */
  private async handleViewOrders(userId: string): Promise<any> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const orders = businessData.orders || [];
      
      let response = `📋 Pesanan Terbaru:\n\n`;
      
      if (orders.length === 0) {
        response += 'Belum ada pesanan.';
      } else {
        orders.slice(0, 5).forEach((order: any) => {
          response += `• ${order.order_number} - ${order.customer_name} (${order.status})\n`;
        });
        
        if (orders.length > 5) {
          response += `\n...dan ${orders.length - 5} pesanan lainnya`;
        }
      }
      
      return { response, data: { orders } };
    } catch (error: any) {
      return { response: 'Gagal mengambil data pesanan.' };
    }
  }
  
  /**
   * Get contextual greeting based on time
   */
  private getContextualGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }
  
  /**
   * Get or create chat context
   */
  private getOrCreateContext(userId: string, contextId?: string): ChatContext {
    const id = contextId || this.generateContextId();
    
    if (this.contexts.has(id)) {
      return this.contexts.get(id)!;
    }
    
    const newContext: ChatContext = {
      id,
      userId,
      conversation: [],
      businessContext: {
        businessType: 'bakery',
        currentPeriod: 'this_month'
      },
      activeActions: [],
      memory: {}
    };
    
    this.contexts.set(id, newContext);
    return newContext;
  }
  
  /**
   * Generate unique IDs
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiChatbot = new AIChatbotService();

// Export for backward compatibility
export default aiChatbot;
