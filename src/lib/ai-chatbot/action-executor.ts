/**
 * Action Executor Module
 * Executes chatbot actions and interacts with APIs
 */

import { ChatAction } from './types';
import { enhancedApiClient } from '../enhanced-api';
import { supabaseUserContext } from '../supabase-user-context';

export class ActionExecutor {
  
  /**
   * Execute a chat action
   */
  static async executeAction(action: ChatAction, userId: string): Promise<any> {
    try {
      switch (action.type) {
        case 'add_order':
          return await this.executeAddOrder(action.data, userId);
        
        case 'check_stock':
          return await this.executeCheckStock(action.data, userId);
        
        case 'view_report':
          return await this.executeViewReport(action.data, userId);
        
        case 'analysis':
          return await this.executeAnalysis(action.data, userId);
        
        case 'recommendation':
          return await this.executeRecommendation(action.data, userId);
        
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error: any) {
      console.error('Action execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action execution failed'
      };
    }
  }
  
  /**
   * Execute add order action
   */
  private static async executeAddOrder(data: any, userId: string): Promise<any> {
    try {
      // Validate order data
      if (!data.customer_name || !data.items || data.items.length === 0) {
        throw new Error('Invalid order data: customer name and items are required');
      }
      
      // Create order via API
      const response = await enhancedApiClient.post('/api/orders', {
        ...data,
        created_by: userId,
        status: 'pending'
      });
      
      return {
        success: true,
        orderId: response.data.id,
        message: `Order #${response.data.order_number} berhasil dibuat untuk ${data.customer_name}`,
        data: response.data
      };
    } catch (error: any) {
      throw new Error('Failed to create order: ' + (error instanceof Error ? error.message : ''));
    }
  }
  
  /**
   * Execute check stock action
   */
  private static async executeCheckStock(data: any, userId: string): Promise<any> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const { inventory } = businessData;
      
      let stockData;
      
      if (data.ingredientId) {
        // Check specific ingredient
        const ingredient = inventory.items.find((item: any) => item.id === data.ingredientId);
        if (!ingredient) {
          throw new Error('Ingredient not found');
        }
        stockData = {
          name: ingredient.name,
          current_stock: ingredient.current_stock ?? 0,
          unit: ingredient.unit,
          status: ingredient.current_stock ?? 0 <= ingredient.minimum_stock ? 'low' : 'ok'
        };
      } else if (data.ingredientName) {
        // Search by name
        const ingredient = inventory.items.find((item: any) => 
          item.name.toLowerCase().includes(data.ingredientName.toLowerCase())
        );
        if (!ingredient) {
          throw new Error('Ingredient not found');
        }
        stockData = {
          name: ingredient.name,
          current_stock: ingredient.current_stock ?? 0,
          unit: ingredient.unit,
          status: ingredient.current_stock ?? 0 <= ingredient.minimum_stock ? 'low' : 'ok'
        };
      } else {
        // Return critical items
        stockData = {
          criticalItems: inventory.criticalItems,
          lowStockItems: inventory.lowStockItems,
          totalItems: inventory.items.length
        };
      }
      
      return {
        success: true,
        data: stockData,
        message: 'Stock data retrieved successfully'
      };
    } catch (error: any) {
      throw new Error('Failed to check stock: ' + (error instanceof Error ? error.message : ''));
    }
  }
  
  /**
   * Execute view report action
   */
  private static async executeViewReport(data: any, userId: string): Promise<any> {
    try {
      const reportType = data.type || 'financial';
      const period = data.period || 'this_month';
      
      let reportData;
      
      switch (reportType) {
        case 'financial':
          reportData = await this.getFinancialReport(userId, period);
          break;
        
        case 'sales':
          reportData = await this.getSalesReport(userId, period);
          break;
        
        case 'inventory':
          reportData = await this.getInventoryReport(userId);
          break;
        
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
      
      return {
        success: true,
        reportType,
        period,
        data: reportData,
        message: `${reportType} report generated successfully`
      };
    } catch (error: any) {
      throw new Error('Failed to generate report: ' + (error instanceof Error ? error.message : ''));
    }
  }
  
  /**
   * Execute analysis action
   */
  private static async executeAnalysis(data: any, userId: string): Promise<any> {
    try {
      const analysisType = data.type || 'general';
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      
      let analysisResult;
      
      switch (analysisType) {
        case 'profit':
          analysisResult = await this.analyzeProfitMargins(businessData);
          break;
        
        case 'cost':
          analysisResult = await this.analyzeCostStructure(businessData);
          break;
        
        case 'trend':
          analysisResult = await this.analyzeSalesTrends(businessData);
          break;
        
        default:
          analysisResult = await this.performGeneralAnalysis(businessData);
      }
      
      return {
        success: true,
        analysisType,
        data: analysisResult,
        message: 'Analysis completed successfully'
      };
    } catch (error: any) {
      throw new Error('Failed to perform analysis: ' + (error instanceof Error ? error.message : ''));
    }
  }
  
  /**
   * Execute recommendation action
   */
  private static async executeRecommendation(data: any, userId: string): Promise<any> {
    try {
      const businessData = await supabaseUserContext.getUserBusinessData(userId);
      const recommendations = await this.generateRecommendations(businessData, data.focus);
      
      return {
        success: true,
        recommendations,
        message: 'Recommendations generated successfully'
      };
    } catch (error: any) {
      throw new Error('Failed to generate recommendations: ' + (error instanceof Error ? error.message : ''));
    }
  }
  
  // Helper methods
  
  private static async getFinancialReport(userId: string, period: string): Promise<any> {
    const response = await enhancedApiClient.get('/api/dashboard/stats', {
      params: { period, userId }
    });
    return response.data;
  }
  
  private static async getSalesReport(userId: string, period: string): Promise<any> {
    const response = await enhancedApiClient.get('/api/orders', {
      params: { period, userId, status: 'completed' }
    });
    return response.data;
  }
  
  private static async getInventoryReport(userId: string): Promise<any> {
    const response = await enhancedApiClient.get('/api/inventory', {
      params: { userId }
    });
    return response.data;
  }
  
  private static async analyzeProfitMargins(businessData: any): Promise<any> {
    const { products, financial } = businessData;
    const productMargins = products.map((product: any) => ({
      name: product.name,
      hpp: product.hpp,
      selling_price: product.selling_price,
      margin: ((product.selling_price - product.hpp) / product.selling_price * 100).toFixed(2)
    }));
    
    return {
      avgMargin: financial.profitMargin,
      productMargins,
      recommendations: this.getProfitRecommendations(productMargins)
    };
  }
  
  private static async analyzeCostStructure(businessData: any): Promise<any> {
    const { financial } = businessData;
    return {
      totalCosts: financial.totalExpenses,
      breakdown: financial.expenseBreakdown,
      recommendations: this.getCostRecommendations(financial)
    };
  }
  
  private static async analyzeSalesTrends(businessData: any): Promise<any> {
    const { orders } = businessData;
    return {
      totalSales: orders.length,
      trends: 'increasing',
      topProducts: []
    };
  }
  
  private static async performGeneralAnalysis(businessData: any): Promise<any> {
    return {
      health: 'good',
      keyMetrics: {
        revenue: businessData.financial?.totalRevenue || 0,
        orders: businessData.orders?.length || 0,
        products: businessData.products?.length || 0
      }
    };
  }
  
  private static async generateRecommendations(businessData: any, focus?: string): Promise<any[]> {
    const recommendations = [];
    
    // Inventory recommendations
    if (businessData.inventory?.criticalItems?.length > 0) {
      recommendations.push({
        type: 'inventory',
        priority: 'high',
        message: `Restock ${businessData.inventory.criticalItems.length} item kritis`
      });
    }
    
    // Profit recommendations
    if (businessData.financial?.profitMargin < 20) {
      recommendations.push({
        type: 'pricing',
        priority: 'medium',
        message: 'Pertimbangkan menaikkan harga untuk meningkatkan margin'
      });
    }
    
    return recommendations;
  }
  
  private static getProfitRecommendations(margins: any[]): string[] {
    const recs = [];
    const lowMargin = margins.filter((m: any) => parseFloat(m.margin) < 20);
    if (lowMargin.length > 0) {
      recs.push(`${lowMargin.length} produk memiliki margin di bawah 20%, pertimbangkan untuk menaikkan harga`);
    }
    return recs;
  }
  
  private static getCostRecommendations(financial: any): string[] {
    const recs = [];
    if (financial.profitMargin < 15) {
      recs.push('Profit margin rendah, evaluasi biaya operasional');
    }
    return recs;
  }
}
