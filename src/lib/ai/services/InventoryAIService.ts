/**
 * Inventory AI Service
 * Smart inventory management and optimization
 */

interface InventoryItem {
  name: string;
  currentStock: number;
  minStock: number;
  usagePerWeek: number;
  price: number;
  supplier: string;
  leadTime: number; // days
  category?: string;
  unit?: string;
}

interface InventoryData {
  ingredients: InventoryItem[];
  seasonality?: string;
  upcomingEvents?: Array<{ name: string; date: string; expectedDemandIncrease: number }>;
  weatherForecast?: { condition: string; impact: string };
}

interface StockAlert {
  ingredient: string;
  currentStock: number;
  minStock: number;
  urgency: 'critical' | 'warning' | 'low';
  daysUntilStockout: number;
  recommendation: string;
}

interface ReorderRecommendation {
  ingredient: string;
  currentStock: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reasoning: string;
}

interface DemandForecast {
  nextWeek: number;
  nextMonth: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  factors: string[];
}

interface CostOptimization {
  totalInventoryValue: number;
  recommendations: Array<{
    area: string;
    currentCost: number;
    potentialSavings: number;
    suggestion: string;
  }>;
  bulkOrderOpportunities: Array<{
    ingredients: string[];
    supplier: string;
    potentialDiscount: number;
    savings: number;
  }>;
}

interface InventoryOptimization {
  stockAlerts: StockAlert[];
  reorderRecommendations: ReorderRecommendation[];
  demandForecast: DemandForecast;
  costOptimization: CostOptimization;
  insights: string[];
}

export class InventoryAIService {
  /**
   * Optimize inventory and provide recommendations
   */
  async optimizeInventory(data: InventoryData): Promise<InventoryOptimization> {
    const { ingredients, seasonality = 'normal', upcomingEvents = [], weatherForecast } = data;

    // Validate ingredients is an array
    if (!Array.isArray(ingredients)) {
      throw new Error('ingredients must be an array');
    }

    // Generate stock alerts
    const stockAlerts = this.generateStockAlerts(ingredients);

    // Generate reorder recommendations
    const reorderRecommendations = this.generateReorderRecommendations(
      ingredients,
      seasonality,
      upcomingEvents
    );

    // Forecast demand
    const demandForecast = this.forecastDemand(ingredients, seasonality, upcomingEvents, weatherForecast);

    // Optimize costs
    const costOptimization = this.optimizeCosts(ingredients);

    // Generate insights
    const insights = this.generateInsights(
      stockAlerts,
      reorderRecommendations,
      demandForecast,
      costOptimization
    );

    return {
      stockAlerts,
      reorderRecommendations,
      demandForecast,
      costOptimization,
      insights
    };
  }

