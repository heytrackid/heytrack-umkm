/**
 * Business Intelligence Module
 * Analyzes business data and provides insights
 */

import { formatCurrency } from '@/shared/utils/currency';
import { InventoryAnalysisResult, FinancialAnalysisResult, BusinessAdviceResult } from './types';
import { enhancedApiClient } from '../enhanced-api';
import { openRouterClient } from '../openrouter-client';
import { supabaseUserContext } from '../supabase-user-context';

export class BusinessIntelligence {
  
  /**
   * Analyze inventory status with AI insights
   */
  static async analyzeInventoryStatus(userId: string): Promise<InventoryAnalysisResult> {
    try {
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

      // Generate AI analysis
      let aiAnalysis = '';
      try {
        aiAnalysis = await openRouterClient.generateDataAnalysis(
          'inventory',
          {
            criticalItems: critical,
            alerts: critical.map((item: any) => `${item.name}: ${item.current_stock} ${item.unit}`),
            totalValue: inventory.totalValue,
            lowStockItems
          },
          {
            businessType: userProfile.business_type || 'bakery',
            location: userProfile.location || 'Indonesia'
          }
        );
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
      
      return {
        summary: critical.length > 0 
          ? `⚠️ ${critical.length} item stok kritis membutuhkan perhatian segera!`
          : '✅ Semua stok dalam kondisi baik',
        alerts: critical.map((item: any) => 
          `${item.name}: Stok tersisa ${item.current_stock} ${item.unit} (minimum: ${item.minimum_stock})`
        ),
        recommendations,
        criticalItems: critical,
        aiAnalysis
      };
    } catch (error) {
      console.error('Inventory analysis error:', error);
      return {
        summary: 'Error menganalisa inventory',
        alerts: [],
        recommendations: [],
        criticalItems: []
      };
    }
  }
  
  /**
   * Analyze financial performance
   */
  static async analyzeFinancialPerformance(userId: string, period: string = 'this_month'): Promise<FinancialAnalysisResult> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const { financial } = businessData;
      
      const revenue = financial.totalRevenue || 0;
      const expenses = financial.totalExpenses || 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      const trends = [];
      if (margin > 30) {
        trends.push('📈 Margin profit sangat bagus di atas 30%');
      } else if (margin > 20) {
        trends.push('✅ Margin profit sehat antara 20-30%');
      } else if (margin > 10) {
        trends.push('⚠️ Margin profit cukup, ada ruang untuk optimasi');
      } else {
        trends.push('🔴 Margin profit rendah, perlu evaluasi biaya');
      }
      
      const recommendations = [];
      if (margin < 20) {
        recommendations.push('Evaluasi harga jual produk untuk meningkatkan margin');
        recommendations.push('Cari supplier dengan harga lebih kompetitif');
        recommendations.push('Kurangi waste dengan inventory management yang lebih baik');
      }
      
      // Generate AI insights
      let aiInsights = '';
      try {
        aiInsights = await openRouterClient.generateDataAnalysis(
          'financial',
          {
            revenue,
            expenses,
            profit,
            margin,
            period
          },
          {
            businessType: 'bakery',
            targetMargin: 25
          }
        );
      } catch (error) {
        console.error('AI financial analysis failed:', error);
      }
      
      return {
        summary: `Profit ${formatCurrency(profit)} (${margin.toFixed(1)}% margin)`,
        metrics: { revenue, expenses, profit, margin },
        trends,
        recommendations,
        aiInsights
      };
    } catch (error) {
      console.error('Financial analysis error:', error);
      return {
        summary: 'Error menganalisa keuangan',
        metrics: { revenue: 0, expenses: 0, profit: 0, margin: 0 },
        trends: [],
        recommendations: []
      };
    }
  }
  
  /**
   * Generate business advice using AI
   */
  static async generateBusinessAdvice(
    userId: string,
    question: string,
    context?: any
  ): Promise<BusinessAdviceResult> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const userProfile = await supabaseUserContext.getUserProfile(userId);
      
      const prompt = `
Sebagai konsultan bisnis F&B berpengalaman di Indonesia, berikan advice untuk pertanyaan berikut:

Pertanyaan: "${question}"

Data Bisnis:
- Tipe: ${userProfile.business_type || 'bakery'}
- Revenue bulan ini: ${formatCurrency(businessData.financial?.totalRevenue || 0)}
- Profit margin: ${businessData.financial?.profitMargin || 0}%
- Jumlah produk: ${businessData.products?.length || 0}
- Stok kritis: ${businessData.inventory?.criticalItems?.length || 0} item

Berikan advice dalam format:
1. Analisa situasi
2. Rekomendasi spesifik (3-5 poin)
3. Action items prioritas
4. Expected impact

Fokus pada solusi praktis untuk UMKM Indonesia.
`;
      
      const aiResponse = await openRouterClient.chat(prompt, {
        maxTokens: 500,
        temperature: 0.7
      });
      
      // Parse response into structured format
      const keyPoints = this.extractKeyPoints(aiResponse);
      const actionItems = this.extractActionItems(aiResponse);
      const priority = this.determinePriority(question, businessData);
      
      return {
        advice: aiResponse,
        keyPoints,
        actionItems,
        priority
      };
    } catch (error) {
      console.error('Business advice generation error:', error);
      return {
        advice: 'Maaf, tidak dapat menghasilkan advice saat ini. Silakan coba lagi.',
        keyPoints: [],
        actionItems: [],
        priority: 'medium'
      };
    }
  }
  
  /**
   * Extract key points from AI response
   */
  private static extractKeyPoints(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim());
    const points: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^[\d\-\*\•]/)) {
        points.push(line.replace(/^[\d\-\*\•]\s*/, '').trim());
      }
    }
    
    return points.slice(0, 5); // Max 5 key points
  }
  
  /**
   * Extract action items from AI response
   */
  private static extractActionItems(text: string): string[] {
    const actionKeywords = ['lakukan', 'segera', 'harus', 'perlu', 'action', 'langkah'];
    const lines = text.split('\n').filter(line => line.trim());
    const actions: string[] = [];
    
    for (const line of lines) {
      const hasActionKeyword = actionKeywords.some(keyword => 
        line.toLowerCase().includes(keyword)
      );
      if (hasActionKeyword && line.length > 10) {
        actions.push(line.replace(/^[\d\-\*\•]\s*/, '').trim());
      }
    }
    
    return actions.slice(0, 3); // Max 3 action items
  }
  
  /**
   * Determine priority based on context
   */
  private static determinePriority(
    question: string,
    businessData: any
  ): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'segera', 'kritis', 'darurat', 'penting'];
    const hasUrgent = urgentKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
    
    if (hasUrgent) return 'high';
    
    // Check business health
    const criticalStock = businessData.inventory?.criticalItems?.length || 0;
    const profitMargin = businessData.financial?.profitMargin || 0;
    
    if (criticalStock > 5 || profitMargin < 10) {
      return 'high';
    }
    
    if (criticalStock > 0 || profitMargin < 20) {
      return 'medium';
    }
    
    return 'low';
  }
}
