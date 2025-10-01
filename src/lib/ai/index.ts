/**
 * AI Services - Main Entry Point
 * Orchestrates all AI services for F&B business intelligence
 * Split from 808-line monolith into 4 specialized modules
 */

export * from './services/PricingAIService';
export * from './services/ProductionAIService';
export * from './services/CustomerAIService';
export * from './services/InventoryAIService';

import { pricingAI, PricingAIService } from './services/PricingAIService';
import { productionAI, ProductionAIService } from './services/ProductionAIService';
import { customerAI, CustomerAIService } from './services/CustomerAIService';
import { inventoryAI, InventoryAIService } from './services/InventoryAIService';

/**
 * Unified AI Service Facade
 * Provides convenient access to all AI capabilities
 */
export class AIService {
  public pricing: PricingAIService;
  public production: ProductionAIService;
  public customer: CustomerAIService;

  constructor() {
    this.pricing = pricingAI;
    this.production = productionAI;
    this.customer = customerAI;
  }

  /**
   * Get comprehensive business insights
   */
  async getBusinessInsights(data: {
    pricing?: any;
    production?: any;
    customers?: any;
  }): Promise<{
    pricing?: any;
    production?: any;
    customers?: any;
    summary: string;
    priorityActions: string[];
  }> {
    const insights: any = {};
    const priorityActions: string[] = [];

    try {
      // Pricing insights
      if (data.pricing) {
        insights.pricing = await this.pricing.analyzePricing(data.pricing);
        if (insights.pricing.marginAnalysis.currentMargin < 20) {
          priorityActions.push('🔴 URGENT: Profit margin below 20%, review pricing strategy');
        }
      }

      // Production insights
      if (data.production) {
        insights.production = await this.production.generateProductionSchedule(data.production);
        if (insights.production.bottlenecks.length > 0) {
          priorityActions.push(`⚠️ ${insights.production.bottlenecks.length} production bottleneck(s) identified`);
        }
      }

      // Customer insights
      if (data.customers) {
        insights.customers = await this.customer.analyzeCustomers(data.customers);
        const highRiskChurn = insights.customers.churnRisk.filter((c: any) => c.riskLevel === 'high');
        if (highRiskChurn.length > 0) {
          priorityActions.push(`⚠️ ${highRiskChurn.length} customers at high risk of churning`);
        }
      }

      // Generate summary
      const summary = this.generateSummary(insights, priorityActions);

      return {
        ...insights,
        summary,
        priorityActions
      };
    } catch (error: any) {
      console.error('Error getting business insights:', error);
      return {
        summary: 'Unable to generate insights. Please check data and try again.',
        priorityActions: ['Review data inputs and API configuration']
      };
    }
  }

  /**
   * Generate executive summary
   */
  private generateSummary(insights: any, priorityActions: string[]): string {
    let summary = '📊 Business Intelligence Summary\n\n';

    if (priorityActions.length > 0) {
      summary += '🚨 Priority Actions:\n';
      priorityActions.forEach(action => {
        summary += `• ${action}\n`;
      });
      summary += '\n';
    }

    if (insights.pricing) {
      summary += `💰 Pricing: Optimal margin ${insights.pricing.marginAnalysis.optimalMargin.toFixed(1)}%\n`;
    }

    if (insights.production) {
      const efficiency = insights.production.resourceAllocation.efficiency;
      summary += `🏭 Production: ${efficiency.toFixed(1)}% efficiency\n`;
    }

    if (insights.customers) {
      const segments = insights.customers.segments;
      const vip = segments.find((s: any) => s.segment === 'vip');
      summary += `👥 Customers: ${vip?.customers.length || 0} VIP customers\n`;
    }

    if (priorityActions.length === 0) {
      summary += '\n✅ No critical issues detected. Business operations running smoothly.';
    }

    return summary;
  }

  /**
   * Backward compatibility: Optimize inventory (delegates to inventory service)
   */
  async optimizeInventory(data: any): Promise<any> {
    // Use dedicated inventory service
    return inventoryAI.optimizeInventory(data);
  }

  /**
   * Backward compatibility: Analyze financial data (delegates to pricing service)
   */
  async analyzeFinancial(data: any): Promise<any> {
    // Financial analysis through pricing optimization
    return this.pricing.analyzePricing({
      ingredients: [],
      currentPrice: 0,
      ...data
    });
  }

  /**
   * Quick health check across all modules
   */
  async healthCheck(): Promise<boolean> {
    return !!(this.pricing && this.production && this.customer);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export for backward compatibility with old imports
export default aiService;

// Named exports for direct access
export {
  pricingAI,
  productionAI,
  customerAI,
  inventoryAI
};