  /**
   * Generate stock alerts for low inventory
   */
  private generateStockAlerts(ingredients: InventoryItem[]): StockAlert[] {
    const alerts: StockAlert[] = [];

    for (const item of ingredients) {
      const stockRatio = item.currentStock / item.minStock;
      const daysUntilStockout = item.usagePerWeek > 0 
        ? (item.currentStock / (item.usagePerWeek / 7))
        : 999;

      if (stockRatio <= 0.5) {
        // Critical: Below 50% of minimum stock
        alerts.push({
          ingredient: item.name,
          currentStock: item.currentStock,
          minStock: item.minStock,
          urgency: 'critical',
          daysUntilStockout: Math.max(0, Math.floor(daysUntilStockout)),
          recommendation: `URGENT: Reorder immediately. Stock will run out in ${Math.max(0, Math.floor(daysUntilStockout))} days.`
        });
      } else if (stockRatio <= 0.8) {
        // Warning: Below 80% of minimum stock
        alerts.push({
          ingredient: item.name,
          currentStock: item.currentStock,
          minStock: item.minStock,
          urgency: 'warning',
          daysUntilStockout: Math.max(0, Math.floor(daysUntilStockout)),
          recommendation: `Order soon. Stock approaching minimum threshold.`
        });
      } else if (stockRatio <= 1.2) {
        // Low: Just above minimum stock
        alerts.push({
          ingredient: item.name,
          currentStock: item.currentStock,
          minStock: item.minStock,
          urgency: 'low',
          daysUntilStockout: Math.max(0, Math.floor(daysUntilStockout)),
          recommendation: `Monitor closely. Consider ordering if lead time is high.`
        });
      }
    }

    // Sort by urgency
    return alerts.sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Generate reorder recommendations
   */
  private generateReorderRecommendations(
    ingredients: InventoryItem[],
    seasonality: string,
    upcomingEvents: Array<{ name: string; date: string; expectedDemandIncrease: number }>
  ): ReorderRecommendation[] {
    const recommendations: ReorderRecommendation[] = [];

    for (const item of ingredients) {
      const stockRatio = item.currentStock / item.minStock;
      
      // Calculate base reorder quantity (enough for 2 weeks + buffer)
      const weeklyUsage = item.usagePerWeek || item.minStock / 2;
      let reorderQuantity = weeklyUsage * 2;

      // Adjust for seasonality
      if (seasonality === 'high') {
        reorderQuantity *= 1.3;
      } else if (seasonality === 'low') {
        reorderQuantity *= 0.8;
      }

      // Adjust for upcoming events
      const nearEvents = upcomingEvents.filter(event => {
        const eventDate = new Date(event.date);
        const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntilEvent > 0 && daysUntilEvent <= 14;
      });

      if (nearEvents.length > 0) {
        const totalIncrease = nearEvents.reduce((sum, event) => sum + (event.expectedDemandIncrease || 0), 0);
        reorderQuantity *= (1 + totalIncrease / 100);
      }

      // Round to reasonable quantities
      reorderQuantity = Math.ceil(reorderQuantity);

      // Determine if reorder is needed
      const daysUntilStockout = weeklyUsage > 0 ? (item.currentStock / (weeklyUsage / 7)) : 999;
      const shouldReorder = daysUntilStockout <= item.leadTime * 1.5;

      if (shouldReorder || stockRatio < 1.2) {
        let priority: 'urgent' | 'high' | 'medium' | 'low';
        let reasoning = '';

        if (daysUntilStockout <= item.leadTime) {
          priority = 'urgent';
          reasoning = `Stock will run out before delivery (${Math.floor(daysUntilStockout)} days vs ${item.leadTime} day lead time)`;
        } else if (stockRatio < 0.8) {
          priority = 'high';
          reasoning = `Below minimum stock threshold (${(stockRatio * 100).toFixed(0)}% of minimum)`;
        } else if (nearEvents.length > 0) {
          priority = 'high';
          reasoning = `Upcoming events: ${nearEvents.map(e => e.name).join(', ')}`;
        } else if (daysUntilStockout <= item.leadTime * 1.5) {
          priority = 'medium';
          reasoning = `Stock low relative to lead time (${Math.floor(daysUntilStockout)} days of stock)`;
        } else {
          priority = 'low';
          reasoning = 'Preventive reorder to maintain optimal levels';
        }

        recommendations.push({
          ingredient: item.name,
          currentStock: item.currentStock,
          recommendedOrderQuantity: reorderQuantity,
          estimatedCost: reorderQuantity * item.price,
          priority,
          reasoning
        });
      }
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Forecast demand
   */
  private forecastDemand(
    ingredients: InventoryItem[],
    seasonality: string,
    upcomingEvents: Array<{ name: string; date: string; expectedDemandIncrease: number }>,
    weatherForecast?: { condition: string; impact: string }
  ): DemandForecast {
    // Calculate average weekly usage
    const avgWeeklyUsage = ingredients.reduce((sum, item) => sum + (item.usagePerWeek || 0), 0) / ingredients.length;

    let nextWeekForecast = avgWeeklyUsage;
    let nextMonthForecast = avgWeeklyUsage * 4;
    const factors: string[] = [];

    // Adjust for seasonality
    if (seasonality === 'high') {
      nextWeekForecast *= 1.25;
      nextMonthForecast *= 1.3;
      factors.push('High season: +25-30% demand increase');
    } else if (seasonality === 'low') {
      nextWeekForecast *= 0.8;
      nextMonthForecast *= 0.75;
      factors.push('Low season: -20-25% demand decrease');
    }

    // Adjust for events
    const nextWeekEvents = upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilEvent > 0 && daysUntilEvent <= 7;
    });

    if (nextWeekEvents.length > 0) {
      const totalIncrease = nextWeekEvents.reduce((sum, event) => sum + (event.expectedDemandIncrease || 0), 0);
      nextWeekForecast *= (1 + totalIncrease / 100);
      factors.push(`Events this week: ${nextWeekEvents.map(e => e.name).join(', ')} (+${totalIncrease}%)`);
    }

    // Adjust for weather
    if (weatherForecast) {
      if (weatherForecast.condition === 'rainy' || weatherForecast.condition === 'cold') {
        nextWeekForecast *= 1.1;
        factors.push('Weather impact: +10% (comfort food demand)');
      }
    }

    // Determine trend
    let trend: 'increasing' | 'stable' | 'decreasing';
    if (seasonality === 'high' || nextWeekEvents.length > 0) {
      trend = 'increasing';
    } else if (seasonality === 'low') {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // Calculate confidence based on data quality
    const dataQuality = ingredients.filter(i => i.usagePerWeek > 0).length / ingredients.length;
    const confidence = 0.6 + (dataQuality * 0.3); // 60-90% confidence

    return {
      nextWeek: Math.round(nextWeekForecast),
      nextMonth: Math.round(nextMonthForecast),
      trend,
      confidence,
      factors: factors.length > 0 ? factors : ['Normal demand patterns']
    };
  }

  /**
   * Optimize costs
   */
  private optimizeCosts(ingredients: InventoryItem[]): CostOptimization {
    const totalInventoryValue = ingredients.reduce((sum, item) => {
      return sum + (item.currentStock * item.price);
    }, 0);

    const recommendations: CostOptimization['recommendations'] = [];

    // Check for overstocking
    const overstocked = ingredients.filter(item => {
      return item.currentStock > item.minStock * 3;
    });

    if (overstocked.length > 0) {
      const tiedUpCapital = overstocked.reduce((sum, item) => {
        const excess = item.currentStock - (item.minStock * 2);
        return sum + (excess * item.price);
      }, 0);

      recommendations.push({
        area: 'Overstocking',
        currentCost: tiedUpCapital,
        potentialSavings: tiedUpCapital * 0.7, // Could free up 70%
        suggestion: `${overstocked.length} items overstocked. Reduce orders to free up ${tiedUpCapital.toFixed(2)} in working capital.`
      });
    }

    // Check for frequent small orders
    const frequentOrders = ingredients.filter(item => {
      const daysOfStock = item.usagePerWeek > 0 
        ? (item.currentStock / (item.usagePerWeek / 7))
        : 999;
      return daysOfStock < item.leadTime * 2;
    });

    if (frequentOrders.length > 0) {
      recommendations.push({
        area: 'Order Frequency',
        currentCost: frequentOrders.length * 50, // Estimated admin cost per order
        potentialSavings: frequentOrders.length * 30,
        suggestion: `${frequentOrders.length} items require frequent reordering. Consider bulk ordering to reduce admin costs.`
      });
    }

    // Identify bulk order opportunities
    const bulkOrderOpportunities: CostOptimization['bulkOrderOpportunities'] = [];
    const supplierGroups = this.groupBySupplier(ingredients);

    for (const [supplier, items] of Object.entries(supplierGroups)) {
      if (items.length >= 3) {
        const totalValue = items.reduce((sum, item) => {
          return sum + (item.currentStock * item.price);
        }, 0);

        if (totalValue > 500) { // Threshold for bulk discount
          bulkOrderOpportunities.push({
            ingredients: items.map(i => i.name),
            supplier,
            potentialDiscount: 10, // Assume 10% bulk discount
            savings: totalValue * 0.1
          });
        }
      }
    }

    return {
      totalInventoryValue,
      recommendations,
      bulkOrderOpportunities
    };
  }

  /**
   * Group ingredients by supplier
   */
  private groupBySupplier(ingredients: InventoryItem[]): Record<string, InventoryItem[]> {
    return ingredients.reduce((groups, item) => {
      const supplier = item.supplier || 'Unknown';
      if (!groups[supplier]) {
        groups[supplier] = [];
      }
      groups[supplier].push(item);
      return groups;
    }, {} as Record<string, InventoryItem[]>);
  }

  /**
   * Generate insights
   */
  private generateInsights(
    stockAlerts: StockAlert[],
    reorderRecommendations: ReorderRecommendation[],
    demandForecast: DemandForecast,
    costOptimization: CostOptimization
  ): string[] {
    const insights: string[] = [];

    // Stock alerts summary
    const criticalAlerts = stockAlerts.filter(a => a.urgency === 'critical').length;
    const warningAlerts = stockAlerts.filter(a => a.urgency === 'warning').length;

    if (criticalAlerts > 0) {
      insights.push(`⚠️ CRITICAL: ${criticalAlerts} ingredients at critical stock levels requiring immediate action`);
    }
    if (warningAlerts > 0) {
      insights.push(`⚡ WARNING: ${warningAlerts} ingredients approaching minimum stock levels`);
    }

    // Reorder urgency
    const urgentReorders = reorderRecommendations.filter(r => r.priority === 'urgent').length;
    if (urgentReorders > 0) {
      const totalUrgentCost = reorderRecommendations
        .filter(r => r.priority === 'urgent')
        .reduce((sum, r) => sum + r.estimatedCost, 0);
      insights.push(`🚨 ${urgentReorders} urgent reorders needed (Est. cost: ${totalUrgentCost.toFixed(2)})`);
    }

    // Demand forecast
    insights.push(`📈 Demand forecast: ${demandForecast.trend} trend (${(demandForecast.confidence * 100).toFixed(0)}% confidence)`);

    // Cost optimization
    if (costOptimization.recommendations.length > 0) {
      const totalSavings = costOptimization.recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
      insights.push(`💰 Potential cost savings identified: ${totalSavings.toFixed(2)}`);
    }

    // Bulk order opportunities
    if (costOptimization.bulkOrderOpportunities.length > 0) {
      const bulkSavings = costOptimization.bulkOrderOpportunities.reduce((sum, o) => sum + o.savings, 0);
      insights.push(`📦 ${costOptimization.bulkOrderOpportunities.length} bulk order opportunities (Save ${bulkSavings.toFixed(2)})`);
    }

    // Overall health
    if (criticalAlerts === 0 && urgentReorders === 0) {
      insights.push('✅ Inventory levels healthy - no immediate action required');
    }

    return insights;
  }
}

// Export singleton instance
export const inventoryAI = new InventoryAIService();
